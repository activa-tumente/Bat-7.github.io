import { useState, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para validación previa a evaluaciones
 * Verifica disponibilidad de pines y permite consumirlos
 */
export const usePinValidation = () => {
  const { user } = useAuth();
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  /**
   * Validar si se puede iniciar una evaluación
   */
  const validateEvaluationStart = useCallback(async () => {
    if (!user?.id) {
      setValidationError('Usuario no autenticado');
      return { canStart: false, reason: 'missing_user' };
    }

    setValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      // Obtener estadísticas del psicólogo
      const { data: pinStats, error: statsError } = await supabase
        .rpc('get_psychologist_pin_stats_optimized', {
          p_psychologist_id: user.id
        });

      if (statsError) throw statsError;

      if (!pinStats) {
        const result = { canStart: false, reason: 'no_pin_control', message: 'No se encontró control de pines' };
        setValidationResult(result);
        return result;
      }

      // Verificar si es usuario ilimitado
      if (pinStats.is_unlimited) {
        const result = { 
          canStart: true, 
          reason: 'unlimited_user',
          message: 'Usuario ilimitado - puede iniciar evaluaciones sin restricciones',
          pinInfo: pinStats
        };
        setValidationResult(result);
        return result;
      }

      // Verificar disponibilidad de pines
      const remainingPins = pinStats.total_pins - pinStats.used_pins;
      if (remainingPins <= 0) {
        const result = { 
          canStart: false, 
          reason: 'no_pins_available',
          message: 'No hay pines disponibles',
          currentPins: pinStats.used_pins,
          totalPins: pinStats.total_pins,
          pinInfo: pinStats
        };
        setValidationResult(result);
        return result;
      }

      // Validación exitosa
      const result = { 
        canStart: true, 
        reason: 'pins_available',
        message: `Puede iniciar evaluación. Pines disponibles: ${remainingPins}`,
        remainingPins,
        pinInfo: pinStats
      };
      setValidationResult(result);
      return result;

    } catch (err) {
      console.error('Error en validación de pines:', err);
      const result = { 
        canStart: false, 
        reason: 'validation_error',
        message: `Error al validar: ${err.message}`
      };
      setValidationError(err.message);
      setValidationResult(result);
      return result;
    } finally {
      setValidating(false);
    }
  }, [user]);

  /**
   * Validar si hay suficientes pines para múltiples evaluaciones
   */
  const validateBatchEvaluation = useCallback(async (patientIds, testType = null) => {
    if (!psychologistId) {
      return { canStart: false, reason: 'missing_psychologist_id' };
    }

    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      return { canStart: false, reason: 'no_patients' };
    }

    setValidating(true);
    setValidationError(null);

    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_psychologist_pin_stats_optimized');

      if (statsError) throw statsError;

      const psychologistStats = stats?.find(
        item => item.psychologist_id === psychologistId
      );

      if (!psychologistStats) {
        return { canStart: false, reason: 'no_pin_control' };
      }

      // Usuario ilimitado
      if (psychologistStats.is_unlimited) {
        return { 
          canStart: true, 
          reason: 'unlimited_user',
          patientsCount: patientIds.length,
          stats: psychologistStats
        };
      }

      // Verificar pines disponibles
      const remainingPins = psychologistStats.total_uses - psychologistStats.used_uses;
      const requiredPins = patientIds.length;

      if (remainingPins < requiredPins) {
        return { 
          canStart: false, 
          reason: 'insufficient_pins',
          requiredPins,
          availablePins: remainingPins,
          stats: psychologistStats
        };
      }

      return { 
        canStart: true, 
        reason: 'sufficient_pins',
        requiredPins,
        availablePins: remainingPins,
        stats: psychologistStats
      };

    } catch (err) {
      console.error('Error en validación de lote:', err);
      setValidationError(err.message);
      return { 
        canStart: false, 
        reason: 'validation_error',
        message: err.message
      };
    } finally {
      setValidating(false);
    }
  }, [psychologistId]);

  /**
   * Obtener estado de validación actual
   */
  const getValidationStatus = useCallback(() => {
    return {
      validating,
      validationError,
      validationResult,
      isValid: validationResult?.canStart || false
    };
  }, [validating, validationError, validationResult]);

  /**
   * Limpiar estado de validación
   */
  const clearValidation = useCallback(() => {
    setValidating(false);
    setValidationError(null);
    setValidationResult(null);
  }, []);

  return {
    // Estado
    validating,
    validationError,
    validationResult,

    // Funciones
    validateEvaluationStart,
    validateBatchEvaluation,
    getValidationStatus,
    clearValidation
  };
};