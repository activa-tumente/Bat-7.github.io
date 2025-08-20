import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing search and filtering functionality
 * Provides standardized filtering logic with search term support
 * 
 * @param {Array} data - Array of data to filter
 * @param {Object} initialFilters - Initial filter values
 * @param {Object} options - Configuration options
 * @returns {Object} Filtering state and operations
 */
export const useFiltering = (data = [], initialFilters = {}, options = {}) => {
  const {
    searchFields = ['name', 'email', 'title'],
    caseSensitive = false,
    debounceMs = 300,
    customFilterFn = null
  } = options;

  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  const debounceTimeout = useMemo(() => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setDebouncedSearchTerm(value);
      }, debounceMs);
    };
  }, [debounceMs]);

  // Update search term with debouncing
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    debounceTimeout(term);
  }, [debounceTimeout]);

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      // Apply custom filter function if provided
      if (customFilterFn && !customFilterFn(item, { searchTerm: debouncedSearchTerm, filters })) {
        return false;
      }

      // Search term filtering
      if (debouncedSearchTerm) {
        const searchValue = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
        const matchesSearch = searchFields.some(field => {
          const fieldValue = getNestedValue(item, field);
          if (fieldValue == null) return false;
          
          const stringValue = String(fieldValue);
          const compareValue = caseSensitive ? stringValue : stringValue.toLowerCase();
          return compareValue.includes(searchValue);
        });
        
        if (!matchesSearch) return false;
      }

      // Apply filters
      return Object.entries(filters).every(([key, value]) => {
        if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
          return true;
        }

        const itemValue = getNestedValue(item, key);
        
        // Handle array filters (multi-select)
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        // Handle range filters
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          const numValue = Number(itemValue);
          return numValue >= value.min && numValue <= value.max;
        }
        
        // Handle date range filters
        if (typeof value === 'object' && value.start && value.end) {
          const itemDate = new Date(itemValue);
          const startDate = new Date(value.start);
          const endDate = new Date(value.end);
          return itemDate >= startDate && itemDate <= endDate;
        }
        
        // Handle boolean filters
        if (typeof value === 'boolean') {
          return Boolean(itemValue) === value;
        }
        
        // Default string comparison
        return itemValue === value;
      });
    });
  }, [data, debouncedSearchTerm, filters, searchFields, caseSensitive, customFilterFn]);

  // Update a specific filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters and search
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, [initialFilters]);

  // Clear only search term
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    const filterCount = Object.values(filters).filter(value => {
      if (value == null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }).length;
    
    const searchCount = debouncedSearchTerm ? 1 : 0;
    return filterCount + searchCount;
  }, [filters, debouncedSearchTerm]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const summary = [];
    
    if (debouncedSearchTerm) {
      summary.push(`Search: "${debouncedSearchTerm}"`);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value == null || value === '') return;
      
      if (Array.isArray(value) && value.length > 0) {
        summary.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'object' && value.min !== undefined) {
        summary.push(`${key}: ${value.min} - ${value.max}`);
      } else if (typeof value === 'object' && value.start) {
        summary.push(`${key}: ${value.start} to ${value.end}`);
      } else if (value !== '') {
        summary.push(`${key}: ${value}`);
      }
    });
    
    return summary;
  }, [filters, debouncedSearchTerm]);

  return {
    // State
    filteredData,
    filters,
    searchTerm,
    debouncedSearchTerm,
    
    // Actions
    updateFilter,
    updateFilters,
    updateSearchTerm,
    clearFilters,
    clearSearch,
    clearFilter,
    
    // Computed values
    activeFilterCount,
    hasActiveFilters,
    filterSummary,
    totalResults: filteredData.length,
    isFiltering: hasActiveFilters
  };
};

// Helper function to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export default useFiltering;