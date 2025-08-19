/**
 * @file useInformesData.js
 * @description Custom hook for managing informes data with proper error handling and performance optimization
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import supabase from '../api/supabaseClient';

/**
 * Custom hook for managing informes data
 * @param {Object} options - Configuration options
 * @param {number} options.itemsPerPage - Items per page for pagination
 * @param {boolean} options.autoRefresh - Enable auto-refresh
 * @param {number} options.refreshInterval - Auto-refresh interval in ms
 * @returns {Object} Hook state and methods
 */
export const useInformesData = ({
  itemsPerPage = 10,
  autoRefresh = false,
  refreshInterval = 30000
} = {}) => {
  // State management
  const [state, setState] = useState({
    informes: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Refs for cleanup and optimization
  const abortControllerRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const cacheRef = useRef(new Map());

  /**
   * Update state with partial updates
   */
  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  /**
   * Optimized data fetching with caching and error handling
   */
  const fetchInformes = useCallback(async (page = 1, options = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Check cache first
    const cacheKey = `page-${page}-${itemsPerPage}`;
    if (cacheRef.current.has(cacheKey) && !options.forceRefresh) {
      const cachedData = cacheRef.current.get(cacheKey);
      updateState({
        ...cachedData,
        currentPage: page,
        loading: false
      });
      return;
    }

    try {
      updateState({ loading: true, error: null });

      const offset = (page - 1) * itemsPerPage;

      // Optimized single query with joins
      const { data: informes, error: informesError, count } = await supabase
        .from('informes_generados')
        .select(`
          id,
          titulo,
          descripcion,
          fecha_generacion,
          metadatos,
          contenido,
          pacientes:paciente_id (
            id,
            nombre,
            apellido,
            documento,
            genero
          )
        `, { count: 'exact' })
        .eq('tipo_informe', 'completo')
        .eq('estado', 'generado')
        .range(offset, offset + itemsPerPage - 1)
        .order('fecha_generacion', { ascending: false })
        .abortSignal(signal);

      if (informesError) throw informesError;

      // Fetch related results in batches to avoid overwhelming the database
      const informesWithResults = await Promise.all(
        (informes || []).map(async (informe) => {
          try {
            const { data: resultados, error: resultadosError } = await supabase
              .from('resultados')
              .select(`
                id,
                puntaje_directo,
                percentil,
                errores,
                tiempo_segundos,
                concentracion,
                created_at,
                aptitudes:aptitud_id (
                  codigo,
                  nombre,
                  descripcion
                )
              `)
              .eq('paciente_id', informe.pacientes?.id)
              .not('puntaje_directo', 'is', null)
              .not('percentil', 'is', null)
              .order('created_at', { ascending: false })
              .limit(20) // Limit to prevent excessive data
              .abortSignal(signal);

            if (resultadosError) {
              console.warn(`Error fetching results for patient ${informe.pacientes?.id}:`, resultadosError);
              return { ...informe, resultados: [] };
            }

            return { ...informe, resultados: resultados || [] };
          } catch (error) {
            if (error.name === 'AbortError') throw error;
            console.warn(`Error processing informe ${informe.id}:`, error);
            return { ...informe, resultados: [] };
          }
        })
      );

      const newState = {
        informes: informesWithResults,
        totalCount: count || 0,
        hasNextPage: offset + itemsPerPage < (count || 0),
        hasPrevPage: page > 1,
        loading: false,
        error: null
      };

      // Cache the result
      cacheRef.current.set(cacheKey, newState);

      // Limit cache size
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      updateState({ ...newState, currentPage: page });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      console.error('Error fetching informes:', error);
      updateState({
        loading: false,
        error: error.message || 'Error al cargar los informes'
      });
    }
  }, [itemsPerPage, updateState]);

  /**
   * Navigate to specific page
   */
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= Math.ceil(state.totalCount / itemsPerPage)) {
      fetchInformes(page);
    }
  }, [fetchInformes, state.totalCount, itemsPerPage]);

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(() => {
    if (state.hasNextPage) {
      goToPage(state.currentPage + 1);
    }
  }, [goToPage, state.hasNextPage, state.currentPage]);

  /**
   * Navigate to previous page
   */
  const prevPage = useCallback(() => {
    if (state.hasPrevPage) {
      goToPage(state.currentPage - 1);
    }
  }, [goToPage, state.hasPrevPage, state.currentPage]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    // Clear cache for current page
    const cacheKey = `page-${state.currentPage}-${itemsPerPage}`;
    cacheRef.current.delete(cacheKey);
    fetchInformes(state.currentPage, { forceRefresh: true });
  }, [fetchInformes, state.currentPage, itemsPerPage]);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Delete informe and refresh data
   */
  const deleteInforme = useCallback(async (informeId) => {
    try {
      updateState({ loading: true });

      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .eq('id', informeId);

      if (error) throw error;

      // Clear cache and refresh
      clearCache();
      await fetchInformes(state.currentPage, { forceRefresh: true });

      return { success: true };
    } catch (error) {
      console.error('Error deleting informe:', error);
      updateState({ 
        loading: false, 
        error: error.message || 'Error al eliminar el informe' 
      });
      return { success: false, error: error.message };
    }
  }, [fetchInformes, state.currentPage, clearCache, updateState]);

  /**
   * Bulk delete informes
   */
  const bulkDeleteInformes = useCallback(async (informeIds) => {
    try {
      updateState({ loading: true });

      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .in('id', informeIds);

      if (error) throw error;

      // Clear cache and refresh
      clearCache();
      await fetchInformes(state.currentPage, { forceRefresh: true });

      return { success: true, deletedCount: informeIds.length };
    } catch (error) {
      console.error('Error bulk deleting informes:', error);
      updateState({ 
        loading: false, 
        error: error.message || 'Error al eliminar los informes' 
      });
      return { success: false, error: error.message };
    }
  }, [fetchInformes, state.currentPage, clearCache, updateState]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchInformes(1);
  }, [fetchInformes]);

  return {
    // State
    informes: state.informes,
    loading: state.loading,
    error: state.error,
    currentPage: state.currentPage,
    totalCount: state.totalCount,
    totalPages: Math.ceil(state.totalCount / itemsPerPage),
    hasNextPage: state.hasNextPage,
    hasPrevPage: state.hasPrevPage,
    
    // Actions
    fetchInformes,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    clearCache,
    deleteInforme,
    bulkDeleteInformes
  };
};

export default useInformesData;