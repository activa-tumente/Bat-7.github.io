import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useDebounce } from '../../hooks/useDebounce';
import { useFiltering } from '../../hooks/useFiltering';

/**
 * Optimized SearchFilter component with performance improvements and accessibility
 */
const SearchFilter = memo(({ 
  onSearch,
  onFilterChange,
  placeholder = 'Search...',
  filters = [],
  activeFilters = {},
  searchValue = '',
  debounceMs = 300,
  showFilterCount = true,
  showClearAll = true,
  className = '',
  disabled = false,
  autoFocus = false,
  ariaLabel = 'Search and filter',
  ...props
}) => {
  const searchInputRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  
  // Use custom filtering hook
  const {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    clearSearch
  } = useFiltering({
    initialSearchTerm: searchValue,
    debounceMs
  });

  // Debounced search callback
  const debouncedSearch = useCallback((term) => {
    onSearch?.(term);
  }, [onSearch]);

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    debouncedSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    updateSearchTerm(e.target.value);
  }, [updateSearchTerm]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    clearSearch();
    searchInputRef.current?.focus();
  }, [clearSearch]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filterId, value) => {
    const currentValues = activeFilters[filterId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange?.({
      ...activeFilters,
      [filterId]: newValues.length > 0 ? newValues : undefined
    });
  }, [activeFilters, onFilterChange]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    onFilterChange?.({});
    setIsFilterOpen(false);
  }, [onFilterChange]);

  // Handle filter dropdown toggle
  const handleFilterDropdownToggle = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (isFilterOpen) {
        setIsFilterOpen(false);
        filterButtonRef.current?.focus();
      } else if (searchTerm) {
        handleClearSearch();
      }
    } else if (e.key === 'Enter' && e.target === searchInputRef.current) {
      e.preventDefault();
      debouncedSearch(searchTerm);
    }
  }, [isFilterOpen, searchTerm, handleClearSearch, debouncedSearch]);

  // Auto focus effect
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFilterOpen]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, values) => {
      return count + (Array.isArray(values) ? values.length : 0);
    }, 0);
  }, [activeFilters]);

  // Memoized filter options
  const filterOptions = useMemo(() => {
    return filters.map(filter => ({
      ...filter,
      activeValues: activeFilters[filter.id] || []
    }));
  }, [filters, activeFilters]);

  return (
    <div 
      className={`flex flex-col sm:flex-row gap-4 ${className}`}
      role="search"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={disabled}
            className="pl-10 pr-10"
            aria-label="Search input"
            aria-describedby={activeFilterCount > 0 ? 'filter-count' : undefined}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              disabled={disabled}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <div className="relative" ref={filterButtonRef}>
            <Button
              type="button"
              variant="outline"
              onClick={handleFilterDropdownToggle}
              disabled={disabled}
              className="flex items-center gap-2"
              aria-label={`Filters ${activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}`}
              aria-expanded={isFilterOpen}
              aria-haspopup="true"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilterCount && activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                role="menu"
                aria-label="Filter options"
              >
                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                  {filterOptions.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        {filter.label}
                      </h4>
                      <div className="space-y-1">
                        {filter.options.map((option) => {
                          const isActive = filter.activeValues.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleFilterToggle(filter.id, option.value)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-describedby={`${filter.id}-${option.value}-desc`}
                              />
                              <span className="text-sm text-gray-700">
                                {option.label}
                              </span>
                              {option.count !== undefined && (
                                <span className="text-xs text-gray-500 ml-auto">
                                  ({option.count})
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Clear All Button */}
                  {showClearAll && activeFilterCount > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="w-full text-left justify-start"
                        aria-label="Clear all filters"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2" id="filter-count">
          {filterOptions.map((filter) => 
            filter.activeValues.map((value) => {
              const option = filter.options.find(opt => opt.value === value);
              return (
                <Badge
                  key={`${filter.id}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">
                    {filter.label}: {option?.label || value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterToggle(filter.id, value)}
                    className="h-3 w-3 p-0 hover:bg-gray-200"
                    aria-label={`Remove ${filter.label}: ${option?.label || value} filter`}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
SearchFilter.displayName = 'SearchFilter';

// PropTypes
SearchFilter.propTypes = {
  onSearch: PropTypes.func,
  onFilterChange: PropTypes.func,
  placeholder: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number
    })).isRequired
  })),
  activeFilters: PropTypes.object,
  searchValue: PropTypes.string,
  debounceMs: PropTypes.number,
  showFilterCount: PropTypes.bool,
  showClearAll: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  ariaLabel: PropTypes.string
};

export default SearchFilter;