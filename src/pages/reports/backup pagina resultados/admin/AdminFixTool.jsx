import React, { useState, useEffect } from 'react';
import { fixModalIssues } from '../../utils/modalUtils';

// Usamos un import condicional para evitar errores si no está disponible
const applyAllFixes = async () => {
  try {
    // Intentar importar dinámicamente
    const fixes = await import('../../fixes');
    if (fixes && typeof fixes.applyAllFixes === 'function') {
      return fixes.applyAllFixes();
    } else {
      throw new Error('Módulo de correcciones no disponible');
    }
  } catch (error) {
    console.error('Error al cargar módulo de correcciones:', error);
    // Aplicar correcciones básicas directamente
    return manualFixes();
  }
};

// Implementación de correcciones manuales como fallback
const manualFixes = async () => {
  console.log('Aplicando correcciones manualmente...');

  // 1. Asegurar que existe el elemento modal-root
  if (!document.getElementById('modal-root')) {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
    console.log('Elemento modal-root creado manualmente.');
  }

  return {
    success: true,
    message: 'Correcciones básicas aplicadas manualmente',
    details: {
      modalRoot: true,
      reactDOM: false,
      tables: { success: false, message: 'No verificado' }
    }
  };
};

/**
 * Herramienta para aplicar correcciones en el panel de administración
 */
const AdminFixTool = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // Capturar logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = function(...args) {
      originalConsoleLog.apply(console, args);
      setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
    };

    console.error = function(...args) {
      originalConsoleError.apply(console, args);
      setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
    };

    console.warn = function(...args) {
      originalConsoleWarn.apply(console, args);
      setLogs(prev => [...prev, { type: 'warning', message: args.join(' ') }]);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Diagnóstico inicial al montar
  useEffect(() => {
    // Crear elemento modal-root si no existe
    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
      console.log('Elemento modal-root creado al iniciar AdminFixTool.');
    }
  }, []);

  // Función para aplicar todas las correcciones
  const handleApplyFixes = async () => {
    setIsFixing(true);
    setLogs([]);

    try {
      console.log('Iniciando aplicación de correcciones...');
      const fixResult = await applyAllFixes();
      setResult(fixResult);

      if (fixResult.success) {
        console.log('Correcciones aplicadas exitosamente.');
      } else {
        console.error('Error al aplicar correcciones:', fixResult.message);
      }
    } catch (error) {
      console.error('Error inesperado al aplicar correcciones:', error);
      setResult({
        success: false,
        message: 'Error inesperado',
        details: error.message || 'Error desconocido'
      });
    } finally {
      setIsFixing(false);
    }
  };

  // Función para corregir solo los modales
  const handleFixModals = () => {
    try {
      console.log('Aplicando correcciones a modales...');

      // Usar la utilidad de corrección de modales
      const result = fixModalIssues();

      // Actualizar el estado con el resultado
      setResult({
        success: result.success,
        message: result.message,
        details: result.details
      });

      console.log('Correcciones de modales completadas.');
    } catch (error) {
      console.error('Error al aplicar correcciones de modales:', error);
      setResult({
        success: false,
        message: 'Error al aplicar correcciones de modales',
        details: error.message || 'Error desconocido'
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Herramienta de corrección
        </h2>
        {result && (
          <div className={`flex items-center ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{result.success ? 'Corrección exitosa' : 'Error'}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Esta herramienta corrige problemas comunes en el panel de administración, como modales que no funcionan
          o problemas de conexión con Supabase.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={handleApplyFixes}
            disabled={isFixing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isFixing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Aplicando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Aplicar todas las correcciones
              </>
            )}
          </button>

          <button
            onClick={handleFixModals}
            disabled={isFixing}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Corregir solo modales
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </h3>

            {result.details && (
              <div className="mt-2 text-sm">
                <ul className="list-disc list-inside">
                  {Object.entries(result.details).map(([key, value]) => (
                    <li key={key} className="text-gray-700">
                      <span className="font-medium">{key}:</span> {
                        typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showLogs ? 'Ocultar logs' : 'Mostrar logs'}
          </button>

          {showLogs && logs.length > 0 && (
            <div className="mt-2 p-4 bg-gray-800 text-gray-200 rounded-md max-h-60 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}
                >
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFixTool;
