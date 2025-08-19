/**
 * errors.js - Clases de error personalizadas para el sistema BAT-7
 * 
 * Características:
 * - Jerarquía de errores específicos del dominio
 * - Códigos de error estructurados
 * - Información contextual para debugging
 * - Soporte para internacionalización
 * - Logging automático
 */

/**
 * Clase base para todos los errores del sistema
 */
class BaseError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.stack = Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack;
    
    // Log automático del error
    this.#logError();
  }

  /**
   * Log automático del error
   */
  #logError() {
    const errorInfo = {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };

    // En desarrollo, mostrar en consola
    if (import.meta.env?.DEV) {
      console.error(`[${this.name}]`, errorInfo);
    }

    // En producción, enviar a servicio de logging
    if (import.meta.env?.PROD && window.errorLogger) {
      window.errorLogger.log(errorInfo);
    }
  }

  /**
   * Serializar error para envío
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp
    };
  }

  /**
   * Obtener mensaje localizado
   */
  getLocalizedMessage(locale = 'es') {
    // Implementación básica de localización
    const messages = {
      es: {
        UNKNOWN_ERROR: 'Error desconocido',
        NETWORK_ERROR: 'Error de conexión',
        VALIDATION_ERROR: 'Error de validación',
        PERMISSION_ERROR: 'Sin permisos suficientes'
      },
      en: {
        UNKNOWN_ERROR: 'Unknown error',
        NETWORK_ERROR: 'Network error',
        VALIDATION_ERROR: 'Validation error',
        PERMISSION_ERROR: 'Insufficient permissions'
      }
    };

    return messages[locale]?.[this.code] || this.message;
  }
}

/**
 * Error relacionado con informes
 */
class InformeError extends BaseError {
  constructor(message, code = 'INFORME_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'informes' });
  }
}

/**
 * Error de generación de informes
 */
class InformeGenerationError extends InformeError {
  constructor(message, context = {}) {
    super(message, 'INFORME_GENERATION_ERROR', context);
  }
}

/**
 * Error cuando no se encuentra un informe
 */
class InformeNotFoundError extends InformeError {
  constructor(message, context = {}) {
    super(message, 'INFORME_NOT_FOUND', context);
  }
}

/**
 * Error de validación de informe
 */
class InformeValidationError extends InformeError {
  constructor(message, validationErrors = [], context = {}) {
    super(message, 'INFORME_VALIDATION_ERROR', { ...context, validationErrors });
    this.validationErrors = validationErrors;
  }

  /**
   * Obtener errores de validación formateados
   */
  getFormattedErrors() {
    return this.validationErrors.map(error => ({
      field: error.field,
      message: error.message,
      code: error.code
    }));
  }
}

/**
 * Error relacionado con pacientes
 */
class PatientError extends BaseError {
  constructor(message, code = 'PATIENT_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'patients' });
  }
}

/**
 * Error cuando no se encuentra un paciente
 */
class PatientNotFoundError extends PatientError {
  constructor(message, context = {}) {
    super(message, 'PATIENT_NOT_FOUND', context);
  }
}

/**
 * Error de validación de paciente
 */
class PatientValidationError extends PatientError {
  constructor(message, validationErrors = [], context = {}) {
    super(message, 'PATIENT_VALIDATION_ERROR', { ...context, validationErrors });
    this.validationErrors = validationErrors;
  }
}

/**
 * Error relacionado con evaluaciones
 */
class EvaluationError extends BaseError {
  constructor(message, code = 'EVALUATION_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'evaluations' });
  }
}

/**
 * Error de procesamiento de evaluación
 */
class EvaluationProcessingError extends EvaluationError {
  constructor(message, context = {}) {
    super(message, 'EVALUATION_PROCESSING_ERROR', context);
  }
}

/**
 * Error de datos de evaluación inválidos
 */
class InvalidEvaluationDataError extends EvaluationError {
  constructor(message, context = {}) {
    super(message, 'INVALID_EVALUATION_DATA', context);
  }
}

/**
 * Error relacionado con la base de datos
 */
class DatabaseError extends BaseError {
  constructor(message, code = 'DATABASE_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'database' });
  }
}

/**
 * Error de conexión a la base de datos
 */
class DatabaseConnectionError extends DatabaseError {
  constructor(message, context = {}) {
    super(message, 'DATABASE_CONNECTION_ERROR', context);
  }
}

/**
 * Error de consulta a la base de datos
 */
class DatabaseQueryError extends DatabaseError {
  constructor(message, query = null, context = {}) {
    super(message, 'DATABASE_QUERY_ERROR', { ...context, query });
    this.query = query;
  }
}

/**
 * Error relacionado con autenticación
 */
class AuthenticationError extends BaseError {
  constructor(message, code = 'AUTHENTICATION_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'auth' });
  }
}

/**
 * Error de credenciales inválidas
 */
class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Credenciales inválidas', context = {}) {
    super(message, 'INVALID_CREDENTIALS', context);
  }
}

/**
 * Error de sesión expirada
 */
class SessionExpiredError extends AuthenticationError {
  constructor(message = 'Sesión expirada', context = {}) {
    super(message, 'SESSION_EXPIRED', context);
  }
}

/**
 * Error relacionado con autorización
 */
class AuthorizationError extends BaseError {
  constructor(message, code = 'AUTHORIZATION_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'auth' });
  }
}

/**
 * Error de permisos insuficientes
 */
