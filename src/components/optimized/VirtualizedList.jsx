import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

/**
 * Optimized VirtualizedList component for rendering large datasets
 * Uses react-window for efficient virtualization
 */
const VirtualizedList = memo(({ 
  items = [],
  renderItem,
  itemHeight = 80,
  variableHeight = false,
  getItemHeight,
  containerHeight = 400,
  containerWidth = '100%',
  overscanCount = 5,
  className = '',
  emptyMessage = 'No items to display',
  loading = false,
  loadingMessage = 'Loading...',
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto',
  direction = 'vertical',
  ...props
}) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  // Row renderer for fixed size list
  const Row = useCallback(({ index, style, data }) => {
    const { items, renderItem } = data;
    const item = items[index];
    
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  }, []);

  // Variable size row renderer
  const VariableRow = useCallback(({ index, style, data }) => {
    const { items, renderItem } = data;
    const item = items[index];
    
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((scrollProps) => {
    onScroll?.(scrollProps);
  }, [onScroll]);

  // Get item height for variable size list
  const getItemSize = useCallback((index) => {
    if (getItemHeight) {
      return getItemHeight(items[index], index);
    }
    return itemHeight;
  }, [getItemHeight, items, itemHeight]);

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight, width: containerWidth }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight, width: containerWidth }}
      >
        <div className="text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render variable size list
  if (variableHeight) {
    return (
      <div className={className} style={{ height: containerHeight, width: containerWidth }}>
        <AutoSizer>
          {({ height, width }) => (
            <VariableSizeList
              height={height}
              width={width}
              itemCount={items.length}
              itemSize={getItemSize}
              itemData={itemData}
              overscanCount={overscanCount}
              onScroll={handleScroll}
              scrollToIndex={scrollToIndex}
              scrollToAlignment={scrollToAlignment}
              direction={direction}
              {...props}
            >
              {VariableRow}
            </VariableSizeList>
          )}
        </AutoSizer>
      </div>
    );
  }

  // Render fixed size list
  return (
    <div className={className} style={{ height: containerHeight, width: containerWidth }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            itemData={itemData}
            overscanCount={overscanCount}
            onScroll={handleScroll}
            scrollToIndex={scrollToIndex}
            scrollToAlignment={scrollToAlignment}
            direction={direction}
            {...props}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

/**
 * Virtualized Grid component for 2D data
 */
export const VirtualizedGrid = memo(({ 
  items = [],
  renderCell,
  columnCount = 1,
  rowCount,
  columnWidth = 200,
  rowHeight = 80,
  containerHeight = 400,
  containerWidth = '100%',
  overscanCount = 5,
  className = '',
  emptyMessage = 'No items to display',
  loading = false,
  loadingMessage = 'Loading...',
  onScroll,
  ...props
}) => {
  // Calculate row count if not provided
  const calculatedRowCount = useMemo(() => {
    if (rowCount !== undefined) return rowCount;
    return Math.ceil(items.length / columnCount);
  }, [rowCount, items.length, columnCount]);

  // Memoize the item data
  const itemData = useMemo(() => ({
    items,
    renderCell,
    columnCount
  }), [items, renderCell, columnCount]);

  // Cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style, data }) => {
    const { items, renderCell, columnCount } = data;
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];
    
    if (!item) {
      return <div style={style} />;
    }
    
    return (
      <div style={style}>
        {renderCell(item, itemIndex, rowIndex, columnIndex)}
      </div>
    );
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((scrollProps) => {
    onScroll?.(scrollProps);
  }, [onScroll]);

  // Loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight, width: containerWidth }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight, width: containerWidth }}
      >
        <div className="text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height: containerHeight, width: containerWidth }}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            height={height}
            width={width}
            columnCount={columnCount}
            rowCount={calculatedRowCount}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            itemData={itemData}
            overscanCount={overscanCount}
            onScroll={handleScroll}
            {...props}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
});

/**
 * Infinite loading virtualized list
 */
export const InfiniteVirtualizedList = memo(({ 
  items = [],
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  containerWidth = '100%',
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  threshold = 5,
  loadingItem = null,
  className = '',
  ...props
}) => {
  // Add loading item to the list if loading next page
  const itemsWithLoading = useMemo(() => {
    if (isNextPageLoading && loadingItem) {
      return [...items, { isLoading: true }];
    }
    return items;
  }, [items, isNextPageLoading, loadingItem]);

  // Item data with loading state
  const itemData = useMemo(() => ({
    items: itemsWithLoading,
    renderItem,
    loadingItem,
    hasNextPage,
    isNextPageLoading,
    loadNextPage,
    threshold
  }), [itemsWithLoading, renderItem, loadingItem, hasNextPage, isNextPageLoading, loadNextPage, threshold]);

  // Row renderer with infinite loading logic
  const Row = useCallback(({ index, style, data }) => {
    const { 
      items, 
      renderItem, 
      loadingItem, 
      hasNextPage, 
      isNextPageLoading, 
      loadNextPage, 
      threshold 
    } = data;
    
    const item = items[index];
    
    // Check if we should load next page
    const shouldLoadNext = hasNextPage && 
                          !isNextPageLoading && 
                          index >= items.length - threshold;
    
    if (shouldLoadNext && loadNextPage) {
      loadNextPage();
    }
    
    // Render loading item
    if (item?.isLoading && loadingItem) {
      return (
        <div style={style}>
          {loadingItem}
        </div>
      );
    }
    
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  }, []);

  return (
    <div className={className} style={{ height: containerHeight, width: containerWidth }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={itemsWithLoading.length}
            itemSize={itemHeight}
            itemData={itemData}
            {...props}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

// Display names for debugging
VirtualizedList.displayName = 'VirtualizedList';
VirtualizedGrid.displayName = 'VirtualizedGrid';
InfiniteVirtualizedList.displayName = 'InfiniteVirtualizedList';

// PropTypes
VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  variableHeight: PropTypes.bool,
  getItemHeight: PropTypes.func,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  overscanCount: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  onScroll: PropTypes.func,
  scrollToIndex: PropTypes.number,
  scrollToAlignment: PropTypes.oneOf(['auto', 'smart', 'center', 'end', 'start']),
  direction: PropTypes.oneOf(['vertical', 'horizontal'])
};

VirtualizedGrid.propTypes = {
  items: PropTypes.array.isRequired,
  renderCell: PropTypes.func.isRequired,
  columnCount: PropTypes.number,
  rowCount: PropTypes.number,
  columnWidth: PropTypes.number,
  rowHeight: PropTypes.number,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  overscanCount: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  onScroll: PropTypes.func
};

InfiniteVirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hasNextPage: PropTypes.bool,
  isNextPageLoading: PropTypes.bool,
  loadNextPage: PropTypes.func,
  threshold: PropTypes.number,
  loadingItem: PropTypes.node,
  className: PropTypes.string
};

export default VirtualizedList;