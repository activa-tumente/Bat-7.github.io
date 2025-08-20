/**
 * Utilidades para validación de datos
 */

/**
 * Valida los datos de una institución
 * @param {Object} data - Datos de la institución
 * @returns {Object} Resultado de la validación { isValid, errors }
 */
export const validateInstitution = (data) => {
  const errors = {};
  
  // Validar nombre
  if (!data.nombre) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (data.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  } else if (data.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder los 100 caracteres';
  }
  
  // Validar dirección
  if (data.direccion && data.direccion.length > 200) {
    errors.direccion = 'La dirección no puede exceder los 200 caracteres';
  }
  
  // Validar teléfono
  if (data.telefono) {
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    if (!phoneRegex.test(data.telefono)) {
      errors.telefono = 'El teléfono debe tener un formato válido';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida los datos de un psicólogo
 * @param {Object} data - Datos del psicólogo
 * @returns {Object} Resultado de la validación { isValid, errors }
 */
export const validatePsychologist = (data) => {
  const errors = {};
  
  // Validar nombre
  if (!data.nombre) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (data.nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.nombre.length > 50) {
    errors.nombre = 'El nombre no puede exceder los 50 caracteres';
  }
  
  // Validar apellidos
  if (!data.apellidos) {
    errors.apellidos = 'Los apellidos son obligatorios';
  } else if (data.apellidos.length < 2) {
    errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
  } else if (data.apellidos.length > 50) {
    errors.apellidos = 'Los apellidos no pueden exceder los 50 caracteres';
  }
  
  // Validar email
  if (!data.email) {
    errors.email = 'El email es obligatorio';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'El email debe tener un formato válido';
    }
  }
  
  // Validar documento de identidad
  if (!data.documento_identidad) {
    errors.documento_identidad = 'El documento de identidad es obligatorio';
  } else if (data.documento_identidad.length < 5) {
    errors.documento_identidad = 'El documento de identidad debe tener al menos 5 caracteres';
  } else if (data.documento_identidad.length > 20) {
    errors.documento_identidad = 'El documento de identidad no puede exceder los 20 caracteres';
  }
  
  // Validar teléfono
  if (data.telefono) {
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    if (!phoneRegex.test(data.telefono)) {
      errors.telefono = 'El teléfono debe tener un formato válido';
    }
  }
  
  // Validar institución
  if (!data.institucion_id) {
    errors.institucion_id = 'La institución es obligatoria';
  }
  
  // Validar usuario
  if (!data.usuario_id) {
    errors.usuario_id = 'El usuario es obligatorio';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida los datos de un paciente
 * @param {Object} data - Datos del paciente
 * @returns {Object} Resultado de la validación { isValid, errors }
 */
export const validatePatient = (data) => {
  const errors = {};
  
  // Validar nombre
  if (!data.nombre) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (data.nombre.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  } else if (data.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder los 100 caracteres';
  }
  
  // Validar fecha de nacimiento
  if (!data.fecha_nacimiento) {
    errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
  } else {
    const birthDate = new Date(data.fecha_nacimiento);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no es válida';
    } else if (birthDate > today) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser en el futuro';
    } else {
      // Calcular edad
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 0) {
        errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser en el futuro';
      } else if (age > 120) {
        errors.fecha_nacimiento = 'La edad no puede ser mayor a 120 años';
      }
    }
  }
  
  // Validar género
  if (!data.genero) {
    errors.genero = 'El género es obligatorio';
  } else if (!['Masculino', 'Femenino', 'Otro', 'No especificado'].includes(data.genero)) {
    errors.genero = 'El género debe ser uno de los valores permitidos';
  }
  
  // Validar institución
  if (!data.institucion_id) {
    errors.institucion_id = 'La institución es obligatoria';
  }
  
  // Validar notas (opcional)
  if (data.notas && data.notas.length > 500) {
    errors.notas = 'Las notas no pueden exceder los 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida los datos según el tipo de entidad
 * @param {string} entityType - Tipo de entidad ('instituciones', 'psicologos', 'pacientes')
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación { isValid, errors }
 */
export const validateEntityData = (entityType, data) => {
  switch (entityType) {
    case 'instituciones':
      return validateInstitution(data);
    case 'psicologos':
      return validatePsychologist(data);
    case 'pacientes':
      return validatePatient(data);
    default:
      return { isValid: true, errors: {} };
  }
};

export default {
  validateInstitution,
  validatePsychologist,
  validatePatient,
  validateEntityData
};
