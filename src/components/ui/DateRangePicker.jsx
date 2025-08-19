import React, { useState, useRef, useEffect } from 'react';

export const DateRangePicker = ({
  value = { from: null, to: null },
  onChange,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString();
  };
  
  const displayValue = `${formatDate(value.from)} - ${formatDate(value.to)}`;

  const handleDateChange = (field, event) => {
    const newDate = event.target.value ? new Date(event.target.value) : null;
    
    onChange({
      ...value,
      [field]: newDate
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formatear fecha para el input date
  const formatForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm cursor-pointer ${className}`}
        onClick={toggleDropdown}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={!value.from && !value.to ? 'text-gray-500' : ''}>
            {value.from && value.to ? displayValue : 'Seleccione un rango de fechas'}
          </span>
          <svg 
            className="w-5 h-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md p-4 border border-gray-200">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicial
              </label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formatForInput(value.from)}
                onChange={(e) => handleDateChange('from', e)}
                max={formatForInput(value.to)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha final
              </label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formatForInput(value.to)}
                onChange={(e) => handleDateChange('to', e)}
                min={formatForInput(value.from)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;