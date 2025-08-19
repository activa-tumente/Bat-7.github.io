import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaDatabase } from 'react-icons/fa';

/**
 * Página de inicio simple para testing sin autenticación
 */
const SimpleHome = () => {
  const [status, setStatus] = useState('loading');
  const [info, setInfo] = useState({});

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verificar variables de entorno
        const envCheck = {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
          nodeEnv: import.meta.env.NODE_ENV,
          dev: import.meta.env.DEV
        };

        setInfo({
          env: envCheck,
          timestamp: new Date().toISOString(),
          url: window.location.href
        });

        setStatus('success');
      } catch (error) {
        console.error('Error en verificación:', error);
        setStatus('error');
        setInfo({ error: error.message });
      }
    };

    checkStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-8 w-8 text-red-500" />;
      default:
        return <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center">
              <FaDatabase className="h-8 w-8 mr-4" />
              <div>
                <h1 className="text-2xl font-bold">BAT-7 Sistema de Evaluación</h1>
                <p className="text-blue-100 mt-1">
                  Verificación del estado del sistema
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Estado principal */}
            <div className={`p-4 rounded-lg border-2 ${getStatusColor()} mb-6`}>
              <div className="flex items-center">
                <div className="mr-4">
                  {getStatusIcon()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Estado del Sistema: {status === 'loading' ? 'Verificando...' : status === 'success' ? 'Funcionando' : 'Error'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {status === 'loading' && 'Verificando configuración...'}
                    {status === 'success' && 'La aplicación React está funcionando correctamente'}
                    {status === 'error' && 'Se encontraron problemas en la configuración'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del sistema */}
            {status !== 'loading' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Información del Sistema</h3>
                
                {/* Variables de entorno */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Variables de Entorno</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Supabase URL:</strong> {info.env?.supabaseUrl || 'No configurada'}</div>
                    <div><strong>Supabase Key:</strong> {info.env?.supabaseKey || 'No configurada'}</div>
                    <div><strong>Entorno:</strong> {info.env?.nodeEnv || 'Desconocido'}</div>
                    <div><strong>Desarrollo:</strong> {info.env?.dev ? 'Sí' : 'No'}</div>
                  </div>
                </div>

                {/* Información de la sesión */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Información de la Sesión</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>URL Actual:</strong> {info.url}</div>
                    <div><strong>Timestamp:</strong> {info.timestamp}</div>
                    <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</div>
                  </div>
                </div>

                {/* Errores */}
                {info.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Error</h4>
                    <div className="text-sm text-red-700">
                      {info.error}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                Recargar Página
              </button>
              
              <button
                onClick={() => {
                  console.log('System Info:', info);
                  alert('Información del sistema enviada a la consola');
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
              >
                Log a Consola
              </button>

              <a
                href="/login"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
              >
                Ir a Login
              </a>

              <a
                href="/diagnostic"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
              >
                Diagnóstico Supabase
              </a>

              <button
                onClick={() => {
                  // Probar navegación a diferentes rutas
                  const routes = ['/login', '/simple', '/test', '/diagnostic'];
                  routes.forEach(route => {
                    console.log(`Ruta disponible: ${window.location.origin}${route}`);
                  });
                  alert('Rutas disponibles enviadas a la consola');
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
              >
                Ver Rutas
              </button>
            </div>

            {/* Información del proyecto */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">🎯 Proyecto BAT-7 - Sistema de Evaluación de Aptitudes</h4>
              <div className="text-sm text-green-700 space-y-2">
                <div><strong>Funcionalidades principales:</strong></div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Evaluaciones de aptitud verbal y numérica</li>
                  <li>Gestión de candidatos y psicólogos</li>
                  <li>Generación de informes psicométricos</li>
                  <li>Dashboard administrativo</li>
                  <li>Sistema de roles (Administrador, Psicólogo, Candidato)</li>
                </ul>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Próximos Pasos</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. ✅ React está funcionando correctamente</li>
                <li>2. ✅ Variables de entorno configuradas</li>
                <li>3. 🔄 Configura la base de datos en Supabase</li>
                <li>4. 🔄 Prueba el login con diferentes roles</li>
                <li>5. 🔄 Verifica las evaluaciones de aptitudes</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
