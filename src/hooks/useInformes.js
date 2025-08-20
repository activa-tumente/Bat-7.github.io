/**
 * useInformes.js - Hook personalizado para gestión de informes
 * 
 * Implementa:
 * - Estado centralizado de informes
 * - Operaciones CRUD optimizadas
 * - Caché inteligente con TTL
 * - Manejo de errores robusto
 * - Paginación y filtrado
 * - Invalidación automática de caché
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { InformesRepository } from '../services/InformesRepository';
import { INFORMES_CONFIG } from '../config/informes';
import { toast } from 'react-toastify';

// Estado inicial
const initialState = {
  informes: [],
  loading: false,
  error: null,
  lastUpdate: null,
  pagination: {
    page: 1,
    pageSize: INFORMES_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0
  }
};

// Hook principal
export const useInformes = (options = {}) => {
  const {
    autoLoad = true,
    enableCache = true,
    enableRealtime = false,
    filters = {},
    sortBy = 'fecha_generacion',
    sortOrder = 'desc'
  } = options;

  // Estados
  const [state, setState] = useState(initialState);
  const { handleError } = useErrorHandler();
  
  // Referencias
  const repositoryRef = useRef(new InformesRepository({ enableCache }));
  const abortControllerRef = useRef(null);
  const realtimeSubscriptionRef = useRef(null);

  // Función para actualizar estado de manera segura
  const updateState = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...updates,
      lastUpdate: Date.now()
    }));
  }, []);

  // Cargar informes
  const loadInformes = useCallback(async (options = {}) => {
    const {
      page = state.pagination.page,
      pageSize = state.pagination.pageSize,
      force = false,
      showLoading = true
    } = options;

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    if (showLoading) {
      updateState({ loading: true, error: null });
    }

    try {
      const queryOptions = {
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize,
        force,
        signal: abortControllerRef.current.signal
      };

      const result = await repositoryRef.current.getInformes(queryOptions);

      updateState({
        informes: result.data || [],
        loading: false,
        error: null,
        pagination: {
          page: result.pagination?.page || page,
          pageSize: result.pagination?.pageSize || pageSize,
          total: result.pagination?.total || 0,
          totalPages: result.pagination?.totalPages || 0
        }
      });

      return result.data || [];

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Petición cancelada');
        return;
      }

      const errorMessage = error.message || 'Error cargando informes';
      updateState({ 
        loading: false, 
        error: errorMessage,
        informes: [] 
      });
      
      handleError(error, 'Cargar informes');
      throw error;
    }
  }, [state.pagination.page, state.pagination.pageSize, filters, sortBy, sortOrder, updateState, handleError]);

  // Refrescar informes
  const refreshInformes = useCallback(async () => {
    try {
      await loadInformes({ force: true });
      toast.success('Informes actualizados correctamente');
    } catch (error) {
      // Error ya manejado en loadInformes
    }
  }, [loadInformes]);

  // Eliminar informe individual
  const deleteInforme = useCallback(async (informeId) => {
    if (!informeId) {
      throw new Error('ID de informe requerido');
    }

    try {
      await repositoryRef.current.deleteInforme(informeId);
      
      // Actualizar estado local inmediatamente
      updateState({
        informes: state.informes.filter(informe => informe.id !== informeId),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        }
      });

      toast.success('Informe eliminado correctamente');
      return true;

    } catch (error) {
      handleError(error, 'Eliminar informe');
      throw error;
    }
  }, [state.informes, state.pagination, updateState, handleError]);

  // Eliminar múltiples informes
  const deleteMultipleInformes = useCallback(async (informeIds) => {
    if (!informeIds || informeIds.length === 0) {
      throw new Error('IDs de informes requeridos');
    }

    const confirmMessage = `¿Estás seguro de que deseas eliminar ${informeIds.length} informe(s)?`;
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    try {
      updateState({ loading: true });
      
      await repositoryRef.current.deleteMultipleInformes(informeIds);
      
      // Actualizar estado local
      updateState({
        informes: state.informes.filter(informe => !informeIds.includes(informe.id)),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - informeIds.length)
        },
        loading: false
      });

      toast.success(`${informeIds.length} informe(s) eliminado(s) correctamente`);
      return true;

    } catch (error) {
      updateState({ loading: false });
      handleError(error, 'Eliminar informes');
      throw error;
    }
  }, [state.informes, state.pagination, updateState, handleError]);

  // Archivar informes
  const archiveInformes = useCallback(async (informeIds) => {
    if (!informeIds || informeIds.length === 0) {
      throw new Error('IDs de informes requeridos');
    }

    try {
      updateState({ loading: true });
      
      await repositoryRef.current.archiveInformes(informeIds);
      
      // Recargar datos después de archivar
      await loadInformes({ force: true, showLoading: false });
      
      toast.success(`${informeIds.length} informe(s) archivado(s) correctamente`);
      return true;

    } catch (error) {
      updateState({ loading: false });
      handleError(error, 'Archivar informes');
      throw error;
    }
  }, [loadInformes, updateState, handleError]);

  // Exportar informes
  const exportInformes = useCallback(async (informeIds, format = 'pdf') => {
    if (!informeIds || informeIds.length === 0) {
      throw new Error('IDs de informes requeridos');
    }

    try {
      updateState({ loading: true });
      
      const result = await repositoryRef.current.exportInformes(informeIds, format);
      
      // Descargar archivo
      if (result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename || `informes_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      updateState({ loading: false });
      toast.success(`${informeIds.length} informe(s) exportado(s) correctamente`);
      return result;

    } catch (error) {
      updateState({ loading: false });
      handleError(error, 'Exportar informes');
      throw error;
    }
  }, [updateState, handleError]);

  // Cambiar página
  const setPage = useCallback(async (newPage) => {
    if (newPage === state.pagination.page) return;
    
    updateState({
      pagination: { ...state.pagination, page: newPage }
    });
    
    await loadInformes({ page: newPage });
  }, [state.pagination, updateState, loadInformes]);

  // Cambiar tamaño de página
  const setPageSize = useCallback(async (newPageSize) => {
    if (newPageSize === state.pagination.pageSize) return;
    
    updateState({
      pagination: { 
        ...state.pagination, 
        pageSize: newPageSize,
        page: 1 // Resetear a primera página
      }
    });
    
    await loadInformes({ page: 1, pageSize: newPageSize });
  }, [state.pagination, updateState, loadInformes]);

  // Manejar acciones de informe
  const handleInformeAction = useCallback(async (action, informeId, data = {}) => {
    try {
      switch (action) {
        case 'view':
          // Navegar a vista de informe
          window.open(`/informes/${informeId}`, '_blank');
          break;
          
        case 'edit':
          // Navegar a edición de informe
          window.location.href = `/informes/${informeId}/edit`;
          break;
          
        case 'delete':
          await deleteInforme(informeId);
          break;
          
        case 'duplicate':
          await repositoryRef.current.duplicateInforme(informeId);
          await refreshInformes();
          toast.success('Informe duplicado correctamente');
          break;
          
        case 'download':
          await exportInformes([informeId], data.format || 'pdf');
          break;
          
        default:
          throw new Error(`Acción no soportada: ${action}`);
      }
    } catch (error) {
      handleError(error, `Acción de informe: ${action}`);
    }
  }, [deleteInforme, exportInformes, refreshInformes, handleError]);

  // Configurar tiempo real (si está habilitado)
  useEffect(() => {
    if (!enableRealtime) return;

    const setupRealtime = async () => {
      try {
        const subscription = await repositoryRef.current.subscribeToChanges((payload) => {
          console.log('Cambio en tiempo real:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              updateState({
                informes: [payload.new, ...state.informes],
                pagination: {
                  ...state.pagination,
                  total: state.pagination.total + 1
                }
              });
              toast.info('Nuevo informe generado');
              break;
              
            case 'UPDATE':
              updateState({
                informes: state.informes.map(informe => 
                  informe.id === payload.new.id ? payload.new : informe
                )
              });
              break;
              
            case 'DELETE':
              updateState({
                informes: state.informes.filter(informe => informe.id !== payload.old.id),
                pagination: {
                  ...state.pagination,
                  total: Math.max(0, state.pagination.total - 1)
                }
              });
              toast.info('Informe eliminado');
              break;
          }
        });
        
        realtimeSubscriptionRef.current = subscription;
      } catch (error) {
        console.warn('No se pudo configurar tiempo real:', error);
      }
    };

    setupRealtime();

    return () => {
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [enableRealtime, state.informes, state.pagination, updateState]);

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad) {
      loadInformes();
    }

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [autoLoad, loadInformes]);

  // Datos memoizados
  const memoizedData = useMemo(() => ({
    informes: state.informes,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    lastUpdate: state.lastUpdate,
    isEmpty: !state.loading && state.informes.length === 0,
    hasError: !!state.error
  }), [state]);

  // Acciones memoizadas
  const actions = useMemo(() => ({
    loadInformes,
    refreshInformes,
    deleteInforme,
    deleteMultipleInformes,
    archiveInformes,
    exportInformes,
    setPage,
    setPageSize,
    handleInformeAction
  }), [
    loadInformes,
    refreshInformes,
    deleteInforme,
    deleteMultipleInformes,
    archiveInformes,
    exportInformes,
    setPage,
    setPageSize,
    handleInformeAction
  ]);

  return {
    ...memoizedData,
    actions
  };
};

// Hook para estadísticas de informes
export const useInformesStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    porEstado: {},
    porTipo: {},
    porGenero: {},
    porMes: {},
    tendencias: []
  });
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const loadStats = useCallback(async (dateRange = {}) => {
    setLoading(true);
    
    try {
      const repository = new InformesRepository();
      const result = await repository.getStats(dateRange);
      setStats(result);
    } catch (error) {
      handleError(error, 'Cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refreshStats: loadStats
  };
};

// Hook para informes recientes
export const useRecentInformes = (limit = 5) => {
  const [recentInformes, setRecentInformes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const loadRecentInformes = useCallback(async () => {
    setLoading(true);
    
    try {
      const repository = new InformesRepository();
      const result = await repository.getRecentInformes(limit);
      setRecentInformes(result.data || []);
    } catch (error) {
      handleError(error, 'Cargar informes recientes');
    } finally {
      setLoading(false);
    }
  }, [limit, handleError]);

  useEffect(() => {
    loadRecentInformes();
  }, [loadRecentInformes]);

  return {
    recentInformes,
    loading,
    refreshRecentInformes: loadRecentInformes
  };
};

export default useInformes;