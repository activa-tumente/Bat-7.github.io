// src/utils/emailValidator.js

/**
 * Valida un correo electrónico con reglas más permisivas
 * Esta función permite cualquier formato de correo que cumpla con la estructura básica
 * @param {string} email - El correo electrónico a validar
 * @returns {boolean} - true si el correo es válido, false en caso contrario
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  // Expresión regular más permisiva que acepta la mayoría de formatos de correo válidos
  // Permite dominios de cualquier tipo, incluidos dominios personalizados
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email);
};

/**
 * Valida un correo electrónico y devuelve un mensaje de error si no es válido
 * @param {string} email - El correo electrónico a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const getEmailValidationError = (email) => {
  if (!email) {
    return 'El correo electrónico es obligatorio';
  }
  
  if (!validateEmail(email)) {
    return 'El formato del correo electrónico no es válido';
  }
  
  return null;
};

export default validateEmail;