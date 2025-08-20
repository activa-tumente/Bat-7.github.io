import React, { useState } from 'react';
// En lugar de usar react-icons, usaremos SVG directos o HTML Unicode
// import { FaSearch, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { Button } from './Button';

/**
 * Componente reutilizable para búsqueda y filtros
 *
 * @param {Object} props
 * @param {string} props.searchTerm - Término de búsqueda actual
 * @param {Function} props.onSearchChange - Función a ejecutar cuando cambia el término de búsqueda
 * @param {string} props.searchPlaceholder - Texto de placeholder para el campo de búsqueda
 * @param {Array} props.filters - Configuración de filtros disponibles
 * @param {Object} props.filterValues - Valores actuales de los filtros
 * @param {Function} props.onFilterChange - Función a ejecutar cuando cambian los filtros
 * @param {Function} props.onClearFilters - Función para limpiar todos los filtros
 * @param {Function} props.onAddNew - Función para añadir un nuevo elemento
 * @param {boolean} props.canAdd - Si el usuario puede añadir nuevos elementos
 * @param {string} props.addButtonText - Texto del botón para añadir
 */
const SearchFilter = ({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  onAddNew,
  canAdd = false,
  addButtonText = 'Añadir Nuevo'
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filterValues).some(
    value => value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="form-input w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => onSearchChange('')}
              title="Limpiar búsqueda"
            >
              <span>×</span>
            </button>
          )}
        </div>

        <div className="flex space-x-2 justify-end">
          {filters.length > 0 && (
            <Button
              variant={showFilters || hasActiveFilters ? "primary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <span className="mr-2">📊</span>
              {hasActiveFilters
                ? `Filtros (${Object.values(filterValues).filter(v => v !== '' && v !== null && v !== undefined).length})`
                : "Filtros"}
            </Button>
          )}

          {canAdd && (
            <Button
              variant="primary"
              onClick={onAddNew}
              className="flex items-center shadow-sm hover:shadow-md transition-shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{addButtonText}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClearFilters}
                className="text-sm"
              >
                Limpiar todos
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-1">
                <label
                  htmlFor={`filter-${filter.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {filter.label}
                </label>

                {filter.type === 'select' ? (
                  <div className="relative">
                    <select
                      id={`filter-${filter.id}`}
                      name={filter.id}
                      value={filterValues[filter.id] || ''}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      className="form-select w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      <option value="">{filter.placeholder || 'Todos'}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {filterValues[filter.id] && (
                      <button
                        type="button"
                        onClick={() => onFilterChange(filter.id, '')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        title="Limpiar filtro"
                      >
                        <span>×</span>
                      </button>
                    )}
                  </div>
                ) : filter.type === 'range' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      id={`filter-${filter.id}-min`}
                      name={`${filter.id}_min`}
                      placeholder={filter.minPlaceholder || 'Mín'}
                      value={filterValues[`${filter.id}_min`] || ''}
                      onChange={(e) => onFilterChange(`${filter.id}_min`, e.target.value)}
                      className="form-input w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      min={filter.min}
                      max={filter.max}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      id={`filter-${filter.id}-max`}
                      name={`${filter.id}_max`}
                      placeholder={filter.maxPlaceholder || 'Máx'}
                      value={filterValues[`${filter.id}_max`] || ''}
                      onChange={(e) => onFilterChange(`${filter.id}_max`, e.target.value)}
                      className="form-input w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      min={filter.min}
                      max={filter.max}
                    />
                  </div>
                ) : filter.type === 'date' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      id={`filter-${filter.id}-from`}
                      name={`${filter.id}_from`}
                      value={filterValues[`${filter.id}_from`] || ''}
                      onChange={(e) => onFilterChange(`${filter.id}_from`, e.target.value)}
                      className="form-input w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="date"
                      id={`filter-${filter.id}-to`}
                      name={`${filter.id}_to`}
                      value={filterValues[`${filter.id}_to`] || ''}
                      onChange={(e) => onFilterChange(`${filter.id}_to`, e.target.value)}
                      className="form-input w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={filter.type || 'text'}
                      id={`filter-${filter.id}`}
                      name={filter.id}
                      placeholder={filter.placeholder || ''}
                      value={filterValues[filter.id] || ''}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      className="form-input w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />

                    {filterValues[filter.id] && (
                      <button
                        type="button"
                        onClick={() => onFilterChange(filter.id, '')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        title="Limpiar filtro"
                      >
                        <span>×</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 text-sm text-gray-700">
              <strong>Filtros activos:</strong> {
                Object.entries(filterValues)
                  .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
                  .map(([key, value]) => {
                    const filter = filters.find(f => f.id === key || key.startsWith(`${f.id}_`));
                    if (!filter) return null;

                    let label = filter.label;
                    if (key.endsWith('_min') || key.endsWith('_from')) {
                      label = `${filter.label} desde`;
                    } else if (key.endsWith('_max') || key.endsWith('_to')) {
                      label = `${filter.label} hasta`;
                    }

                    // Formatear valor si es una opción de un select
                    let displayValue = value;
                    if (filter.type === 'select' && filter.options) {
                      const option = filter.options.find(opt => opt.value === value);
                      if (option) {
                        displayValue = option.label;
                      }
                    }

                    return (
                      <span
                        key={key}
                        className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                      >
                        {label}: {displayValue}
                        <button
                          type="button"
                          onClick={() => onFilterChange(key, '')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          title="Quitar filtro"
                        >
                          <span>×</span>
                        </button>
                      </span>
                    );
                  })
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;