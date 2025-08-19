/**
 * @file Checkbox.jsx
 * @description Accessible checkbox component with indeterminate state support
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { FaCheck, FaMinus } from 'react-icons/fa';

const Checkbox = forwardRef(({ 
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className = '',
  children,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}, ref) => {
  const inputRef = useRef(null);
  const finalRef = ref || inputRef;

  // Handle indeterminate state
  useEffect(() => {
    if (finalRef.current) {
      finalRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, finalRef]);

  const handleChange = (event) => {
    if (onChange && !disabled) {
      onChange(event);
    }
  };

  const baseClasses = `
    relative inline-flex items-center justify-center w-5 h-5 border-2 rounded transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `;

  const stateClasses = {
    unchecked: 'border-gray-300 bg-white hover:border-gray-400',
    checked: 'border-blue-600 bg-blue-600 hover:border-blue-700 hover:bg-blue-700',
    indeterminate: 'border-blue-600 bg-blue-600 hover:border-blue-700 hover:bg-blue-700'
  };

  const getStateClass = () => {
    if (indeterminate) return stateClasses.indeterminate;
    if (checked) return stateClasses.checked;
    return stateClasses.unchecked;
  };

  const renderIcon = () => {
    if (indeterminate) {
      return <FaMinus className="w-3 h-3 text-white" aria-hidden="true" />;
    }
    if (checked) {
      return <FaCheck className="w-3 h-3 text-white" aria-hidden="true" />;
    }
    return null;
  };

  return (
    <label 
      className={`inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      htmlFor={id}
    >
      <div className="relative">
        <input
          ref={finalRef}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          {...props}
        />
        <div className={`${baseClasses} ${getStateClass()}`}>
          {renderIcon()}
        </div>
      </div>
      {children && (
        <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {children}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;