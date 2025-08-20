import React, { memo } from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Componente de loading spinner optimizado
 * Memoizado para evitar re-renders innecesarios
 */
const LoadingSpinner = memo(({ 
  size = 'md', 
  color = 'blue', 
  text = 'Cargando...', 
  fullScreen = false,
  className = '',
  showText = true,
  testId = 'loading-spinner'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  const spinnerClass = `animate-spin ${sizeClasses[size]} ${colorClasses[color]}`;

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <FaSpinner className={spinnerClass} data-testid={testId} />
      {showText && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
