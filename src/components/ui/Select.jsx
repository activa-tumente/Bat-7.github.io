import React, { useState, useRef, useEffect } from 'react';

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  displayKey = 'label',
  valueKey = 'value',
  name,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(option => 
    option[valueKey] === value
  );
  
  const displayValue = selectedOption 
    ? selectedOption[displayKey] 
    : placeholder;

  const handleSelectOption = (option) => {
    onChange(option[valueKey], name);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const baseStyles = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
  const errorStyles = error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer';
  const styles = `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`;

  return (
    <div className="relative" ref={selectRef}>
      <div
        className={styles}
        onClick={toggleDropdown}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={!selectedOption ? 'text-gray-500' : ''}>
            {displayValue}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
          <ul className="py-1" role="listbox">
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  option[valueKey] === value ? 'bg-primary-50 text-primary-700' : ''
                }`}
                onClick={() => handleSelectOption(option)}
                role="option"
                aria-selected={option[valueKey] === value}
              >
                {option[displayKey]}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No hay opciones disponibles
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;