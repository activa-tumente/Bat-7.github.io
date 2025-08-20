import { useState, useEffect, useCallback, useRef } from 'react';
import PatientResultsExtractorImproved from '../services/patientResultsExtractorImproved';

/**
 * Custom hook mejorado para manejar datos de reportes de pacientes
 * Implementa mejores prácticas de React y manejo de estado
 * 
 * @param {string} patientId - ID del paciente
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones del reporte
 */
export function usePatientReport(patientId, options = {}) {
  const {
    autoLoad = true,
    retryAttempts = 3,
    retryDelay = 1000,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    onSuccess,
    onError
  } = options;

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientReport, setPatientReport] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Estados adicionales para mejor UX
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Referencias para cleanup y cache
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const timeoutRef = useRef(null);

  /**
   * Limpiar recursos al desmontar el componente
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Verificar si hay datos en cache válidos
   * @param {string} key - Clave del cache
   * @returns {Object|null} Datos del cache o null
   */
  const getCachedData = useCallback((key) => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cacheTimeout;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [enableCache, cacheTimeout]);

  /**
   * Guardar datos en cache
   * @param {string} key - Clave del cache
   * @param {Object} data - Datos a cachear
   */
  const setCachedData = useCallback((key, data) => {
    if (!enableCache) return;
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [enableCache]);

  /**
   * Simular progreso de carga para mejor UX
   */
  const simulateProgress = useCallback(() => {
    setProgress(0);
    
    const intervals = [20, 40, 60, 80, 95];
    let currentIndex = 0;
    
    const progressInterval = setInterval(() => {
      if (currentIndex < intervals.length) {
        setProgress(intervals[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(progressInterval);
      }
    }, 200);
    
    return () => clearInterval(progressInterval);
  }, []);

  /**
   * Cargar reporte del paciente con manejo de errores y reintentos
   */
  const loadPatientReport = useCallback(async (forceRefresh = false) => {
    if (!patientId) {
      setError(new Error('ID de paciente requerido'));
      return;
    }

    // Verificar cache primero
    const cacheKey = `patient-report-${patientId}`;
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setPatientReport(cachedData);
        setLastUpdated(new Date());
        setError(null);
        return cachedData;
      }
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      setRetryCount(0);
      setIsRetrying(false);
      
      const cleanupProgress = simulateProgress();
      
      console.log('🔄 Cargando reporte completo del paciente:', patientId);
      
      const report = await PatientResultsExtractorImproved.generatePatientReport(patientId);
      
      // Verificar si la operación fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setProgress(100);
      setPatientReport(report);
      setLastUpdated(new Date());
      
      // Guardar en cache
      setCachedData(cacheKey, report);
      
      console.log('✅ Reporte generado exitosamente:', report);
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess(report);
      }
      
      cleanupProgress();
      return report;
      
    } catch (err) {
      // Verificar si la operación fue cancelada
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('❌ Error al cargar reporte:', err);
      
      // Intentar reintento automático
      if (retryCount < retryAttempts && !isRetrying) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        
        console.log(`🔄 Reintentando... (${retryCount + 1}/${retryAttempts})`);
        
        timeoutRef.current = setTimeout(() => {
          setIsRetrying(false);
          loadPatientReport(forceRefresh);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        
        return;
      }
      
      setError(err);
      setProgress(0);
      
      // Callback de error
      if (onError) {
        onError(err);
      }
      
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [patientId, retryCount, retryAttempts, retryDelay, isRetrying, getCachedData, setCachedData, simulateProgress, onSuccess, onError]);

  /**
   * Refrescar datos forzando una nueva carga
   */
  const refetch = useCallback(() => {
    return loadPatientReport(true);
  }, [loadPatientReport]);

  /**
   * Limpiar cache manualmente
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('🗑️ Cache limpiado');
  }, []);

  /**
   * Cancelar operación en curso
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setIsRetrying(false);
      setProgress(0);
      console.log('❌ Operación cancelada');
    }
  }, []);

  /**
   * Reintentar manualmente
   */
  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    return loadPatientReport(true);
  }, [loadPatientReport]);

  /**
   * Verificar si los datos están obsoletos
   */
  const isStale = useCallback(() => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > cacheTimeout;
  }, [lastUpdated, cacheTimeout]);

  /**
   * Obtener información del estado actual
   */
  const getStatusInfo = useCallback(() => {
    return {
      hasData: !!patientReport,
      isLoading: loading,
      hasError: !!error,
      isRetrying,
      retryCount,
      progress,
      lastUpdated,
      isStale: isStale(),
      cacheSize: cacheRef.current.size
    };
  }, [patientReport, loading, error, isRetrying, retryCount, progress, lastUpdated, isStale]);

  // Auto-cargar datos cuando cambia el patientId
  useEffect(() => {
    if (autoLoad && patientId) {
      loadPatientReport();
    }
  }, [patientId, autoLoad, loadPatientReport]);

  // Limpiar timeout al cambiar patientId
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [patientId]);

  return {
    // Estados principales
    loading,
    error,
    patientReport,
    lastUpdated,
    
    // Estados adicionales
    retryCount,
    isRetrying,
    progress,
    
    // Funciones de control
    loadPatientReport,
    refetch,
    retry,
    cancel,
    clearCache,
    
    // Utilidades
    isStale,
    getStatusInfo,
    
    // Datos derivados
    hasData: !!patientReport,
    hasError: !!error,
    isEmpty: !loading && !error && !patientReport,
    canRetry: !!error && retryCount < retryAttempts && !isRetrying
  };
}

