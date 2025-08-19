import React from 'react';

/**
 * Componente de barra de progreso reutilizable
 * Soporta diferentes estilos, colores y animaciones
 */
const ProgressBar = ({
  progress = 0,
  max = 100,
  min = 0,
  size = 'md',
  color = 'blue',
  variant = 'default',
  showLabel = false,
  label = '',
  animated = true,
  striped = false,
  className = '',
  ...props
}) => {
  // Normalizar el progreso entre 0 y 100
  const normalizedProgress = Math.min(max, Math.max(min, progress));
  const percentage = ((normalizedProgress - min) / (max - min)) * 100;

  // Clases de tamaño
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  // Clases de color
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    gray: 'bg-gray-600',
    indigo: 'bg-indigo-600',
    pink: 'bg-pink-600'
  };

  // Clases de fondo
  const backgroundClasses = {
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    red: 'bg-red-200',
    yellow: 'bg-yellow-200',
    purple: 'bg-purple-200',
    orange: 'bg-orange-200',
    gray: 'bg-gray-200',
    indigo: 'bg-indigo-200',
    pink: 'bg-pink-200'
  };

  // Clases de variante
  const variantClasses = {
    default: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-md'
  };

  // Clases de animación
  const animationClasses = animated ? 'transition-all duration-300 ease-out' : '';
  const stripedClasses = striped ? 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:20px_20px] animate-pulse' : '';

  // Determinar el color basado en el porcentaje (para barras de estado)
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 70) return 'blue';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 30) return 'orange';
    return 'red';
  };

  const finalColor = color === 'auto' ? getStatusColor(percentage) : color;
  const displayLabel = label || (showLabel ? `${Math.round(percentage)}%` : '');

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Label superior */}
      {displayLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
          {showLabel && !label && (
            <span className="text-sm text-gray-500">
              {normalizedProgress} / {max}
            </span>
          )}
        </div>
      )}
      
      {/* Contenedor de la barra */}
      <div 
        className={`w-full ${backgroundClasses[finalColor]} ${sizeClasses[size]} ${variantClasses[variant]} overflow-hidden relative`}
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={displayLabel || `Progreso: ${Math.round(percentage)}%`}
      >
        {/* Barra de progreso */}
        <div
          className={`h-full ${colorClasses[finalColor]} ${animationClasses} ${stripedClasses} relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Efecto de brillo para barras animadas */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
          )}
        </div>
        
        {/* Indicador de posición para barras grandes */}
        {size === 'xl' && percentage > 0 && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-white opacity-50"
            style={{ left: `${percentage}%` }}
          />
        )}
      </div>
      
      {/* Información adicional */}
      {size === 'xl' && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Barra de progreso circular
 */
export const CircularProgressBar = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  color = 'blue',
  backgroundColor = 'gray-200',
  showLabel = true,
  label = '',
  className = ''
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colorClasses = {
    blue: 'stroke-blue-600',
    green: 'stroke-green-600',
    red: 'stroke-red-600',
    yellow: 'stroke-yellow-600',
    purple: 'stroke-purple-600',
    orange: 'stroke-orange-600'
  };

  const backgroundColorClasses = {
    'gray-200': 'stroke-gray-200',
    'gray-300': 'stroke-gray-300',
    'blue-100': 'stroke-blue-100',
    'green-100': 'stroke-green-100'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={backgroundColorClasses[backgroundColor]}
          strokeWidth={strokeWidth}
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${colorClasses[color]} transition-all duration-300 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Label central */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {label || `${Math.round(normalizedProgress)}%`}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Barra de progreso con múltiples segmentos
 */
export const MultiProgressBar = ({
  segments = [],
  size = 'md',
  variant = 'default',
  showLabels = false,
  className = ''
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const variantClasses = {
    default: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-md'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${segment.color}`} />
              <span className="text-xs text-gray-600">
                {segment.label} ({segment.value})
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Barra de progreso */}
      <div className={`w-full bg-gray-200 ${sizeClasses[size]} ${variantClasses[variant]} overflow-hidden flex`}>
        {segments.map((segment, index) => {
          const percentage = total > 0 ? (segment.value / total) * 100 : 0;
          return (
            <div
              key={index}
              className={`${segment.color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
              title={`${segment.label}: ${segment.value} (${Math.round(percentage)}%)`}
            />
          );
        })}
      </div>
      
      {/* Total */}
      {showLabels && (
        <div className="text-right mt-1">
          <span className="text-xs text-gray-500">Total: {total}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Barra de progreso con pasos
 */
export const StepProgressBar = ({
  steps = [],
  currentStep = 0,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Círculo del paso */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                isCompleted ? 'bg-green-600 text-white' :
                isCurrent ? 'bg-blue-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              {/* Label del paso */}
              <span className={`text-xs mt-1 text-center ${
                isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full ${sizeClasses[size]} ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                } transform translate-x-4`} style={{ zIndex: -1 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;