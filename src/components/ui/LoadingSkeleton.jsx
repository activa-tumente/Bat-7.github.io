/**
 * @file LoadingSkeleton.jsx
 * @description Skeleton loading component for better perceived performance
 */

import React from 'react';

const LoadingSkeleton = ({ 
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
  ...props
}) => {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    avatar: 'rounded-full w-10 h-10'
  };

  const getSkeletonClasses = () => {
    return `
      ${baseClasses}
      ${animationClasses[animation] || animationClasses.pulse}
      ${variantClasses[variant] || variantClasses.rectangular}
      ${className}
    `.trim();
  };

  const getStyle = () => {
    const style = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={getSkeletonClasses()}
            style={{
              ...getStyle(),
              width: index === lines - 1 ? '75%' : '100%' // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={getSkeletonClasses()}
      style={getStyle()}
      {...props}
    />
  );
};

// Predefined skeleton components for common use cases
const SkeletonText = ({ lines = 3, className = '', ...props }) => (
  <LoadingSkeleton 
    variant="text" 
    lines={lines} 
    className={className}
    {...props} 
  />
);

const SkeletonAvatar = ({ size = 40, className = '', ...props }) => (
  <LoadingSkeleton 
    variant="circular" 
    width={size} 
    height={size} 
    className={className}
    {...props} 
  />
);

const SkeletonCard = ({ className = '', ...props }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`} {...props}>
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonAvatar size={48} />
      <div className="flex-1">
        <LoadingSkeleton variant="text" width="60%" className="mb-2" />
        <LoadingSkeleton variant="text" width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex space-x-2 mt-4">
      <LoadingSkeleton width={80} height={32} />
      <LoadingSkeleton width={80} height={32} />
    </div>
  </div>
);

const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className = '',
  showHeader = true,
  ...props 
}) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`} {...props}>
    {showHeader && (
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }, (_, index) => (
            <LoadingSkeleton 
              key={index} 
              variant="text" 
              width={`${100 / columns}%`}
              className="flex-1"
            />
          ))}
        </div>
      </div>
    )}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3">
          <div className="flex space-x-4">
            {Array.from({ length: columns }, (_, colIndex) => (
              <LoadingSkeleton 
                key={colIndex} 
                variant="text" 
                width={`${100 / columns}%`}
                className="flex-1"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonList = ({ items = 5, className = '', ...props }) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded">
        <SkeletonAvatar size={40} />
        <div className="flex-1">
          <LoadingSkeleton variant="text" width="70%" className="mb-1" />
          <LoadingSkeleton variant="text" width="50%" />
        </div>
        <LoadingSkeleton width={60} height={24} />
      </div>
    ))}
  </div>
);

// Export all components
export {
  LoadingSkeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList
};

export default LoadingSkeleton;