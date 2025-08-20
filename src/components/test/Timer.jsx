import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra un temporizador con formato mm:ss
 * @param {number} timeRemaining - Tiempo restante en segundos
 * @param {function} formatTime - Función para formatear el tiempo
 */
const Timer = ({ timeRemaining, formatTime }) => {
  // Determinar el color basado en el tiempo restante
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600'; // Último minuto
    if (timeRemaining <= 180) return 'text-yellow-600'; // Últimos 3 minutos
    return 'text-green-600'; // Tiempo normal
  };

  return (
    <div className="flex items-center">
      <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`font-mono font-medium ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
};

Timer.propTypes = {
  timeRemaining: PropTypes.number.isRequired,
  formatTime: PropTypes.func.isRequired
};

export default Timer;