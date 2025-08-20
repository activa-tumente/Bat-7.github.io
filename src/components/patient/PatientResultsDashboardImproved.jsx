import React, { useState, useMemo, Suspense, lazy } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { usePatientReport } from '../../hooks/usePatientReport';
import { formatDate, formatTime } from '../../utils/dateUtils';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import ProgressBar from '../common/ProgressBar';

// Lazy loading de componentes pesados
const AptitudeDetailChart = lazy(() => import('../charts/AptitudeDetailChart'));
const PerformanceTrendChart = lazy(() => import('../charts/PerformanceTrendChart'));
const ComparativeAnalysisChart = lazy(() => import('../charts/ComparativeAnalysisChart'));

/**
 * Componente de tarjeta estadística memoizado para optimización
 */
const StatCard = React.memo(({ title, value, color, icon, ariaLabel, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div 
      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${colorClasses[color] || colorClasses.blue}`}
      role="region"
      aria-label={ariaLabel || `${title}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold" aria-live="polite">
            {value}
          </div>
          <div className="text-sm font-medium opacity-80">{title}</div>
        </div>
        {icon && (
          <div className="text-2xl opacity-60">{icon}</div>
        )}
      </div>
      {trend && (
        <div className="mt-2 text-xs opacity-70">
          Tendencia: {trend}
        </div>
      )}
    </div>
  );
});

StatCard.displayName = 'StatCard';

/**
 * Componente de tabla de evaluaciones memoizado
 */
