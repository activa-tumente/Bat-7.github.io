import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state synchronization
 * Provides type-safe localStorage operations with automatic serialization
 * 
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @param {Object} options - Configuration options
 * @returns {Array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    errorOnFailure = false
  } = options;

  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      if (errorOnFailure) {
        throw error;
      }
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        if (valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      if (errorOnFailure) {
        throw error;
      }
    }
  }, [key, serialize, storedValue, errorOnFailure]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(undefined);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
      if (errorOnFailure) {
        throw error;
      }
    }
  }, [key, errorOnFailure]);

  // Listen for changes in localStorage (for cross-tab synchronization)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== serialize(storedValue)) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : undefined;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
          if (errorOnFailure) {
            throw error;
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storedValue, serialize, deserialize, syncAcrossTabs, errorOnFailure]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing multiple localStorage values
 * Useful when you need to manage several localStorage keys together
 */
export const useMultipleLocalStorage = (keys, initialValues = {}, options = {}) => {
  const storageHooks = {};
  const values = {};
  const setters = {};
  const removers = {};

  keys.forEach(key => {
    const [value, setValue, removeValue] = useLocalStorage(
      key,
      initialValues[key],
      options
    );
    
    storageHooks[key] = { value, setValue, removeValue };
    values[key] = value;
    setters[key] = setValue;
    removers[key] = removeValue;
  });

  const setMultipleValues = useCallback((newValues) => {
    Object.entries(newValues).forEach(([key, value]) => {
      if (setters[key]) {
        setters[key](value);
      }
    });
  }, [setters]);

  const removeMultipleValues = useCallback((keysToRemove) => {
    keysToRemove.forEach(key => {
      if (removers[key]) {
        removers[key]();
      }
    });
  }, [removers]);

  const clearAll = useCallback(() => {
    Object.values(removers).forEach(removeValue => removeValue());
  }, [removers]);

  return {
    values,
    setters,
    removers,
    setMultipleValues,
    removeMultipleValues,
    clearAll,
    hooks: storageHooks
  };
};

/**
 * Hook for managing localStorage with expiration
 * Automatically removes expired values
 */
export const useLocalStorageWithExpiry = (key, initialValue, expiryMs, options = {}) => {
  const serialize = (value) => {
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + expiryMs
    };
    return JSON.stringify(item);
  };

  const deserialize = (value) => {
    const item = JSON.parse(value);
    const now = new Date();
    
    if (now.getTime() > item.expiry) {
      // Value has expired
      return null;
    }
    
    return item.value;
  };

  const [storedValue, setValue, removeValue] = useLocalStorage(
    key,
    initialValue,
    {
      ...options,
      serialize,
      deserialize
    }
  );

  // Check for expiry on mount and periodically
  useEffect(() => {
    const checkExpiry = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          const now = new Date();
          
          if (now.getTime() > parsed.expiry) {
            removeValue();
          }
        }
      } catch (error) {
        console.warn(`Error checking expiry for localStorage key "${key}":`, error);
      }
    };

    // Check immediately
    checkExpiry();
    
    // Check periodically (every minute)
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [key, removeValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing localStorage state with validation
 * Validates values before storing and provides error handling
 */
export const useValidatedLocalStorage = (key, initialValue, validator, options = {}) => {
  const [validationError, setValidationError] = useState(null);
  
  const validateAndSet = useCallback((value) => {
    try {
      if (validator && !validator(value)) {
        const error = new Error(`Invalid value for localStorage key "${key}"`);
        setValidationError(error);
        if (options.errorOnFailure) {
          throw error;
        }
        return false;
      }
      
      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(error);
      if (options.errorOnFailure) {
        throw error;
      }
      return false;
    }
  }, [key, validator, options.errorOnFailure]);

  const [storedValue, setStoredValue, removeValue] = useLocalStorage(
    key,
    initialValue,
    options
  );

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    
    if (validateAndSet(valueToStore)) {
      setStoredValue(valueToStore);
    }
  }, [storedValue, validateAndSet, setStoredValue]);

  return [storedValue, setValue, removeValue, validationError];
};

export default useLocalStorage;