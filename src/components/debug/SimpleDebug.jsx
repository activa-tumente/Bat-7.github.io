import React, { useState, useEffect } from 'react';

/**
 * Componente simple de debug para verificar qué está pasando
 */
const SimpleDebug = () => {
  const [info, setInfo] = useState({
    env: {},
    errors: [],
    status: 'loading'
  });

  useEffect(() => {
    try {
      const envInfo = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[DEFINIDA]' : '[NO DEFINIDA]',
        NODE_ENV: import.meta.env.NODE_ENV,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
      };

      setInfo({
        env: envInfo,
        errors: [],
        status: 'success'
      });
    } catch (error) {
      setInfo({
        env: {},
        errors: [error.message],
        status: 'error'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">🔍 Debug de la Aplicación</h1>
          
          <div className="space-y-6">
            {/* Estado */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Estado:</h2>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                info.status === 'success' ? 'bg-green-100 text-green-800' :
                info.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {info.status}
              </div>
            </div>

            {/* Variables de entorno */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Variables de Entorno:</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm">
                  {JSON.stringify(info.env, null, 2)}
                </pre>
              </div>
            </div>

            {/* Errores */}
            {info.errors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-red-600">Errores:</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  {info.errors.map((error, index) => (
                    <div key={index} className="text-red-700 text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información del navegador */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Información del Navegador:</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                <div><strong>URL:</strong> {window.location.href}</div>
                <div><strong>Protocolo:</strong> {window.location.protocol}</div>
                <div><strong>Host:</strong> {window.location.host}</div>
              </div>
            </div>

            {/* Prueba de React */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Prueba de React:</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-700">
                  ✅ React está funcionando correctamente
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Timestamp: {new Date().toISOString()}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Acciones:</h2>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Recargar Página
                </button>
                <button
                  onClick={() => {
                    console.log('Debug info:', info);
                    alert('Información enviada a la consola');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Log a Consola
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDebug;
