import React, { createContext, useState, useContext } from 'react';

/**
 * Contexto sin autenticación - permite acceso libre a toda la aplicación
 */
const NoAuthContext = createContext();

export const NoAuthProvider = ({ children }) => {
  // Usuario por defecto para desarrollo
  const [currentUserType, setCurrentUserType] = useState('administrador');
  
  const defaultUser = {
    id: 'dev-user',
    email: 'dev@bat7.com',
    nombre: 'Usuario',
    apellido: 'Desarrollo',
    tipo_usuario: currentUserType
  };

  console.log('NoAuthContext: Sin autenticación - Acceso libre');

  const value = {
    user: defaultUser,
    loading: false,
    error: null,
    login: () => Promise.resolve({ success: true }),
    logout: () => Promise.resolve({ success: true }),
    isAuthenticated: true, // Siempre autenticado
    userRole: currentUserType,
    isAdmin: currentUserType === 'administrador',
    isPsicologo: currentUserType === 'psicologo',
    isCandidato: currentUserType === 'candidato',
    // Función para cambiar rol en desarrollo
    setUserType: setCurrentUserType
  };

  return (
    <NoAuthContext.Provider value={value}>
      {children}
    </NoAuthContext.Provider>
  );
};

export const useNoAuth = () => {
  const context = useContext(NoAuthContext);
  if (!context) {
    throw new Error('useNoAuth debe usarse dentro de NoAuthProvider');
  }
  return context;
};

export default NoAuthContext;
