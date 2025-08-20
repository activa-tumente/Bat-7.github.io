import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing sorting functionality
 * Provides standardized sorting logic with multiple sort criteria support
 * 
 * @param {Array} data - Array of data to sort
 * @param {Object} options - Configuration options
 * @returns {Object} Sorting state and operations
 */
export const useSorting = (data = [], options = {}) => {
  const {
    initialSortBy = null,
    initialSortOrder = 'asc',
    multiSort = false,
    caseSensitive = false,
    customCompareFn = null
  } = options;

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [sortCriteria, setSortCriteria] = useState([]);

  // Helper function to get nested property value
  const getNestedValue = useCallback((obj, path) => {
    if (!path) return obj;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }, []);

  // Compare function for sorting
  const compareValues = useCallback((a, b, field, order = 'asc', customFn = null) => {
    // Use custom compare function if provided
    if (customFn) {
      const result = customFn(a, b, field);
      return order === 'desc' ? -result : result;
    }

    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) {
      if (bValue === null || bValue === undefined) return 0;
      return order === 'asc' ? 1 : -1;
    }
    if (bValue === null || bValue === undefined) {
      return order === 'asc' ? -1 : 1;
    }

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aStr = caseSensitive ? aValue : aValue.toLowerCase();
      const bStr = caseSensitive ? bValue : bValue.toLowerCase();
      const result = aStr.localeCompare(bStr);
      return order === 'desc' ? -result : result;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const result = aValue - bValue;
      return order === 'desc' ? -result : result;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      const result = aValue.getTime() - bValue.getTime();
      return order === 'desc' ? -result : result;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      const result = aValue === bValue ? 0 : aValue ? 1 : -1;
      return order === 'desc' ? -result : result;
    }

    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const result = caseSensitive ? aStr.localeCompare(bStr) : aStr.toLowerCase().localeCompare(bStr.toLowerCase());
    return order === 'desc' ? -result : result;
  }, [getNestedValue, caseSensitive]);

  // Sort data based on current criteria
  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return data;

    const dataToSort = [...data];

    if (multiSort && sortCriteria.length > 0) {
      // Multi-column sorting
      return dataToSort.sort((a, b) => {
        for (const criteria of sortCriteria) {
          const { field, order, customFn } = criteria;
          const result = compareValues(a, b, field, order, customFn);
          if (result !== 0) return result;
        }
        return 0;
      });
    } else if (sortBy) {
      // Single column sorting
      return dataToSort.sort((a, b) => {
        return compareValues(a, b, sortBy, sortOrder, customCompareFn);
      });
    }

    return dataToSort;
  }, [data, sortBy, sortOrder, sortCriteria, multiSort, compareValues, customCompareFn]);

  // Set single sort criteria
  const setSingleSort = useCallback((field, order = 'asc') => {
    setSortBy(field);
    setSortOrder(order);
    
    if (multiSort) {
      setSortCriteria([{ field, order, customFn: customCompareFn }]);
    }
  }, [multiSort, customCompareFn]);

  // Toggle sort order for a field
  const toggleSort = useCallback((field) => {
    if (sortBy === field) {
      // Same field, toggle order
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSingleSort(field, newOrder);
    } else {
      // Different field, start with ascending
      setSingleSort(field, 'asc');
    }
  }, [sortBy, sortOrder, setSingleSort]);

  // Add sort criteria for multi-sort
  const addSortCriteria = useCallback((field, order = 'asc', customFn = null) => {
    if (!multiSort) {
      setSingleSort(field, order);
      return;
    }

    setSortCriteria(prev => {
      // Remove existing criteria for the same field
      const filtered = prev.filter(criteria => criteria.field !== field);
      // Add new criteria
      return [...filtered, { field, order, customFn }];
    });
  }, [multiSort, setSingleSort]);

  // Remove sort criteria
  const removeSortCriteria = useCallback((field) => {
    if (!multiSort) {
      clearSort();
      return;
    }

    setSortCriteria(prev => prev.filter(criteria => criteria.field !== field));
  }, [multiSort]);

  // Clear all sorting
  const clearSort = useCallback(() => {
    setSortBy(null);
    setSortOrder('asc');
    setSortCriteria([]);
  }, []);

  // Get sort direction for a field
  const getSortDirection = useCallback((field) => {
    if (multiSort) {
      const criteria = sortCriteria.find(c => c.field === field);
      return criteria ? criteria.order : null;
    }
    
    return sortBy === field ? sortOrder : null;
  }, [multiSort, sortCriteria, sortBy, sortOrder]);

  // Check if a field is being sorted
  const isSorted = useCallback((field) => {
    if (multiSort) {
      return sortCriteria.some(c => c.field === field);
    }
    
    return sortBy === field;
  }, [multiSort, sortCriteria, sortBy]);

  // Get sort index for multi-sort (1-based)
  const getSortIndex = useCallback((field) => {
    if (!multiSort) return null;
    
    const index = sortCriteria.findIndex(c => c.field === field);
    return index >= 0 ? index + 1 : null;
  }, [multiSort, sortCriteria]);

  // Get sort icon/indicator
  const getSortIcon = useCallback((field) => {
    const direction = getSortDirection(field);
    
    if (!direction) return 'sort';
    return direction === 'asc' ? 'sort-asc' : 'sort-desc';
  }, [getSortDirection]);

  // Reset to initial state
  const resetSort = useCallback(() => {
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setSortCriteria([]);
  }, [initialSortBy, initialSortOrder]);

  return {
    // State
    sortBy,
    sortOrder,
    sortCriteria,
    sortedData,
    
    // Single sort actions
    setSingleSort,
    toggleSort,
    
    // Multi-sort actions
    addSortCriteria,
    removeSortCriteria,
    
    // General actions
    clearSort,
    resetSort,
    
    // Utilities
    getSortDirection,
    isSorted,
    getSortIndex,
    getSortIcon,
    
    // Configuration
    multiSort,
    caseSensitive,
    
    // Computed values
    hasSorting: sortBy !== null || sortCriteria.length > 0,
    sortCount: multiSort ? sortCriteria.length : (sortBy ? 1 : 0)
  };
};

export default useSorting;