/**
 * Hook simplificado para casos básicos
 * @param {string} patientId - ID del paciente
 * @returns {Object} Estado básico del reporte
 */
export function usePatientReportSimple(patientId) {
  return usePatientReport(patientId, {
    autoLoad: true,
    enableCache: true,
    retryAttempts: 2
  });
}

/**
 * Hook para múltiples pacientes con paginación
 * @param {Array} patientIds - Array de IDs de pacientes
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado de múltiples reportes
 */
export function useMultiplePatientReports(patientIds = [], options = {}) {
  const {
    batchSize = 5,
    concurrent = 3,
    onBatchComplete,
    onAllComplete
  } = options;

  const [reports, setReports] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState(new Map());
  const [completed, setCompleted] = useState(0);

  const loadBatch = useCallback(async (ids) => {
    const promises = ids.slice(0, concurrent).map(async (patientId) => {
      try {
        const report = await PatientResultsExtractorImproved.generatePatientReport(patientId);
        setReports(prev => new Map(prev).set(patientId, report));
        setCompleted(prev => prev + 1);
        return { patientId, report, success: true };
      } catch (error) {
        setErrors(prev => new Map(prev).set(patientId, error));
        setCompleted(prev => prev + 1);
        return { patientId, error, success: false };
      }
    });

    const results = await Promise.allSettled(promises);
    
    if (onBatchComplete) {
      onBatchComplete(results);
    }

    return results;
  }, [concurrent, onBatchComplete]);

  const loadAllReports = useCallback(async () => {
    if (patientIds.length === 0) return;

    setLoading(true);
    setProgress(0);
    setCompleted(0);
    setReports(new Map());
    setErrors(new Map());

    try {
      for (let i = 0; i < patientIds.length; i += batchSize) {
        const batch = patientIds.slice(i, i + batchSize);
        await loadBatch(batch);
        
        const progressPercent = Math.round(((i + batch.length) / patientIds.length) * 100);
        setProgress(progressPercent);
      }

      if (onAllComplete) {
        onAllComplete({
          reports: Array.from(reports.values()),
          errors: Array.from(errors.values()),
          total: patientIds.length,
          successful: reports.size,
          failed: errors.size
        });
      }

    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, [patientIds, batchSize, loadBatch, onAllComplete, reports, errors]);

  useEffect(() => {
    if (patientIds.length > 0) {
      loadAllReports();
    }
  }, [patientIds, loadAllReports]);

  return {
    reports: Array.from(reports.values()),
    reportsMap: reports,
    errors: Array.from(errors.values()),
    errorsMap: errors,
    loading,
    progress,
    completed,
    total: patientIds.length,
    successful: reports.size,
    failed: errors.size,
    isComplete: completed === patientIds.length,
    reload: loadAllReports
  };
}

export default usePatientReport;