import React, { createContext, useState, useContext } from 'react';

/**
 * Contexto de autenticación mínimo para debugging
 * Sin llamadas a Supabase para evitar problemas de conexión
 */
const MinimalAuthContext = createContext();

export const MinimalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Siempre false para evitar loading infinito
  const [error, setError] = useState(null);

  console.log('MinimalAuthContext: Renderizando provider');

  // Función de login simulada
  const login = async (email, password) => {
    console.log('MinimalAuthContext: Login simulado con:', email);
    setLoading(true);
    setError(null);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular usuario según email
    const mockUsers = {
      'admin@bat7.com': {
        id: 'admin-id',
        email: 'admin@bat7.com',
        nombre: 'Administrador',
        apellido: 'Sistema',
        tipo_usuario: 'administrador'
      },
      'psicologo1@bat7.com': {
        id: 'psicologo-id',
        email: 'psicologo1@bat7.com',
        nombre: 'María',
        apellido: 'González',
        tipo_usuario: 'psicologo'
      },
      'candidato1@email.com': {
        id: 'candidato-id',
        email: 'candidato1@email.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        tipo_usuario: 'candidato'
      }
    };

    const mockUser = mockUsers[email];
    
    if (mockUser && password === 'password') {
      setUser(mockUser);
      setLoading(false);
      console.log('MinimalAuthContext: Login exitoso para:', mockUser.tipo_usuario);
      return { success: true, data: mockUser };
    } else {
      setError('Credenciales incorrectas');
      setLoading(false);
      console.log('MinimalAuthContext: Login fallido');
      return { success: false, error: 'Credenciales incorrectas' };
    }
  };

  // Función de logout
  const logout = async () => {
    console.log('MinimalAuthContext: Logout');
    setUser(null);
    setError(null);
    return { success: true };
  };

  // Función para simular usuario logueado
  const simulateLogin = (userType = 'candidato') => {
    const users = {
      administrador: {
        id: 'admin-id',
        email: 'admin@bat7.com',
        nombre: 'Administrador',
        apellido: 'Sistema',
        tipo_usuario: 'administrador'
      },
      psicologo: {
        id: 'psicologo-id',
        email: 'psicologo1@bat7.com',
        nombre: 'María',
        apellido: 'González',
        tipo_usuario: 'psicologo'
      },
      candidato: {
        id: 'candidato-id',
        email: 'candidato1@email.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        tipo_usuario: 'candidato'
      }
    };

    setUser(users[userType]);
    console.log('MinimalAuthContext: Usuario simulado:', userType);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    simulateLogin,
    isAuthenticated: !!user,
    userRole: user?.tipo_usuario || null,
    isAdmin: user?.tipo_usuario === 'administrador',
    isPsicologo: user?.tipo_usuario === 'psicologo',
    isCandidato: user?.tipo_usuario === 'candidato'
  };

  console.log('MinimalAuthContext: Estado actual:', {
    hasUser: !!user,
    userType: user?.tipo_usuario,
    loading,
    error
  });

  return (
    <MinimalAuthContext.Provider value={value}>
      {children}
    </MinimalAuthContext.Provider>
  );
};

export const useMinimalAuth = () => {
  const context = useContext(MinimalAuthContext);
  if (!context) {
    throw new Error('useMinimalAuth debe usarse dentro de MinimalAuthProvider');
  }
  return context;
};

export default MinimalAuthContext;
