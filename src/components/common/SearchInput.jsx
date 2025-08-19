import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Optimized search input component with debouncing and accessibility
 */
const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  disabled = false,
  autoFocus = false,
  clearable = true
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange?.(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleInputChange = useCallback((e) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange?.('');
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
      e.target.blur();
    }
  }, [handleClear]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className={`h-5 w-5 transition-colors ${
              isFocused ? 'text-blue-500' : 'text-gray-400'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            block w-full pl-10 pr-10 py-2 border rounded-lg
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
              : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
            }
            ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          aria-label={placeholder}
          role="searchbox"
          aria-describedby={localValue ? 'search-clear-button' : undefined}
        />

        {/* Clear button */}
        {clearable && localValue && !disabled && (
          <button
            id="search-clear-button"
            type="button"
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-3 flex items-center
              text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600
              transition-colors duration-200
            "
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {localValue && `Search term: ${localValue}`}
      </div>
    </div>
  );
};

export default React.memo(SearchInput);

// Export hook for external debouncing if needed
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