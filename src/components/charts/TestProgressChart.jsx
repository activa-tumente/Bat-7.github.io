import React from 'react';

/**
 * Componente que renderiza 7 gráficos circulares horizontales para mostrar el progreso de cada aptitud
 * @param {array} completedTests - Array de tests completados
 * @param {array} allTests - Array de todos los tests disponibles
 * @param {number} totalTime - Tiempo total en segundos
 */
export const TestProgressChart = ({ completedTests = [], allTests = [], totalTime = 0 }) => {
  // Definir las 7 aptitudes del BAT-7
  const aptitudes = [
    { codigo: 'V', nombre: 'Verbal', color: '#3B82F6' },
    { codigo: 'E', nombre: 'Espacial', color: '#6366F1' },
    { codigo: 'A', nombre: 'Atención', color: '#EF4444' },
    { codigo: 'R', nombre: 'Razonamiento', color: '#F59E0B' },
    { codigo: 'N', nombre: 'Numérica', color: '#14B8A6' },
    { codigo: 'M', nombre: 'Mecánica', color: '#64748B' },
    { codigo: 'O', nombre: 'Ortografía', color: '#10B981' }
  ];

  // Si no hay datos, mostrar mensaje
  if (allTests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay tests disponibles</p>
      </div>
    );
  }

  // Función para formatear tiempo
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Crear datos para cada aptitud
  const aptitudeData = aptitudes.map(aptitud => {
    const testCompleted = completedTests.find(test => test.aptitudes?.codigo === aptitud.codigo);
    const testAvailable = allTests.find(test => test.abbreviation === aptitud.codigo);
    
    return {
      ...aptitud,
      completed: !!testCompleted,
      available: !!testAvailable,
      puntaje: testCompleted?.puntaje_directo || 0,
      fecha: testCompleted?.created_at || null
    };
  });

  // Componente para un gráfico circular individual
  const SingleAptitudeChart = ({ aptitud }) => {
    const percentage = aptitud.completed ? 100 : 0;
    const circumference = 2 * Math.PI * 30; // radio de 30 (aumentado)
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
      <div className="flex flex-col items-center flex-1 min-w-0">
        <div className="relative mb-3">
          <svg viewBox="0 0 80 80" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
            {/* Círculo de fondo */}
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="6"
            />
            {/* Círculo de progreso */}
            {aptitud.available && (
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="none"
                stroke={aptitud.completed ? aptitud.color : '#E5E7EB'}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset="0"
                transform="rotate(-90 40 40)"
                strokeLinecap="round"
              />
            )}
          </svg>
          {/* Contenido central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm sm:text-base font-bold" style={{ color: aptitud.color }}>
              {aptitud.codigo}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {aptitud.nombre}
          </div>
          {aptitud.completed ? (
            <div className="text-xs sm:text-sm text-green-600 font-semibold">
              PD: {aptitud.puntaje}
            </div>
          ) : aptitud.available ? (
            <div className="text-xs sm:text-sm text-gray-500">
              Pendiente
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-400">
              No disponible
            </div>
          )}
        </div>
      </div>
    );
  };

  const completedCount = aptitudeData.filter(apt => apt.completed).length;
  const availableCount = aptitudeData.filter(apt => apt.available).length;

  return (
    <div className="flex flex-col items-center">
      {/* Gráficos circulares horizontales */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-4 mb-6">
          {aptitudeData.map((aptitud, index) => (
            <SingleAptitudeChart key={index} aptitud={aptitud} />
          ))}
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700">
            Completados: <span className="font-semibold">{completedCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-700">
            Pendientes: <span className="font-semibold">{availableCount - completedCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <i className="fas fa-clock text-purple-600"></i>
          <span className="text-sm text-gray-700">
            Tiempo total: <span className="font-semibold">{formatTime(totalTime)}</span>
          </span>
        </div>
      </div>
      
      {/* Progreso general */}
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-800">
          {completedCount} de {availableCount} tests
        </div>
        <div className="text-sm text-gray-500">
          {availableCount > 0 ? `${((completedCount / availableCount) * 100).toFixed(0)}% completado` : 'Sin progreso'}
        </div>
      </div>
    </div>
  );
};