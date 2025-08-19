import React from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';

/**
 * Filter panel component for candidates
 */
const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  institutions, 
  psychologists 
}) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (key, value) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '');
    }
    return value !== '';
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaFilter className="text-orange-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              Activos
            </span>
          )}
        </div>
        
        <button
          onClick={onClearFilters}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaTimes className="mr-1" />
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        {/* Evaluation Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado de Evaluación
          </label>
          <select
            value={filters.evaluationStatus}
            onChange={(e) => handleFilterChange('evaluationStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Todos</option>
            <option value="no_iniciada">No iniciada</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="suspendida">Suspendida</option>
          </select>
        </div>

        {/* Institution Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institución
          </label>
          <select
            value={filters.institution}
            onChange={(e) => handleFilterChange('institution', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Todas las instituciones</option>
            {institutions?.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Psychologist Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Psicólogo Asignado
          </label>
          <select
            value={filters.psychologist}
            onChange={(e) => handleFilterChange('psychologist', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Todos los psicólogos</option>
            {psychologists?.map(psychologist => (
              <option key={psychologist.id} value={psychologist.id}>
                {psychologist.nombre} {psychologist.apellidos}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Desde
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Estado: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.evaluationStatus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Evaluación: {filters.evaluationStatus}
                <button
                  onClick={() => handleFilterChange('evaluationStatus', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.institution && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Institución: {institutions?.find(i => i.id === filters.institution)?.nombre}
                <button
                  onClick={() => handleFilterChange('institution', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.psychologist && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Psicólogo: {psychologists?.find(p => p.id === filters.psychologist)?.nombre}
                <button
                  onClick={() => handleFilterChange('psychologist', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Fechas: {filters.dateRange.start} - {filters.dateRange.end}
                <button
                  onClick={() => handleDateRangeChange('start', '') || handleDateRangeChange('end', '')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
