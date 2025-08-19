import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../api/supabaseClient';

/**
 * Contexto de autenticación seguro que maneja errores de conexión
 */
const SafeAuthContext = createContext();

export const SafeAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initialized) return;

    const initializeAuth = async () => {
      try {
        console.log('SafeAuthContext: Inicializando autenticación...');

        // La librería de Supabase maneja sus propios timeouts.
        // Simplificamos para obtener un error más descriptivo si algo falla.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error obteniendo sesión:', error);
          setConnectionError(true);
          setErrorDetails({
            name: error.name,
            message: error.message,
            code: error.code || 'UNKNOWN'
          });
          setLoading(false);
          return;
        }

        console.log('SafeAuthContext: Sesión obtenida:', !!session);
        setSession(session);

        if (session?.user) {
          // Intentar obtener perfil con manejo de errores
          try {
            const { data: profile, error: profileError } = await supabase
              .from('usuarios')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();

            if (profileError) {
              console.warn('No se encontró perfil, usando datos básicos:', profileError);
              // Usuario autenticado pero sin perfil en BD
              setUser({
                ...session.user,
                tipo_usuario: 'candidato',
                nombre: session.user.user_metadata?.nombre || 'Usuario',
                apellido: session.user.user_metadata?.apellido || '',
                email: session.user.email
              });
            } else {
              console.log('Perfil encontrado:', profile);
              setUser({
                ...session.user,
                ...profile
              });
            }
          } catch (profileError) {
            console.error('Error obteniendo perfil:', profileError);
            // Fallback a usuario básico
            setUser({
              ...session.user,
              tipo_usuario: 'candidato',
              nombre: session.user.user_metadata?.nombre || 'Usuario',
              apellido: session.user.user_metadata?.apellido || '',
              email: session.user.email
            });
          }
        }

        // Configurar listener de cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('SafeAuthContext: Auth state changed:', event);
            setSession(session);
            
            if (session?.user) {
              // Simplificar: usar solo datos de sesión
              setUser({
                ...session.user,
                tipo_usuario: 'candidato',
                nombre: session.user.user_metadata?.nombre || 'Usuario',
                apellido: session.user.user_metadata?.apellido || '',
                email: session.user.email
              });
            } else {
              setUser(null);
            }
          }
        );

        setLoading(false);
        setInitialized(true);
        console.log('SafeAuthContext: Inicialización completada');

        return () => {
          subscription?.unsubscribe();
        };

      } catch (error) {
        console.error('SafeAuthContext: Error en inicialización:', error);
        console.error('Tipo de error:', error.name);
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
        setConnectionError(true);
        setErrorDetails({
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    connectionError,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.tipo_usuario || null,
    isAdmin: user?.tipo_usuario === 'administrador',
    isPsicologo: user?.tipo_usuario === 'psicologo',
    isCandidato: user?.tipo_usuario === 'candidato'
  };

  // Mostrar error de conexión si es necesario
  if (connectionError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-red-600 mb-4">
              Error de Conexión con Supabase
            </h1>
            <p className="text-gray-600">
              No se pudo establecer conexión con el servidor de autenticación.
            </p>
          </div>

          {/* Detalles del error */}
          {errorDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Detalles del Error:</h3>
              <div className="text-sm space-y-1">
                <div><strong>Tipo:</strong> {errorDetails.name}</div>
                <div><strong>Mensaje:</strong> {errorDetails.message}</div>
                {errorDetails.code && <div><strong>Código:</strong> {errorDetails.code}</div>}
              </div>
            </div>
          )}

          {/* Posibles soluciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Posibles Soluciones:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verifica tu conexión a internet</li>
              <li>• Asegúrate de que el proyecto de Supabase esté activo</li>
              <li>• Revisa las variables de entorno (.env)</li>
              <li>• Verifica si hay restricciones de firewall</li>
              <li>• Comprueba el estado de Supabase en status.supabase.com</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
            <a
              href="/simple"
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Modo Offline
            </a>
            <a
              href="https://status.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Estado de Supabase
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SafeAuthContext.Provider value={value}>
      {children}
    </SafeAuthContext.Provider>
  );
};

export const useSafeAuth = () => {
  const context = useContext(SafeAuthContext);
  if (!context) {
    throw new Error('useSafeAuth debe usarse dentro de SafeAuthProvider');
  }
  return context;
};

export default SafeAuthContext;
