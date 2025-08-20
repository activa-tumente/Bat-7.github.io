import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback, useStableCallback } from './useOptimizedMemo';
import cacheService from '../services/cacheService';

/**
 * Hook optimizado para llamadas a API con cache, debounce y manejo de estados
 */
export const useOptimizedAPI = (apiFunction, options = {}) => {
  const {
    immediate = false,
    cache = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    debounceMs = 0,
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const abortControllerRef = useRef();
  const retryCountRef = useRef(0);

  // Función estable para callbacks
  const stableOnSuccess = useStableCallback(onSuccess);
  const stableOnError = useStableCallback(onError);

  // Función principal de fetch
  const fetchData = useCallback(async (...args) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    // Generar clave de cache
    const key = cacheKey || `api_${apiFunction.name}_${JSON.stringify(args)}`;

    // Verificar cache si está habilitado
    if (cache) {
      const cachedData = cacheService.get(key);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        setLastFetch(Date.now());
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args, {
        signal: abortControllerRef.current.signal
      });

      // Guardar en cache si está habilitado
      if (cache) {
        cacheService.set(key, result, {
          ttl: cacheTTL,
          tags: ['api', apiFunction.name]
        });
      }

      setData(result);
      setLastFetch(Date.now());
      retryCountRef.current = 0;

      if (stableOnSuccess) {
        stableOnSuccess(result);
      }

      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request cancelado, no hacer nada
      }

      // Retry logic
      if (retryCountRef.current < retries) {
        retryCountRef.current++;
        
        setTimeout(() => {
          fetchData(...args);
        }, retryDelay * retryCountRef.current);
        
        return;
      }

      setError(err);
      retryCountRef.current = 0;

      if (stableOnError) {
        stableOnError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cache, cacheKey, cacheTTL, retries, retryDelay, stableOnSuccess, stableOnError]);

  // Función con debounce si está configurado
  const debouncedFetch = useDebouncedCallback(fetchData, debounceMs, [fetchData]);

  // Función final que se expone
  const execute = debounceMs > 0 ? debouncedFetch : fetchData;

  // Función para refetch
  const refetch = useCallback((...args) => {
    const key = cacheKey || `api_${apiFunction.name}_${JSON.stringify(args)}`;
    if (cache) {
      cacheService.delete(key);
    }
    return execute(...args);
  }, [execute, cache, cacheKey, apiFunction.name]);

  // Función para invalidar cache
  const invalidateCache = useCallback(() => {
    if (cache) {
      cacheService.invalidateByTags(['api', apiFunction.name]);
    }
  }, [cache, apiFunction.name]);

  // Ejecutar inmediatamente si está configurado
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    invalidateCache,
    lastFetch
  };
};

/**
 * Hook para múltiples llamadas a API en paralelo
 */
export const useParallelAPI = (apiCalls, options = {}) => {
  const { immediate = false, cache = true } = options;
  
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const execute = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const promises = Object.entries(apiCalls).map(async ([key, { fn, args = [], options: callOptions = {} }]) => {
      try {
        const result = await fn(...args);
        return { key, result, error: null };
      } catch (error) {
        return { key, result: null, error };
      }
    });

    const responses = await Promise.allSettled(promises);
    
    const newResults = {};
    const newErrors = {};

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        const { key, result, error } = response.value;
        if (error) {
          newErrors[key] = error;
        } else {
          newResults[key] = result;
        }
      }
    });

    setResults(newResults);
    setErrors(newErrors);
    setLoading(false);
  }, [apiCalls]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    results,
    loading,
    errors,
    execute
  };
};

/**
 * Hook para paginación optimizada
 */
export const usePaginatedAPI = (apiFunction, options = {}) => {
  const {
    pageSize = 20,
    cache = true,
    prefetchNext = true,
    ...otherOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const {
    data,
    loading,
    error,
    execute
  } = useOptimizedAPI(apiFunction, {
    ...otherOptions,
    cache,
    cacheKey: `paginated_${apiFunction.name}_${currentPage}_${pageSize}`
  });

  // Cargar página específica
  const loadPage = useCallback(async (page) => {
    const result = await execute({
      page,
      pageSize,
      offset: (page - 1) * pageSize
    });

    if (result) {
      setTotalCount(result.total || result.count || 0);
      setHasMore(result.hasMore || (result.data && result.data.length === pageSize));
      
      if (page === 1) {
        setAllData(result.data || []);
      } else {
        setAllData(prev => [...prev, ...(result.data || [])]);
      }
    }

    return result;
  }, [execute, pageSize]);

  // Cargar siguiente página
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      return loadPage(nextPage);
    }
  }, [currentPage, hasMore, loading, loadPage]);

  // Resetear y cargar primera página
  const reset = useCallback(() => {
    setCurrentPage(1);
    setAllData([]);
    setHasMore(true);
    setTotalCount(0);
    return loadPage(1);
  }, [loadPage]);

  // Prefetch siguiente página
  useEffect(() => {
    if (prefetchNext && !loading && hasMore && data) {
      const nextPage = currentPage + 1;
      const nextCacheKey = `paginated_${apiFunction.name}_${nextPage}_${pageSize}`;
      
      // Solo prefetch si no está en cache
      if (!cacheService.get(nextCacheKey)) {
        setTimeout(() => {
          apiFunction({
            page: nextPage,
            pageSize,
            offset: nextPage * pageSize
          }).then(result => {
            if (cache) {
              cacheService.set(nextCacheKey, result, {
                ttl: 2 * 60 * 1000, // 2 minutos para prefetch
                tags: ['api', 'paginated', apiFunction.name]
              });
            }
          }).catch(() => {
            // Ignorar errores de prefetch
          });
        }, 100);
      }
    }
  }, [prefetchNext, loading, hasMore, data, currentPage, apiFunction, pageSize, cache]);

  // Cargar primera página al montar
  useEffect(() => {
    loadPage(1);
  }, []);

  return {
    data: allData,
    currentPage,
    totalCount,
    hasMore,
    loading,
    error,
    loadMore,
    reset,
    loadPage
  };
};

export default {
  useOptimizedAPI,
  useParallelAPI,
  usePaginatedAPI
};
