/**
 * Improved Resultados Filters component with better accessibility,
 * performance optimizations, and enhanced user experience
 */

import React, { useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { TEST_TYPES, UI_CONFIG, ARIA_LABELS } from '../../constants/resultados';

const ResultadosFiltersImproved = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTest, 
  onTestChange,
  availableTests = [],
  isLoading = false,
  totalResults = 0
}) => {
  // Memoize test options to prevent unnecessary re-renders
  const testOptions = useMemo(() => {
    const options = [{ value: TEST_TYPES.TODOS, label: 'Todos los tests' }];
    
    // Add available tests dynamically
    availableTests.forEach(test => {
      if (test && test !== TEST_TYPES.TODOS) {
        options.push({
          value: test,
          label: test.toUpperCase()
        });
      }
    });
    
    return options;
  }, [availableTests]);

  // Optimized search handler with validation
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    
    // Prevent searches that are too long
    if (value.length <= UI_CONFIG.MAX_SEARCH_LENGTH) {
      onSearchChange(value);
    }
  }, [onSearchChange]);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  // Test filter change handler
  const handleTestChange = useCallback((e) => {
    onTestChange(e.target.value);
  }, [onTestChange]);

  // Keyboard navigation for search input
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  }, [handleClearSearch]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Filtros de Búsqueda
          </h3>
          {totalResults > 0 && (
            <span className="text-sm text-gray-500">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Search Input */}
          <div className="space-y-2">
            <label 
              htmlFor="patient-search"
              className="block text-sm font-medium text-gray-700"
            >
              Buscar Paciente
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
              
              <input
                id="patient-search"
                type="text"
                placeholder="Nombre, apellido o documento..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                disabled={isLoading}
                maxLength={UI_CONFIG.MAX_SEARCH_LENGTH}
                className={`
                  w-full pl-10 pr-10 py-2 border rounded-lg transition-colors
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${isLoading ? 'border-gray-200' : 'border-gray-300'}
                `}
                aria-label={ARIA_LABELS.SEARCH_INPUT}
                aria-describedby="search-help search-counter"
                role="searchbox"
                aria-expanded="false"
                autoComplete="off"
              />
              
              {/* Clear button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 disabled:opacity-50"
                  aria-label="Limpiar búsqueda"
                >
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Help text and character counter */}
            <div className="flex justify-between text-xs text-gray-500">
              <span id="search-help">
                Escriba para filtrar los resultados por paciente
              </span>
              <span id="search-counter">
                {searchTerm.length}/{UI_CONFIG.MAX_SEARCH_LENGTH}
              </span>
            </div>
          </div>

          {/* Enhanced Test Filter */}
          <div className="space-y-2">
            <label 
              htmlFor="test-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Test
            </label>
            
            <select
              id="test-filter"
              value={selectedTest}
              onChange={handleTestChange}
              disabled={isLoading || testOptions.length <= 1}
              className={`
                w-full py-2 px-3 border rounded-lg transition-colors
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${isLoading ? 'border-gray-200' : 'border-gray-300'}
              `}
              aria-label={ARIA_LABELS.TEST_FILTER}
              aria-describedby="test-filter-help"
            >
              {testOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div id="test-filter-help" className="text-xs text-gray-500">
              Seleccione un tipo de test para filtrar los resultados
              {testOptions.length <= 1 && ' (No hay filtros disponibles)'}
            </div>
          </div>
        </div>
        
        {/* Active filters summary */}
        {(searchTerm || selectedTest !== TEST_TYPES.TODOS) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Búsqueda: "{searchTerm}"
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    aria-label="Quitar filtro de búsqueda"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {selectedTest !== TEST_TYPES.TODOS && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Test: {selectedTest.toUpperCase()}
                  <button
                    type="button"
                    onClick={() => onTestChange(TEST_TYPES.TODOS)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                    aria-label="Quitar filtro de test"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ResultadosFiltersImproved;