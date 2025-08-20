import React, { Suspense } from 'react';
import { FaCog } from 'react-icons/fa';
import { ErrorBoundary } from 'react-error-boundary';

import PageHeader from '../../components/ui/PageHeader';
import TabNavigation from '../../components/admin/ConfigurationTabs/TabNavigation';
import TabContentStrategy from '../../components/admin/ConfigurationTabs/TabContentStrategy';
import { useConfigurationTabs } from '../../hooks/useConfigurationTabs';

/**
 * Improved Configuration component with better architecture
 * - Separated concerns using Strategy pattern
 * - Custom hook for tab management
 * - Error boundaries for resilience
 * - Lazy loading for performance
 * - Accessibility improvements
 */
const ConfiguracionImproved = () => {
  const {
    activeTab,
    availableTabs,
    isAdmin,
    user,
    userRole,
    handleTabChange
  } = useConfigurationTabs();

  // Error fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error al cargar el contenido
      </h3>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Cargando contenido...</span>
    </div>
  );

  // Access denied component
  const AccessDenied = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="text-yellow-800">
          <h3 className="text-lg font-medium">Acceso Restringido</h3>
          <p className="mt-2">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    </div>
  );

  // Render tab content with error boundary and suspense
  const renderTabContent = () => {
    const TabComponent = TabContentStrategy.getComponent(activeTab);
    
    if (!TabComponent) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Contenido no disponible</p>
        </div>
      );
    }

    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            <TabComponent user={user} userRole={userRole} isAdmin={isAdmin} />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Early return for access denied
  if (!isAdmin && availableTabs.length === 0) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Gestiona usuarios, configuraciones y estadísticas del sistema"
        icon={FaCog}
      />

      <div className="container mx-auto px-4 py-8">
        <TabNavigation
          tabs={availableTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow-md p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>
            Sistema de Administración BAT-7 • 
            Usuario: {user?.nombre} {user?.apellido} • 
            Rol: {userRole || user?.tipo_usuario}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ConfiguracionImproved;