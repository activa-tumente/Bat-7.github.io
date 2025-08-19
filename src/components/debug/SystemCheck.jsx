import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import { checkIcons } from '../../utils/iconCheck';
import auditLogger from '../../services/auditLogger';

/**
 * Componente de verificación del sistema
 * Útil para debugging y verificar que todo funciona correctamente
 */
const SystemCheck = () => {
  const [checks, setChecks] = useState({
    icons: { status: 'checking', message: 'Verificando iconos...' },
    auditLogger: { status: 'checking', message: 'Verificando audit logger...' },
    localStorage: { status: 'checking', message: 'Verificando localStorage...' },
    environment: { status: 'checking', message: 'Verificando entorno...' }
  });

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    // Check iconos
    try {
      const iconReport = checkIcons();
      setChecks(prev => ({
        ...prev,
        icons: {
          status: iconReport.errorCount === 0 ? 'success' : 'error',
          message: iconReport.errorCount === 0 
            ? `✅ ${iconReport.successCount} iconos cargados correctamente`
            : `❌ ${iconReport.errorCount} errores en iconos`,
          details: iconReport
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        icons: {
          status: 'error',
          message: `❌ Error verificando iconos: ${error.message}`
        }
      }));
    }

    // Check audit logger
    try {
      auditLogger.info('system_check', 'Testing audit logger');
      const stats = auditLogger.getStats();
      setChecks(prev => ({
        ...prev,
        auditLogger: {
          status: 'success',
          message: `✅ Audit logger funcionando (${stats.total} logs)`,
          details: stats
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        auditLogger: {
          status: 'error',
          message: `❌ Error en audit logger: ${error.message}`
        }
      }));
    }

    // Check localStorage
    try {
      const testKey = 'system_check_test';
      const testValue = 'test_value';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      setChecks(prev => ({
        ...prev,
        localStorage: {
          status: retrieved === testValue ? 'success' : 'error',
          message: retrieved === testValue 
            ? '✅ localStorage funcionando correctamente'
            : '❌ localStorage no funciona correctamente'
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        localStorage: {
          status: 'error',
          message: `❌ Error en localStorage: ${error.message}`
        }
      }));
    }

    // Check environment
    try {
      const env = {
        NODE_ENV: import.meta.env.NODE_ENV,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        BASE_URL: import.meta.env.BASE_URL,
        MODE: import.meta.env.MODE
      };

      setChecks(prev => ({
        ...prev,
        environment: {
          status: 'success',
          message: `✅ Entorno: ${env.MODE} (${env.NODE_ENV})`,
          details: env
        }
      }));
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        environment: {
          status: 'error',
          message: `❌ Error verificando entorno: ${error.message}`
        }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      case 'checking':
      default:
        return <FaCog className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'checking':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const allChecksComplete = Object.values(checks).every(check => check.status !== 'checking');
  const hasErrors = Object.values(checks).some(check => check.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Verificación del Sistema</h1>
          <p className="text-blue-100">
            Estado de los componentes principales del sistema BAT-7
          </p>
        </div>

        <div className="p-6">
          {/* Resumen */}
          {allChecksComplete && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              hasErrors ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center">
                {hasErrors ? (
                  <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-3" />
                ) : (
                  <FaCheckCircle className="h-6 w-6 text-green-500 mr-3" />
                )}
                <div>
                  <h3 className={`font-semibold ${hasErrors ? 'text-red-800' : 'text-green-800'}`}>
                    {hasErrors ? 'Se encontraron problemas' : 'Sistema funcionando correctamente'}
                  </h3>
                  <p className={`text-sm ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>
                    {hasErrors 
                      ? 'Revisa los errores a continuación y corrige los problemas encontrados.'
                      : 'Todos los componentes del sistema están funcionando correctamente.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checks individuales */}
          <div className="space-y-4">
            {Object.entries(checks).map(([key, check]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {check.message}
                    </p>
                    
                    {/* Detalles adicionales */}
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                          Ver detalles
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={runSystemChecks}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            >
              <FaCog className="h-4 w-4 mr-2" />
              Ejecutar verificación nuevamente
            </button>

            <div className="text-sm text-gray-500">
              Última verificación: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemCheck;