const EvaluationTable = React.memo(({ evaluaciones, onRowClick }) => {
  const sortedEvaluaciones = useMemo(() => 
    [...evaluaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [evaluaciones]
  );

  const getPercentileColor = useMemo(() => (percentil) => {
    if (!percentil) return 'text-gray-500';
    if (percentil >= 75) return 'text-green-600';
    if (percentil >= 50) return 'text-blue-600';
    if (percentil >= 25) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  if (sortedEvaluaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">📊</div>
        <p>No hay evaluaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table 
        className="min-w-full divide-y divide-gray-200"
        role="table"
        aria-label="Tabla de evaluaciones del paciente"
      >
        <thead className="bg-gray-50">
          <tr role="row">
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Puntaje Directo
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Percentil
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Errores
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiempo
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEvaluaciones.map((evaluacion, index) => (
            <tr 
              key={evaluacion.id || index} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}
              role="row"
            >
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatDate(evaluacion.fecha)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {evaluacion.puntajeDirecto || 'N/A'}
              </td>
              <td className={`px-4 py-3 text-sm font-semibold ${getPercentileColor(evaluacion.percentil)}`}>
                {evaluacion.percentil || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {evaluacion.errores || 0}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {evaluacion.tiempoSegundos ? formatTime(evaluacion.tiempoSegundos) : 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm">
                {onRowClick && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRowClick(evaluacion)}
                    aria-label={`Ver detalles de evaluación del ${formatDate(evaluacion.fecha)}`}
                  >
                    Ver detalles
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

EvaluationTable.displayName = 'EvaluationTable';

/**
 * Componente de navegación por tabs mejorado
 */
const TabNavigation = React.memo(({ tabs, activeTab, onTabChange }) => {
  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <nav 
      className="border-b border-gray-200"
      role="tablist" 
      aria-label="Secciones del reporte del paciente"
    >
      <div className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
});

TabNavigation.displayName = 'TabNavigation';

/**
 * Componente principal del dashboard mejorado
 */
const PatientResultsDashboardImproved = ({ patientId, onClose, onEvaluationClick }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  // Usar el custom hook mejorado
  const {
    loading,
    error,
    patientReport,
    progress,
    isRetrying,
    retryCount,
    canRetry,
    refetch,
    retry,
    cancel,
    getStatusInfo
  } = usePatientReport(patientId, {
    autoLoad: true,
    retryAttempts: 3,
    enableCache: true,
    onSuccess: (report) => {
      console.log('✅ Reporte cargado exitosamente');
    },
    onError: (err) => {
      console.error('❌ Error al cargar reporte:', err);
    }
  });

  // Configuración de tabs memoizada
  const tabs = useMemo(() => [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'aptitudes', label: 'Por Aptitud', icon: '🎯' },
    { id: 'comparativo', label: 'Comparativo', icon: '⚖️' },
    { id: 'tendencias', label: 'Tendencias', icon: '📈' },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: '💡' }
  ], []);

  // Función para obtener icono de tendencia
  const getTrendIcon = useMemo(() => (tendencia) => {
    const icons = {
      'mejorando': '📈',
      'declinando': '📉',
      'estable': '➡️'
    };
    return icons[tendencia] || '❓';
  }, []);

  // Manejar click en evaluación
  const handleEvaluationClick = (evaluacion) => {
    setSelectedEvaluation(evaluacion);
    if (onEvaluationClick) {
      onEvaluationClick(evaluacion);
    }
  };

  // Componente de loading mejorado
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isRetrying ? `Reintentando... (${retryCount}/3)` : 'Cargando reporte del paciente'}
          </h3>
          <ProgressBar progress={progress} className="w-64" />
          <p className="text-sm text-gray-500 mt-2">
            {progress < 30 && 'Obteniendo datos del paciente...'}
            {progress >= 30 && progress < 60 && 'Calculando estadísticas...'}
            {progress >= 60 && progress < 90 && 'Generando análisis...'}
            {progress >= 90 && 'Finalizando reporte...'}
          </p>
          <Button 
            onClick={cancel} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Componente de error mejorado
  if (error) {
    return (
      <Card className="border-red-200">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error al cargar datos del paciente
            </h3>
            <p className="text-red-600 mb-4">
              {error.message || 'Ha ocurrido un error inesperado'}
            </p>
            {error.code && (
              <p className="text-sm text-red-500 mb-4">
                Código de error: {error.code}
              </p>
            )}
            <div className="flex justify-center space-x-3">
              {canRetry && (
                <Button 
                  onClick={retry} 
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isRetrying}
                >
                  {isRetrying ? 'Reintentando...' : 'Reintentar'}
                </Button>
              )}
              <Button 
                onClick={refetch} 
                variant="outline"
                disabled={loading}
              >
                Recargar
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Estado vacío
  if (!patientReport) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              No se encontraron resultados para este paciente.
            </p>
            <Button onClick={refetch} variant="outline">
              Intentar nuevamente
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { paciente, estadisticasGenerales, rendimientoPorAptitud, analisisComparativo, recomendaciones } = patientReport;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header del paciente */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {paciente?.nombre} {paciente?.apellido}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>📄</span>
                    <span>{paciente?.documento}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🎂</span>
                    <span>{paciente?.edad} años</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span className="capitalize">{paciente?.genero}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span className="truncate">{paciente?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={refetch} variant="outline" size="sm">
                  🔄 Actualizar
                </Button>
                <Button onClick={onClose} variant="outline">
                  ✕ Cerrar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Estadísticas generales */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">📊 Resumen General</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Evaluaciones Completadas"
                value={estadisticasGenerales.totalEvaluaciones}
                color="blue"
                icon="📋"
                ariaLabel={`${estadisticasGenerales.totalEvaluaciones} evaluaciones completadas`}
              />
              <StatCard
                title="Promedio General (PD)"
                value={estadisticasGenerales.promedioGeneral}
                color="green"
                icon="🎯"
                ariaLabel={`Promedio general de ${estadisticasGenerales.promedioGeneral} puntos`}
              />
              <StatCard
                title="Promedio Percentil"
                value={estadisticasGenerales.promedioPercentil}
                color="purple"
                icon="📊"
                ariaLabel={`Promedio percentil de ${estadisticasGenerales.promedioPercentil}`}
              />
              <StatCard
                title="Tendencia General"
                value={getTrendIcon(estadisticasGenerales.tendenciaGeneral)}
                color="orange"
                trend={estadisticasGenerales.tendenciaGeneral}
                ariaLabel={`Tendencia general: ${estadisticasGenerales.tendenciaGeneral}`}
              />
            </div>
            
            {estadisticasGenerales.tasaAciertos !== undefined && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Tasa de Aciertos:</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        estadisticasGenerales.tasaAciertos >= 90 ? 'bg-green-500' :
                        estadisticasGenerales.tasaAciertos >= 75 ? 'bg-blue-500' :
                        estadisticasGenerales.tasaAciertos >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${estadisticasGenerales.tasaAciertos}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{estadisticasGenerales.tasaAciertos}%</span>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Aptitudes Evaluadas:</h4>
              <div className="flex flex-wrap gap-2">
                {estadisticasGenerales.aptitudesEvaluadas.map(apt => (
                  <span key={apt} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {apt}
                  </span>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Navegación por tabs */}
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Contenido de tabs */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(rendimientoPorAptitud).map(([codigo, data]) => (
                <Card key={codigo}>
                  <CardHeader>
                    <h4 className="font-semibold text-gray-900">
                      {codigo} - {data.aptitud.nombre}
                    </h4>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard
                        title="Evaluaciones"
                        value={data.estadisticas.total}
                        color="blue"
                        icon="📋"
                      />
                      <StatCard
                        title="Promedio PD"
                        value={data.estadisticas.promedioPD}
                        color="green"
                        icon="🎯"
                      />
                      <StatCard
                        title="Promedio PC"
                        value={data.estadisticas.promedioPC}
                        color="purple"
                        icon="📊"
                      />
                      <StatCard
                        title="Tendencia"
                        value={getTrendIcon(data.estadisticas.tendencia)}
                        color="orange"
                        trend={data.estadisticas.tendencia}
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Última evaluación: {formatDate(data.estadisticas.ultimaEvaluacion)}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'aptitudes' && (
            <div className="space-y-6">
              {Object.entries(rendimientoPorAptitud).map(([codigo, data]) => (
                <Card key={codigo}>
                  <CardHeader>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {codigo} - {data.aptitud.nombre}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{data.aptitud.descripcion}</p>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <StatCard
                        title="Promedio PD"
                        value={data.estadisticas.promedioPD}
                        color="blue"
                        icon="🎯"
                      />
                      <StatCard
                        title="Mejor Puntaje"
                        value={data.estadisticas.mejorPD}
                        color="green"
                        icon="🏆"
                      />
                      <StatCard
                        title="Menor Puntaje"
                        value={data.estadisticas.peorPD}
                        color="red"
                        icon="📉"
                      />
                    </div>
                    
                    <EvaluationTable 
                      evaluaciones={data.evaluaciones} 
                      onRowClick={handleEvaluationClick}
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'comparativo' && analisisComparativo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-green-700">🏆 Fortalezas</h4>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {analisisComparativo.fortalezas.map((aptitud, index) => (
                      <div key={aptitud.codigo} className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                        <div>
                          <span className="font-semibold text-green-800">{aptitud.codigo}</span>
                          <span className="text-sm text-green-600 ml-2">{aptitud.nombre}</span>
                        </div>
                        <span className="text-lg font-bold text-green-700">{aptitud.promedio}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-orange-700">📈 Áreas de Desarrollo</h4>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {analisisComparativo.areasDeDesarrollo.map((aptitud, index) => (
                      <div key={aptitud.codigo} className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                        <div>
                          <span className="font-semibold text-orange-800">{aptitud.codigo}</span>
                          <span className="text-sm text-orange-600 ml-2">{aptitud.nombre}</span>
                        </div>
                        <span className="text-lg font-bold text-orange-700">{aptitud.promedio}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'tendencias' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-gray-900">📈 Análisis de Tendencias</h4>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<LoadingSpinner />}>
                    <PerformanceTrendChart data={rendimientoPorAptitud} />
                  </Suspense>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <h4 className="text-lg font-semibold text-gray-900">⚖️ Comparativa de Aptitudes</h4>
                </CardHeader>
                <CardBody>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ComparativeAnalysisChart data={analisisComparativo} />
                  </Suspense>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'recomendaciones' && (
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold text-blue-700">💡 Recomendaciones</h4>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {recomendaciones.map((recomendacion, index) => {
                    const isWarning = recomendacion.includes('⚠️') || recomendacion.includes('declive');
                    const isSuccess = recomendacion.includes('✅') || recomendacion.includes('Excelente');
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${
                          isWarning ? 'bg-yellow-50 border-yellow-200' :
                          isSuccess ? 'bg-green-50 border-green-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className={`text-xl ${
                          isWarning ? 'text-yellow-600' :
                          isSuccess ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {isWarning ? '⚠️' : isSuccess ? '✅' : '💡'}
                        </div>
                        <p className={`flex-1 ${
                          isWarning ? 'text-yellow-800' :
                          isSuccess ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {recomendacion}
                        </p>
                      </div>
                    );
                  })}
                  
                  {recomendaciones.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🤔</div>
                      <p>No hay recomendaciones específicas disponibles en este momento.</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Footer con información de generación */}
        <div className="text-center text-sm text-gray-500 py-4 border-t">
          <div className="flex justify-center items-center space-x-4">
            <span>Reporte generado el {formatDate(patientReport.fechaGeneracion)}</span>
            {patientReport.metadatos && (
              <>
                <span>•</span>
                <span>Versión {patientReport.metadatos.version}</span>
                <span>•</span>
                <span>Confiabilidad: {patientReport.metadatos.confiabilidad}%</span>
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PatientResultsDashboardImproved;