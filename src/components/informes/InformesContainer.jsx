/**
 * InformesContainer.jsx - Componente refactorizado siguiendo mejores prácticas
 * 
 * Mejoras implementadas:
 * - Separación de responsabilidades
 * - Uso de Context API en lugar de window.addEventListener
 * - Hooks personalizados para lógica de negocio
 * - Manejo centralizado de errores
 * - Optimizaciones de rendimiento
 * - Accesibilidad mejorada
 */

import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useInformes } from '../../hooks/useInformes';
import { useInformesFilters } from '../../hooks/useInformesFilters';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { INFORMES_CONFIG } from '../../config/informes';

// Componentes lazy-loaded
const InformesList = React.lazy(() => import('./InformesList'));
const InformesFilters = React.lazy(() => import('./InformesFilters'));
const InformesPagination = React.lazy(() => import('./InformesPagination'));
const InformesActions = React.lazy(() => import('./InformesActions'));

// Componente de loading
const LoadingSpinner = ({ message = 'Cargando informes...' }) => (
  <div 
    role="status" 
    aria-live="polite"
    className="flex items-center justify-center p-8"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" aria-hidden="true" />
    <span className="text-gray-600">{message}</span>
    <span className="sr-only">{message}</span>
  </div>
);

// Componente de error
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div 
    role="alert"
    className="bg-red-50 border border-red-200 rounded-lg p-6 m-4"
  >
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Error en el sistema de informes
        </h3>
      </div>
    </div>
    
    <div className="text-sm text-red-700 mb-4">
      <p>Ha ocurrido un error inesperado:</p>
      <code className="block mt-2 p-2 bg-red-100 rounded text-xs">
        {error.message}
      </code>
    </div>
    
    <div className="flex space-x-3">
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Intentar nuevamente
      </button>
      <button
        onClick={() => window.location.reload()}
        className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Recargar página
      </button>
    </div>
  </div>
);

// Hook personalizado para estadísticas
const useInformesStats = (informes) => {
  return useMemo(() => {
    if (!informes || informes.length === 0) {
      return {
        total: 0,
        porGenero: {},
        porMes: {},
        promedioTiempo: 0
      };
    }

    const stats = {
      total: informes.length,
      porGenero: {},
      porMes: {},
      tiempos: []
    };

    informes.forEach(informe => {
      // Estadísticas por género
      const genero = informe.pacientes?.genero || 'No especificado';
      stats.porGenero[genero] = (stats.porGenero[genero] || 0) + 1;

      // Estadísticas por mes
      const mes = new Date(informe.fecha_generacion).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
      stats.porMes[mes] = (stats.porMes[mes] || 0) + 1;

      // Tiempos de generación (si están disponibles)
      if (informe.tiempo_generacion) {
        stats.tiempos.push(informe.tiempo_generacion);
      }
    });

    // Calcular promedio de tiempo
    stats.promedioTiempo = stats.tiempos.length > 0 
      ? stats.tiempos.reduce((a, b) => a + b, 0) / stats.tiempos.length 
      : 0;

    return stats;
  }, [informes]);
};

