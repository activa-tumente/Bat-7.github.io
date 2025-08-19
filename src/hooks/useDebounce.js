import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing callbacks
 * Returns a debounced version of the callback function
 * 
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array for the callback
 * @returns {Function} The debounced callback
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

/**
 * Custom hook for debouncing with immediate execution option
 * Can execute immediately on first call, then debounce subsequent calls
 * 
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @param {Array} deps - Dependencies array for the callback
 * @returns {Function} The debounced callback
 */
export const useDebouncedCallbackWithImmediate = (callback, delay, immediate = false, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const immediateRef = useRef(immediate);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    const callNow = immediate && !timeoutRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (!immediate) {
        callbackRef.current(...args);
      }
    }, delay);

    if (callNow) {
      callbackRef.current(...args);
    }
  }, [delay, immediate]);
};

/**
 * Custom hook for debouncing state updates
 * Provides both immediate and debounced state values
 * 
 * @param {*} initialValue - Initial state value
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} Object containing immediate value, debounced value, and setter
 */
export const useDebouncedState = (initialValue, delay) => {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [immediateValue, delay]);

  const setValue = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(immediateValue) : value;
    setImmediateValue(newValue);
  }, [immediateValue]);

  const setDebouncedValueDirectly = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(debouncedValue) : value;
    setImmediateValue(newValue);
    setDebouncedValue(newValue);
  }, [debouncedValue]);

  return {
    immediateValue,
    debouncedValue,
    setValue,
    setDebouncedValue: setDebouncedValueDirectly,
    isPending: immediateValue !== debouncedValue
  };
};

/**
 * Custom hook for debouncing search functionality
 * Specifically designed for search inputs with loading states
 * 
 * @param {string} searchTerm - The search term to debounce
 * @param {Function} searchFunction - Function to execute when search term changes
 * @param {number} delay - Delay in milliseconds
 * @param {number} minLength - Minimum length before triggering search
 * @returns {Object} Search state and utilities
 */
export const useDebouncedSearch = (searchTerm, searchFunction, delay = 300, minLength = 1) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const searchFunctionRef = useRef(searchFunction);

  // Update search function ref
  useEffect(() => {
    searchFunctionRef.current = searchFunction;
  }, [searchFunction]);

  // Perform search when debounced term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < minLength) {
        setSearchResults([]);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchFunctionRef.current(debouncedSearchTerm);
        setSearchResults(results || []);
      } catch (error) {
        setSearchError(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, minLength]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
  }, []);

  return {
    debouncedSearchTerm,
    isSearching,
    searchResults,
    searchError,
    clearSearch,
    hasResults: searchResults.length > 0,
    shouldShowResults: debouncedSearchTerm.length >= minLength
  };
};

/**
 * Custom hook for debouncing API calls
 * Prevents multiple API calls when parameters change rapidly
 * 
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies that trigger the API call
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Additional options
 * @returns {Object} API call state and utilities
 */
export const useDebouncedApiCall = (apiCall, dependencies, delay = 300, options = {}) => {
  const {
    immediate = false,
    enabled = true,
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callCount, setCallCount] = useState(0);
  
  const apiCallRef = useRef(apiCall);
  const abortControllerRef = useRef(null);

  // Update API call ref
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  // Debounced effect for API calls
  useEffect(() => {
    if (!enabled) return;

    const makeApiCall = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      setCallCount(prev => prev + 1);

      try {
        const result = await apiCallRef.current({
          signal: abortControllerRef.current.signal,
          dependencies
        });
        
        if (!abortControllerRef.current.signal.aborted) {
          setData(result);
          if (onSuccess) onSuccess(result);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err);
          if (onError) onError(err);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (immediate) {
      makeApiCall();
    } else {
      const timer = setTimeout(makeApiCall, delay);
      return () => clearTimeout(timer);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...dependencies, enabled, immediate, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    setCallCount(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setCallCount(0);
  }, []);

  return {
    data,
    loading,
    error,
    callCount,
    refetch,
    reset,
    hasData: data !== null,
    hasError: error !== null
  };
};

export default useDebounce;