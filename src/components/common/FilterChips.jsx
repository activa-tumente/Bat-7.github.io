import React, { useMemo, useCallback } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Filter chips component to display active filters as removable tags
 */
const FilterChips = ({
  searchTerm = '',
  filters = {},
  filterConfig = [],
  onRemoveSearch,
  onRemoveFilter,
  onClearAll,
  maxChips = 10,
  className = ''
}) => {
  // Create a map of filter keys to their config for easy lookup
  const filterConfigMap = useMemo(() => {
    const map = new Map();
    filterConfig.forEach(config => {
      map.set(config.key, config);
    });
    return map;
  }, [filterConfig]);

  // Format filter value for display
  const formatFilterValue = useCallback((key, value, config) => {
    if (value == null || value === '') return null;
    
    switch (config?.type) {
      case 'select':
        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          if (value.length === 1) {
            const option = config.options?.find(opt => opt.value === value[0]);
            return option?.label || value[0];
          }
          return `${value.length} selected`;
        } else {
          const option = config.options?.find(opt => opt.value === value);
          return option?.label || value;
        }
        
      case 'range':
        if (Array.isArray(value)) {
          const [min, max] = value;
          if (min == null && max == null) return null;
          if (min != null && max != null) {
            return `${min} - ${max}`;
          }
          if (min != null) return `≥ ${min}`;
          if (max != null) return `≤ ${max}`;
        }
        return value;
        
      case 'dateRange':
        if (Array.isArray(value)) {
          const [start, end] = value;
          if (!start && !end) return null;
          
          const formatDate = (date) => {
            if (!date) return null;
            return new Date(date).toLocaleDateString();
          };
          
          const startStr = formatDate(start);
          const endStr = formatDate(end);
          
          if (startStr && endStr) {
            return `${startStr} - ${endStr}`;
          }
          if (startStr) return `From ${startStr}`;
          if (endStr) return `Until ${endStr}`;
        }
        return value;
        
      case 'text':
        return value.length > 20 ? `${value.substring(0, 20)}...` : value;
        
      default:
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        if (Array.isArray(value)) {
          return value.length > 0 ? `${value.length} items` : null;
        }
        return value.toString();
    }
  }, []);

  // Generate chips for active filters
  const filterChips = useMemo(() => {
    const chips = [];
    
    // Add search chip
    if (searchTerm) {
      chips.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm,
        onRemove: onRemoveSearch
      });
    }
    
    // Add filter chips
    Object.entries(filters).forEach(([key, value]) => {
      const config = filterConfigMap.get(key);
      const formattedValue = formatFilterValue(key, value, config);
      
      if (formattedValue !== null) {
        chips.push({
          id: key,
          type: 'filter',
          label: config?.label || key,
          value: formattedValue,
          onRemove: () => onRemoveFilter?.(key)
        });
      }
    });
    
    return chips;
  }, [searchTerm, filters, filterConfigMap, formatFilterValue, onRemoveSearch, onRemoveFilter]);

  // Handle individual chip removal
  const handleChipRemove = useCallback((chip) => {
    chip.onRemove?.();
  }, []);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onClearAll?.();
  }, [onClearAll]);

  if (filterChips.length === 0) {
    return null;
  }

  const visibleChips = filterChips.slice(0, maxChips);
  const hiddenCount = filterChips.length - maxChips;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Active filter chips */}
      {visibleChips.map((chip) => (
        <div
          key={chip.id}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
            transition-colors duration-200
            ${chip.type === 'search'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
            }
          `}
        >
          {/* Chip icon */}
          {chip.type === 'search' && (
            <MagnifyingGlassIcon className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          
          {/* Chip content */}
          <span className="font-medium">{chip.label}:</span>
          <span className="truncate max-w-32">{chip.value}</span>
          
          {/* Remove button */}
          <button
            type="button"
            onClick={() => handleChipRemove(chip)}
            className={`
              ml-1 p-0.5 rounded-full transition-colors
              ${chip.type === 'search'
                ? 'hover:bg-blue-200 focus:bg-blue-200'
                : 'hover:bg-gray-200 focus:bg-gray-200'
              }
              focus:outline-none
            `}
            aria-label={`Remove ${chip.label} filter`}
          >
            <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
      
      {/* Hidden chips indicator */}
      {hiddenCount > 0 && (
        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-600 border border-gray-200">
          +{hiddenCount} more
        </div>
      )}
      
      {/* Clear all button */}
      {filterChips.length > 1 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="
            inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
            bg-red-50 text-red-700 border border-red-200
            hover:bg-red-100 focus:bg-red-100 focus:outline-none
            transition-colors duration-200
          "
          aria-label="Clear all filters"
        >
          <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Clear all
        </button>
      )}
      
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {filterChips.length} filter{filterChips.length !== 1 ? 's' : ''} applied:
        {filterChips.map(chip => `${chip.label}: ${chip.value}`).join(', ')}
      </div>
    </div>
  );
};

export default React.memo(FilterChips);

// Export utility for external chip generation
export const createFilterChip = (key, value, config, onRemove) => {
  const formatValue = (val) => {
    if (val == null || val === '') return null;
    
    switch (config?.type) {
      case 'select':
        if (Array.isArray(val)) {
          return val.length > 0 ? `${val.length} selected` : null;
        }
        const option = config.options?.find(opt => opt.value === val);
        return option?.label || val;
        
      case 'range':
        if (Array.isArray(val)) {
          const [min, max] = val;
          if (min != null && max != null) return `${min} - ${max}`;
          if (min != null) return `≥ ${min}`;
          if (max != null) return `≤ ${max}`;
        }
        return val;
        
      default:
        return val.toString();
    }
  };
  
  const formattedValue = formatValue(value);
  if (formattedValue === null) return null;
  
  return {
    id: key,
    type: 'filter',
    label: config?.label || key,
    value: formattedValue,
    onRemove
  };
};