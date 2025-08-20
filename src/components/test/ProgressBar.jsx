import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra una barra de progreso
 * @param {number} progress - Porcentaje de progreso (0-100)
 */
const ProgressBar = ({ progress }) => {
  // Asegurar que el progreso esté entre 0 y 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);
  
  // Determinar el color basado en el progreso
  const getProgressColor = () => {
    if (normalizedProgress < 30) return 'bg-red-500';
    if (normalizedProgress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
        style={{ width: `${normalizedProgress}%` }}
      ></div>
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired
};

export default ProgressBar;