class InsufficientPermissionsError extends AuthorizationError {
  constructor(message = 'Permisos insuficientes', requiredPermissions = [], context = {}) {
    super(message, 'INSUFFICIENT_PERMISSIONS', { ...context, requiredPermissions });
    this.requiredPermissions = requiredPermissions;
  }
}

/**
 * Error relacionado con la red
 */
class NetworkError extends BaseError {
  constructor(message, code = 'NETWORK_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'network' });
  }
}

/**
 * Error de timeout de red
 */
class NetworkTimeoutError extends NetworkError {
  constructor(message = 'Timeout de red', context = {}) {
    super(message, 'NETWORK_TIMEOUT', context);
  }
}

/**
 * Error de conexión de red
 */
class NetworkConnectionError extends NetworkError {
  constructor(message = 'Error de conexión', context = {}) {
    super(message, 'NETWORK_CONNECTION_ERROR', context);
  }
}

/**
 * Error relacionado con validación
 */
class ValidationError extends BaseError {
  constructor(message, validationErrors = [], context = {}) {
    super(message, 'VALIDATION_ERROR', { ...context, validationErrors });
    this.validationErrors = validationErrors;
  }

  /**
   * Agregar error de validación
   */
  addValidationError(field, message, code = 'INVALID') {
    this.validationErrors.push({ field, message, code });
  }

  /**
   * Verificar si hay errores para un campo específico
   */
  hasFieldError(field) {
    return this.validationErrors.some(error => error.field === field);
  }

  /**
   * Obtener errores para un campo específico
   */
  getFieldErrors(field) {
    return this.validationErrors.filter(error => error.field === field);
  }
}

/**
 * Error relacionado con archivos
 */
class FileError extends BaseError {
  constructor(message, code = 'FILE_ERROR', context = {}) {
    super(message, code, { ...context, domain: 'files' });
  }
}

/**
 * Error de archivo no encontrado
 */
class FileNotFoundError extends FileError {
  constructor(message, filePath = null, context = {}) {
    super(message, 'FILE_NOT_FOUND', { ...context, filePath });
    this.filePath = filePath;
  }
}

/**
 * Error de formato de archivo inválido
 */
class InvalidFileFormatError extends FileError {
  constructor(message, expectedFormat = null, actualFormat = null, context = {}) {
    super(message, 'INVALID_FILE_FORMAT', { ...context, expectedFormat, actualFormat });
    this.expectedFormat = expectedFormat;
    this.actualFormat = actualFormat;
  }
}

/**
 * Error de tamaño de archivo excedido
 */
class FileSizeExceededError extends FileError {
  constructor(message, maxSize = null, actualSize = null, context = {}) {
    super(message, 'FILE_SIZE_EXCEEDED', { ...context, maxSize, actualSize });
    this.maxSize = maxSize;
    this.actualSize = actualSize;
  }
}

/**
 * Manejador global de errores
 */
class ErrorHandler {
  static handlers = new Map();

  /**
   * Registrar manejador para tipo de error
   */
  static register(errorType, handler) {
    this.handlers.set(errorType, handler);
  }

  /**
   * Manejar error
   */
  static handle(error) {
    const handler = this.handlers.get(error.constructor);
    
    if (handler) {
      return handler(error);
    }

    // Manejador por defecto
    console.error('Error no manejado:', error);
    
    // En producción, mostrar mensaje genérico
    if (import.meta.env?.PROD) {
      return {
        message: 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.',
        code: 'UNEXPECTED_ERROR'
      };
    }

    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  /**
   * Crear error desde respuesta de API
   */
  static fromApiResponse(response, context = {}) {
    const { status, data } = response;
    
    switch (status) {
      case 400:
        return new ValidationError(data.message || 'Datos inválidos', data.errors, context);
      case 401:
        return new InvalidCredentialsError(data.message, context);
      case 403:
        return new InsufficientPermissionsError(data.message, data.requiredPermissions, context);
      case 404:
        return new InformeNotFoundError(data.message || 'Recurso no encontrado', context);
      case 408:
        return new NetworkTimeoutError(data.message, context);
      case 500:
        return new DatabaseError(data.message || 'Error interno del servidor', 'INTERNAL_SERVER_ERROR', context);
      default:
        return new BaseError(data.message || 'Error desconocido', `HTTP_${status}`, context);
    }
  }
}

// Registrar manejadores por defecto
ErrorHandler.register(NetworkError, (error) => ({
  message: 'Error de conexión. Verifique su conexión a internet.',
  code: error.code,
  retry: true
}));

ErrorHandler.register(ValidationError, (error) => ({
  message: error.message,
  code: error.code,
  errors: error.validationErrors
}));

ErrorHandler.register(AuthenticationError, (error) => ({
  message: 'Error de autenticación. Por favor, inicie sesión nuevamente.',
  code: error.code,
  redirect: '/login'
}));

// Exportar todas las clases de error
export {
  BaseError,
  InformeError,
  InformeGenerationError,
  InformeNotFoundError,
  InformeValidationError,
  PatientError,
  PatientNotFoundError,
  PatientValidationError,
  EvaluationError,
  EvaluationProcessingError,
  InvalidEvaluationDataError,
  DatabaseError,
  DatabaseConnectionError,
  DatabaseQueryError,
  AuthenticationError,
  InvalidCredentialsError,
  SessionExpiredError,
  AuthorizationError,
  InsufficientPermissionsError,
  NetworkError,
  NetworkTimeoutError,
  NetworkConnectionError,
  ValidationError,
  FileError,
  FileNotFoundError,
  InvalidFileFormatError,
  FileSizeExceededError,
  ErrorHandler
};

export default ErrorHandler;