import React, { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Optimized text filter component with debouncing and validation
 */
const FilterText = ({
  label,
  value = '',
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className = '',
  debounceMs = 300,
  minLength = 0,
  maxLength = null,
  pattern = null,
  patternMessage = 'Invalid format',
  clearable = true,
  multiline = false,
  rows = 3
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        // Validate before sending
        const validationError = validateValue(localValue);
        if (!validationError) {
          onChange?.(localValue);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Validate input value
  const validateValue = useCallback((val) => {
    if (!val) return null;
    
    if (minLength && val.length < minLength) {
      return `Minimum ${minLength} characters required`;
    }
    
    if (maxLength && val.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }
    
    if (pattern && !new RegExp(pattern).test(val)) {
      return patternMessage;
    }
    
    return null;
  }, [minLength, maxLength, pattern, patternMessage]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const validationError = validateValue(localValue);
    setError(validationError);
    
    // Send value even if there's an error (let parent decide)
    if (localValue !== value) {
      onChange?.(localValue);
    }
  }, [localValue, value, onChange, validateValue]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue('');
    setError(null);
    onChange?.('');
  }, [onChange]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
      e.target.blur();
    }
    
    if (e.key === 'Enter' && !multiline) {
      e.target.blur();
    }
  }, [handleClear, multiline]);

  const hasValue = localValue.length > 0;
  const characterCount = localValue.length;
  const isValid = !error;

  const inputClasses = `
    block w-full px-3 py-2 border rounded-lg
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${disabled 
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
      : error
        ? 'bg-white text-gray-900 border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
    }
    ${isFocused && !error ? 'ring-2 ring-blue-500 border-blue-500' : ''}
    ${clearable && hasValue ? 'pr-10' : ''}
  `;

  const InputComponent = multiline ? 'textarea' : 'input';
  const inputProps = {
    value: localValue,
    onChange: handleInputChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyPress,
    placeholder,
    disabled,
    className: inputClasses,
    'aria-label': label || placeholder,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${label}-error` : undefined,
    ...(multiline ? { rows } : { type: 'text' }),
    ...(maxLength ? { maxLength } : {})
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {minLength > 0 && (
            <span className="text-gray-500 font-normal ml-1">
              (min {minLength} chars)
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <InputComponent {...inputProps} />
        
        {/* Clear button */}
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-3 flex items-center
              text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600
              transition-colors duration-200
            "
            aria-label="Clear text"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs">
        {/* Error message */}
        {error && (
          <p id={`${label}-error`} className="text-red-600">
            {error}
          </p>
        )}
        
        {/* Character count */}
        {(maxLength || minLength > 0) && (
          <span className={`ml-auto ${
            error ? 'text-red-600' : 
            maxLength && characterCount > maxLength * 0.8 ? 'text-yellow-600' : 
            'text-gray-500'
          }`}>
            {characterCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>

      {/* Validation status for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {error && `Error: ${error}`}
        {isValid && hasValue && 'Input is valid'}
      </div>
    </div>
  );
};

export default React.memo(FilterText);

// Export validation utilities
export const textValidators = {
  email: {
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: '^[\\+]?[1-9]?[0-9]{7,15}$',
    message: 'Please enter a valid phone number'
  },
  alphanumeric: {
    pattern: '^[a-zA-Z0-9]+$',
    message: 'Only letters and numbers are allowed'
  },
  noSpecialChars: {
    pattern: '^[a-zA-Z0-9\\s]+$',
    message: 'Special characters are not allowed'
  }
};