// Componente principal
const InformesContainer = () => {
  // Estados locales
  const [selectedInformes, setSelectedInformes] = useState(new Set());
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'table'

  // Hooks personalizados
  const {
    informes,
    loading,
    error,
    pagination,
    actions
  } = useInformes();

  const {
    filters,
    activeFilters,
    setFilter,
    clearFilters,
    getFilteredInformes
  } = useInformesFilters(informes);

  const { handleError } = useErrorHandler();
  const stats = useInformesStats(informes);

  // Datos filtrados y paginados
  const filteredInformes = useMemo(() => {
    return getFilteredInformes();
  }, [getFilteredInformes]);

  // Handlers optimizados con useCallback
  const handleSelectInforme = useCallback((informeId) => {
    setSelectedInformes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(informeId)) {
        newSet.delete(informeId);
      } else {
        newSet.add(informeId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedInformes.size === filteredInformes.length) {
      setSelectedInformes(new Set());
    } else {
      setSelectedInformes(new Set(filteredInformes.map(i => i.id)));
    }
  }, [selectedInformes.size, filteredInformes]);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedInformes.size === 0) {
      handleError(new Error('No hay informes seleccionados'), 'Acción masiva');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          await actions.deleteMultipleInformes(Array.from(selectedInformes));
          setSelectedInformes(new Set());
          break;
        case 'export':
          await actions.exportInformes(Array.from(selectedInformes));
          break;
        case 'archive':
          await actions.archiveInformes(Array.from(selectedInformes));
          setSelectedInformes(new Set());
          break;
        default:
          throw new Error(`Acción no soportada: ${action}`);
      }
    } catch (error) {
      handleError(error, `Acción masiva: ${action}`);
    }
  }, [selectedInformes, actions, handleError]);

  const handleRefresh = useCallback(async () => {
    try {
      await actions.refreshInformes();
      setSelectedInformes(new Set());
    } catch (error) {
      handleError(error, 'Actualizar informes');
    }
  }, [actions, handleError]);

  // Configuración de accesibilidad
  const accessibilityProps = {
    'aria-label': 'Sistema de gestión de informes psicológicos',
    'aria-describedby': 'informes-description'
  };

  // Renderizado condicional para estados de carga y error
  if (error && !informes.length) {
    return (
      <ErrorFallback 
        error={new Error(error)} 
        resetErrorBoundary={handleRefresh}
      />
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('[InformesContainer] Error boundary:', error, errorInfo);
        handleError(error, 'Componente de informes');
      }}
      onReset={handleRefresh}
    >
      <div className="informes-container" {...accessibilityProps}>
        {/* Descripción oculta para lectores de pantalla */}
        <div id="informes-description" className="sr-only">
          Sistema de gestión de informes psicológicos BAT-7. 
          Mostrando {filteredInformes.length} de {stats.total} informes.
          {selectedInformes.size > 0 && ` ${selectedInformes.size} informes seleccionados.`}
        </div>

        {/* Header con controles principales */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Informes Generados
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {loading ? 'Cargando...' : `${filteredInformes.length} informes encontrados`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botón de estadísticas */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-pressed={showStats}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
              </button>

              {/* Selector de vista */}
              <div className="flex rounded-md shadow-sm" role="group" aria-label="Modo de vista">
                {[
                  { mode: 'grid', icon: 'grid', label: 'Cuadrícula' },
                  { mode: 'list', icon: 'list', label: 'Lista' },
                  { mode: 'table', icon: 'table', label: 'Tabla' }
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`
                      relative inline-flex items-center px-3 py-2 text-sm font-medium border
                      ${viewMode === mode 
                        ? 'bg-blue-600 text-white border-blue-600 z-10' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                      ${mode === 'grid' ? 'rounded-l-md' : ''}
                      ${mode === 'table' ? 'rounded-r-md' : ''}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    `}
                    aria-pressed={viewMode === mode}
                    aria-label={`Vista de ${label}`}
                  >
                    <span className="sr-only">{label}</span>
                    {/* Iconos SVG simplificados */}
                    <div className="h-4 w-4" aria-hidden="true">
                      {icon === 'grid' && '⊞'}
                      {icon === 'list' && '☰'}
                      {icon === 'table' && '⊟'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botón de actualizar */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Actualizar lista de informes"
              >
                <svg 
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel de estadísticas (colapsible) */}
        {showStats && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total de informes</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(stats.porGenero).length}
                </div>
                <div className="text-sm text-gray-600">Géneros registrados</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.porMes).length}
                </div>
                <div className="text-sm text-gray-600">Meses activos</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.promedioTiempo > 0 ? `${stats.promedioTiempo.toFixed(1)}s` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Tiempo promedio</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Suspense fallback={<LoadingSpinner message="Cargando filtros..." />}>
          <InformesFilters
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
            stats={stats}
          />
        </Suspense>

        {/* Acciones masivas */}
        {selectedInformes.size > 0 && (
          <Suspense fallback={<LoadingSpinner message="Cargando acciones..." />}>
            <InformesActions
              selectedCount={selectedInformes.size}
              totalCount={filteredInformes.length}
              onBulkAction={handleBulkAction}
              onSelectAll={handleSelectAll}
              onClearSelection={() => setSelectedInformes(new Set())}
            />
          </Suspense>
        )}

        {/* Lista de informes */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<LoadingSpinner message="Cargando informes..." />}>
            <InformesList
              informes={filteredInformes}
              loading={loading}
              viewMode={viewMode}
              selectedInformes={selectedInformes}
              onSelectInforme={handleSelectInforme}
              onSelectAll={handleSelectAll}
              onAction={actions.handleInformeAction}
            />
          </Suspense>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <Suspense fallback={<LoadingSpinner message="Cargando paginación..." />}>
            <InformesPagination
              pagination={pagination}
              onPageChange={actions.setPage}
              onPageSizeChange={actions.setPageSize}
            />
          </Suspense>
        )}

        {/* Mensaje cuando no hay informes */}
        {!loading && filteredInformes.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron informes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilters.length > 0 
                ? 'Intenta ajustar los filtros para ver más resultados.'
                : 'Aún no se han generado informes en el sistema.'
              }
            </p>
            {activeFilters.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default InformesContainer;