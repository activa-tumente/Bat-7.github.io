// src/components/dashboard/AuthDiagnosticPanel.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { diagnosisAuth } from '../../utils/authDiagnostics';
import { FaUserShield, FaExclamationTriangle, FaCheck, FaTools } from 'react-icons/fa';

/**
 * Panel para mostrar información de diagnóstico de autenticación en el Dashboard
 */
const AuthDiagnosticPanel = () => {
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Ejecutar diagnóstico al montar el componente
  useEffect(() => {
    console.log('[AuthDiagnosticPanel] Montando componente, ejecutando diagnóstico');
    runDiagnostic();
  }, []);

  // Función para ejecutar el diagnóstico
  const runDiagnostic = async () => {
    try {
      console.log('[AuthDiagnosticPanel] Iniciando diagnóstico de autenticación');
      setLoading(true);
      const result = await diagnosisAuth();
      console.log('[AuthDiagnosticPanel] Resultado del diagnóstico:', result);
      setDiagnosticResult(result);
    } catch (error) {
      console.error('[AuthDiagnosticPanel] Error al ejecutar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determinar el estado de autenticación
  const authStatus = () => {
    if (!diagnosticResult) return 'unknown';

    // Si hay sesión en Supabase y datos en localStorage/sessionStorage
    if (diagnosticResult.session &&
        (diagnosticResult.storage.localStorage.user || diagnosticResult.storage.sessionStorage.user)) {
      return 'healthy';
    }

    // Si hay sesión en Supabase pero no hay datos en almacenamiento
    if (diagnosticResult.session &&
        !diagnosticResult.storage.localStorage.user &&
        !diagnosticResult.storage.sessionStorage.user) {
      return 'partial';
    }

    // Si no hay sesión en Supabase pero hay datos en almacenamiento
    if (!diagnosticResult.session &&
        (diagnosticResult.storage.localStorage.user || diagnosticResult.storage.sessionStorage.user)) {
      return 'inconsistent';
    }

    // Si no hay sesión en Supabase ni datos en almacenamiento
    return 'none';
  };

  // Obtener color según el estado de autenticación
  const getStatusColor = () => {
    switch (authStatus()) {
      case 'healthy': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'inconsistent': return 'bg-red-500';
      case 'none': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  // Obtener mensaje según el estado de autenticación
  const getStatusMessage = () => {
    switch (authStatus()) {
      case 'healthy': return 'Estado de autenticación correcto';
      case 'partial': return 'Sesión activa, pero podría haber problemas con datos locales';
      case 'inconsistent': return 'Inconsistencia en la autenticación (deberías cerrar sesión)';
      case 'none': return 'No hay sesión activa';
      default: return 'Verificando estado de autenticación...';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 px-4 py-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaUserShield className="mr-2 text-xl" />
            <h3 className="font-semibold text-lg">Estado de Autenticación</h3>
          </div>
          <div>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-1 mr-2"
              title="Actualizar diagnóstico"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/auth/troubleshooting')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-1"
              title="Herramienta de solución de problemas"
            >
              <FaTools className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="font-medium">{getStatusMessage()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Usuario actual</h4>
            <div className="text-sm">
              {isAuthenticated && user ? (
                <>
                  <p><span className="font-medium">Nombre:</span> {user.name || `${user.nombre || ''} ${user.apellido || ''}`}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Rol:</span> {user.role || user.tipo_usuario || 'No definido'}</p>
                  <p><span className="font-medium">ID:</span> {user.id ? user.id.substring(0, 8) + '...' : 'No disponible'}</p>
                </>
              ) : (
                <p className="text-red-500 flex items-center">
                  <FaExclamationTriangle className="mr-1" /> No hay usuario autenticado
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Estado de sesión</h4>
            <div className="text-sm">
              {diagnosticResult ? (
                <>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Supabase:</span>
                    {diagnosticResult.session ? (
                      <span className="text-green-500 flex items-center"><FaCheck className="mr-1" /> Activa</span>
                    ) : (
                      <span className="text-red-500 flex items-center"><FaExclamationTriangle className="mr-1" /> Inactiva</span>
                    )}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">LocalStorage:</span>
                    {diagnosticResult.storage.localStorage.user ? (
                      <span className="text-green-500 flex items-center"><FaCheck className="mr-1" /> Presente</span>
                    ) : (
                      <span className="text-red-500 flex items-center"><FaExclamationTriangle className="mr-1" /> No existe</span>
                    )}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">SessionStorage:</span>
                    {diagnosticResult.storage.sessionStorage.user ? (
                      <span className="text-green-500 flex items-center"><FaCheck className="mr-1" /> Presente</span>
                    ) : (
                      <span className="text-red-500 flex items-center"><FaExclamationTriangle className="mr-1" /> No existe</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Cargando información...</p>
              )}
            </div>
          </div>
        </div>

        {diagnosticResult && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              {expanded ? 'Ocultar detalles' : 'Mostrar detalles'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ml-1 transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded && (
              <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-64">
                <pre className="text-xs">{JSON.stringify(diagnosticResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDiagnosticPanel;
