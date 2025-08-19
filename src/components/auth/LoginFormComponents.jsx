import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaSpinner } from 'react-icons/fa';

/**
 * Reusable Input Field Component
 * Handles various input types with consistent styling and validation
 */
export const InputField = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  required = false,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
  className = '',
  ...props
}) => {
  const baseClasses = `
    w-full pl-10 pr-4 py-3 border rounded-lg 
    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
    transition-colors duration-200 bg-white
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon && (
          <Icon 
            className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`}
            aria-hidden="true"
          />
        )}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error ? 'true' : 'false'}
        className={baseClasses}
        {...props}
      />
      {error && (
        <div 
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Password Input Component with visibility toggle
 */
export const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Contraseña',
  error,
  required = false,
  autoComplete = 'current-password',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaLock 
          className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`}
          aria-hidden="true"
        />
      </div>
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full pl-10 pr-12 py-3 border rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-colors duration-200 bg-white
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {showPassword ? (
          <FaEyeSlash className="h-5 w-5 text-gray-400" aria-hidden="true" />
        ) : (
          <FaEye className="h-5 w-5 text-gray-400" aria-hidden="true" />
        )}
      </button>
      {error && (
        <div 
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * User Type Selector Component
 */
export const UserTypeSelector = ({
  value,
  onChange,
  options = [
    { value: 'candidato', label: 'Candidato', description: 'Realizar evaluaciones psicológicas' },
    { value: 'psicologo', label: 'Psicólogo', description: 'Administrar y revisar evaluaciones' },
    { value: 'administrador', label: 'Administrador', description: 'Gestión completa del sistema' }
  ],
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-3">
          Tipo de Usuario
        </legend>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className={`
                relative flex items-start p-3 border rounded-lg cursor-pointer 
                hover:bg-gray-50 transition-colors duration-200
                ${value === option.value 
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                  : 'border-gray-300'
                }
                ${error ? 'border-red-300' : ''}
              `}
            >
              <input
                type="radio"
                name="userType"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                aria-describedby={`${option.value}-description`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                    ${value === option.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {value === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p 
                      id={`${option.value}-description`}
                      className="text-xs text-gray-500"
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <div 
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Submit Button Component with loading state
 */
export const SubmitButton = ({
  loading = false,
  disabled = false,
  children = 'Iniciar Sesión',
  loadingText = 'Iniciando sesión...',
  className = '',
  ...props
}) => {
  const isDisabled = loading || disabled;
  
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        w-full flex justify-center items-center py-3 px-4 border border-transparent 
        rounded-lg shadow-sm text-sm font-medium text-white 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-all duration-200
        ${isDisabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
        ${className}
      `}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <FaSpinner 
          className="animate-spin h-4 w-4 mr-2" 
          aria-hidden="true"
        />
      )}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
};

/**
 * Form Error Display Component
 */
export const FormError = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <div 
      className={`
        p-3 rounded-lg bg-red-50 border border-red-200 
        text-sm text-red-700 ${className}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center">
        <svg 
          className="w-4 h-4 mr-2 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{error}</span>
      </div>
    </div>
  );
};

/**
 * Form Success Display Component
 */
export const FormSuccess = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div 
      className={`
        p-3 rounded-lg bg-green-50 border border-green-200 
        text-sm text-green-700 ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <svg 
          className="w-4 h-4 mr-2 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};