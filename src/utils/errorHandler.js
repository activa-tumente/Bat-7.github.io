import { toast } from 'react-toastify';

/**
 * Muestra un mensaje de error usando toast
 * @param {string|Object} error - Mensaje de error o objeto de error
 * @param {string} customMessage - Mensaje personalizado (opcional)
 */
export const showErrorToast = (error, customMessage = null) => {
  console.error('Error:', error);
  
  // Determinar el mensaje a mostrar
  let displayMessage = 'Ha ocurrido un error.';
  
  if (customMessage) {
    displayMessage = customMessage;
  } else if (typeof error === 'string') {
    displayMessage = error;
  } else if (error && error.message) {
    displayMessage = error.message;
  } else if (error && error.error_description) {
    displayMessage = error.error_description;
  }
  
  // Mostrar mensaje de error con toast
  toast.error(displayMessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Muestra un mensaje de éxito usando toast
 * @param {string} message - Mensaje de éxito
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Muestra un mensaje de información usando toast
 * @param {string} message - Mensaje informativo
 */
export const showInfoToast = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Muestra un mensaje de advertencia usando toast
 * @param {string} message - Mensaje de advertencia
 */
export const showWarningToast = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Maneja errores específicos de Supabase
 * @param {Object} error - Objeto de error de Supabase
 * @returns {string} - Mensaje de error formateado
 */
export const handleSupabaseError = (error) => {
  if (!error) return 'Error desconocido';
  
  // Errores de autenticación
  if (error.code === 'auth/invalid-email') {
    return 'El correo electrónico no es válido.';
  }
  
  if (error.code === 'auth/user-not-found') {
    return 'No existe una cuenta con este correo electrónico.';
  }
  
  if (error.code === 'auth/wrong-password') {
    return 'La contraseña es incorrecta.';
  }
  
  if (error.code === 'auth/email-already-in-use') {
    return 'Ya existe una cuenta con este correo electrónico.';
  }
  
  if (error.code === 'auth/weak-password') {
    return 'La contraseña es demasiado débil.';
  }
  
  // Errores de base de datos
  if (error.code === '23505') {
    return 'Ya existe un registro con estos datos.';
  }
  
  if (error.code === '23503') {
    return 'No se puede eliminar este registro porque está siendo utilizado por otros registros.';
  }
  
  // Error de conexión
  if (error.message && error.message.includes('network')) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }
  
  // Devolver mensaje original si no hay manejo específico
  return error.message || 'Se ha producido un error.';
};

/**
 * Valida si un correo electrónico tiene formato válido
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} - true si es válido, false en caso contrario
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {Object} - { isValid, message }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres.'
    };
  }
  
  // Puedes agregar más validaciones según tus requisitos
  // Por ejemplo, requerir letras mayúsculas, números, etc.
  
  return {
    isValid: true,
    message: ''
  };
};

export default {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  handleSupabaseError,
  isValidEmail,
  validatePassword
};
