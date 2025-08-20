import React, { useState, useCallback, useEffect } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Optimized date range filter component with accessibility and validation
 */
const FilterDateRange = ({
  label,
  value = [null, null],
  onChange,
  minDate = null,
  maxDate = null,
  disabled = false,
  className = '',
  showTime = false,
  placeholder = ['Start date', 'End date']
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [inputValues, setInputValues] = useState(['', '']);
  const [errors, setErrors] = useState([null, null]);

  // Format date for input
  const formatDateForInput = useCallback((date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (showTime) {
      return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    }
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }, [showTime]);

  // Parse date from input
  const parseDateFromInput = useCallback((dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
    setInputValues([
      formatDateForInput(value[0]),
      formatDateForInput(value[1])
    ]);
  }, [value, formatDateForInput]);

  // Validate date
  const validateDate = useCallback((date, index) => {
    if (!date) return null;
    
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    if (minDate && d < new Date(minDate)) {
      return `Date must be after ${formatDateForInput(minDate)}`;
    }
    
    if (maxDate && d > new Date(maxDate)) {
      return `Date must be before ${formatDateForInput(maxDate)}`;
    }
    
    // Check range consistency
    const otherDate = localValue[1 - index];
    if (otherDate) {
      const other = new Date(otherDate);
      if (index === 0 && d > other) {
        return 'Start date must be before end date';
      }
      if (index === 1 && d < other) {
        return 'End date must be after start date';
      }
    }
    
    return null;
  }, [minDate, maxDate, localValue, formatDateForInput]);

  // Handle date input changes
  const handleInputChange = useCallback((index, inputValue) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = inputValue;
    setInputValues(newInputValues);
    
    // Clear error when user starts typing
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = null;
      setErrors(newErrors);
    }
  }, [inputValues, errors]);

  // Handle date input blur (commit changes)
  const handleInputBlur = useCallback((index) => {
    const inputValue = inputValues[index];
    const parsedDate = parseDateFromInput(inputValue);
    
    // Validate the date
    const error = validateDate(parsedDate, index);
    const newErrors = [...errors];
    newErrors[index] = error;
    setErrors(newErrors);
    
    if (!error) {
      const newRange = [...localValue];
      newRange[index] = parsedDate;
      
      // Auto-adjust other date if needed
      if (parsedDate && localValue[1 - index]) {
        const otherDate = new Date(localValue[1 - index]);
        if (index === 0 && parsedDate > otherDate) {
          newRange[1] = parsedDate;
        } else if (index === 1 && parsedDate < otherDate) {
          newRange[0] = parsedDate;
        }
      }
      
      setLocalValue(newRange);
      onChange?.(newRange);
      
      // Update input values to reflect any auto-adjustments
      setInputValues([
        formatDateForInput(newRange[0]),
        formatDateForInput(newRange[1])
      ]);
    }
  }, [inputValues, parseDateFromInput, validateDate, errors, localValue, onChange, formatDateForInput]);

  // Handle input key press
  const handleInputKeyPress = useCallback((e, index) => {
    if (e.key === 'Enter') {
      handleInputBlur(index);
      e.target.blur();
    }
  }, [handleInputBlur]);

  // Clear date range
  const handleClear = useCallback(() => {
    const clearedRange = [null, null];
    setLocalValue(clearedRange);
    setInputValues(['', '']);
    setErrors([null, null]);
    onChange?.(clearedRange);
  }, [onChange]);

  // Quick date selections
  const handleQuickSelect = useCallback((days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const newRange = [startDate, endDate];
    setLocalValue(newRange);
    setInputValues([
      formatDateForInput(startDate),
      formatDateForInput(endDate)
    ]);
    setErrors([null, null]);
    onChange?.(newRange);
  }, [onChange, formatDateForInput]);

  const hasValue = localValue[0] !== null || localValue[1] !== null;
  const hasErrors = errors.some(error => error !== null);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and clear button */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date inputs */}
      <div className="space-y-2">
        {/* Start date */}
        <div className="relative">
          <input
            type={showTime ? 'datetime-local' : 'date'}
            value={inputValues[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={() => handleInputBlur(0)}
            onKeyPress={(e) => handleInputKeyPress(e, 0)}
            placeholder={placeholder[0]}
            min={minDate ? formatDateForInput(minDate) : undefined}
            max={maxDate ? formatDateForInput(maxDate) : undefined}
            disabled={disabled}
            className={`
              w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500
              ${disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200' 
                : errors[0]
                  ? 'border-red-300 focus:ring-red-500'
                  : 'bg-white text-gray-900 border-gray-300'
              }
            `}
            aria-label={`${label} start date`}
            aria-invalid={!!errors[0]}
            aria-describedby={errors[0] ? `${label}-start-error` : undefined}
          />
          
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          
          {errors[0] && (
            <p id={`${label}-start-error`} className="mt-1 text-xs text-red-600">
              {errors[0]}
            </p>
          )}
        </div>

        {/* End date */}
        <div className="relative">
          <input
            type={showTime ? 'datetime-local' : 'date'}
            value={inputValues[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={() => handleInputBlur(1)}
            onKeyPress={(e) => handleInputKeyPress(e, 1)}
            placeholder={placeholder[1]}
            min={minDate ? formatDateForInput(minDate) : undefined}
            max={maxDate ? formatDateForInput(maxDate) : undefined}
            disabled={disabled}
            className={`
              w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500
              ${disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200' 
                : errors[1]
                  ? 'border-red-300 focus:ring-red-500'
                  : 'bg-white text-gray-900 border-gray-300'
              }
            `}
            aria-label={`${label} end date`}
            aria-invalid={!!errors[1]}
            aria-describedby={errors[1] ? `${label}-end-error` : undefined}
          />
          
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          
          {errors[1] && (
            <p id={`${label}-end-error`} className="mt-1 text-xs text-red-600">
              {errors[1]}
            </p>
          )}
        </div>
      </div>

      {/* Quick select buttons */}
      {!disabled && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleQuickSelect(7)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect(30)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect(90)}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Last 90 days
          </button>
        </div>
      )}

      {/* Value display */}
      {hasValue && !hasErrors && (
        <div className="text-xs text-gray-600">
          {localValue[0] && localValue[1] ? (
            <span>
              {new Date(localValue[0]).toLocaleDateString()} - {new Date(localValue[1]).toLocaleDateString()}
            </span>
          ) : localValue[0] ? (
            <span>From {new Date(localValue[0]).toLocaleDateString()}</span>
          ) : localValue[1] ? (
            <span>Until {new Date(localValue[1]).toLocaleDateString()}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default React.memo(FilterDateRange);