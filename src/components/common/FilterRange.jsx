import React, { useState, useCallback, useEffect } from 'react';

/**
 * Optimized range filter component with dual sliders and input validation
 */
const FilterRange = ({
  label,
  value = [null, null],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
  showInputs = true,
  formatValue = (val) => val?.toString() || '',
  parseValue = (str) => {
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [inputValues, setInputValues] = useState([
    value[0]?.toString() || '',
    value[1]?.toString() || ''
  ]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
    setInputValues([
      value[0]?.toString() || '',
      value[1]?.toString() || ''
    ]);
  }, [value]);

  // Validate and constrain values
  const constrainValue = useCallback((val) => {
    if (val === null || val === undefined) return null;
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  // Handle slider changes
  const handleSliderChange = useCallback((index, newValue) => {
    const numValue = parseFloat(newValue);
    const constrainedValue = constrainValue(numValue);
    
    const newRange = [...localValue];
    newRange[index] = constrainedValue;
    
    // Ensure min <= max
    if (index === 0 && newRange[1] !== null && constrainedValue > newRange[1]) {
      newRange[1] = constrainedValue;
    } else if (index === 1 && newRange[0] !== null && constrainedValue < newRange[0]) {
      newRange[0] = constrainedValue;
    }
    
    setLocalValue(newRange);
    onChange?.(newRange);
  }, [localValue, onChange, constrainValue]);

  // Handle input changes
  const handleInputChange = useCallback((index, inputValue) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = inputValue;
    setInputValues(newInputValues);
  }, [inputValues]);

  // Handle input blur (commit changes)
  const handleInputBlur = useCallback((index) => {
    const inputValue = inputValues[index];
    const parsedValue = inputValue === '' ? null : parseValue(inputValue);
    const constrainedValue = constrainValue(parsedValue);
    
    const newRange = [...localValue];
    newRange[index] = constrainedValue;
    
    // Ensure min <= max
    if (index === 0 && newRange[1] !== null && constrainedValue > newRange[1]) {
      newRange[1] = constrainedValue;
    } else if (index === 1 && newRange[0] !== null && constrainedValue < newRange[0]) {
      newRange[0] = constrainedValue;
    }
    
    setLocalValue(newRange);
    setInputValues([
      newRange[0]?.toString() || '',
      newRange[1]?.toString() || ''
    ]);
    onChange?.(newRange);
  }, [inputValues, localValue, onChange, parseValue, constrainValue]);

  // Handle input key press
  const handleInputKeyPress = useCallback((e, index) => {
    if (e.key === 'Enter') {
      handleInputBlur(index);
      e.target.blur();
    }
  }, [handleInputBlur]);

  // Clear range
  const handleClear = useCallback(() => {
    const clearedRange = [null, null];
    setLocalValue(clearedRange);
    setInputValues(['', '']);
    onChange?.(clearedRange);
  }, [onChange]);

  // Calculate slider positions for visual representation
  const getSliderPosition = useCallback((val) => {
    if (val === null || val === undefined) return 0;
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const minPos = getSliderPosition(localValue[0] || min);
  const maxPos = getSliderPosition(localValue[1] || max);
  
  const hasValue = localValue[0] !== null || localValue[1] !== null;

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

      {/* Input fields */}
      {showInputs && (
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="number"
              value={inputValues[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              onBlur={() => handleInputBlur(0)}
              onKeyPress={(e) => handleInputKeyPress(e, 0)}
              placeholder="Min"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`
                w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500
                ${disabled 
                  ? 'bg-gray-50 text-gray-500 border-gray-200' 
                  : 'bg-white text-gray-900 border-gray-300'
                }
              `}
              aria-label={`${label} minimum value`}
            />
          </div>
          
          <span className="text-gray-500 text-sm">to</span>
          
          <div className="flex-1">
            <input
              type="number"
              value={inputValues[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              onBlur={() => handleInputBlur(1)}
              onKeyPress={(e) => handleInputKeyPress(e, 1)}
              placeholder="Max"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`
                w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500
                ${disabled 
                  ? 'bg-gray-50 text-gray-500 border-gray-200' 
                  : 'bg-white text-gray-900 border-gray-300'
                }
              `}
              aria-label={`${label} maximum value`}
            />
          </div>
        </div>
      )}

      {/* Dual range slider */}
      <div className="relative">
        {/* Track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Active range */}
          <div 
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{
              left: `${minPos}%`,
              width: `${maxPos - minPos}%`
            }}
          />
        </div>

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0] || min}
          onChange={(e) => handleSliderChange(0, e.target.value)}
          disabled={disabled}
          className={`
            absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer
            slider-thumb
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{ zIndex: localValue[0] >= (localValue[1] || max) ? 2 : 1 }}
          aria-label={`${label} minimum slider`}
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1] || max}
          onChange={(e) => handleSliderChange(1, e.target.value)}
          disabled={disabled}
          className={`
            absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer
            slider-thumb
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{ zIndex: localValue[1] <= (localValue[0] || min) ? 2 : 1 }}
          aria-label={`${label} maximum slider`}
        />
      </div>

      {/* Value display */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        {hasValue && (
          <span className="font-medium text-gray-700">
            {formatValue(localValue[0])} - {formatValue(localValue[1])}
          </span>
        )}
        <span>{formatValue(max)}</span>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          background: #1d4ed8;
          transform: scale(1.2);
        }
        
        .slider-thumb:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default React.memo(FilterRange);