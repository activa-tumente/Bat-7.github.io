import React from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaSpinner } from 'react-icons/fa';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema } from '../../utils/validationSchemas';
import ValidatedInput from '../forms/ValidatedInput';
import { FormErrorBoundary } from '../error/ErrorBoundary';

/**
 * Ejemplo de formulario con validación completa
 * Demuestra el uso del sistema de validación robusto
 */
const ValidatedFormExample = () => {
  const initialValues = {
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    telefono: '',
    fechaNacimiento: '',
    password: '',
    confirmPassword: '',
    rol: 'estudiante',
    institucion: '',
    especialidad: '',
    numeroLicencia: '',
    acceptTerms: false
  };

  const handleSubmit = async (values) => {
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Formulario enviado:', values);
    toast.success('¡Registro completado exitosamente!');
    
    return values;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleInputChange,
    handleBlur,
    handleSubmit: onSubmit,
    resetForm,
    getFieldProps,
    getFieldState
  } = useFormValidation(initialValues, registerSchema, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    onSubmit: handleSubmit
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit(e);
    
    if (result.success) {
      resetForm();
    } else if (result.errors) {
      toast.error('Por favor, corrige los errores en el formulario');
    } else if (result.error) {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleReset = () => {
    resetForm();
    toast.info('Formulario reiniciado');
  };

  return (
    <FormErrorBoundary formName="ValidatedFormExample">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ejemplo de Formulario Validado
          </h1>
          <p className="text-gray-600">
            Demuestra validación en tiempo real, sanitización y manejo de errores
          </p>
        </div>

        {/* Indicadores de estado */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Válido: {isValid ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isDirty ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span>Modificado: {isDirty ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isSubmitting ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span>Enviando: {isSubmitting ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${Object.keys(errors).length === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Errores: {Object.keys(errors).length}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Información personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValidatedInput
              label="Nombre"
              {...getFieldProps('nombre', 'name')}
              placeholder="Ingresa tu nombre"
              prefix={<FaUser />}
              required
              maxLength={50}
            />

            <ValidatedInput
              label="Apellido"
              {...getFieldProps('apellido', 'name')}
              placeholder="Ingresa tu apellido"
              prefix={<FaUser />}
              required
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValidatedInput
              label="Email"
              type="email"
              {...getFieldProps('email', 'email')}
              placeholder="ejemplo@correo.com"
              prefix={<FaEnvelope />}
              required
              autoComplete="email"
            />

            <ValidatedInput
              label="Documento de Identidad"
              {...getFieldProps('documento', 'document')}
              placeholder="Número de documento"
              required
              helpText="Cédula, pasaporte o documento de identidad"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValidatedInput
              label="Teléfono"
              type="tel"
              {...getFieldProps('telefono', 'phone')}
              placeholder="+1 234 567 8900"
              prefix={<FaPhone />}
              helpText="Incluye código de país si es internacional"
            />

            <ValidatedInput
              label="Fecha de Nacimiento"
              type="date"
              {...getFieldProps('fechaNacimiento')}
              required
            />
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValidatedInput
              label="Contraseña"
              type="password"
              {...getFieldProps('password')}
              placeholder="Mínimo 8 caracteres"
              prefix={<FaLock />}
              required
              helpText="Debe contener mayúscula, minúscula y número"
              autoComplete="new-password"
            />

            <ValidatedInput
              label="Confirmar Contraseña"
              type="password"
              {...getFieldProps('confirmPassword')}
              placeholder="Repite tu contraseña"
              prefix={<FaLock />}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Rol y campos condicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="rol"
              value={values.rol}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="estudiante">Estudiante</option>
              <option value="psicologo">Psicólogo</option>
              <option value="administrador">Administrador</option>
            </select>
            {touched.rol && errors.rol && (
              <div className="mt-1 text-sm text-red-600">{errors.rol}</div>
            )}
          </div>

          {/* Campos condicionales según el rol */}
          {values.rol === 'estudiante' && (
            <ValidatedInput
              label="Institución"
              {...getFieldProps('institucion')}
              placeholder="Universidad o institución educativa"
              required
            />
          )}

          {values.rol === 'psicologo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValidatedInput
                label="Especialidad"
                {...getFieldProps('especialidad')}
                placeholder="Especialidad psicológica"
                required
              />

              <ValidatedInput
                label="Número de Licencia"
                {...getFieldProps('numeroLicencia')}
                placeholder="Número de licencia profesional"
                required
              />
            </div>
          )}

          {/* Términos y condiciones */}
          <div className="flex items-start">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={values.acceptTerms}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              required
            />
            <label className="ml-3 text-sm text-gray-700">
              Acepto los{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                política de privacidad
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {touched.acceptTerms && errors.acceptTerms && (
            <div className="text-sm text-red-600">{errors.acceptTerms}</div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting || !isDirty}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reiniciar
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Registrando...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2" />
                  Registrar
                </>
              )}
            </button>
          </div>
        </form>

        {/* Debug info en desarrollo */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Debug Info (Solo en desarrollo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Valores:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(values, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Errores:</h4>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormErrorBoundary>
  );
};

export default ValidatedFormExample;
