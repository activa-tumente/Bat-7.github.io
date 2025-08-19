/**
 * @file EnhancedReports.jsx
 * @description Enhanced Reports component with improved performance and modular structure
 * Combines the functionality from the backup with modern React patterns
 */

import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { FaChartBar, FaFileAlt, FaUsers, FaTasks, FaChartLine } from 'react-icons/fa';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { debounce } from '../../utils/performance';

// Lazy load heavy components for better performance
const RefactoredInformesExample = React.lazy(() =>
  import('../../components/reports/RefactoredInformesExample')
);

const VerificarPacientesNuevos = React.lazy(() => 
  import('../../components/admin/VerificarPacientesNuevos')
);

/**
 * Executive Summary Component with memoization for performance
 */
const ExecutiveSummary = React.memo(() => {
  const summaryData = useMemo(() => [
    { 
      value: 6, 
      label: 'Pacientes Evaluados', 
      color: 'blue',
      icon: FaUsers,
      description: 'Total de pacientes con evaluaciones'
    },
    { 
      value: 24, 
      label: 'Tests Completados', 
      color: 'green',
      icon: FaTasks,
      description: 'Evaluaciones finalizadas'
    },
    { 
      value: 9, 
      label: 'Aptitudes Altas', 
      color: 'yellow',
      icon: FaChartLine,
      description: 'Resultados sobresalientes'
    },
    { 
      value: 1, 
      label: 'A Reforzar', 
      color: 'orange',
      icon: FaChartBar,
      description: 'Áreas de mejora identificadas'
    },
    { 
      value: 67, 
      label: 'PC Promedio Global', 
      color: 'purple',
      icon: FaFileAlt,
      description: 'Percentil promedio general'
    }
  ], []);

  return (
    <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-indigo-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
            <FaChartBar className="text-white text-xl" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-800">
              📊 Resumen Ejecutivo - Sistema BAT-7
            </h2>
            <p className="text-sm text-indigo-600 mt-1">
              Vista general de todos los pacientes con evaluaciones completadas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {summaryData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={`summary-${index}`}
                className={`bg-${item.color}-50 p-6 rounded-lg border border-${item.color}-200 text-center hover:shadow-md transition-shadow duration-200`}
                role="region"
                aria-label={`${item.label}: ${item.value}`}
              >
                <div className="flex justify-center mb-3">
                  <IconComponent className={`text-2xl text-${item.color}-600`} />
                </div>
                <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>
                  {item.value}
                </div>
                <div className={`text-sm text-${item.color}-700 font-medium mb-1`}>
                  {item.label}
                </div>
                <div className={`text-xs text-${item.color}-600 opacity-75`}>
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
});

ExecutiveSummary.displayName = 'ExecutiveSummary';

/**
 * Tab Navigation Component
 */
const TabNavigation = React.memo(({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === tab.id 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
        >
          <tab.icon className="mr-2" />
          {tab.label}
        </button>
      ))}
    </div>
  );
});

TabNavigation.displayName = 'TabNavigation';

/**
 * Loading Fallback Component
 */
const LoadingFallback = ({ message = "Cargando..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

/**
 * Enhanced Reports Main Component
 */
const EnhancedReports = () => {
  const [activeTab, setActiveTab] = useState('informes');
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoize tabs configuration
  const tabs = useMemo(() => [
    {
      id: 'informes',
      label: 'Informes Generados',
      icon: FaFileAlt,
      component: RefactoredInformesExample
    },
    {
      id: 'pacientes',
      label: 'Verificar Pacientes',
      icon: FaUsers,
      component: VerificarPacientesNuevos
    }
  ], []);

  // Debounced tab change to prevent rapid switching
  const debouncedTabChange = useCallback(
    debounce((tabId) => {
      setActiveTab(tabId);
    }, 150),
    []
  );

  // Handle refresh with key change to force re-render
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Get current tab configuration
  const currentTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTab),
    [tabs, activeTab]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Informes y Reportes"
        subtitle="Gestión completa de informes psicométricos"
        icon={FaChartBar}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Executive Summary */}
        <ErrorBoundary fallbackMessage="Error cargando el resumen ejecutivo.">
          <ExecutiveSummary />
        </ErrorBoundary>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Módulos de Gestión
          </h3>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <FaChartBar className="mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={debouncedTabChange}
          tabs={tabs}
        />

        {/* Tab Content */}
        <div 
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <ErrorBoundary 
            fallbackMessage={`Error cargando ${currentTab?.label}. Por favor, intenta nuevamente.`}
          >
            <Suspense 
              fallback={
                <LoadingFallback 
                  message={`Cargando ${currentTab?.label}...`} 
                />
              }
            >
              {currentTab && (
                <div key={`${currentTab.id}-${refreshKey}`}>
                  <currentTab.component />
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <FaChartBar className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  💡 Ayuda y Consejos
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use la pestaña "Informes Generados" para gestionar reportes existentes</li>
                  <li>• La pestaña "Verificar Pacientes" permite revisar nuevos registros</li>
                  <li>• El botón "Actualizar" refresca todos los datos en tiempo real</li>
                  <li>• Los componentes se cargan de forma optimizada para mejor rendimiento</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedReports;