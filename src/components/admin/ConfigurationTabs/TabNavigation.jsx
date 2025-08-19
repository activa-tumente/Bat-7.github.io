import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable tab navigation component
 * Follows BAT-7 accessibility guidelines
 */
const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="border-b border-gray-200">
        <nav 
          className="flex space-x-8 px-6" 
          aria-label="Configuration tabs"
          role="tablist"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm 
                  transition-colors duration-200 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab description */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    description: PropTypes.string.isRequired
  })).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default TabNavigation;