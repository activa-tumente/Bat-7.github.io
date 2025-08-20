import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PatientResultsDashboardImproved from '../components/patient/PatientResultsDashboardImproved';
import { usePatientReport, useMultiplePatientReports } from '../hooks/usePatientReport';
import LoadingSpinner, { StatusSpinner } from '../components/common/LoadingSpinner';
import ProgressBar, { CircularProgressBar } from '../components/common/ProgressBar';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { formatDate, getRelativeTime } from '../utils/dateUtils';

/**
 * Ejemplo práctico de implementación de las mejoras del sistema BAT-7
 * Demuestra el uso integrado de todos los componentes y hooks mejorados
 */
const PatientReportExample = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'multiple' | 'comparison'
  const [selectedPatients, setSelectedPatients] = useState([]);

  // Ejemplo de uso del hook simple
  const {
    loading: singleLoading,
    error: singleError,
    patientReport,
    progress,
    isRetrying,
    retryCount,
    canRetry,
    refetch,
    retry,
    cancel
  } = usePatientReport(selectedPatientId, {
    autoLoad: !!selectedPatientId,
    retryAttempts: 3,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    onSuccess: (report) => {
      console.log('✅ Reporte individual cargado:', report.paciente?.nombre);
    },
    onError: (error) => {
      console.error('❌ Error en reporte individual:', error.message);
    },
    onRetry: (attempt) => {
      console.log(`🔄 Reintentando carga (intento ${attempt})`);
    }
  });

  // Ejemplo de uso del hook para múltiples pacientes
  const {
    loading: multipleLoading,
    error: multipleError,
    reports: multipleReports,
    progress: multipleProgress,
    completedCount,
    totalCount,
    refetchAll,
    retryFailed
  } = useMultiplePatientReports(selectedPatients, {
    batchSize: 3,
    maxConcurrent: 2,
    enableCache: true,
    onBatchComplete: (batch, completed, total) => {
      console.log(`📊 Lote completado: ${completed}/${total}`);
    },
    onAllComplete: (reports) => {
      console.log('🎉 Todos los reportes completados:', reports.length);
    }
  });

  // Simulación de datos de pacientes para el ejemplo
  const mockPatients = [
    { id: '1', nombre: 'Juan Pérez', documento: '12345678' },
    { id: '2', nombre: 'María García', documento: '87654321' },
    { id: '3', nombre: 'Carlos López', documento: '11223344' },
    { id: '4', nombre: 'Ana Martínez', documento: '44332211' }
  ];

  const handlePatientSelect = useCallback((patientId) => {
    setSelectedPatientId(patientId);
    setViewMode('single');
  }, []);

  const handleMultipleSelect = useCallback((patientIds) => {
    setSelectedPatients(patientIds);
    setViewMode('multiple');
  }, []);

  const handleEvaluationClick = useCallback((evaluation) => {
    console.log('📋 Evaluación seleccionada:', evaluation);
    // Aquí podrías abrir un modal con detalles de la evaluación
  }, []);

  const renderPatientSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Paciente(s)</h3>
        <div className="flex space-x-2 mt-2">
          <Button
            onClick={() => setViewMode('single')}
            variant={viewMode === 'single' ? 'primary' : 'outline'}
            size="sm"
          >
            Vista Individual
          </Button>
          <Button
            onClick={() => setViewMode('multiple')}
            variant={viewMode === 'multiple' ? 'primary' : 'outline'}
            size="sm"
          >
            Vista Múltiple
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {mockPatients.map(patient => (
              <Button
                key={patient.id}
                onClick={() => handlePatientSelect(patient.id)}
                variant={selectedPatientId === patient.id ? 'primary' : 'outline'}
                className="text-left p-3 h-auto"
              >
                <div>
                  <div className="font-semibold">{patient.nombre}</div>
                  <div className="text-sm opacity-70">{patient.documento}</div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {mockPatients.map(patient => (
                <label key={patient.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPatients(prev => [...prev, patient.id]);
                      } else {
                        setSelectedPatients(prev => prev.filter(id => id !== patient.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{patient.nombre}</span>
                </label>
              ))}
            </div>
            <Button
              onClick={() => handleMultipleSelect(selectedPatients)}
              disabled={selectedPatients.length === 0}
              className="mt-3"
            >
              Cargar Reportes Seleccionados ({selectedPatients.length})
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderSinglePatientView = () => {
    if (!selectedPatientId) {
      return (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">👆</div>
              <p>Selecciona un paciente para ver su reporte</p>
            </div>
          </CardBody>
        </Card>
      );
    }

    return (
      <ErrorBoundary
        onRetry={() => refetch()}
        componentName="PatientReportExample"
      >
        <PatientResultsDashboardImproved
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onEvaluationClick={handleEvaluationClick}
        />
      </ErrorBoundary>
    );
  };

  const renderMultiplePatientView = () => {
    if (selectedPatients.length === 0) {
      return (
        <Card>
          <CardBody>
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>Selecciona múltiples pacientes para comparar reportes</p>
            </div>
          </CardBody>
        </Card>
      );
    }

    if (multipleLoading) {
      return (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <StatusSpinner
                status={`Cargando reportes (${completedCount}/${totalCount})`}
                substatus="Procesando datos de pacientes..."
                progress={multipleProgress}
                size="lg"
                color="blue"
              />
              <div className="mt-6 max-w-md mx-auto">
                <ProgressBar
                  progress={multipleProgress}
                  showLabel
                  label={`Progreso: ${completedCount}/${totalCount} reportes`}
                  color="blue"
                  animated
                />
              </div>
              <Button
                onClick={() => setSelectedPatients([])}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Cancelar
              </Button>
            </div>
          </CardBody>
        </Card>
      );
    }

    if (multipleError) {
      return (
        <Card className="border-red-200">
          <CardBody>
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Error al cargar reportes múltiples
              </h3>
              <p className="text-red-600 mb-4">{multipleError.message}</p>
              <div className="flex justify-center space-x-3">
                <Button onClick={retryFailed} className="bg-red-600 hover:bg-red-700">
                  Reintentar Fallidos
                </Button>
                <Button onClick={refetchAll} variant="outline">
                  Recargar Todos
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación de Reportes ({Object.keys(multipleReports).length})
              </h3>
              <div className="flex space-x-2">
                <Button onClick={refetchAll} variant="outline" size="sm">
                  🔄 Actualizar
                </Button>
                <Button onClick={() => setSelectedPatients([])} variant="outline" size="sm">
                  ✕ Cerrar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(multipleReports).map(([patientId, report]) => {
                if (!report || report.error) {
                  return (
                    <Card key={patientId} className="border-red-200">
                      <CardBody>
                        <div className="text-center py-4">
                          <div className="text-red-500 text-2xl mb-2">❌</div>
                          <p className="text-sm text-red-600">
                            Error al cargar paciente {patientId}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  );
                }

                const { paciente, estadisticasGenerales } = report;
                return (
                  <Card key={patientId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <h4 className="font-semibold text-gray-900">
                        {paciente?.nombre} {paciente?.apellido}
                      </h4>
                      <p className="text-sm text-gray-600">{paciente?.documento}</p>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Evaluaciones:</span>
                          <span className="font-semibold">{estadisticasGenerales.totalEvaluaciones}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Promedio General:</span>
                          <span className="font-semibold text-blue-600">{estadisticasGenerales.promedioGeneral}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Promedio Percentil:</span>
                          <span className="font-semibold text-green-600">{estadisticasGenerales.promedioPercentil}</span>
                        </div>
                        
                        {/* Progreso circular para visualizar rendimiento */}
                        <div className="flex justify-center mt-4">
                          <CircularProgressBar
                            progress={estadisticasGenerales.promedioPercentil || 0}
                            size={80}
                            color={estadisticasGenerales.promedioPercentil >= 75 ? 'green' : 
                                   estadisticasGenerales.promedioPercentil >= 50 ? 'blue' : 'orange'}
                            showLabel
                            label={`${estadisticasGenerales.promedioPercentil}%`}
                          />
                        </div>
                        
                        <Button
                          onClick={() => handlePatientSelect(patientId)}
                          size="sm"
                          className="w-full mt-3"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema BAT-7 - Reportes de Pacientes
        </h1>
        <p className="text-gray-600">
          Ejemplo de implementación con componentes y hooks mejorados
        </p>
      </div>

      {/* Selector de pacientes */}
      {renderPatientSelector()}

      {/* Contenido principal */}
      {viewMode === 'single' ? renderSinglePatientView() : renderMultiplePatientView()}

      {/* Información de estado para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-700">🔧 Debug Info</h3>
          </CardHeader>
          <CardBody>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Modo de vista: <code>{viewMode}</code></div>
              <div>Paciente seleccionado: <code>{selectedPatientId || 'ninguno'}</code></div>
              <div>Pacientes múltiples: <code>[{selectedPatients.join(', ')}]</code></div>
              <div>Estado de carga individual: <code>{singleLoading ? 'cargando' : 'inactivo'}</code></div>
              <div>Estado de carga múltiple: <code>{multipleLoading ? 'cargando' : 'inactivo'}</code></div>
              {progress > 0 && <div>Progreso: <code>{progress}%</code></div>}
              {isRetrying && <div>Reintentando: <code>{retryCount}/3</code></div>}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PatientReportExample;

/**
 * Ejemplo de uso en App.js:
 * 
 * import PatientReportExample from './examples/PatientReportExample';
 * 
 * function App() {
 *   return (
 *     <div className="App">
 *       <PatientReportExample />
 *     </div>
 *   );
 * }
 */