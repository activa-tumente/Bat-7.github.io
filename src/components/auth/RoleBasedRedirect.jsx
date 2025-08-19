import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';
import { FaSpinner } from 'react-icons/fa';

/**
 * Componente que redirige a los usuarios según su rol después del login
 */
const RoleBasedRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Obtener la URL a la que el usuario intentaba acceder antes del login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      console.log('Usuario autenticado:', {
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        nombre: user.nombre
      });
    }
  }, [user]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirigir según el rol del usuario
  const getRedirectPath = () => {
    const userRole = user?.tipo_usuario?.toLowerCase();

    switch (userRole) {
      case 'administrador':
      case 'admin':
        // Administradores van al dashboard de administración
        return '/admin/administration';

      case 'psicologo':
      case 'psicólogo':
        // Psicólogos van a la lista de candidatos
        return '/admin/candidates';

      case 'candidato':
      case 'estudiante':
        // Candidatos van a la página de inicio con cuestionarios
        return '/home';

      default:
        // Rol desconocido, ir a home por defecto
        console.warn('Rol de usuario desconocido:', userRole);
        return '/home';
    }
  };

  const redirectPath = getRedirectPath();

  // Si el usuario ya está en la página correcta, no redirigir
  if (from === redirectPath || location.pathname === redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Redirigir a la página apropiada para el rol
  return <Navigate to={redirectPath} replace />;
};

/**
 * Hook para obtener la página de inicio según el rol
 */
export const useRoleBasedHomePage = () => {
  const { user } = useAuth();

  const getHomePage = () => {
    const userRole = user?.tipo_usuario?.toLowerCase();

    switch (userRole) {
      case 'administrador':
      case 'admin':
        return '/admin/administration';

      case 'psicologo':
      case 'psicólogo':
        return '/admin/candidates';

      case 'candidato':
      case 'estudiante':
        return '/home';

      default:
        return '/home';
    }
  };

  return getHomePage();
};

/**
 * Componente para mostrar información del usuario actual
 */
export const UserInfo = () => {
  const { user, userRole } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="text-sm">
        <div><strong>Usuario:</strong> {user.nombre} {user.apellido}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Rol:</strong> {userRole}</div>
        <div><strong>Tipo:</strong> {user.tipo_usuario}</div>
      </div>
    </div>
  );
};

export default RoleBasedRedirect;
