/**
 * Servicio de logging para auditoría de accesos y acciones del sistema
 * Registra eventos importantes para seguridad y debugging
 */

class AuditLogger {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_AUDIT_LOGGING !== 'false';
    this.logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
    this.logs = [];
    this.maxLogs = 1000; // Máximo número de logs en memoria
  }

  /**
   * Niveles de log disponibles
   */
  static LEVELS = {
    ERROR: 'error',
    WARN: 'warn', 
    INFO: 'info',
    DEBUG: 'debug'
  };

  /**
   * Tipos de eventos de auditoría
   */
  static EVENT_TYPES = {
    // Autenticación
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    LOGOUT: 'logout',
    SESSION_EXPIRED: 'session_expired',
    
    // Autorización
    ACCESS_GRANTED: 'access_granted',
    ACCESS_DENIED: 'access_denied',
    ROLE_VERIFICATION: 'role_verification',
    
    // Navegación
    ROUTE_ACCESS: 'route_access',
    COMPONENT_ACCESS: 'component_access',
    
    // Acciones de usuario
    USER_ACTION: 'user_action',
    DATA_ACCESS: 'data_access',
    DATA_MODIFICATION: 'data_modification',
    
    // Errores
    ERROR: 'error',
    SECURITY_VIOLATION: 'security_violation'
  };

  /**
   * Crear entrada de log estructurada
   */
  createLogEntry(level, eventType, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      }
    };
  }

  /**
   * Obtener ID de sesión (simplificado para demo)
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Método principal de logging
   */
  log(level, eventType, message, metadata = {}) {
    if (!this.isEnabled) return;

    const logEntry = this.createLogEntry(level, eventType, message, metadata);
    
    // Agregar a logs en memoria
    this.logs.push(logEntry);
    
    // Mantener solo los últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log a consola con formato
    this.logToConsole(logEntry);

    // En producción, aquí enviarías a un servicio de logging
    if (import.meta.env.PROD) {
      this.sendToRemoteLogger(logEntry);
    }
  }

  /**
   * Log a consola con formato colorizado
   */
  logToConsole(logEntry) {
    const { level, eventType, message, metadata } = logEntry;
    const colors = {
      error: 'color: #ef4444; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      info: 'color: #3b82f6;',
      debug: 'color: #6b7280;'
    };

    console.log(
      `%c[AUDIT] ${level.toUpperCase()} - ${eventType}`,
      colors[level] || colors.info,
      message,
      metadata
    );
  }

  /**
   * Enviar logs a servicio remoto (placeholder)
   */
  async sendToRemoteLogger(logEntry) {
    try {
      // Aquí implementarías el envío a tu servicio de logging
      // Por ejemplo: Sentry, LogRocket, DataDog, etc.
      
      // Ejemplo con fetch a endpoint personalizado:
      // await fetch('/api/audit-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
      
    } catch (error) {
      console.error('Error enviando log de auditoría:', error);
    }
  }

  // Métodos de conveniencia para diferentes niveles
  error(eventType, message, metadata = {}) {
    this.log(AuditLogger.LEVELS.ERROR, eventType, message, metadata);
  }

  warn(eventType, message, metadata = {}) {
    this.log(AuditLogger.LEVELS.WARN, eventType, message, metadata);
  }

  info(eventType, message, metadata = {}) {
    this.log(AuditLogger.LEVELS.INFO, eventType, message, metadata);
  }

  debug(eventType, message, metadata = {}) {
    this.log(AuditLogger.LEVELS.DEBUG, eventType, message, metadata);
  }

  // Métodos específicos para eventos de auditoría
  logLogin(success, userEmail, userRole, metadata = {}) {
    const eventType = success ? 
      AuditLogger.EVENT_TYPES.LOGIN_SUCCESS : 
      AuditLogger.EVENT_TYPES.LOGIN_FAILED;
    
    const level = success ? 
      AuditLogger.LEVELS.INFO : 
      AuditLogger.LEVELS.WARN;

    this.log(level, eventType, `Login ${success ? 'exitoso' : 'fallido'} para ${userEmail}`, {
      userEmail,
      userRole,
      ...metadata
    });
  }

  logRouteAccess(route, allowed, userRole, requiredRoles = []) {
    const eventType = allowed ? 
      AuditLogger.EVENT_TYPES.ACCESS_GRANTED : 
      AuditLogger.EVENT_TYPES.ACCESS_DENIED;
    
    const level = allowed ? 
      AuditLogger.LEVELS.INFO : 
      AuditLogger.LEVELS.WARN;

    this.log(level, eventType, `Acceso a ruta ${route} ${allowed ? 'permitido' : 'denegado'}`, {
      route,
      userRole,
      requiredRoles,
      allowed
    });
  }

  logUserAction(action, details = {}) {
    this.info(AuditLogger.EVENT_TYPES.USER_ACTION, `Acción de usuario: ${action}`, details);
  }

  logSecurityViolation(violation, details = {}) {
    this.error(AuditLogger.EVENT_TYPES.SECURITY_VIOLATION, `Violación de seguridad: ${violation}`, details);
  }

  // Obtener logs para debugging
  getLogs(filterBy = {}) {
    let filteredLogs = [...this.logs];

    if (filterBy.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filterBy.level);
    }

    if (filterBy.eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === filterBy.eventType);
    }

    if (filterBy.since) {
      const sinceDate = new Date(filterBy.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
    this.info(AuditLogger.EVENT_TYPES.USER_ACTION, 'Logs de auditoría limpiados');
  }
}

// Instancia singleton
const auditLogger = new AuditLogger();

export default auditLogger;
export { AuditLogger };
