import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug } from 'react-icons/fa';
import auditLogger from '../../services/auditLogger';

/**
 * Componente de Error Boundary personalizado
 * Captura errores de JavaScript y muestra una UI de fallback amigable
 */

// Componente de fallback para errores
const ErrorFallback = ({ error, resetErrorBoundary, resetKeys }) => {
  const isDevelopment = import.meta.env.DEV;

  // Log del error para auditoría
  React.useEffect(() => {
    auditLogger.error('error_boundary_triggered', 'Error capturado por Error Boundary', {
      errorMessage: error.message,
      errorStack: error.stack,
      resetKeys,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, [error, resetKeys]);

  const handleReportError = () => {
    // Implementar reporte de errores a servicio externo
    const errorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'anonymous'
    };

    console.log('Reportando error:', errorReport);
    
    // Aquí enviarías el error a tu servicio de monitoreo
    // Por ejemplo: Sentry, LogRocket, Bugsnag, etc.
    
    auditLogger.logUserAction('error_reported', {
      errorId: `error_${Date.now()}`,
      errorMessage: error.message
    });
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icono de error */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <FaExclamationTriangle className="h-8 w-8 text-red-600" />
          </div>

          {/* Título y mensaje */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Oops! Algo salió mal
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado 
            y está trabajando para solucionarlo.
          </p>

          {/* Detalles del error en desarrollo */}
          {isDevelopment && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                <FaBug className="h-4 w-4 mr-2" />
                Detalles del error (solo en desarrollo)
              </h3>
              <div className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded overflow-auto max-h-32">
                <div className="font-semibold mb-1">Mensaje:</div>
                <div className="mb-2">{error.message}</div>
                <div className="font-semibold mb-1">Stack trace:</div>
                <div className="whitespace-pre-wrap">{error.stack}</div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={resetErrorBoundary}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
            >
              <FaRedo className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              <FaHome className="h-4 w-4 mr-2" />
              Ir al inicio
            </button>

            <button
              onClick={handleReportError}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <FaBug className="h-4 w-4 mr-2" />
              Reportar este error
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Si el problema persiste, contacta a soporte técnico.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Error ID: {`error_${Date.now()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Error Boundary principal
const ErrorBoundary = ({ 
  children, 
  fallback: CustomFallback,
  onError,
  resetKeys = [],
  resetOnPropsChange = true,
  isolate = false 
}) => {
  const handleError = (error, errorInfo) => {
    // Log del error
    console.error('Error Boundary capturó un error:', error, errorInfo);
    
    // Callback personalizado
    if (onError) {
      onError(error, errorInfo);
    }

    // Log de auditoría
    auditLogger.error('javascript_error', 'Error de JavaScript capturado', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
      url: window.location.href
    });
  };

  const handleReset = (details) => {
    auditLogger.info('error_boundary_reset', 'Error Boundary fue reiniciado', {
      reason: details.reason,
      args: details.args
    });
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={CustomFallback || ErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
      isolate={isolate}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Error Boundary específico para formularios
export const FormErrorBoundary = ({ children, formName }) => {
  const FormErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error en el formulario
          </h3>
          <p className="text-sm text-red-700 mt-1">
            Ha ocurrido un error al procesar el formulario. Por favor, intenta de nuevo.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={resetErrorBoundary}
          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={FormErrorFallback}
      onError={(error, errorInfo) => {
        auditLogger.error('form_error', `Error en formulario: ${formName}`, {
          formName,
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error Boundary específico para componentes de datos
export const DataErrorBoundary = ({ children, dataSource }) => {
  const DataErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center">
        <FaExclamationTriangle className="h-5 w-5 text-yellow-600 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Error cargando datos
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            No se pudieron cargar los datos. Verifica tu conexión e intenta de nuevo.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={resetErrorBoundary}
          className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={DataErrorFallback}
      onError={(error, errorInfo) => {
        auditLogger.error('data_loading_error', `Error cargando datos: ${dataSource}`, {
          dataSource,
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error Boundary específico para rutas
export const RouteErrorBoundary = ({ children, routePath }) => {
  const RouteErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <FaExclamationTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error en la página
        </h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error al cargar esta página.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={RouteErrorFallback}
      onError={(error, errorInfo) => {
        auditLogger.error('route_error', `Error en ruta: ${routePath}`, {
          routePath,
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
