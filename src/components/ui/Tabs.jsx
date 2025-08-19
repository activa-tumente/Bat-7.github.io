import React, { useState, useEffect, Children } from 'react';

export const Tabs = ({ children, activeTab = 0, onChange }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (index) => {
    setCurrentTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  // Extraer TabList y TabPanels de los children
  let tabList = null;
  let tabPanels = [];

  Children.forEach(children, (child) => {
    if (!child) {
      return;
    }

    if (!child.type) {
      return;
    }

    if (child.type === TabList) {
      tabList = React.cloneElement(child, {
        activeTab: currentTab,
        onTabChange: handleTabChange
      });
    } else if (child.type === TabPanel) {
      tabPanels.push(child);
    }
  });

  return (
    <div className="tabs">
      {tabList}
      <div className="tab-content mt-4">
        {tabPanels.length > 0 ? (
          <>
            {tabPanels[currentTab]}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No hay contenido disponible
          </div>
        )}
      </div>
    </div>
  );
};

export const TabList = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="-mb-px flex space-x-1">
        {Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            isActive: index === activeTab,
            onClick: () => onTabChange(index),
            index
          });
        })}
      </nav>
    </div>
  );
};

export const Tab = ({ children, isActive, onClick }) => {
  return (
    <button
      className={`py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'border-blue-600 text-blue-700 bg-blue-50'
          : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabPanel = ({ children }) => {
  return (
    <div className="tab-panel animate-fadeIn">
      {children || (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200 my-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contenido disponible</h3>
          <p className="mt-1 text-sm text-gray-500">No hay contenido disponible para esta pestaña</p>
        </div>
      )}
    </div>
  );
};

// No exportamos un default, solo los componentes individuales
