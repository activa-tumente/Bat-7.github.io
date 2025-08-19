import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import PatientResultsExtractor from '../../services/patientResultsExtractor';
import { formatDate, formatTime } from '../../utils/dateUtils';

/**
 * Dashboard para mostrar resultados completos de un paciente
 * Utiliza el servicio PatientResultsExtractor para obtener y procesar datos
 */
const PatientResultsDashboard = ({ patientId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientReport, setPatientReport] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (patientId) {
      loadPatientReport();
    }
  }, [patientId]);

  const loadPatientReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando reporte completo del paciente:', patientId);
      const report = await PatientResultsExtractor.generatePatientReport(patientId);
      
      console.log('✅ Reporte generado:', report);
      setPatientReport(report);
      
    } catch (err) {
      console.error('❌ Error al cargar reporte:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInterpretacionColor = (percentil) => {
    if (!percentil) return 'text-gray-500';
    if (percentil >= 75) return 'text-green-600';
    if (percentil >= 50) return 'text-blue-600';
    if (percentil >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia) {
      case 'mejorando':
        return '📈';
      case 'declinando':
        return '📉';
      case 'estable':
        return '➡️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando reporte del paciente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPatientReport} className="bg-red-600 hover:bg-red-700">
              Reintentar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!patientReport) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600">No se encontraron resultados para este paciente.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { paciente, estadisticasGenerales, rendimientoPorAptitud, analisisComparativo, recomendaciones } = patientReport;

  return (
    <div className="space-y-6">
      {/* Header del paciente */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente?.nombre} {paciente?.apellido}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>📄 {paciente?.documento}</span>
                <span>🎂 {paciente?.edad} años</span>
                <span>👤 {paciente?.genero}</span>
                <span>📧 {paciente?.email}</span>
              </div>
            </div>
            <Button onClick={onClose} variant="outline">
              ✕ Cerrar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas generales */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">📊 Resumen General</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estadisticasGenerales.totalEvaluaciones}</div>
              <div className="text-sm text-blue-800">Evaluaciones Completadas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{estadisticasGenerales.promedioGeneral}</div>
              <div className="text-sm text-green-800">Promedio General (PD)</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{estadisticasGenerales.promedioPercentil}</div>
              <div className="text-sm text-purple-800">Promedio Percentil</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {getTendenciaIcon(estadisticasGenerales.tendenciaGeneral)}
              </div>
              <div className="text-sm text-orange-800 capitalize">
                {estadisticasGenerales.tendenciaGeneral || 'Sin datos'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'resumen', label: '📊 Resumen', icon: '📊' },
            { id: 'aptitudes', label: '🎯 Por Aptitud', icon: '🎯' },
            { id: 'comparativo', label: '⚖️ Comparativo', icon: '⚖️' },
            { id: 'recomendaciones', label: '💡 Recomendaciones', icon: '💡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Evaluaciones:</span>
                    <span className="font-semibold">{data.estadisticas.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio PD:</span>
                    <span className="font-semibold">{data.estadisticas.promedioPD}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio PC:</span>
                    <span className={`font-semibold ${getInterpretacionColor(data.estadisticas.promedioPC)}`}>
                      {data.estadisticas.promedioPC}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendencia:</span>
                    <span className="font-semibold">
                      {getTendenciaIcon(data.estadisticas.tendencia)} {data.estadisticas.tendencia}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última evaluación:</span>
                    <span className="text-sm">
                      {formatDate(data.estadisticas.ultimaEvaluacion)}
                    </span>
                  </div>
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
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-lg font-bold text-blue-600">{data.estadisticas.promedioPD}</div>
                    <div className="text-sm text-blue-800">Promedio PD</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-lg font-bold text-green-600">{data.estadisticas.mejorPD}</div>
                    <div className="text-sm text-green-800">Mejor Puntaje</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-lg font-bold text-red-600">{data.estadisticas.peorPD}</div>
                    <div className="text-sm text-red-800">Menor Puntaje</div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PD</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PC</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Errores</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.evaluaciones.map((evaluacion, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatDate(evaluacion.fecha)}
                          </td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                            {evaluacion.puntajeDirecto}
                          </td>
                          <td className={`px-4 py-2 text-sm font-semibold ${getInterpretacionColor(evaluacion.percentil)}`}>
                            {evaluacion.percentil || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {evaluacion.errores || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {evaluacion.tiempoSegundos ? formatTime(evaluacion.tiempoSegundos) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  <div key={aptitud.codigo} className="flex justify-between items-center p-3 bg-green-50 rounded">
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
                  <div key={aptitud.codigo} className="flex justify-between items-center p-3 bg-orange-50 rounded">
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

      {activeTab === 'recomendaciones' && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-blue-700">💡 Recomendaciones</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recomendaciones.map((recomendacion, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 text-xl">💡</div>
                  <p className="text-blue-800 flex-1">{recomendacion}</p>
                </div>
              ))}
              
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

      {/* Footer con información de generación */}
      <div className="text-center text-sm text-gray-500 py-4">
        Reporte generado el {formatDate(patientReport.fechaGeneracion)}
      </div>
    </div>
  );
};

export default PatientResultsDashboard;