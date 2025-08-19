import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de formulario reutilizable para pacientes
 * Implementa validación, accesibilidad y mejores prácticas de React
 */
const PatientForm = ({ 
  initialData = {}, 
  institutions = [], 
  psychologists = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    fecha_nacimiento: '',
    documento: '',
    email: '',
    nivel_educativo: '',
    ocupacion: '',
    institucion_id: '',
    psicologo_id: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validación de campos
  const validateField = useCallback((name, value) => {
    const validationRules = {
      nombre: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'El nombre debe tener al menos 2 caracteres y solo contener letras'
      },
      apellido: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'El apellido debe tener al menos 2 caracteres y solo contener letras'
      },
      email: {
        required: false,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Ingrese un email válido'
      },
      documento: {
        required: false,
        pattern: /^[0-9]{7,8}$/,
        message: 'El documento debe tener 7 u 8 dígitos'
      },
      fecha_nacimiento: {
        required: false,
        validate: (val) => {
          if (!val) return true;
          const date = new Date(val);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          return age >= 0 && age <= 120;
        },
        message: 'Ingrese una fecha de nacimiento válida'
      }
    };

    const rule = validationRules[name];
    if (!rule) return null;

    // Campo requerido
    if (rule.required && (!value || value.trim() === '')) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} es requerido`;
    }

    // Si el campo está vacío y no es requerido, es válido
    if (!value || value.trim() === '') {
      return null;
    }

    // Longitud mínima
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    // Patrón regex
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    // Validación personalizada
    if (rule.validate && !rule.validate(value)) {
      return rule.message;
    }

    return null;
  }, []);

  // Manejar cambios en los campos
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  // Manejar blur (campo tocado)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  // Validar todo el formulario
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  }, [formData, validateField]);

  // Manejar envío del formulario
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, validateForm, onSubmit]);

  // Componente de campo de entrada reutilizable
  const InputField = ({ name, label, type = 'text', required = false, ...props }) => (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] && touched[name] 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-blue-500'
        }`}
        aria-invalid={errors[name] && touched[name] ? 'true' : 'false'}
        aria-describedby={errors[name] && touched[name] ? `${name}-error` : undefined}
        disabled={loading}
        {...props}
      />
      {errors[name] && touched[name] && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );

  // Componente de select reutilizable
  const SelectField = ({ name, label, options, required = false, placeholder = 'Seleccionar...' }) => (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] && touched[name] 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:border-blue-500'
        }`}
        aria-invalid={errors[name] && touched[name] ? 'true' : 'false'}
        disabled={loading}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && touched[name] && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="nombre"
          label="Nombre"
          required
          autoComplete="given-name"
        />
        
        <InputField
          name="apellido"
          label="Apellido"
          required
          autoComplete="family-name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="genero"
          label="Género"
          options={[
            { value: 'masculino', label: 'Masculino' },
            { value: 'femenino', label: 'Femenino' },
            { value: 'otro', label: 'Otro' }
          ]}
        />
        
        <InputField
          name="fecha_nacimiento"
          label="Fecha de Nacimiento"
          type="date"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="documento"
          label="Documento"
          placeholder="12345678"
        />
        
        <InputField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="nivel_educativo"
          label="Nivel Educativo"
          placeholder="Ej: Universitario"
        />
        
        <InputField
          name="ocupacion"
          label="Ocupación"
          placeholder="Ej: Estudiante"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="institucion_id"
          label="Institución"
          options={institutions.map(inst => ({
            value: inst.id,
            label: inst.nombre
          }))}
          placeholder="Seleccionar institución..."
        />
        
        <SelectField
          name="psicologo_id"
          label="Psicólogo Asignado"
          options={psychologists.map(psy => ({
            value: psy.id,
            label: `${psy.nombre} ${psy.apellido}`
          }))}
          placeholder="Seleccionar psicólogo..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
};

PatientForm.propTypes = {
  initialData: PropTypes.object,
  institutions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired
  })),
  psychologists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired
  })),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default PatientForm;