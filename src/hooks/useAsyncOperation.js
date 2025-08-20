import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for handling async operations with loading states
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage = 'An error occurred',
      showSuccessToast = true,
      showErrorToast = true
    } = options;

    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || errorMessage;
      setError(errorMsg);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset
  };
};