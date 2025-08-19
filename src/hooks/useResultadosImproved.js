/**
 * Improved custom hook for managing resultados logic
 * Uses Repository pattern, better error handling, and performance optimizations
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import resultadosRepository from '../services/resultadosRepository';
import useErrorHandler from './useErrorHandler';
import { RETRY_DELAY, SUCCESS_MESSAGES } from '../constants/resultados';

export const useResultadosImproved = (searchTerm = '', selectedTest = 'todos') => {
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  
  const { error, handleError, clearError, retryWithErrorHandling } = useErrorHandler();
  const retryTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Memoized Map of pacientes for O(1) lookups
  const pacientesMap = useMemo(() => {
    return new Map(pacientes.map(p => [p.id, p]));
  }, [pacientes]);

  // Memoized filtering logic with performance optimizations
  const filteredResultados = useMemo(() => {
    if (!resultados.length) return [];
    
    let filtered = resultados;

    // Apply search filter
    if (searchTerm && searchTerm.length >= 2) { // Minimum search length
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(resultado => {
        const paciente = pacientesMap.get(resultado.paciente_id);
        if (!paciente) return false;
        
        const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`.toLowerCase();
        const documento = paciente.documento?.toLowerCase() || '';
        
        return nombreCompleto.includes(searchLower) || documento.includes(searchLower);
      });
    }

    // Apply test type filter
    if (selectedTest !== 'todos') {
      filtered = filtered.filter(resultado => resultado.tipo_test === selectedTest);
    }

    return filtered;
  }, [resultados, searchTerm, selectedTest, pacientesMap]);

  // Memoized statistics with better performance
  const estadisticas = useMemo(() => {
    const totalResultados = filteredResultados.length;
    const pacientesUnicos = new Set(filteredResultados.map(r => r.paciente_id)).size;
    
    // Calculate available tests based on current filter
    const testsDisponibles = selectedTest === 'todos' 
      ? new Set(resultados.map(r => r.tipo_test)).size 
      : 1;
    
    // Calculate average with null safety
    const validScores = filteredResultados
      .map(r => r.puntaje_directo)
      .filter(score => score != null && !isNaN(score));
    
    const promedioPD = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;
      
    return { 
      totalResultados, 
      pacientesUnicos, 
      testsDisponibles, 
      promedioPD,
      hasValidData: totalResultados > 0
    };
  }, [filteredResultados, selectedTest, resultados]);

  // Helper functions with better error handling
  const obtenerNombrePaciente = useCallback((pacienteId) => {
    const paciente = pacientesMap.get(pacienteId);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
  }, [pacientesMap]);

  const obtenerDocumentoPaciente = useCallback((pacienteId) => {
    const paciente = pacientesMap.get(pacienteId);
    return paciente?.documento || 'N/A';
  }, [pacientesMap]);

  // Enhanced data loading with retry logic
  const cargarDatos = useCallback(async (useCache = true, isRetry = false) => {
    setLoading(true);
    clearError();
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    try {
      const { resultados: resultadosData, pacientes: pacientesData } = 
        await retryWithErrorHandling(
          () => resultadosRepository.getAllData(useCache),
          'cargarDatos'
        );

      setResultados(resultadosData);
      setPacientes(pacientesData);
      
      if (!isRetry) {
        toast.success(SUCCESS_MESSAGES.DATA_LOADED);
      }
      
    } catch (error) {
      // Auto-retry logic for network errors
      if (!isRetry && error.message?.includes('network')) {
        retryTimeoutRef.current = setTimeout(() => {
          cargarDatos(false, true); // Retry without cache
        }, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [clearError, retryWithErrorHandling]);

  // Real-time subscription management
  const enableRealTime = useCallback(() => {
    if (isRealTimeEnabled) return;
    
    unsubscribeRef.current = resultadosRepository.subscribeToChanges((payload) => {
      console.log('Real-time update received:', payload);
      // Refresh data when changes occur
      cargarDatos(false); // Don't use cache for real-time updates
    });
    
    setIsRealTimeEnabled(true);
  }, [isRealTimeEnabled, cargarDatos]);

  const disableRealTime = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsRealTimeEnabled(false);
  }, []);

  // Force refresh (bypass cache)
  const refrescarDatos = useCallback(() => {
    resultadosRepository.clearCache();
    cargarDatos(false);
  }, [cargarDatos]);

  // Load data on mount
  useEffect(() => {
    cargarDatos();
    
    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [cargarDatos]);

  return {
    // States
    loading,
    error,
    isRealTimeEnabled,
    
    // Data
    resultados,
    pacientes,
    filteredResultados,
    estadisticas,
    pacientesMap,
    
    // Functions
    cargarDatos,
    refrescarDatos,
    obtenerNombrePaciente,
    obtenerDocumentoPaciente,
    enableRealTime,
    disableRealTime,
    clearError
  };
};

export default useResultadosImproved;