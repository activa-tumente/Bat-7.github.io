import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  FaSpinner,
  FaExclamationTriangle,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaUserMd,
  FaUsers
} from 'react-icons/fa';

/**
 * Componente de modal con formulario dinámico
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de apertura del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {Array} props.fields - Configuración de los campos del formulario
 * @param {Object} props.initialValues - Valores iniciales de los campos
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.submitText - Texto del botón de envío
 * @param {string} props.cancelText - Texto del botón de cancelación
 * @param {string} props.size - Tamaño del modal (sm, md, lg, xl)
 * @param {boolean} props.isEdit - Si es un formulario de edición
 */
const FormModal = ({
  isOpen,
  onClose,
  title,
  fields = [],
  initialValues = {},
  onSubmit,
  loading = false,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  loadingText = 'Guardando...',
  size = 'md',
  isEdit = false
}) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inicializar valores del formulario cuando cambian los valores iniciales o se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Clonar los valores iniciales para evitar referencias compartidas
      const safeInitialValues = { ...initialValues };
      
      // Comprobar si hay alguna propiedad indefinida o nula y convertirla a cadena vacía
      Object.keys(safeInitialValues).forEach(key => {
        if (safeInitialValues[key] === undefined || safeInitialValues[key] === null) {
          safeInitialValues[key] = '';
        }
      });
      
      // Asegurar que todos los campos definidos tienen un valor inicial
      fields.forEach(field => {
        if (field.id && field.type !== 'section' && field.type !== 'divider' && safeInitialValues[field.id] === undefined) {
          // Asignar un valor inicial dependiendo del tipo de campo
          if (field.type === 'checkbox') {
            safeInitialValues[field.id] = false;
          } else if (field.type === 'checkboxGroup') {
            safeInitialValues[field.id] = [];
          } else {
            safeInitialValues[field.id] = '';
          }
        }
      });
      
      console.log('Valores iniciales del formulario:', safeInitialValues);
      setFormValues(safeInitialValues);
      setErrors({});
      setTouched({});

      // Asegurar que los campos del formulario sean interactivos
      setTimeout(() => {
        const firstInput = document.querySelector('.modal-form input, .modal-form select, .modal-form textarea');
        if (firstInput) {
          try {
            firstInput.focus();
          } catch (e) {
            console.warn('Error al enfocar el primer campo:', e);
          }
        }
      }, 200); // Aumentado el tiempo para asegurar que el DOM esté listo
    }
  }, [isOpen, initialValues, fields]);

  // Manejar cambios en los campos
  const handleChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));

    // Validar campo y actualizar errores
    validateField(fieldId, value);
  };

  // Validar un campo específico
  const validateField = (fieldId, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.validation) return;

    let error = null;

    // Validación requerida
    if (field.validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      error = field.validation.requiredMessage || 'Este campo es obligatorio';
    }

    // Validación de expresión regular
    if (value && field.validation.pattern && !field.validation.pattern.test(value)) {
      error = field.validation.patternMessage || 'El formato no es válido';
    }

    // Validación de longitud mínima
    if (value && field.validation.minLength && value.length < field.validation.minLength) {
      error = field.validation.minLengthMessage || `Debe tener al menos ${field.validation.minLength} caracteres`;
    }

    // Validación de longitud máxima
    if (value && field.validation.maxLength && value.length > field.validation.maxLength) {
      error = field.validation.maxLengthMessage || `Debe tener máximo ${field.validation.maxLength} caracteres`;
    }

    // Validación de valor mínimo (para campos numéricos)
    if (value && field.validation.min !== undefined && parseFloat(value) < field.validation.min) {
      error = field.validation.minMessage || `El valor mínimo es ${field.validation.min}`;
    }

    // Validación de valor máximo (para campos numéricos)
    if (value && field.validation.max !== undefined && parseFloat(value) > field.validation.max) {
      error = field.validation.maxMessage || `El valor máximo es ${field.validation.max}`;
    }

    // Validación personalizada
    if (field.validation.custom && typeof field.validation.custom === 'function') {
      const customError = field.validation.custom(value, formValues);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));

    return error;
  };

  // Validar todos los campos
  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.type === 'section' || field.type === 'divider') return;

      const value = formValues[field.id];
      const error = validateField(field.id, value);

      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const newTouched = {};
    fields.forEach(field => {
      if (field.type !== 'section' && field.type !== 'divider') {
        newTouched[field.id] = true;
      }
    });
    setTouched(newTouched);

    // Validar todos los campos
    if (validateAllFields()) {
      onSubmit(formValues);
    }
  };

  // Obtener el icono adecuado para el campo
  const getFieldIcon = (field) => {
    const { id, type } = field;

    // Mapeo de campos a iconos
    if (id.includes('nombre') || id.includes('name')) return <FaUser className="text-blue-500" />;
    if (id.includes('email') || id.includes('correo')) return <FaEnvelope className="text-blue-500" />;
    if (id.includes('telefono') || id.includes('phone')) return <FaPhone className="text-blue-500" />;
    if (id.includes('direccion') || id.includes('address')) return <FaMapMarkerAlt className="text-blue-500" />;
    if (id.includes('documento') || id.includes('identity') || id.includes('id')) return <FaIdCard className="text-blue-500" />;
    if (id.includes('fecha') || id.includes('date') || type === 'date') return <FaCalendarAlt className="text-blue-500" />;
    if (id.includes('genero') || id.includes('gender')) return <FaVenusMars className="text-blue-500" />;
    if (id.includes('institucion') || id.includes('institution')) return <FaBuilding className="text-blue-500" />;
    if (id.includes('psicologo') || id.includes('psychologist')) return <FaUserMd className="text-blue-500" />;
    if (id.includes('paciente') || id.includes('patient')) return <FaUsers className="text-blue-500" />;

    // Icono por defecto según el tipo
    if (type === 'email') return <FaEnvelope className="text-blue-500" />;
    if (type === 'tel') return <FaPhone className="text-blue-500" />;
    if (type === 'date') return <FaCalendarAlt className="text-blue-500" />;

    // Icono por defecto
    return <FaUser className="text-blue-500" />;
  };

  // Renderizar campo según su tipo
  const renderField = (field) => {
    const { id, label, type, placeholder, options, disabled, info, className = '', width = 'full' } = field;
    const value = formValues[id] !== undefined ? formValues[id] : '';
    const error = errors[id];
    const isTouched = touched[id];
    const showError = error && isTouched;

    // Mapeo de ancho a clases
    const widthClasses = {
      'full': 'col-span-1 md:col-span-2',
      'half': 'col-span-1',
      '1/3': 'col-span-1',
      '2/3': 'col-span-1 md:col-span-2'
    };

    const fieldWidthClass = widthClasses[width] || widthClasses.full;

    // Campo section (título de sección)
    if (type === 'section') {
      return (
        <div key={id} className={`col-span-1 md:col-span-2 mb-3 ${className}`}>
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-2">{label}</h3>
          {info && <p className="mt-1 text-sm text-gray-500">{info}</p>}
        </div>
      );
    }

    // Línea divisoria
    if (type === 'divider') {
      return (
        <div key={id} className={`col-span-1 md:col-span-2 my-3 border-t border-gray-200 ${className}`}></div>
      );
    }

    return (
      <div key={id} className={`mb-3 ${fieldWidthClass} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label} {field.validation?.required && <span className="text-red-500">*</span>}
          </label>
        )}

        {type === 'text' || type === 'email' || type === 'number' || type === 'tel' || type === 'password' || type === 'date' || type === 'time' ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getFieldIcon(field)}
            </div>
            <input
              type={type}
              id={id}
              name={id}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              placeholder={placeholder}
              disabled={disabled || loading}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                showError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:ring focus:ring-opacity-50 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-300'
              } transition-colors duration-200 text-gray-700`}
              autoComplete="off"
              min={field.min}
              max={field.max}
              step={field.step}
              maxLength={field.maxLength}
            />
            {showError && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaExclamationTriangle className="text-red-500" />
              </div>
            )}
          </div>
        ) : type === 'textarea' ? (
          <div className="relative">
            <textarea
              id={id}
              name={id}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              placeholder={placeholder}
              disabled={disabled || loading}
              rows={field.rows || 3}
              className={`w-full rounded-lg border px-4 py-2 ${
                showError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:ring focus:ring-opacity-50 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              } transition-colors duration-200`}
              maxLength={field.maxLength}
            />
          </div>
        ) : type === 'select' ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getFieldIcon(field)}
            </div>
            <select
              id={id}
              name={id}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              disabled={disabled || loading}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border appearance-none bg-no-repeat bg-right ${
                showError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } focus:ring focus:ring-opacity-50 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-300'
              } transition-colors duration-200 text-gray-700`}
              autoComplete="off"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundSize: "1.5em 1.5em", backgroundPosition: "right 0.75rem center" }}
            >
              {placeholder && (
                <option value="">{placeholder}</option>
              )}
              {options && options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError && (
              <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                <FaExclamationTriangle className="text-red-500" />
              </div>
            )}
          </div>
        ) : type === 'radio' ? (
          <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {options && options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${id}-${option.value}`}
                  name={id}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(id, option.value)}
                  disabled={disabled || loading}
                  className={`h-4 w-4 ${
                    showError
                      ? 'border-red-300 text-red-600 focus:ring-red-500'
                      : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className={`ml-3 block text-sm font-medium text-gray-700 ${
                    disabled ? 'text-gray-500' : ''
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : type === 'checkbox' ? (
          <div className="flex items-center h-5 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input
              id={id}
              name={id}
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(id, e.target.checked)}
              disabled={disabled || loading}
              className={`h-4 w-4 rounded ${
                showError
                  ? 'border-red-300 text-red-600 focus:ring-red-500'
                  : 'border-gray-300 text-blue-600 focus:ring-blue-500'
              } focus:ring focus:ring-opacity-50 ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {field.checkboxLabel && (
              <label
                htmlFor={id}
                className={`ml-3 block text-sm text-gray-700 ${
                  disabled ? 'text-gray-500' : ''
                }`}
              >
                {field.checkboxLabel}
              </label>
            )}
          </div>
        ) : type === 'checkboxGroup' ? (
          <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {options && options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${id}-${option.value}`}
                  name={`${id}-${option.value}`}
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const currentValues = Array.isArray(value) ? [...value] : [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleChange(id, newValues);
                  }}
                  disabled={disabled || loading}
                  className={`h-4 w-4 rounded ${
                    showError
                      ? 'border-red-300 text-red-600 focus:ring-red-500'
                      : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                  } focus:ring focus:ring-opacity-50 ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className={`ml-3 block text-sm font-medium text-gray-700 ${
                    disabled ? 'text-gray-500' : ''
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-500">Tipo de campo no soportado: {type}</p>
        )}

        {showError && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FaExclamationTriangle className="mr-1 text-xs" /> {error}
          </p>
        )}

        {info && !showError && (
          <p className="mt-1 text-xs text-gray-500">{info}</p>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <form onSubmit={handleSubmit} className="bg-white modal-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(renderField)}
        </div>

        <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-gray-700"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="min-w-[120px] px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                {loadingText}
              </span>
            ) : (
              isEdit ? `Actualizar` : submitText
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;