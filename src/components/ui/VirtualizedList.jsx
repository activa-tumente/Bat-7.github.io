import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useVirtualizedMemo, useThrottledCallback } from '../../hooks/useOptimizedMemo';

/**
 * Componente de lista virtualizada para manejar grandes cantidades de datos
 * Optimizado para performance con renderizado solo de elementos visibles
 */
const VirtualizedList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  getItemKey,
  overscan = 5,
  className = '',
  onScroll,
  estimatedItemHeight,
  variableHeight = false,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef();
  const scrollTimeoutRef = useRef();

  // Memoización de cálculos de virtualización
  const virtualConfig = useVirtualizedMemo(items, itemHeight, containerHeight);

  // Calcular elementos visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + virtualConfig.visibleCount + overscan,
      items.length - 1
    );
    
    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex
    };
  }, [scrollTop, itemHeight, virtualConfig.visibleCount, overscan, items.length]);

  // Elementos visibles
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange.start, visibleRange.end]);

  // Manejar scroll con throttle
  const handleScroll = useThrottledCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Callback externo
    if (onScroll) {
      onScroll(event);
    }

    // Limpiar estado de scrolling después de un delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, 16); // ~60fps

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Scroll programático
  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  // Scroll al top
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // Obtener key del item
  const getKey = useCallback((item, index) => {
    if (getItemKey) {
      return getItemKey(item, index);
    }
    return item.id || item.key || index;
  }, [getItemKey]);

  // Renderizar item con posicionamiento absoluto
  const renderVirtualItem = useCallback((item, index) => {
    const actualIndex = visibleRange.start + index;
    const top = actualIndex * itemHeight;
    
    return (
      <div
        key={getKey(item, actualIndex)}
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: 0,
          right: 0,
          height: `${itemHeight}px`
        }}
        data-index={actualIndex}
      >
        {renderItem(item, actualIndex, {
          isScrolling,
          isVisible: true
        })}
      </div>
    );
  }, [visibleRange.start, itemHeight, getKey, renderItem, isScrolling]);

  // Altura total del contenedor virtual
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-testid="virtualized-list"
      {...props}
    >
      {/* Contenedor virtual con altura total */}
      <div
        style={{
          position: 'relative',
          height: `${totalHeight}px`,
          width: '100%'
        }}
      >
        {/* Elementos visibles */}
        {visibleItems.map((item, index) => renderVirtualItem(item, index))}
      </div>
    </div>
  );
};

// HOC para agregar funcionalidad de búsqueda
export const withSearch = (WrappedComponent) => {
  return React.memo(({ items, searchTerm, searchFields, ...props }) => {
    const filteredItems = useMemo(() => {
      if (!searchTerm) return items;
      
      const term = searchTerm.toLowerCase();
      return items.filter(item => {
        if (searchFields) {
          return searchFields.some(field => 
            String(item[field]).toLowerCase().includes(term)
          );
        }
        
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(term)
        );
      });
    }, [items, searchTerm, searchFields]);

    return <WrappedComponent {...props} items={filteredItems} />;
  });
};

// HOC para agregar funcionalidad de ordenamiento
export const withSort = (WrappedComponent) => {
  return React.memo(({ items, sortBy, sortOrder = 'asc', ...props }) => {
    const sortedItems = useMemo(() => {
      if (!sortBy) return items;
      
      return [...items].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }, [items, sortBy, sortOrder]);

    return <WrappedComponent {...props} items={sortedItems} />;
  });
};

// HOC para agregar funcionalidad de selección múltiple
export const withSelection = (WrappedComponent) => {
  return React.memo(({ items, onSelectionChange, ...props }) => {
    const [selectedItems, setSelectedItems] = useState(new Set());

    const handleItemSelect = useCallback((item, isSelected) => {
      setSelectedItems(prev => {
        const newSelection = new Set(prev);
        if (isSelected) {
          newSelection.add(item.id || item.key);
        } else {
          newSelection.delete(item.id || item.key);
        }
        
        if (onSelectionChange) {
          onSelectionChange(Array.from(newSelection));
        }
        
        return newSelection;
      });
    }, [onSelectionChange]);

    const handleSelectAll = useCallback(() => {
      const allIds = items.map(item => item.id || item.key);
      setSelectedItems(new Set(allIds));
      
      if (onSelectionChange) {
        onSelectionChange(allIds);
      }
    }, [items, onSelectionChange]);

    const handleDeselectAll = useCallback(() => {
      setSelectedItems(new Set());
      
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }, [onSelectionChange]);

    return (
      <WrappedComponent
        {...props}
        items={items}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />
    );
  });
};

// Componente optimizado con todas las funcionalidades
export const OptimizedVirtualizedList = withSelection(withSort(withSearch(VirtualizedList)));

export default React.memo(VirtualizedList);
