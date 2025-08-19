import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import supabase from '../api/supabaseClient';
import { TEST_COLORS, PERFORMANCE_THRESHOLDS } from '../constants/testConstants';

/**
 * Custom hook for managing patient results with memoization
 */
export const usePatientResults = (selectedPatient) => {
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Memoized results fetching
  const fetchPatientResults = useCallback(async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoadingResults(true);
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          aptitudes:aptitud_id (
            codigo,
            nombre,
            descripcion
          )
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error al cargar resultados:', error.message);
      toast.error('Error al cargar los resultados del paciente');
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Memoized statistics calculation
  const patientStatistics = useMemo(() => {
    if (!results.length) return null;

    const totalTests = results.length;
    const totalPercentile = results.reduce((sum, r) => sum + (r.percentil || 0), 0);
    const totalDirectScore = results.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0);
    const totalErrors = results.reduce((sum, r) => sum + (r.errores || 0), 0);
    const totalTime = results.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0);

    return {
      totalTests,
      averagePercentile: Math.round(totalPercentile / totalTests),
      averageDirectScore: Math.round(totalDirectScore / totalTests),
      totalErrors,
      averageErrors: totalErrors / totalTests,
      totalTimeSeconds: totalTime,
      averageTimeSeconds: totalTime / totalTests,
      lastTestDate: results[0]?.created_at
    };
  }, [results]);

  // Memoized results by aptitude
  const resultsByAptitude = useMemo(() => {
    const grouped = {};
    
    results.forEach(result => {
      const aptitudCodigo = result.aptitudes?.codigo;
      if (aptitudCodigo) {
        if (!grouped[aptitudCodigo]) {
          grouped[aptitudCodigo] = {
            aptitud: result.aptitudes,
            resultados: [],
            color: TEST_COLORS[aptitudCodigo] || '#6B7280'
          };
        }
        grouped[aptitudCodigo].resultados.push(result);
      }
    });

    return grouped;
  }, [results]);

  // Memoized performance analysis
  const performanceAnalysis = useMemo(() => {
    if (!patientStatistics) return null;

    const { averagePercentile } = patientStatistics;
    
    let level = 'needs_improvement';
    let message = 'Necesita mejorar';
    let color = 'text-red-600';

    if (averagePercentile >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
      level = 'excellent';
      message = 'Excelente desempeño';
      color = 'text-green-600';
    } else if (averagePercentile >= PERFORMANCE_THRESHOLDS.GOOD) {
      level = 'good';
      message = 'Buen desempeño';
      color = 'text-blue-600';
    }

    return { level, message, color };
  }, [patientStatistics]);

  // Helper function to get result by aptitude code
  const getResultByCode = useCallback((code) => {
    return results.find(result => result.aptitudes?.codigo === code);
  }, [results]);

  // Helper function to calculate concentration
  const calculateConcentration = useCallback((atencionResult, errores) => {
    if (!atencionResult || atencionResult === 0) return 0;
    return ((atencionResult / (atencionResult + errores)) * 100).toFixed(2);
  }, []);

  // Effect to fetch results when patient changes
  useEffect(() => {
    if (selectedPatient?.id) {
      fetchPatientResults(selectedPatient.id);
    } else {
      setResults([]);
    }
  }, [selectedPatient?.id, fetchPatientResults]);

  return {
    // State
    results,
    loadingResults,
    
    // Computed values
    patientStatistics,
    resultsByAptitude,
    performanceAnalysis,
    
    // Helper functions
    getResultByCode,
    calculateConcentration,
    fetchPatientResults
  };
};