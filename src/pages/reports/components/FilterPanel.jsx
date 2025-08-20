import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaChartBar, FaTag, FaTimes } from 'react-icons/fa';

/**
 * Panel de filtros avanzados para informes
 * Permite filtrar por fecha, tipo, estado, psicólogo, etc.
 */
const FilterPanel = ({ reports, onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: [],
    type: [],
    psychologist: [],
    questionnaire: [],
    tags: [],
    scoreRange: { min: '', max: '' }
  });

  const [availableOptions, setAvailableOptions] = useState({
    psychologists: [],
    questionnaires: [],
    tags: [],
    statuses: ['completed', 'draft', 'processing', 'error']
  });

  // Extraer opciones únicas de los informes
  useEffect(() => {
    const psychologists = [...new Set(reports.map(r => r.psychologistName))];
    const questionnaires = [...new Set(reports.map(r => r.questionnaireName))];
    const tags = [...new Set(reports.flatMap(r => r.tags || []))];

    setAvailableOptions({
      psychologists,
      questionnaires,
      tags,
      statuses: ['completed', 'draft', 'processing', 'error']
    });
  }, [reports]);

  // Notificar cambios de filtros
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (filterType, value, isMultiple = false) => {
    setFilters(prev => {
      if (isMultiple) {
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        return {
          ...prev,
          [filterType]: newValues
        };
      } else {
        return {
          ...prev,
          [filterType]: value
        };
      }
    });
  };

  const clearFilter = (filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: Array.isArray(prev[filterType]) ? [] : 
                   typeof prev[filterType] === 'object' ? {} : ''
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      status: [],
      type: [],
      psychologist: [],
      questionnaire: [],
      tags: [],
      scoreRange: { min: '', max: '' }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.status.length > 0) count++;
    if (filters.type.length > 0) count++;
    if (filters.psychologist.length > 0) count++;
    if (filters.questionnaire.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.scoreRange.min || filters.scoreRange.max) count++;
    return count;
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completado',
      draft: 'Borrador',
      processing: 'Procesando',
      error: 'Error'
    };
    return labels[status] || status;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-6">
      {/* Header del panel */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFiltersCount} activos
            </span>
          )}
        </h3>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            <FaTimes className="h-3 w-3 mr-1" />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Filtro de fecha */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaCalendarAlt className="h-4 w-4 mr-2" />
            Rango de fechas
            {(filters.dateRange.start || filters.dateRange.end) && (
              <button
                onClick={() => clearFilter('dateRange')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fecha fin"
            />
          </div>
        </div>

        {/* Filtro de estado */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaChartBar className="h-4 w-4 mr-2" />
            Estado
            {filters.status.length > 0 && (
              <button
                onClick={() => clearFilter('status')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2">
            {availableOptions.statuses.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleFilterChange('status', status, true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {getStatusLabel(status)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de tipo */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaUser className="h-4 w-4 mr-2" />
            Tipo de informe
            {filters.type.length > 0 && (
              <button
                onClick={() => clearFilter('type')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.type.includes('individual')}
                onChange={() => handleFilterChange('type', 'individual', true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Individual</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.type.includes('group')}
                onChange={() => handleFilterChange('type', 'group', true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Grupal</span>
            </label>
          </div>
        </div>

        {/* Filtro de psicólogo */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaUser className="h-4 w-4 mr-2" />
            Psicólogo
            {filters.psychologist.length > 0 && (
              <button
                onClick={() => clearFilter('psychologist')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableOptions.psychologists.map(psychologist => (
              <label key={psychologist} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.psychologist.includes(psychologist)}
                  onChange={() => handleFilterChange('psychologist', psychologist, true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {psychologist}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de cuestionario */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaChartBar className="h-4 w-4 mr-2" />
            Cuestionario
            {filters.questionnaire.length > 0 && (
              <button
                onClick={() => clearFilter('questionnaire')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableOptions.questionnaires.map(questionnaire => (
              <label key={questionnaire} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.questionnaire.includes(questionnaire)}
                  onChange={() => handleFilterChange('questionnaire', questionnaire, true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {questionnaire}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaTag className="h-4 w-4 mr-2" />
            Etiquetas
            {filters.tags.length > 0 && (
              <button
                onClick={() => clearFilter('tags')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableOptions.tags.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => handleFilterChange('tags', tag, true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de puntuación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FaChartBar className="h-4 w-4 mr-2" />
            Rango de puntuación
            {(filters.scoreRange.min || filters.scoreRange.max) && (
              <button
                onClick={() => clearFilter('scoreRange')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            )}
          </label>
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              max="100"
              value={filters.scoreRange.min}
              onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, min: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mín. %"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={filters.scoreRange.max}
              onChange={(e) => handleFilterChange('scoreRange', { ...filters.scoreRange, max: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Máx. %"
            />
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.status.map(status => (
              <span
                key={`status-${status}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                Estado: {getStatusLabel(status)}
                <button
                  onClick={() => handleFilterChange('status', status, true)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {filters.type.map(type => (
              <span
                key={`type-${type}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                Tipo: {type === 'individual' ? 'Individual' : 'Grupal'}
                <button
                  onClick={() => handleFilterChange('type', type, true)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {filters.tags.slice(0, 3).map(tag => (
              <span
                key={`tag-${tag}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {tag}
                <button
                  onClick={() => handleFilterChange('tags', tag, true)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {filters.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{filters.tags.length - 3} etiquetas más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
