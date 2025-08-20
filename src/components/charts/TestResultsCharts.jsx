import React, { useState } from 'react';
import { PieChart } from './PieChart';

/**
 * Componente que muestra gráficos circulares individuales para cada test completado
 * @param {array} results - Array de resultados de tests con datos detallados
 * @param {array} completedTests - Array de tests completados desde el contexto
 * @param {string} selectedLevel - Nivel educativo seleccionado
 */
export const TestResultsCharts = ({ results = [], completedTests = [], selectedLevel = 'E' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Filtrar solo resultados que tienen datos detallados
  const resultsWithDetails = results.filter(result =>
    result.respuestas_correctas !== null &&
    result.respuestas_incorrectas !== null &&
    result.respuestas_sin_contestar !== null
  );

  // Definir todos los tests disponibles por nivel
  const testsByLevel = {
    E: [
      { id: 'verbal', name: 'Aptitud Verbal', code: 'V' },
      { id: 'espacial', name: 'Aptitud Espacial', code: 'E' },
      { id: 'atencion', name: 'Atención y Concentración', code: 'A' },
      { id: 'razonamiento', name: 'Razonamiento', code: 'R' },
      { id: 'numerico', name: 'Aptitud Numérica', code: 'N' },
      { id: 'mecanico', name: 'Comprensión Mecánica', code: 'M' },
      { id: 'ortografia', name: 'Ortografía', code: 'O' }
    ],
    B: [], // Bachillerato (pendiente)
    S: []  // Superior (pendiente)
  };

  // Calcular estadísticas en tiempo real
  const totalTestsAvailable = testsByLevel[selectedLevel]?.length || 0;
  const completedCount = completedTests.length || 0;
  const pendingCount = totalTestsAvailable - completedCount;
  const progressPercentage = totalTestsAvailable > 0 ? Math.round((completedCount / totalTestsAvailable) * 100) : 0;

  if (resultsWithDetails.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
          Resultados de Tests Aplicados
        </h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <i className="fas fa-chart-pie text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-500">No hay resultados detallados disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Los gráficos aparecerán cuando se completen tests</p>
        </div>
      </div>
    );
  }

  // Función para obtener el color del test
  const getTestColor = (codigo) => {
    const colors = {
      'V': '#3B82F6', // blue-500
      'E': '#6366F1', // indigo-500
      'A': '#EF4444', // red-500
      'R': '#F59E0B', // amber-500
      'N': '#14B8A6', // teal-500
      'M': '#64748B', // slate-500
      'O': '#10B981'  // green-500
    };
    return colors[codigo] || '#6B7280'; // gray-500
  };

  // Función para formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
        Resultados de Tests Aplicados
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resultsWithDetails.map((result) => {
          const totalQuestions = result.total_preguntas || 0;
          const correctPercentage = totalQuestions > 0 ? ((result.respuestas_correctas || 0) / totalQuestions * 100).toFixed(1) : 0;

          return (
            <div key={result.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              {/* Header del test */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mr-2"
                    style={{ backgroundColor: getTestColor(result.aptitudes?.codigo) }}
                  >
                    {result.aptitudes?.codigo || 'N/A'}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      {result.aptitudes?.nombre || 'Test'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(result.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedResult(result);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  title="Ver gráfico"
                >
                  <i className="fas fa-chart-pie mr-1"></i>
                  Gráfico
                </button>
              </div>

              {/* Estadísticas principales */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-sm text-gray-600">Porcentaje de Aciertos:</span>
                  <span className="text-lg font-bold text-green-600">{correctPercentage}%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Correctas:</span>
                    <span className="font-medium text-green-600">{result.respuestas_correctas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incorrectas:</span>
                    <span className="font-medium text-red-600">{result.respuestas_incorrectas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PD:</span>
                    <span className="font-medium text-blue-600">{result.puntaje_directo || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PC:</span>
                    <span className="font-medium text-purple-600">{result.percentil || 0}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600">Tiempo:</span>
                    <span className="font-medium text-gray-800">{formatTime(result.tiempo_segundos || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen general en tiempo real */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{completedCount}</div>
            <div className="text-xs text-gray-600">Tests Completados</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-lg font-bold text-orange-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">Tests Pendientes</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">{progressPercentage}%</div>
            <div className="text-xs text-gray-600">Progreso Total</div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              {resultsWithDetails.reduce((sum, r) => sum + (r.respuestas_correctas || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">Total Correctas</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-600">
              {formatTime(resultsWithDetails.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0))}
            </div>
            <div className="text-xs text-gray-600">Tiempo Total</div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso de Evaluación</span>
            <span>{completedCount} de {totalTestsAvailable} tests</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Modal para mostrar información detallada */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Resultados Detallados - {selectedResult.aptitudes?.nombre || 'Test'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de resultados */}
              <div className="text-center">
                <h5 className="text-lg font-semibold text-gray-800 mb-4">Resultados</h5>
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48">
                    <PieChart 
                      data={[
                        {
                          name: 'Correctas',
                          value: selectedResult.respuestas_correctas || 0,
                          color: '#10B981'
                        },
                        {
                          name: 'Incorrectas', 
                          value: selectedResult.respuestas_incorrectas || 0,
                          color: '#EF4444'
                        },
                        {
                          name: 'Sin Responder',
                          value: selectedResult.respuestas_sin_contestar || 0,
                          color: '#6B7280'
                        }
                      ].filter(item => item.value > 0)}
                      width={192}
                      height={192}
                      centerText={`${((selectedResult.respuestas_correctas || 0) / (selectedResult.total_preguntas || 1) * 100).toFixed(1)}%`}
                      centerSubtext="Aciertos"
                    />
                  </div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              <div>
                <h5 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Respuestas correctas</span>
                    </div>
                    <span className="font-semibold text-gray-800">{selectedResult.respuestas_correctas || 0} de {selectedResult.total_preguntas || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Respuestas incorrectas</span>
                    </div>
                    <span className="font-semibold text-gray-800">{selectedResult.respuestas_incorrectas || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Sin responder</span>
                    </div>
                    <span className="font-semibold text-gray-800">{selectedResult.respuestas_sin_contestar || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-700 font-medium">Tiempo utilizado</span>
                    <span className="font-semibold text-blue-800">{formatTime(selectedResult.tiempo_segundos || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-purple-700 font-medium">Puntaje Directo</span>
                    <span className="font-bold text-purple-800 text-lg">{selectedResult.puntaje_directo || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <span className="text-indigo-700 font-medium">Percentil (PC)</span>
                    <span className="font-bold text-indigo-800 text-lg">{selectedResult.percentil || 0}</span>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h6 className="text-sm font-semibold text-blue-800 mb-2">
                    <i className="fas fa-lightbulb mr-1"></i>
                    Recomendaciones
                  </h6>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                      Continúa practicando ejercicios similares para mejorar tu desempeño
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                      Revisa los conceptos básicos relacionados con este tipo de prueba
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check text-green-600 mr-2 mt-0.5 text-xs"></i>
                      Analiza las preguntas que te resultaron más difíciles para identificar áreas de mejora
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultsCharts;