import React from 'react';
import { FaUsers, FaCoins, FaChartBar, FaClock } from 'react-icons/fa';

/**
 * Reusable statistics card component for pin metrics
 */
const PinStatisticsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-200',
    green: 'from-green-500 to-green-600 text-green-200',
    orange: 'from-orange-500 to-orange-600 text-orange-200',
    purple: 'from-purple-500 to-purple-600 text-purple-200'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${colorClasses[color].split(' ')[2]} text-sm font-medium`}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className={`${colorClasses[color].split(' ')[2]} text-xs mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[2]}`} />
      </div>
    </div>
  );
};

export default PinStatisticsCard;