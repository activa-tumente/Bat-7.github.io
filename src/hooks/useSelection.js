import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing item selection functionality
 * Provides standardized selection logic with bulk operations support
 * 
 * @param {Array} items - Array of items that can be selected
 * @param {Object} options - Configuration options
 * @returns {Object} Selection state and operations
 */
export const useSelection = (items = [], options = {}) => {
  const {
    idField = 'id',
    maxSelections = null,
    allowSelectAll = true,
    initialSelected = []
  } = options;

  const [selectedIds, setSelectedIds] = useState(new Set(initialSelected));

  // Get array of selected IDs
  const selectedArray = useMemo(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item[idField]));
  }, [items, selectedIds, idField]);

  // Selection counts
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);
  const totalCount = useMemo(() => items.length, [items.length]);

  // Selection state checks
  const hasSelections = useMemo(() => selectedCount > 0, [selectedCount]);
  const isAllSelected = useMemo(() => {
    return totalCount > 0 && selectedCount === totalCount;
  }, [selectedCount, totalCount]);
  const isPartiallySelected = useMemo(() => {
    return selectedCount > 0 && selectedCount < totalCount;
  }, [selectedCount, totalCount]);
  const canSelectMore = useMemo(() => {
    return maxSelections === null || selectedCount < maxSelections;
  }, [maxSelections, selectedCount]);

  // Check if specific item is selected
  const isSelected = useCallback((item) => {
    const id = typeof item === 'object' ? item[idField] : item;
    return selectedIds.has(id);
  }, [selectedIds, idField]);

  // Toggle single item selection
  const toggleSelection = useCallback((item) => {
    const id = typeof item === 'object' ? item[idField] : item;
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else if (canSelectMore) {
        newSet.add(id);
      }
      
      return newSet;
    });
  }, [idField, canSelectMore]);

  // Select single item
  const selectItem = useCallback((item) => {
    const id = typeof item === 'object' ? item[idField] : item;
    
    if (canSelectMore) {
      setSelectedIds(prev => new Set([...prev, id]));
    }
  }, [idField, canSelectMore]);

  // Deselect single item
  const deselectItem = useCallback((item) => {
    const id = typeof item === 'object' ? item[idField] : item;
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [idField]);

  // Select multiple items
  const selectItems = useCallback((itemsToSelect) => {
    const idsToSelect = itemsToSelect.map(item => 
      typeof item === 'object' ? item[idField] : item
    );
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      for (const id of idsToSelect) {
        if (maxSelections === null || newSet.size < maxSelections) {
          newSet.add(id);
        } else {
          break;
        }
      }
      
      return newSet;
    });
  }, [idField, maxSelections]);

  // Deselect multiple items
  const deselectItems = useCallback((itemsToDeselect) => {
    const idsToDeselect = itemsToDeselect.map(item => 
      typeof item === 'object' ? item[idField] : item
    );
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      idsToDeselect.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, [idField]);

  // Select all items
  const selectAll = useCallback(() => {
    if (!allowSelectAll) return;
    
    const allIds = items.map(item => item[idField]);
    const idsToSelect = maxSelections 
      ? allIds.slice(0, maxSelections)
      : allIds;
    
    setSelectedIds(new Set(idsToSelect));
  }, [items, idField, allowSelectAll, maxSelections]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Toggle all selections
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [isAllSelected, clearSelection, selectAll]);

  // Select range of items (useful for shift+click)
  const selectRange = useCallback((startItem, endItem) => {
    const startId = typeof startItem === 'object' ? startItem[idField] : startItem;
    const endId = typeof endItem === 'object' ? endItem[idField] : endItem;
    
    const startIndex = items.findIndex(item => item[idField] === startId);
    const endIndex = items.findIndex(item => item[idField] === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    const rangeItems = items.slice(minIndex, maxIndex + 1);
    selectItems(rangeItems);
  }, [items, idField, selectItems]);

  // Get selection summary
  const selectionSummary = useMemo(() => {
    if (selectedCount === 0) {
      return 'No items selected';
    }
    
    if (isAllSelected) {
      return `All ${totalCount} items selected`;
    }
    
    return `${selectedCount} of ${totalCount} items selected`;
  }, [selectedCount, totalCount, isAllSelected]);

  // Get selection percentage
  const selectionPercentage = useMemo(() => {
    return totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;
  }, [selectedCount, totalCount]);

  // Reset selection when items change
  const resetSelection = useCallback(() => {
    setSelectedIds(new Set(initialSelected));
  }, [initialSelected]);

  // Filter selected items that still exist in current items
  const syncSelection = useCallback(() => {
    const currentIds = new Set(items.map(item => item[idField]));
    setSelectedIds(prev => {
      const newSet = new Set();
      prev.forEach(id => {
        if (currentIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [items, idField]);

  return {
    // State
    selectedIds: selectedArray,
    selectedItems,
    selectedCount,
    totalCount,
    
    // Selection state
    hasSelections,
    isAllSelected,
    isPartiallySelected,
    canSelectMore,
    
    // Single item operations
    isSelected,
    toggleSelection,
    selectItem,
    deselectItem,
    
    // Multiple item operations
    selectItems,
    deselectItems,
    selectRange,
    
    // Bulk operations
    selectAll,
    clearSelection,
    toggleSelectAll,
    
    // Utilities
    resetSelection,
    syncSelection,
    
    // Computed values
    selectionSummary,
    selectionPercentage,
    
    // Configuration
    maxSelections,
    allowSelectAll
  };
};

export default useSelection;