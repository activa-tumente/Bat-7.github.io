import { toast } from 'react-toastify';

/**
 * Enhanced Error Handler Service
 * Provides centralized error handling with better categorization,
 * user-friendly messages, and logging capabilities
 */

// Error types for better categorization
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error class with enhanced properties
 */
export class AppError extends Error {
  constructor({
    message,
    type = ERROR_TYPES.UNKNOWN,
    severity = ERROR_SEVERITY.MEDIUM,
    code = null,
    details = null,
    userMessage = null,
    shouldLog = true,
    shouldNotify = true,
    retryable = false,
    originalError = null
  }) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.userMessage = userMessage || this.generateUserMessage();
    this.shouldLog = shouldLog;
    this.shouldNotify = shouldNotify;
    this.retryable = retryable;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.stack = originalError?.stack || this.stack;
  }

  generateUserMessage() {
    const userMessages = {
      [ERROR_TYPES.VALIDATION]: 'Por favor, verifique los datos ingresados.',
      [ERROR_TYPES.AUTHENTICATION]: 'Error de autenticación. Verifique sus credenciales.',
      [ERROR_TYPES.AUTHORIZATION]: 'No tiene permisos para realizar esta acción.',
      [ERROR_TYPES.NETWORK]: 'Error de conexión. Verifique su conexión a internet.',
      [ERROR_TYPES.SERVER]: 'Error del servidor. Intente nuevamente en unos momentos.',
      [ERROR_TYPES.CLIENT]: 'Error en la aplicación. Recargue la página.',
      [ERROR_TYPES.UNKNOWN]: 'Ha ocurrido un error inesperado.'
    };

    return userMessages[this.type] || userMessages[ERROR_TYPES.UNKNOWN];
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      details: this.details,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }

  /**
   * Main error handling method
   */
  handle(error, context = {}) {
    const appError = this.normalizeError(error, context);
    
    if (appError.shouldLog) {
      this.logError(appError, context);
    }

    if (appError.shouldNotify) {
      this.notifyUser(appError);
    }

    return appError;
  }

  /**
   * Convert any error to AppError
   */
  normalizeError(error, context = {}) {
    if (error instanceof AppError) {
      return error;
    }

    // Handle different error types
    if (error?.response) {
      // HTTP errors (Axios, fetch)
      return this.handleHttpError(error, context);
    }

    if (error?.code) {
      // Supabase or other service errors
      return this.handleServiceError(error, context);
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network errors
      return new AppError({
        message: error.message,
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Error de conexión. Verifique su conexión a internet.',
        retryable: true,
        originalError: error
      });
    }

    // Generic error
    return new AppError({
      message: error.message || 'Error desconocido',
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      originalError: error
    });
  }

  /**
   * Handle HTTP errors
   */
  handleHttpError(error, context = {}) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    const errorMap = {
      400: {
        type: ERROR_TYPES.VALIDATION,
        severity: ERROR_SEVERITY.LOW,
        userMessage: 'Datos inválidos. Verifique la información ingresada.'
      },
      401: {
        type: ERROR_TYPES.AUTHENTICATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
      },
      403: {
        type: ERROR_TYPES.AUTHORIZATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'No tiene permisos para realizar esta acción.'
      },
      404: {
        type: ERROR_TYPES.CLIENT,
        severity: ERROR_SEVERITY.LOW,
        userMessage: 'Recurso no encontrado.'
      },
      422: {
        type: ERROR_TYPES.VALIDATION,
        severity: ERROR_SEVERITY.LOW,
        userMessage: 'Datos inválidos. Verifique la información ingresada.'
      },
      429: {
        type: ERROR_TYPES.SERVER,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Demasiadas solicitudes. Intente nuevamente en unos momentos.',
        retryable: true
      },
      500: {
        type: ERROR_TYPES.SERVER,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Error del servidor. Intente nuevamente en unos momentos.',
        retryable: true
      },
      502: {
        type: ERROR_TYPES.SERVER,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Servicio temporalmente no disponible.',
        retryable: true
      },
      503: {
        type: ERROR_TYPES.SERVER,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Servicio temporalmente no disponible.',
        retryable: true
      }
    };

    const errorConfig = errorMap[status] || {
      type: ERROR_TYPES.SERVER,
      severity: ERROR_SEVERITY.MEDIUM,
      userMessage: 'Error del servidor. Intente nuevamente.'
    };

    return new AppError({
      message: data?.message || error.message || `HTTP ${status} Error`,
      code: status,
      details: data,
      originalError: error,
      ...errorConfig
    });
  }

  /**
   * Handle service-specific errors (Supabase, etc.)
   */
  handleServiceError(error, context = {}) {
    const supabaseErrorMap = {
      'PGRST116': {
        type: ERROR_TYPES.VALIDATION,
        userMessage: 'Datos inválidos o faltantes.'
      },
      'PGRST301': {
        type: ERROR_TYPES.AUTHORIZATION,
        userMessage: 'No tiene permisos para acceder a este recurso.'
      },
      '23505': {
        type: ERROR_TYPES.VALIDATION,
        userMessage: 'Ya existe un registro con estos datos.'
      },
      '23503': {
        type: ERROR_TYPES.VALIDATION,
        userMessage: 'Referencia inválida en los datos.'
      },
      'invalid_credentials': {
        type: ERROR_TYPES.AUTHENTICATION,
        userMessage: 'Credenciales inválidas.'
      },
      'email_not_confirmed': {
        type: ERROR_TYPES.AUTHENTICATION,
        userMessage: 'Email no confirmado. Verifique su correo electrónico.'
      },
      'signup_disabled': {
        type: ERROR_TYPES.AUTHORIZATION,
        userMessage: 'Registro de usuarios deshabilitado.'
      }
    };

    const errorConfig = supabaseErrorMap[error.code] || {
      type: ERROR_TYPES.SERVER,
      userMessage: 'Error del servicio. Intente nuevamente.'
    };

    return new AppError({
      message: error.message || 'Service error',
      code: error.code,
      details: error.details,
      originalError: error,
      ...errorConfig
    });
  }

  /**
   * Log error for debugging and monitoring
   */
  logError(error, context = {}) {
    const logEntry = {
      ...error.toJSON(),
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Add to local log
    this.errorLog.unshift(logEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Console logging based on severity
    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
      case ERROR_SEVERITY.HIGH:
        console.error('🚨 Error:', logEntry);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('⚠️ Warning:', logEntry);
        break;
      case ERROR_SEVERITY.LOW:
        console.info('ℹ️ Info:', logEntry);
        break;
      default:
        console.log('📝 Log:', logEntry);
    }

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === 'production' && error.severity !== ERROR_SEVERITY.LOW) {
      this.sendToMonitoring(logEntry);
    }
  }

  /**
   * Notify user with appropriate toast
   */
  notifyUser(error) {
    const toastConfig = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    };

    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
      case ERROR_SEVERITY.HIGH:
        toast.error(error.userMessage, {
          ...toastConfig,
          autoClose: 8000
        });
        break;
      case ERROR_SEVERITY.MEDIUM:
        toast.warning(error.userMessage, toastConfig);
        break;
      case ERROR_SEVERITY.LOW:
        toast.info(error.userMessage, {
          ...toastConfig,
          autoClose: 3000
        });
        break;
      default:
        toast(error.userMessage, toastConfig);
    }
  }

  /**
   * Show success message
   */
  showSuccess(message, options = {}) {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  /**
   * Show info message
   */
  showInfo(message, options = {}) {
    toast.info(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }

  /**
   * Retry mechanism for retryable errors
   */
  async retry(operation, errorKey, maxRetries = this.maxRetries) {
    const attempts = this.retryAttempts.get(errorKey) || 0;
    
    if (attempts >= maxRetries) {
      this.retryAttempts.delete(errorKey);
      throw new AppError({
        message: 'Maximum retry attempts exceeded',
        type: ERROR_TYPES.CLIENT,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Operación fallida después de varios intentos.'
      });
    }

    try {
      const result = await operation();
      this.retryAttempts.delete(errorKey);
      return result;
    } catch (error) {
      this.retryAttempts.set(errorKey, attempts + 1);
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      throw error;
    }
  }

  /**
   * Send error to external monitoring service
   */
  async sendToMonitoring(logEntry) {
    try {
      // Implement your monitoring service integration here
      // Examples: Sentry, LogRocket, Bugsnag, etc.
      console.log('📊 Sending to monitoring:', logEntry);
    } catch (error) {
      console.error('Failed to send error to monitoring:', error);
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.retryAttempts.clear();
  }

  /**
   * Create error boundary handler
   */
  createErrorBoundaryHandler() {
    return (error, errorInfo) => {
      const appError = new AppError({
        message: error.message,
        type: ERROR_TYPES.CLIENT,
        severity: ERROR_SEVERITY.HIGH,
        details: errorInfo,
        userMessage: 'Ha ocurrido un error en la aplicación. La página se recargará automáticamente.',
        originalError: error
      });

      this.handle(appError, { errorBoundary: true });
      
      // Auto-reload after error boundary catch
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context) => errorHandler.handle(error, context);
export const showSuccess = (message, options) => errorHandler.showSuccess(message, options);
export const showInfo = (message, options) => errorHandler.showInfo(message, options);
export const retryOperation = (operation, key, maxRetries) => errorHandler.retry(operation, key, maxRetries);
export const createErrorBoundaryHandler = () => errorHandler.createErrorBoundaryHandler();
export const getErrorLog = () => errorHandler.getErrorLog();
export const clearErrorLog = () => errorHandler.clearErrorLog();

export default errorHandler;