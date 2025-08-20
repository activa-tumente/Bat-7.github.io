import React from 'react';

/**
 * Utilidad para combinar clases CSS
 */
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Variantes de spinner mejoradas
const SpinnerVariants = {
  // Spinner circular clásico
  circle: ({ size, color }) => (
    <svg
      className={cn(
        'animate-spin',
        size === 'xs' && 'h-3 w-3',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-6 w-6',
        size === 'lg' && 'h-8 w-8',
        size === 'xl' && 'h-12 w-12',
        color
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),

  // Puntos pulsantes
  dots: ({ size, color }) => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            size === 'xs' && 'h-1.5 w-1.5',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-4 w-4',
            size === 'xl' && 'h-6 w-6',
            color.replace('text-', 'bg-')
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  ),

  // Barras ondulantes
  bars: ({ size, color }) => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-sm',
            size === 'xs' && 'w-0.5 h-3',
            size === 'sm' && 'w-1 h-4',
            size === 'md' && 'w-1.5 h-6',
            size === 'lg' && 'w-2 h-8',
            size === 'xl' && 'w-3 h-12',
            color.replace('text-', 'bg-')
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  ),

  // Spinner de anillo
  ring: ({ size, color }) => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200',
        size === 'xs' && 'h-3 w-3',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-6 w-6',
        size === 'lg' && 'h-8 w-8',
        size === 'xl' && 'h-12 w-12',
        color.replace('text-', 'border-t-')
      )}
    />
  ),

  // Pulso simple
  pulse: ({ size, color }) => (
    <div
      className={cn(
        'animate-ping rounded-full',
        size === 'xs' && 'h-3 w-3',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-6 w-6',
        size === 'lg' && 'h-8 w-8',
        size === 'xl' && 'h-12 w-12',
        color.replace('text-', 'bg-')
      )}
    />
  )
};

/**
 * Componente de spinner de carga mejorado
 * Soporta múltiples variantes, tamaños y colores
 */
const LoadingSpinner = ({ 
  variant = 'circle',
  size = 'md', 
  color = 'text-blue-600', 
  className = '', 
  text = '', 
  textClassName = '',
  centered = false,
  overlay = false,
  fullScreen = false,
  ...props
}) => {
  // Mapeo de colores legacy para compatibilidad
  const legacyColorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  // Convertir color legacy si es necesario
  const resolvedColor = legacyColorMap[color] || color;
  
  const SpinnerComponent = SpinnerVariants[variant] || SpinnerVariants.circle;

  const spinnerElement = (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2',
        className
      )}
      role="status"
      aria-label={text || 'Cargando...'}
      {...props}
    >
      <SpinnerComponent size={size} color={resolvedColor} />
      {text && (
        <p
          className={cn(
            'text-sm font-medium',
            resolvedColor,
            textClassName
          )}
        >
          {text}
        </p>
      )}
      <span className="sr-only">{text || 'Cargando...'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {spinnerElement}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
        {spinnerElement}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

/**
 * Spinner con overlay para cubrir toda la pantalla
 */
export const FullScreenSpinner = ({ text = 'Cargando...', onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" color="blue" />
          <p className="mt-4 text-gray-700 font-medium">{text}</p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Spinner inline para botones
 */
export const ButtonSpinner = ({ size = 'sm', color = 'white' }) => {
  return (
    <LoadingSpinner 
      size={size} 
      color={color} 
      className="mr-2" 
    />
  );
};

/**
 * Spinner con puntos animados
 */
export const DotSpinner = ({ color = 'blue', className = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Cargando">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${colorClasses[color]} animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );
};

/**
 * Spinner con texto de estado personalizable
 */
export const StatusSpinner = ({ 
  status = 'Cargando...', 
  substatus = '', 
  progress = null,
  size = 'md',
  color = 'blue' 
}) => {
  return (
    <div className="text-center space-y-3">
      <LoadingSpinner size={size} color={color} />
      <div>
        <p className="text-sm font-medium text-gray-700">{status}</p>
        {substatus && (
          <p className="text-xs text-gray-500 mt-1">{substatus}</p>
        )}
        {progress !== null && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`bg-${color}-600 h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;