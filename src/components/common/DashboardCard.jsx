import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable dashboard card component
 * Eliminates code duplication and provides consistent styling
 */
const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  className = '',
  onClick,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  const textColorClasses = {
    blue: 'text-blue-900',
    green: 'text-green-900',
    purple: 'text-purple-900',
    yellow: 'text-yellow-900',
    red: 'text-red-900'
  };

  const cardClasses = `
    ${colorClasses[color]} p-6 rounded-lg border transition-all duration-200
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    ${className}
  `;

  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className="flex items-center">
        <Icon className={`${colorClasses[color].split(' ')[2]} text-2xl mr-3`} />
        <div className="flex-1">
          <p className={`text-sm ${colorClasses[color].split(' ')[2]} opacity-80`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className={`text-xs ${colorClasses[color].split(' ')[2]} opacity-70 mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'yellow', 'red']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  loading: PropTypes.bool
};

export default DashboardCard;