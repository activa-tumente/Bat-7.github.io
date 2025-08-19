import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useUnifiedAuth } from '../../context/UnifiedAuthContext';
import { 
  InputField, 
  PasswordInput, 
  UserTypeSelector, 
  SubmitButton, 
  FormError 
} from './LoginFormComponents';

/**
 * Custom hook for form validation
 */
const useFormValidation = (initialState = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const validators = {
      identifier: (val) => {
        if (!val?.trim()) return 'Email o documento es requerido';
        if (val.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val) ? null : 'Email inválido';
        } else {
          const docRegex = /^[0-9]{7,10}$/;
          return docRegex.test(val) ? null : 'Documento debe tener entre 7 y 10 dígitos';
        }
      },
      password: (val) => {
        if (!val) return 'Contraseña es requerida';
        if (val.length < 6) return 'Contraseña debe tener al menos 6 caracteres';
        return null;
      },
      userType: (val) => {
        if (!val) return 'Debe seleccionar un tipo de usuario';
        return null;
      }
    };

    const validator = validators[name];
    return validator ? validator(value) : null;
  }, []);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const handleBlur = useCallback((name) => {
    setFieldTouched(name);
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField, setFieldTouched]);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    setValue,
    handleBlur,
    validateForm,
    reset,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0
  };
};

/**
 * Improved Login Form Component
 * Addresses code smells from the original LoginForm:
 * - Decomposed into smaller, reusable components
 * - Better state management with custom hooks
 * - Improved accessibility
 * - Better error handling
 * - Cleaner validation logic
 */
const ImprovedLoginForm = () => {
  const navigate = useNavigate();
  const { login, loading, authMode } = useUnifiedAuth();
  const [submitError, setSubmitError] = useState(null);

  const {
    values,
    errors,
    touched,
    setValue,
    handleBlur,
    validateForm,
    reset
  } = useFormValidation({
    identifier: '',
    password: '',
    userType: 'candidato'
  });

  // Memoized user type options to prevent unnecessary re-renders
  const userTypeOptions = useMemo(() => [
    { 
      value: 'candidato', 
      label: 'Candidato', 
      description: 'Realizar evaluaciones psicológicas' 
    },
    { 
      value: 'psicologo', 
      label: 'Psicólogo', 
      description: 'Administrar y revisar evaluaciones' 
    },
    { 
      value: 'administrador', 
      label: 'Administrador', 
      description: 'Gestión completa del sistema' 
    }
  ], []);

  const handleInputChange = useCallback((name) => (event) => {
    const value = event.target?.value ?? event;
    setValue(name, value);
  }, [setValue]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError('Por favor, corrija los errores en el formulario');
      return;
    }

    try {
      const result = await login({
        identifier: values.identifier.trim(),
        password: values.password,
        userType: values.userType
      });

      if (result.success) {
        // Navigation based on user type
        const routes = {
          administrador: '/admin/dashboard',
          psicologo: '/professional/dashboard',
          candidato: '/student/dashboard'
        };
        
        const targetRoute = routes[values.userType] || '/dashboard';
        navigate(targetRoute, { replace: true });
      } else {
        setSubmitError(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError('Error inesperado. Por favor, intente nuevamente.');
    }
  }, [login, values, validateForm, navigate]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           values.identifier && 
           values.password && 
           values.userType;
  }, [errors, values]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <FaUser className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Evaluación Psicológica BAT-7
          </p>
          {authMode === 'development' && (
            <div className="mt-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-md">
              <p className="text-xs text-yellow-800 font-medium">
                Modo Desarrollo - Autenticación simulada
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form 
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" 
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-6">
            {/* Submit Error */}
            <FormError error={submitError} />

            {/* Identifier Field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email o Documento
              </label>
              <InputField
                id="identifier"
                name="identifier"
                type="text"
                value={values.identifier}
                onChange={handleInputChange('identifier')}
                onBlur={() => handleBlur('identifier')}
                placeholder="Ingrese su email o documento"
                icon={FaUser}
                error={touched.identifier ? errors.identifier : null}
                autoComplete="username"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={values.password}
                onChange={handleInputChange('password')}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : null}
                required
              />
            </div>

            {/* User Type Selector */}
            <UserTypeSelector
              value={values.userType}
              onChange={handleInputChange('userType')}
              options={userTypeOptions}
              error={touched.userType ? errors.userType : null}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <SubmitButton
              loading={loading}
              disabled={!isFormValid}
              loadingText="Iniciando sesión..."
            >
              Iniciar Sesión
            </SubmitButton>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </form>

        {/* Development Mode Controls */}
        {authMode === 'development' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Controles de Desarrollo
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              En modo desarrollo, cualquier credencial será aceptada.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setValue('identifier', 'admin@bat7.com');
                  setValue('password', 'admin123');
                  setValue('userType', 'administrador');
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('identifier', 'psicologo@bat7.com');
                  setValue('password', 'psi123');
                  setValue('userType', 'psicologo');
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Psicólogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('identifier', 'candidato@bat7.com');
                  setValue('password', 'cand123');
                  setValue('userType', 'candidato');
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Candidato
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedLoginForm;