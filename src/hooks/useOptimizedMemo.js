import { useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

/**
 * Hooks de optimización para memoización avanzada
 */

/**
 * Memoización profunda para objetos complejos
 */
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  
  return useMemo(() => {
    const newValue = factory();
    
    // Comparación profunda simple
    if (ref.current && JSON.stringify(ref.current) === JSON.stringify(newValue)) {
      return ref.current;
    }
    
    ref.current = newValue;
    return newValue;
  }, deps);
};

/**
 * Callback con debounce
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
};

/**
 * Callback con throttle
 */
export const useThrottledCallback = (callback, delay, deps = []) => {
  const throttledFn = useMemo(
    () => throttle(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      throttledFn.cancel();
    };
  }, [throttledFn]);

  return throttledFn;
};

/**
 * Memoización con expiración (cache con TTL)
 */
export const useExpirableMemo = (factory, deps, ttl = 5000) => {
  const cache = useRef({ value: null, timestamp: 0 });
  
  return useMemo(() => {
    const now = Date.now();
    
    if (cache.current.value && (now - cache.current.timestamp) < ttl) {
      return cache.current.value;
    }
    
    const newValue = factory();
    cache.current = { value: newValue, timestamp: now };
    return newValue;
  }, deps);
};

/**
 * Memoización condicional
 */
export const useConditionalMemo = (factory, deps, condition) => {
  const lastValue = useRef();
  
  return useMemo(() => {
    if (condition) {
      lastValue.current = factory();
    }
    return lastValue.current;
  }, [...deps, condition]);
};

/**
 * Callback estable que no cambia entre renders
 */
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

/**
 * Memoización de cálculos costosos con cache LRU
 */
export const useExpensiveCalculation = (calculator, deps, cacheSize = 10) => {
  const cache = useRef(new Map());
  
  return useMemo(() => {
    const key = JSON.stringify(deps);
    
    if (cache.current.has(key)) {
      // Mover al final (LRU)
      const value = cache.current.get(key);
      cache.current.delete(key);
      cache.current.set(key, value);
      return value;
    }
    
    const result = calculator();
    
    // Limpiar cache si excede el tamaño
    if (cache.current.size >= cacheSize) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
    
    cache.current.set(key, result);
    return result;
  }, deps);
};

/**
 * Memoización de arrays con comparación personalizada
 */
export const useArrayMemo = (array, compareFn) => {
  const lastArray = useRef(array);
  
  return useMemo(() => {
    if (compareFn ? compareFn(lastArray.current, array) : 
        JSON.stringify(lastArray.current) === JSON.stringify(array)) {
      return lastArray.current;
    }
    
    lastArray.current = array;
    return array;
  }, [array, compareFn]);
};

/**
 * Memoización de funciones de filtrado/búsqueda
 */
export const useFilteredData = (data, filterFn, searchTerm, sortFn) => {
  return useMemo(() => {
    let result = data;
    
    // Aplicar filtro
    if (filterFn) {
      result = result.filter(filterFn);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(term)
        )
      );
    }
    
    // Aplicar ordenamiento
    if (sortFn) {
      result = [...result].sort(sortFn);
    }
    
    return result;
  }, [data, filterFn, searchTerm, sortFn]);
};

/**
 * Memoización de cálculos estadísticos
 */
export const useStatistics = (data, calculations = ['count', 'sum', 'avg']) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    
    const stats = {};
    
    if (calculations.includes('count')) {
      stats.count = data.length;
    }
    
    if (calculations.includes('sum')) {
      stats.sum = data.reduce((acc, item) => acc + (Number(item) || 0), 0);
    }
    
    if (calculations.includes('avg') && stats.count > 0) {
      stats.avg = stats.sum / stats.count;
    }
    
    if (calculations.includes('min')) {
      stats.min = Math.min(...data.map(item => Number(item) || 0));
    }
    
    if (calculations.includes('max')) {
      stats.max = Math.max(...data.map(item => Number(item) || 0));
    }
    
    return stats;
  }, [data, calculations]);
};

/**
 * Memoización de transformaciones de datos complejas
 */
export const useDataTransformation = (data, transformations) => {
  return useMemo(() => {
    return transformations.reduce((result, transform) => {
      switch (transform.type) {
        case 'map':
          return result.map(transform.fn);
        case 'filter':
          return result.filter(transform.fn);
        case 'sort':
          return [...result].sort(transform.fn);
        case 'group':
          return result.reduce((groups, item) => {
            const key = transform.fn(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {});
        case 'aggregate':
          return transform.fn(result);
        default:
          return result;
      }
    }, data);
  }, [data, transformations]);
};

/**
 * Hook para optimizar re-renders de listas grandes
 */
export const useVirtualizedMemo = (items, itemHeight, containerHeight) => {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.min(5, Math.floor(visibleCount * 0.5));
    
    return {
      itemHeight,
      visibleCount,
      bufferSize,
      totalHeight: items.length * itemHeight
    };
  }, [items.length, itemHeight, containerHeight]);
};

export default {
  useDeepMemo,
  useDebouncedCallback,
  useThrottledCallback,
  useExpirableMemo,
  useConditionalMemo,
  useStableCallback,
  useExpensiveCalculation,
  useArrayMemo,
  useFilteredData,
  useStatistics,
  useDataTransformation,
  useVirtualizedMemo
};
