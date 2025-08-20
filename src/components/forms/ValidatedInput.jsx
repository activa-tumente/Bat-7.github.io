import React, { forwardRef } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Componente de input con validación integrada
 * Muestra errores, estados de validación y soporte para diferentes tipos
 */
const ValidatedInput = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  showValidIcon = true,
  helpText,
  prefix,
  suffix,
  maxLength,
  autoComplete,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const hasError = Boolean(touched && error);
  const isValid = Boolean(touched && !error && value);
  const isPassword = type === 'password';

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clases dinámicas
  const baseInputClasses = `
    w-full px-3 py-2 border rounded-md text-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${prefix ? 'pl-10' : ''}
    ${suffix || isPassword ? 'pr-10' : ''}
  `;

  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : isValid && showValidIcon
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : isFocused
    ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
    : 'border-gray-300 hover:border-gray-400';

  const inputClasses = `${baseInputClasses} ${stateClasses} ${inputClassName}`;

  const labelClasses = `
    block text-sm font-medium mb-1 transition-colors duration-200
    ${hasError ? 'text-red-700' : isValid ? 'text-green-700' : 'text-gray-700'}
    ${labelClassName}
  `;

  const errorClasses = `
    mt-1 text-sm text-red-600 flex items-center
    ${errorClassName}
  `;

  const helpTextClasses = `
    mt-1 text-sm text-gray-500
  `;

  return (
    <div className={`${containerClassName}`}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Prefix icon */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-sm ${hasError ? 'text-red-400' : 'text-gray-400'}`}>
              {prefix}
            </span>
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
          }
          {...props}
        />

        {/* Suffix icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4" />
              ) : (
                <FaEye className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Validation icons */}
          {!isPassword && (
            <>
              {hasError && (
                <FaExclamationCircle className="h-4 w-4 text-red-500" />
              )}
              {isValid && showValidIcon && (
                <FaCheckCircle className="h-4 w-4 text-green-500" />
              )}
              {suffix && !hasError && !isValid && (
                <span className="text-sm text-gray-400">{suffix}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div id={`${name}-error`} className={errorClasses}>
          <FaExclamationCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {helpText && !hasError && (
        <div id={`${name}-help`} className={helpTextClasses}>
          {helpText}
        </div>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
