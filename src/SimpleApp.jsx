import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './context/SimpleAuthContext';
import SimpleHome from './pages/SimpleHome';
import TestApp from './TestApp';

// Componente de diagnóstico de Supabase
const SupabaseDiagnostic = () => {
  const [testResults, setTestResults] = React.useState({
    envVars: null,
    connection: null,
    loading: true
  });

  React.useEffect(() => {
    const runDiagnostics = async () => {
      // Test 1: Variables de entorno
      const envTest = {
        url: import.meta.env.VITE_SUPABASE_URL,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
        urlValid: import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co')
      };

      setTestResults(prev => ({ ...prev, envVars: envTest }));

      // Test 2: Conexión a Supabase
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });

        setTestResults(prev => ({
          ...prev,
          connection: {
            status: response.status,
            ok: response.ok,
            message: response.ok ? 'Conexión exitosa' : 'Error de conexión'
          },
          loading: false
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          connection: {
            status: 'Error',
            ok: false,
            message: error.message
          },
          loading: false
        }));
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">🔍 Diagnóstico de Supabase</h1>

          {/* Variables de entorno */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Variables de Entorno</h2>
            {testResults.envVars ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>URL de Supabase:</span>
                    <span className={testResults.envVars.urlValid ? 'text-green-600' : 'text-red-600'}>
                      {testResults.envVars.url || 'No configurada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clave anónima:</span>
                    <span className={testResults.envVars.key === 'Configurada' ? 'text-green-600' : 'text-red-600'}>
                      {testResults.envVars.key}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Cargando...</div>
            )}
          </div>

          {/* Test de conexión */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Test de Conexión</h2>
            {testResults.loading ? (
              <div className="text-gray-500">Probando conexión...</div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={testResults.connection.ok ? 'text-green-600' : 'text-red-600'}>
                      {testResults.connection.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mensaje:</span>
                    <span>{testResults.connection.message}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Soluciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Posibles Soluciones</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verifica que las variables de entorno estén correctas en el archivo .env</li>
              <li>• Asegúrate de que el proyecto de Supabase esté activo</li>
              <li>• Verifica tu conexión a internet</li>
              <li>• Revisa si hay restricciones de firewall</li>
              <li>• Considera usar la aplicación en modo offline</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reintentar Test
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de login simple
const SimpleLogin = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Simple</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="password"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Iniciar Sesión
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-2">
            <div><strong>Rutas disponibles:</strong></div>
            <div>• <a href="/" className="text-blue-600 hover:underline">/</a> - Inicio</div>
            <div>• <a href="/simple" className="text-blue-600 hover:underline">/simple</a> - Página simple</div>
            <div>• <a href="/test" className="text-blue-600 hover:underline">/test</a> - Test React</div>
            <div>• <a href="/login" className="text-blue-600 hover:underline">/login</a> - Esta página</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Aplicación simplificada para testing sin dependencias complejas
 */
function SimpleApp() {
  console.log('SimpleApp: Renderizando aplicación simplificada');

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SimpleAuthProvider>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/simple" element={<SimpleHome />} />
          <Route path="/test" element={<TestApp />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/diagnostic" element={<SupabaseDiagnostic />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Página No Encontrada
                </h1>
                <p className="text-gray-600 mb-6">
                  La ruta que buscas no existe.
                </p>
                <div className="space-x-4">
                  <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Ir al Inicio
                  </a>
                  <a href="/simple" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    Página Simple
                  </a>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </SimpleAuthProvider>
    </BrowserRouter>
  );
}

export default SimpleApp;
