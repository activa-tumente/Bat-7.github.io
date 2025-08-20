import { useCallback, useState, useEffect } from 'react';
import pinControlService from '../services/pin/ImprovedPinControlService';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para el control de pines
 * Proporciona funciones para verificar y consumir pines
 */
export const usePinControl = () => {
  /**
   * Verifica si un psicólogo puede usar el sistema
   */
  const checkPsychologistUsage = useCallback(async (psychologistId) => {
    try {
      const result = await pinControlService.checkPsychologistUsage(psychologistId);
      return result;
    } catch (error) {
      console.error('Error al verificar uso del psicólogo:', error);
      return {
        canUse: false,
        reason: 'Error al verificar permisos',
        remainingPins: 0,
        isUnlimited: false
      };
    }
  }, []);

  /**
   * Consume un pin automáticamente
   */
  const consumePin = useCallback(async (psychologistId, patientId = null, testSessionId = null, reportId = null) => {
    try {
      const success = await pinControlService.consumePin(psychologistId, patientId, testSessionId, reportId);
      
      if (success) {
        console.log('✅ Pin consumido correctamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al consumir pin:', error);
      toast.error('Error al consumir pin: ' + error.message);
      return false;
    }
  }, []);

  /**
   * Consume un pin cuando se completa un test
   */
  const consumePinOnTestCompletion = useCallback(async (psychologistId, patientId, testSessionId) => {
    try {
      // Verificar primero si puede usar el sistema
      const usage = await checkPsychologistUsage(psychologistId);
      
      if (!usage.canUse) {
        toast.error(`No se puede completar el test: ${usage.reason}`);
        return false;
      }

      // Consumir el pin
      const success = await consumePin(psychologistId, patientId, testSessionId);
      
      if (success && !usage.isUnlimited) {
        const remainingPins = usage.remainingPins - 1;
        
        if (remainingPins <= 5 && remainingPins > 0) {
          toast.warning(`Quedan solo ${remainingPins} pines disponibles`);
        } else if (remainingPins === 0) {
          toast.error('Se han agotado los pines disponibles');
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error al consumir pin en test:', error);
      toast.error('Error al procesar el test');
      return false;
    }
  }, [checkPsychologistUsage, consumePin]);

  /**
   * Consume un pin cuando se genera un informe
   */
  const consumePinOnReportGeneration = useCallback(async (psychologistId, patientId, reportId) => {
    try {
      // Verificar primero si puede usar el sistema
      const usage = await checkPsychologistUsage(psychologistId);
      
      if (!usage.canUse) {
        toast.error(`No se puede generar el informe: ${usage.reason}`);
        return false;
      }

      // Consumir el pin
      const success = await consumePin(psychologistId, patientId, null, reportId);
      
      if (success && !usage.isUnlimited) {
        const remainingPins = usage.remainingPins - 1;
        
        if (remainingPins <= 5 && remainingPins > 0) {
          toast.warning(`Quedan solo ${remainingPins} pines disponibles`);
        } else if (remainingPins === 0) {
          toast.error('Se han agotado los pines disponibles');
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error al consumir pin en informe:', error);
      toast.error('Error al procesar el informe');
      return false;
    }
  }, [checkPsychologistUsage, consumePin]);

  /**
   * Verifica si un psicólogo puede realizar una acción antes de ejecutarla
   */
  const withPinCheck = useCallback((psychologistId, action) => {
    return async (...args) => {
      const usage = await checkPsychologistUsage(psychologistId);
      
      if (!usage.canUse) {
        toast.error(`Acción no permitida: ${usage.reason}`);
        return false;
      }
      
      return await action(...args);
    };
  }, [checkPsychologistUsage]);

  return {
    checkPsychologistUsage,
    consumePin,
    consumePinOnTestCompletion,
    consumePinOnReportGeneration,
    withPinCheck
  };
};

/**
 * Hook for managing pin status state (used by HOC)
 * @param {string} psychologistId - ID del psicólogo
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones del control de pines
 */
export const usePinControlStatus = (psychologistId, options = {}) => {
  const [pinStatus, setPinStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkPinStatus = useCallback(async () => {
    if (!psychologistId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const status = await pinControlService.checkPsychologistUsage(psychologistId);
      setPinStatus(status);
      
      if (!status.canUse && options.showToastOnError) {
        toast.error(`No se puede usar el sistema: ${status.reason}`);
      }
    } catch (err) {
      console.error('Error verificando estado de pines:', err);
      setError('Error al verificar permisos del sistema');
      
      if (options.showToastOnError) {
        toast.error('Error al verificar permisos del sistema');
      }
    } finally {
      setLoading(false);
    }
  }, [psychologistId, options.showToastOnError]);

  useEffect(() => {
    checkPinStatus();
  }, [checkPinStatus]);

  return {
    pinStatus,
    loading,
    error,
    canUse: pinStatus?.canUse || false,
    remainingPins: pinStatus?.remainingPins,
    isUnlimited: pinStatus?.isUnlimited || false,
    refreshStatus: checkPinStatus
  };
};

export default usePinControl;