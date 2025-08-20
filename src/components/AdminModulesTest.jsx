/**
 * Componente de prueba para verificar los módulos de administración
 */

import React, { useState } from 'react';
import { verifyAdminModules, quickVerify } from '../utils/verifyAdminModules';

const AdminModulesTest = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFullVerification = async () => {
    setLoading(true);
    try {
      const verificationResults = await verifyAdminModules();
      setResults(verificationResults);
    } catch (error) {
      console.error('Error en verificación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerification = async () => {
    setLoading(true);
    try {
      const isWorking = await quickVerify();
      setResults({
        quick: true,
        working: isWorking,
        overall: isWorking ? 'good' : 'poor'
      });
    } catch (error) {
      console.error('Error en verificación rápida:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallColor = (overall) => {
    switch (overall) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🔧 Verificación de Módulos de Administración
        </h2>

        <div className="space-y-4 mb-6">
          <button
            onClick={handleQuickVerification}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            ⚡ Verificación Rápida
          </button>

          <button
            onClick={handleFullVerification}
            disabled={loading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            🔍 Verificación Completa
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Verificando...</span>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-6">
            {/* Estado general */}
            <div className={`p-4 rounded-lg ${getOverallColor(results.overall)}`}>
              <h3 className="font-medium">
                Estado General: {
                  results.overall === 'excellent' ? '🟢 EXCELENTE' :
                  results.overall === 'good' ? '🟡 BUENO' :
                  results.overall === 'poor' ? '🔴 PROBLEMAS' : '⚪ DESCONOCIDO'
                }
              </h3>
              {results.quick && (
                <p className="text-sm mt-1">
                  {results.working ? 
                    'Los módulos básicos están funcionando correctamente.' :
                    'Los módulos básicos no están funcionando. Revise la instalación.'
                  }
                </p>
              )}
            </div>

            {/* Resultados detallados */}
            {!results.quick && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tablas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">📋 Tablas</h4>
                  <div className="space-y-2">
                    {Object.entries(results.tables || {}).map(([table, result]) => (
                      <div key={table} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{table}</span>
                        <span className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.status === 'success' ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funciones */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">⚙️ Funciones</h4>
                  <div className="space-y-2">
                    {Object.entries(results.functions || {}).map(([func, result]) => (
                      <div key={func} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{func}</span>
                        <span className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.status === 'success' ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permisos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🔐 Permisos</h4>
                  <div className="space-y-2">
                    {Object.entries(results.permissions || {}).map(([perm, result]) => (
                      <div key={perm} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{perm}</span>
                        <span className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.status === 'success' ? '✅' : '❌'}
                          {result.count && (
                            <span className="ml-1 text-xs">({result.count})</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Instrucciones */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📝 Próximos Pasos</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {results.overall === 'excellent' ? (
                  <>
                    <p>✅ Los módulos están listos para usar</p>
                    <p>• Puedes acceder a la página de configuración</p>
                    <p>• Todos los paneles de administración están disponibles</p>
                  </>
                ) : results.overall === 'good' ? (
                  <>
                    <p>⚠️ Los módulos funcionan con algunos problemas menores</p>
                    <p>• Revisa los elementos marcados con ❌</p>
                    <p>• La funcionalidad básica debería estar disponible</p>
                  </>
                ) : (
                  <>
                    <p>🔴 Los módulos requieren atención</p>
                    <p>• Verifica que los scripts SQL se ejecutaron correctamente</p>
                    <p>• Revisa la conexión a Supabase</p>
                    <p>• Consulta la consola para más detalles</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Este componente verifica que los módulos de administración estén instalados correctamente</p>
            <p>• La verificación rápida solo comprueba la conectividad básica</p>
            <p>• La verificación completa prueba todas las tablas, funciones y permisos</p>
            <p>• Revisa la consola del navegador para más detalles sobre los errores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModulesTest;
