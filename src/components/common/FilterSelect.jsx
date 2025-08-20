import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Optimized select filter component with multi-select support and accessibility
 */
const FilterSelect = ({
  label,
  value = null,
  options = [],
  onChange,
  multiple = false,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
  clearable = true,
  className = '',
  maxDisplayItems = 2
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  // Get selected options for display
  const selectedOptions = React.useMemo(() => {
    if (!multiple) {
      return value ? options.find(opt => opt.value === value) : null;
    }
    
    if (!Array.isArray(value)) return [];
    return options.filter(opt => value.includes(opt.value));
  }, [value, options, multiple]);

  // Handle option selection
  const handleSelect = useCallback((optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  }, [value, onChange, multiple]);

  // Handle clear selection
  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : null);
  }, [onChange, multiple]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    setFocusedIndex(-1);
  }, [disabled]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else {
          toggleDropdown();
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
        
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, focusedIndex, filteredOptions, handleSelect, toggleDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Generate display text
  const getDisplayText = () => {
    if (!selectedOptions) return placeholder;
    
    if (!multiple) {
      return selectedOptions?.label || placeholder;
    }
    
    if (selectedOptions.length === 0) return placeholder;
    
    if (selectedOptions.length <= maxDisplayItems) {
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    
    return `${selectedOptions.slice(0, maxDisplayItems).map(opt => opt.label).join(', ')} +${selectedOptions.length - maxDisplayItems} more`;
  };

  const hasValue = multiple ? selectedOptions.length > 0 : selectedOptions !== null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full bg-white border rounded-lg px-3 py-2 text-left cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          ${disabled 
            ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${label}-label` : undefined}
      >
        <span className={`block truncate ${
          hasValue ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {getDisplayText()}
        </span>
        
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear selection"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 overflow-hidden">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 overflow-auto" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                const isFocused = index === focusedIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full text-left px-3 py-2 text-sm transition-colors
                      ${isFocused ? 'bg-blue-50' : ''}
                      ${isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900 hover:bg-gray-50'}
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {multiple && isSelected && (
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FilterSelect);