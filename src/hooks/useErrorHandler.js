/**
 * Custom hook for centralized error handling
 * Provides consistent error management across the application
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ERROR_MESSAGES } from '../constants/resultados';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, context = '', showToast = true) => {
    console.error(`Error in ${context}:`, error);
    
    // Determine error type and message
    let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
    let canRetry = true;
    
    if (error.code === 'PGRST116') {
      errorMessage = ERROR_MESSAGES.PERMISSION_ERROR;
      canRetry = false;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message?.includes('load') || error.message?.includes('data')) {
      errorMessage = ERROR_MESSAGES.LOAD_DATA;
    }
    
    const errorObj = {
      message: errorMessage,
      details: error.message || 'Error desconocido',
      canRetry,
      timestamp: new Date().toISOString(),
      context
    };
    
    setError(errorObj);
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement external logging service
      // logToService(errorObj);
    }
    
    return errorObj;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = useCallback(async (asyncFunction, context = '') => {
    clearError();
    try {
      return await asyncFunction();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryWithErrorHandling
  };
};

export default useErrorHandler;