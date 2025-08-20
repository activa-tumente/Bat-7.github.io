import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Loader2, RefreshCw, Download, Upload, Search } from 'lucide-react';

/**
 * Optimized LoadingSpinner component with various loading states and accessibility
 */
const LoadingSpinner = memo(({ 
  size = 'md',
  variant = 'default',
  color = 'blue',
  text = '',
  showText = true,
  textPosition = 'bottom',
  className = '',
  fullScreen = false,
  overlay = false,
  overlayOpacity = 0.5,
  icon: CustomIcon,
  ariaLabel = 'Loading',
  testId = 'loading-spinner',
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16'
  };

  // Color configurations
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white',
    current: 'text-current'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  // Icon variants
  const iconVariants = {
    default: Loader2,
    refresh: RefreshCw,
    download: Download,
    upload: Upload,
    search: Search
  };

  // Select icon
  const IconComponent = CustomIcon || iconVariants[variant] || Loader2;

  // Base spinner classes
  const spinnerClasses = `
    animate-spin
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim();

  // Container classes based on position
  const getContainerClasses = () => {
    const baseClasses = 'flex items-center justify-center';
    
    if (fullScreen) {
      return `${baseClasses} fixed inset-0 z-50 bg-white bg-opacity-75`;
    }
    
    if (overlay) {
      return `${baseClasses} absolute inset-0 z-10`;
    }
    
    const directionClasses = {
      top: 'flex-col',
      bottom: 'flex-col',
      left: 'flex-row',
      right: 'flex-row-reverse'
    };
    
    return `${baseClasses} ${directionClasses[textPosition] || 'flex-col'}`;
  };

  // Text spacing classes
  const getTextSpacing = () => {
    const spacingMap = {
      top: 'mb-2',
      bottom: 'mt-2',
      left: 'mr-2',
      right: 'ml-2'
    };
    return spacingMap[textPosition] || 'mt-2';
  };

  // Render spinner element
  const renderSpinner = () => (
    <IconComponent 
      className={spinnerClasses}
      aria-hidden="true"
      data-testid={`${testId}-icon`}
    />
  );

  // Render text element
  const renderText = () => {
    if (!showText || !text) return null;
    
    return (
      <span 
        className={`${textSizeClasses[size]} ${colorClasses[color]} ${getTextSpacing()}`}
        data-testid={`${testId}-text`}
      >
        {text}
      </span>
    );
  };

  // Render overlay background
  const renderOverlay = () => {
    if (!overlay && !fullScreen) return null;
    
    return (
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />
    );
  };

  return (
    <div 
      className={getContainerClasses()}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      data-testid={testId}
      {...props}
    >
      {renderOverlay()}
      <div className="relative flex items-center justify-center">
        {textPosition === 'top' && renderText()}
        {textPosition === 'left' && renderText()}
        {renderSpinner()}
        {textPosition === 'right' && renderText()}
        {textPosition === 'bottom' && renderText()}
      </div>
    </div>
  );
});

/**
 * Skeleton loading component for content placeholders
 */
export const SkeletonLoader = memo(({ 
  lines = 3,
  width = '100%',
  height = '1rem',
  className = '',
  animate = true,
  variant = 'rounded',
  spacing = 'normal'
}) => {
  const variantClasses = {
    rounded: 'rounded',
    rectangular: '',
    circular: 'rounded-full'
  };

  const spacingClasses = {
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4'
  };

  const animationClass = animate ? 'animate-pulse' : '';

  if (lines === 1) {
    return (
      <div 
        className={`bg-gray-200 ${variantClasses[variant]} ${animationClass} ${className}`}
        style={{ width, height }}
        aria-label="Loading content"
        role="status"
      />
    );
  }

  return (
    <div className={`${spacingClasses[spacing]} ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }, (_, index) => {
        const isLast = index === lines - 1;
        const lineWidth = isLast ? `${Math.random() * 40 + 60}%` : width;
        
        return (
          <div
            key={index}
            className={`bg-gray-200 ${variantClasses[variant]} ${animationClass}`}
            style={{ width: lineWidth, height }}
          />
        );
      })}
    </div>
  );
});

/**
 * Progress bar loading component
 */
export const ProgressBar = memo(({ 
  progress = 0,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = '',
  label = 'Loading progress',
  indeterminate = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  const progressValue = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`} {...props}>
      {showPercentage && !indeterminate && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{Math.round(progressValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${
            indeterminate 
              ? `${colorClasses[color]} animate-pulse` 
              : colorClasses[color]
          }`}
          style={{ 
            width: indeterminate ? '100%' : `${progressValue}%`,
            animation: indeterminate ? 'progress-indeterminate 2s ease-in-out infinite' : undefined
          }}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : progressValue}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={label}
        />
      </div>
    </div>
  );
});

/**
 * Dots loading animation
 */
export const DotsLoader = memo(({ 
  size = 'md',
  color = 'blue',
  count = 3,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
});

// Display names
LoadingSpinner.displayName = 'LoadingSpinner';
SkeletonLoader.displayName = 'SkeletonLoader';
ProgressBar.displayName = 'ProgressBar';
DotsLoader.displayName = 'DotsLoader';

// PropTypes
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  variant: PropTypes.oneOf(['default', 'refresh', 'download', 'upload', 'search']),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'gray', 'white', 'current']),
  text: PropTypes.string,
  showText: PropTypes.bool,
  textPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  overlayOpacity: PropTypes.number,
  icon: PropTypes.elementType,
  ariaLabel: PropTypes.string,
  testId: PropTypes.string
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  animate: PropTypes.bool,
  variant: PropTypes.oneOf(['rounded', 'rectangular', 'circular']),
  spacing: PropTypes.oneOf(['tight', 'normal', 'loose'])
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  showPercentage: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple']),
  className: PropTypes.string,
  label: PropTypes.string,
  indeterminate: PropTypes.bool
};

DotsLoader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple', 'gray']),
  count: PropTypes.number,
  className: PropTypes.string
};

// CSS for indeterminate progress animation
const progressStyles = `
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('progress-styles')) {
  const style = document.createElement('style');
  style.id = 'progress-styles';
  style.textContent = progressStyles;
  document.head.appendChild(style);
}

export default LoadingSpinner;