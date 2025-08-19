import React, { createContext, useState, useEffect, useContext } from 'react';

/**
 * Contexto de autenticación simplificado para debugging
 * Sin dependencias de Supabase para identificar problemas
 */
const SimpleAuthContext = createContext();

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Cambiado a false para evitar loading infinito
  const [error, setError] = useState(null);

  // Simular usuario para testing
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    nombre: 'Usuario',
    apellido: 'Prueba',
    tipo_usuario: 'candidato'
  };

  useEffect(() => {
    console.log('SimpleAuthContext: Inicializando...');
    
    // Simular verificación de sesión
    setTimeout(() => {
      console.log('SimpleAuthContext: Verificación completada');
      setLoading(false);
      // Descomenta la siguiente línea para simular usuario logueado
      // setUser(mockUser);
    }, 100);
  }, []);

  const login = async (email, password) => {
    console.log('SimpleAuthContext: Intentando login con:', email);
    setLoading(true);
    setError(null);

    try {
      // Simular login exitoso
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
        console.log('SimpleAuthContext: Login exitoso');
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('SimpleAuthContext: Error en login:', err);
    }
  };

  const logout = async () => {
    console.log('SimpleAuthContext: Cerrando sesión');
    setUser(null);
    setLoading(false);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    userRole: user?.tipo_usuario || null,
    isAdmin: user?.tipo_usuario === 'administrador',
    isPsicologo: user?.tipo_usuario === 'psicologo',
    isCandidato: user?.tipo_usuario === 'candidato'
  };

  console.log('SimpleAuthContext: Estado actual:', {
    user: !!user,
    loading,
    error,
    isAuthenticated: !!user
  });

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth debe usarse dentro de SimpleAuthProvider');
  }
  return context;
};

export default SimpleAuthContext;
