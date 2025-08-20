import { PIN_CONSTANTS } from './PinConstants.js';

/**
 * Base error class for pin control operations with enhanced debugging
 */
export class PinControlError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'PinControlError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.stack = Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : (new Error()).stack;
  }

  /**
   * Convert error to JSON for logging/debugging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Create user-friendly error message
   */
  getUserMessage() {
    switch (this.code) {
      case PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE:
        return 'No tienes pines disponibles. Contacta al administrador para obtener más pines.';
      case PIN_CONSTANTS.ERROR_CODES.PSYCHOLOGIST_NOT_FOUND:
        return 'No se encontró la configuración de pines para este psicólogo.';
      case PIN_CONSTANTS.ERROR_CODES.INVALID_PARAMETERS:
        return 'Los parámetros proporcionados no son válidos.';
      default:
        return 'Ha ocurrido un error en el sistema de pines.';
    }
  }
}

export class ValidationError extends PinControlError {
  constructor(message, details = null) {
    super(message, PIN_CONSTANTS.ERROR_CODES.INVALID_PARAMETERS, details);
    this.name = 'ValidationError';
  }
}

export class NoPinsAvailableError extends PinControlError {
  constructor(psychologistId, remainingPins = 0) {
    super(
      `No pins available for psychologist ${psychologistId}`,
      PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE,
      { psychologistId, remainingPins }
    );
    this.name = 'NoPinsAvailableError';
  }
}

export class PsychologistNotFoundError extends PinControlError {
  constructor(psychologistId) {
    super(
      `Psychologist not found: ${psychologistId}`,
      PIN_CONSTANTS.ERROR_CODES.PSYCHOLOGIST_NOT_FOUND,
      { psychologistId }
    );
    this.name = 'PsychologistNotFoundError';
  }
}