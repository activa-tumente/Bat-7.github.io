import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import ModernBarChart from '../charts/ModernBarChart';

const EnhancedReportViewer = ({ report }) => {
  if (!report || !report.contenido) {
    return null;
  }

  const contenido = report.contenido;
  const paciente = contenido.paciente || report.pacientes;
  const isCompleteReport = report.tipo_informe === 'evaluacion_completa';

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const getTestColor = (testCode) => {
    const colors = {
      'V': 'blue',
      'E': 'indigo',
      'A': 'red',
      'R': 'amber',
      'N': 'teal',
      'M': 'slate',
      'O': 'green'
    };
    return colors[testCode] || 'gray';
  };

  if (isCompleteReport && contenido.resultados) {
    // Informe completo con múltiples tests
    const resultsWithPercentiles = contenido.resultados.filter(r => r.puntajes?.percentil);
    
    return (
      <div className="space-y-6">
        {/* Resumen general */}
        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-chart-pie mr-2"></i>
              Resumen General
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {contenido.resumen?.total_tests || contenido.resultados.length}
                </div>
                <div className="text-sm font-medium text-blue-700">
                  Tests Completados
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {contenido.resumen?.promedio_percentil || 'N/A'}
                </div>
                <div className="text-sm font-medium text-green-700">
                  Percentil Promedio
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {contenido.resultados.filter(r => r.puntajes?.percentil && r.puntajes.percentil >= 70).length}
                </div>
                <div className="text-sm font-medium text-purple-700">
                  Aptitudes Altas
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {contenido.resultados.filter(r => r.puntajes?.percentil && r.puntajes.percentil < 30).length}
                </div>
                <div className="text-sm font-medium text-orange-700">
                  Aptitudes a Reforzar
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Gráfico de perfil de aptitudes */}
        {resultsWithPercentiles.length > 0 && (
          <Card>
            <CardHeader className="bg-indigo-50 border-b">
              <h2 className="text-xl font-semibold text-blue-800">
                <i className="fas fa-chart-bar mr-2"></i>
                Perfil de Aptitudes
              </h2>
            </CardHeader>
            <CardBody>
              <ModernBarChart
                data={resultsWithPercentiles.map(resultado => ({
                  code: resultado.test?.codigo,
                  name: resultado.test?.nombre,
                  value: resultado.puntajes?.percentil
                }))}
                title="Distribución de Percentiles por Aptitud"
                height={400}
              />
            </CardBody>
          </Card>
        )}

        {/* Resultados detallados */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-list-alt mr-2"></i>
              Resultados Detallados por Aptitud
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {contenido.resultados.map((resultado, index) => {
                const testColor = getTestColor(resultado.test?.codigo);
                return (
                  <div key={index} className={`p-6 border border-${testColor}-200 bg-${testColor}-50 rounded-lg`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-${testColor}-100 rounded-full flex items-center justify-center mr-4`}>
                        <i className={`${getTestIcon(resultado.test?.codigo)} text-${testColor}-600 text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{resultado.test?.nombre}</h3>
                        <p className="text-sm text-gray-600">{resultado.test?.descripcion}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {resultado.puntajes?.puntaje_directo || 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-orange-700">
                          Puntaje PD
                        </div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {resultado.puntajes?.percentil || 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-blue-700">
                          Percentil PC
                        </div>
                      </div>
                    </div>

                    {resultado.interpretacion && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        resultado.interpretacion.nivel === 'Alto' || resultado.interpretacion.nivel === 'Muy Alto' ? 'bg-green-100 text-green-800' :
                        resultado.interpretacion.nivel === 'Medio-Alto' ? 'bg-blue-100 text-blue-800' :
                        resultado.interpretacion.nivel === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                        resultado.interpretacion.nivel === 'Medio-Bajo' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <div className="text-sm font-semibold">
                          Interpretación: {resultado.interpretacion.nivel}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Errores:</span>
                        <span className="ml-1 font-medium">{resultado.puntajes?.errores || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tiempo:</span>
                        <span className="ml-1 font-medium">
                          {resultado.puntajes?.tiempo_segundos ? 
                            `${Math.round(resultado.puntajes.tiempo_segundos / 60)}:${String(resultado.puntajes.tiempo_segundos % 60).padStart(2, '0')}` : 
                            'N/A'
                          }
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="ml-1 font-medium">
                          {new Date(resultado.fecha_evaluacion).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <CardHeader className="bg-yellow-50 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-lightbulb mr-2"></i>
              Recomendaciones Generales
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {contenido.resumen?.promedio_percentil && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Análisis General del Rendimiento</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    El evaluado presenta un percentil promedio de {contenido.resumen.promedio_percentil}, lo que indica un rendimiento{' '}
                    {contenido.resumen.promedio_percentil >= 70 ? 'por encima del promedio' : 
                     contenido.resumen.promedio_percentil >= 30 ? 'en el rango promedio' : 'por debajo del promedio'}{' '}
                    en las aptitudes evaluadas.
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Recomendaciones Específicas</h4>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  {contenido.resultados.filter(r => r.puntajes?.percentil && r.puntajes.percentil >= 85).length > 0 && (
                    <li>Considerar actividades de enriquecimiento en las aptitudes con alto rendimiento</li>
                  )}
                  {contenido.resultados.filter(r => r.puntajes?.percentil && r.puntajes.percentil < 30).length > 0 && (
                    <li>Implementar estrategias de apoyo en las aptitudes con rendimiento bajo</li>
                  )}
                  <li>Realizar seguimiento periódico del progreso en todas las aptitudes</li>
                  <li>Considerar la aplicación de tests complementarios según las necesidades identificadas</li>
                  <li>Mantener un registro detallado de las intervenciones y su efectividad</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  } else {
    // Informe individual de un solo test
    return (
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            <i className="fas fa-chart-bar mr-2"></i>
            Resultado de la Evaluación Individual
          </h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500">Visualización de informe individual en desarrollo...</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-xs text-gray-600 text-left overflow-auto">
                {JSON.stringify(contenido, null, 2)}
              </pre>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }
};

export default EnhancedReportViewer;
