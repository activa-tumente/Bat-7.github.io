import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing pagination functionality
 * Provides standardized pagination logic with configurable options
 * 
 * @param {Array} data - Array of data to paginate
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination state and operations
 */
export const usePagination = (data = [], options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
    maxVisiblePages = 5
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const totalItems = useMemo(() => data.length, [data.length]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  // Get current page data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Calculate visible page numbers for pagination controls
  const visiblePages = useMemo(() => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Page size functions
  const changePageSize = useCallback((newPageSize) => {
    const newTotalPages = Math.ceil(totalItems / newPageSize) || 1;
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    
    setPageSize(newPageSize);
    setCurrentPage(newCurrentPage);
  }, [currentPage, totalItems]);

  // Reset pagination (useful when data changes)
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  // Get pagination info for display
  const paginationInfo = useMemo(() => {
    if (totalItems === 0) {
      return {
        start: 0,
        end: 0,
        total: 0,
        text: 'No items to display'
      };
    }

    const start = startIndex + 1;
    const end = endIndex;
    
    return {
      start,
      end,
      total: totalItems,
      text: `Showing ${start} to ${end} of ${totalItems} items`
    };
  }, [startIndex, endIndex, totalItems]);

  // Check if pagination is needed
  const isPaginationNeeded = useMemo(() => {
    return totalItems > pageSize;
  }, [totalItems, pageSize]);

  // Navigation state
  const canGoToPrevious = useMemo(() => currentPage > 1, [currentPage]);
  const canGoToNext = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const canGoToFirst = useMemo(() => currentPage > 1, [currentPage]);
  const canGoToLast = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

  // Get page range for current view
  const pageRange = useMemo(() => {
    return {
      start: startIndex,
      end: endIndex,
      size: endIndex - startIndex
    };
  }, [startIndex, endIndex]);

  return {
    // Data
    paginatedData,
    
    // State
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    
    // Navigation
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    
    // Page size
    changePageSize,
    pageSizeOptions,
    
    // Utilities
    resetPagination,
    
    // Computed values
    visiblePages,
    paginationInfo,
    pageRange,
    isPaginationNeeded,
    
    // Navigation state
    canGoToPrevious,
    canGoToNext,
    canGoToFirst,
    canGoToLast,
    
    // Indices
    startIndex,
    endIndex
  };
};

export default usePagination;