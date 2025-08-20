import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Optimized list component with virtualization, sorting, and performance optimizations
 * Demonstrates React performance best practices
 */
const OptimizedList = ({
  items = [],
  renderItem,
  itemHeight = 60,
  height = 400,
  width = '100%',
  sortable = false,
  sortConfig = null,
  onSort,
  className = '',
  emptyMessage = 'No items to display',
  loadingMessage = 'Loading...',
  isLoading = false,
  overscan = 5,
  threshold = 100 // Threshold for enabling virtualization
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const listRef = useRef(null);

  // Memoize sorted items to prevent unnecessary re-sorting
  const sortedItems = useMemo(() => {
    if (!sortable || !sortConfig || !sortConfig.key) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [items, sortConfig, sortable]);

  // Memoize whether to use virtualization
  const shouldVirtualize = useMemo(() => {
    return sortedItems.length > threshold;
  }, [sortedItems.length, threshold]);

  // Handle sort column click
  const handleSort = useCallback((key) => {
    if (!sortable || !onSort) return;

    const direction = 
      sortConfig?.key === key && sortConfig?.direction === 'asc' 
        ? 'desc' 
        : 'asc';

    onSort({ key, direction });
  }, [sortable, onSort, sortConfig]);

  // Handle mouse enter/leave for hover effects
  const handleMouseEnter = useCallback((index) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(-1);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, 'center');
    }
  }, []);

  // Reset scroll position when items change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [sortedItems]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500">{loadingMessage}</div>
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  // Render virtualized list
  if (shouldVirtualize) {
    return (
      <div className={className}>
        <List
          ref={listRef}
          height={height}
          width={width}
          itemCount={sortedItems.length}
          itemSize={itemHeight}
          overscanCount={overscan}
          itemData={{
            items: sortedItems,
            renderItem,
            hoveredIndex,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave
          }}
        >
          {VirtualizedItem}
        </List>
      </div>
    );
  }

  // Render regular list for smaller datasets
  return (
    <div className={className} style={{ height, overflow: 'auto' }}>
      {sortedItems.map((item, index) => (
        <RegularItem
          key={item.id || index}
          item={item}
          index={index}
          renderItem={renderItem}
          isHovered={hoveredIndex === index}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
};

// Memoized virtualized item component
const VirtualizedItem = React.memo(({ index, style, data }) => {
  const { items, renderItem, hoveredIndex, onMouseEnter, onMouseLeave } = data;
  const item = items[index];
  const isHovered = hoveredIndex === index;

  return (
    <div
      style={style}
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={onMouseLeave}
    >
      {renderItem(item, index, isHovered)}
    </div>
  );
});

VirtualizedItem.displayName = 'VirtualizedItem';

// Memoized regular item component
const RegularItem = React.memo(({
  item,
  index,
  renderItem,
  isHovered,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {renderItem(item, index, isHovered)}
    </div>
  );
});

RegularItem.displayName = 'RegularItem';

// Sortable header component
export const SortableHeader = React.memo(({
  label,
  sortKey,
  sortConfig,
  onSort,
  className = ''
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  const handleClick = useCallback(() => {
    onSort(sortKey);
  }, [onSort, sortKey]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        flex items-center gap-1 px-3 py-2 text-left font-medium text-gray-700
        hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-50
        transition-colors duration-200 ${className}
      `}
      aria-label={`Sort by ${label}`}
    >
      <span>{label}</span>
      <div className="flex flex-col">
        <ChevronUpIcon 
          className={`w-3 h-3 ${
            isSorted && direction === 'asc' 
              ? 'text-blue-600' 
              : 'text-gray-400'
          }`}
        />
        <ChevronDownIcon 
          className={`w-3 h-3 -mt-1 ${
            isSorted && direction === 'desc' 
              ? 'text-blue-600' 
              : 'text-gray-400'
          }`}
        />
      </div>
    </button>
  );
});

SortableHeader.displayName = 'SortableHeader';

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Performance monitoring hook
export const useListPerformance = (itemCount) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(`List rendered ${renderCount.current} times. ` +
                 `Time since last render: ${timeSinceLastRender}ms. ` +
                 `Item count: ${itemCount}`);
    }
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
};

// Export optimized list with default props
export default React.memo(OptimizedList);

// Export list item wrapper for consistent styling
export const ListItem = React.memo(({
  children,
  isHovered = false,
  isSelected = false,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 border-b border-gray-200 transition-colors duration-150
        ${isHovered ? 'bg-gray-50' : 'bg-white'}
        ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

ListItem.displayName = 'ListItem';

// Export configuration for different list types
export const listConfigs = {
  small: {
    itemHeight: 40,
    height: 200,
    threshold: 50
  },
  medium: {
    itemHeight: 60,
    height: 400,
    threshold: 100
  },
  large: {
    itemHeight: 80,
    height: 600,
    threshold: 200
  }
};