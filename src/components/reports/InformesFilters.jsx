/**
 * @file InformesFilters.jsx
 * @description Advanced filtering component for informes with search, date range, and status filters
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalendarAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DateRangePicker } from '../ui/DateRangePicker';
import { Card } from '../ui/Card';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/dateUtils';

/**
 * Search input component with debouncing
 */
const SearchInput = memo(({ value, onChange, placeholder, className = '' }) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  // Update parent when debounced value changes
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Update local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Buscar informes"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

/**
 * Filter chip component for active filters
 */
const FilterChip = memo(({ label, value, onRemove, icon: Icon }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
    {Icon && <Icon className="w-3 h-3 mr-1" aria-hidden="true" />}
    <span className="mr-2">
      <span className="font-medium">{label}:</span> {value}
    </span>
    <button
      type="button"
      onClick={onRemove}
      className="text-blue-600 hover:text-blue-800 focus:outline-none"
      aria-label={`Remover filtro ${label}`}
    >
      <FaTimes className="w-3 h-3" />
    </button>
  </div>
));

FilterChip.displayName = 'FilterChip';

/**
 * Advanced filters panel
 */
const AdvancedFilters = memo(({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle,
  availablePatients = [],
  availableStatuses = []
}) => {
  const handleFilterChange = useCallback((key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((range) => {
    onFiltersChange({
      ...filters,
      dateRange: range
    });
  }, [filters, onFiltersChange]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center space-x-2"
        aria-expanded={false}
        aria-controls="advanced-filters"
      >
        <FaFilter className="w-4 h-4" />
        <span>Filtros avanzados</span>
      </Button>
    );
  }

  return (
    <Card className="p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros avanzados</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label="Cerrar filtros avanzados"
        >
          <FaTimes className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUser className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Paciente
          </label>
          <Select
            value={filters.patient || ''}
            onChange={(value) => handleFilterChange('patient', value)}
            placeholder="Seleccionar paciente"
            options={[
              { value: '', label: 'Todos los pacientes' },
              ...availablePatients.map(patient => ({
                value: patient.id,
                label: patient.nombre
              }))
            ]}
          />
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaFileAlt className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Estado
          </label>
          <Select
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Seleccionar estado"
            options={[
              { value: '', label: 'Todos los estados' },
              ...availableStatuses.map(status => ({
                value: status.value,
                label: status.label
              }))
            ]}
          />
        </div>

        {/* Date range filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline w-4 h-4 mr-1" aria-hidden="true" />
            Rango de fechas
          </label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            placeholder="Seleccionar rango"
          />
        </div>
      </div>

      {/* Filter actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFiltersChange({})}
        >
          Limpiar filtros
        </Button>
        
        <div className="text-sm text-gray-500">
          {Object.keys(filters).filter(key => filters[key] && filters[key] !== '').length} filtro(s) activo(s)
        </div>
      </div>
    </Card>
  );
});

AdvancedFilters.displayName = 'AdvancedFilters';

/**
 * Main filters component
 */
const InformesFilters = memo(({ 
  searchTerm = '',
  onSearchChange,
  filters = {},
  onFiltersChange,
  onClearAll,
  availablePatients = [],
  availableStatuses = [],
  resultCount = 0,
  totalCount = 0,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate active filters for chips
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (searchTerm) {
      active.push({
        key: 'search',
        label: 'Búsqueda',
        value: searchTerm,
        icon: FaSearch,
        onRemove: () => onSearchChange('')
      });
    }
    
    if (filters.patient) {
      const patient = availablePatients.find(p => p.id === filters.patient);
      active.push({
        key: 'patient',
        label: 'Paciente',
        value: patient?.nombre || filters.patient,
        icon: FaUser,
        onRemove: () => onFiltersChange({ ...filters, patient: '' })
      });
    }
    
    if (filters.status) {
      const status = availableStatuses.find(s => s.value === filters.status);
      active.push({
        key: 'status',
        label: 'Estado',
        value: status?.label || filters.status,
        icon: FaFileAlt,
        onRemove: () => onFiltersChange({ ...filters, status: '' })
      });
    }
    
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const { start, end } = filters.dateRange;
      let dateValue = '';
      
      if (start && end) {
        dateValue = `${formatDate(start)} - ${formatDate(end)}`;
      } else if (start) {
        dateValue = `Desde ${formatDate(start)}`;
      } else if (end) {
        dateValue = `Hasta ${formatDate(end)}`;
      }
      
      active.push({
        key: 'dateRange',
        label: 'Fecha',
        value: dateValue,
        icon: FaCalendarAlt,
        onRemove: () => onFiltersChange({ ...filters, dateRange: null })
      });
    }
    
    return active;
  }, [searchTerm, filters, availablePatients, availableStatuses, onSearchChange, onFiltersChange]);

  const hasActiveFilters = activeFilters.length > 0;

  const handleClearAll = useCallback(() => {
    onSearchChange('');
    onFiltersChange({});
    setShowAdvanced(false);
    onClearAll?.();
  }, [onSearchChange, onFiltersChange, onClearAll]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and basic controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por paciente, título o contenido..."
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            isOpen={showAdvanced}
            onToggle={() => setShowAdvanced(!showAdvanced)}
            availablePatients={availablePatients}
            availableStatuses={availableStatuses}
          />
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              value={filter.value}
              icon={filter.icon}
              onRemove={filter.onRemove}
            />
          ))}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {hasActiveFilters ? (
            <span>
              Mostrando {resultCount} de {totalCount} informes
              {searchTerm && (
                <span className="ml-1">
                  para "{searchTerm}"
                </span>
              )}
            </span>
          ) : (
            <span>Mostrando {totalCount} informes</span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ver todos
          </button>
        )}
      </div>
    </div>
  );
});

InformesFilters.displayName = 'InformesFilters';

export default InformesFilters;