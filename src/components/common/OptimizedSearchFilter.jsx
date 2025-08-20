import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDownIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Separate filter components for better organization
import SearchInput from './SearchInput';
import FilterSelect from './FilterSelect';
import FilterRange from './FilterRange';
import FilterDateRange from './FilterDateRange';
import FilterText from './FilterText';
import FilterChips from './FilterChips';

/**
 * Optimized SearchFilter component with better separation of concerns
 * Demonstrates component decomposition and performance optimizations
 */
const OptimizedSearchFilter = ({
  searchTerm = '',
  filters = {},
  filterConfig = [],
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onAddNew,
  hasActiveFilters = false,
  filterSummary = [],
  resultCount = 0,
  placeholder = 'Search...',
  showAddButton = false,
  addButtonText = 'Add New',
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Toggle filter panel visibility
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Toggle filter section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Handle filter value changes
  const handleFilterChange = useCallback((key, value) => {
    onFilterChange?.(key, value);
  }, [onFilterChange]);

  // Handle search changes with debouncing handled by parent
  const handleSearchChange = useCallback((value) => {
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Clear all filters and search
  const handleClearAll = useCallback(() => {
    onClearFilters?.();
  }, [onClearFilters]);

  // Group filters by category for better organization
  const groupedFilters = useMemo(() => {
    const groups = {};
    
    filterConfig.forEach(filter => {
      const category = filter.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(filter);
    });
    
    return groups;
  }, [filterConfig]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    const filterCount = Object.values(filters).filter(value => {
      if (value == null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }).length;
    
    const searchCount = searchTerm ? 1 : 0;
    return filterCount + searchCount;
  }, [filters, searchTerm]);

  // Render individual filter based on type
  const renderFilter = useCallback((filter) => {
    const { key, type, label, options, ...filterProps } = filter;
    const value = filters[key];

    const commonProps = {
      key,
      label,
      value,
      onChange: (newValue) => handleFilterChange(key, newValue),
      ...filterProps
    };

    switch (type) {
      case 'select':
        return (
          <FilterSelect
            {...commonProps}
            options={options}
            multiple={filter.multiple}
          />
        );
      
      case 'range':
        return (
          <FilterRange
            {...commonProps}
            min={filter.min}
            max={filter.max}
            step={filter.step}
          />
        );
      
      case 'dateRange':
        return (
          <FilterDateRange
            {...commonProps}
            minDate={filter.minDate}
            maxDate={filter.maxDate}
          />
        );
      
      case 'text':
        return (
          <FilterText
            {...commonProps}
            placeholder={filter.placeholder}
          />
        );
      
      default:
        return null;
    }
  }, [filters, handleFilterChange]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Search and filter toggle header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          {/* Search input */}
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="w-full"
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={toggleFilters}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
              ${hasActiveFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }
            `}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Add new button */}
          {showAddButton && (
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {addButtonText}
            </button>
          )}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <span>
            {resultCount} result{resultCount !== 1 ? 's' : ''} found
          </span>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="px-4 py-3 border-b bg-gray-50">
          <FilterChips
            searchTerm={searchTerm}
            filters={filters}
            filterConfig={filterConfig}
            onRemoveSearch={() => handleSearchChange('')}
            onRemoveFilter={(key) => handleFilterChange(key, '')}
            onClearAll={handleClearAll}
          />
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-6">
            {Object.entries(groupedFilters).map(([category, categoryFilters]) => (
              <div key={category} className="space-y-3">
                {/* Category header */}
                {Object.keys(groupedFilters).length > 1 && (
                  <button
                    onClick={() => toggleSection(category)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">{category}</h3>
                    <ChevronDownIcon 
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.has(category) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                )}

                {/* Category filters */}
                {(Object.keys(groupedFilters).length === 1 || expandedSections.has(category)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryFilters.map(renderFilter)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filter actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={!hasActiveFilters}
              >
                Clear All
              </button>
              
              <button
                onClick={toggleFilters}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OptimizedSearchFilter);