import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';

/**
 * Higher-Order Component para protección de componentes basada en roles
 * Envuelve componentes y verifica permisos antes de renderizar
 */
export const withRoleProtection = (WrappedComponent, allowedRoles = [], options = {}) => {
  const {
    redirectTo = '/unauthorized',
    showAccessDenied = true,
    fallbackComponent: FallbackComponent = null,
    requireAuth = true,
  } = options;

  const ProtectedComponent = (props) => {
    const {
      hasAccess,
      isAuthenticated,
      userRole,
      getDefaultRoute
    } = useRoleBasedAccess(allowedRoles);

    // Si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Si no tiene acceso
    if (!hasAccess) {
      // Si hay un componente de fallback personalizado
      if (FallbackComponent) {
        return <FallbackComponent userRole={userRole} requiredRoles={allowedRoles} />;
      }

      // Si debe mostrar mensaje de acceso denegado
      if (showAccessDenied) {
        return <AccessDeniedMessage userRole={userRole} requiredRoles={allowedRoles} />;
      }

      // Redirigir a la página especificada
      return <Navigate to={redirectTo} replace />;
    }

    // Si tiene acceso, renderizar el componente
    return <WrappedComponent {...props} />;
  };

  // Preservar el nombre del componente para debugging
  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
};

/**
 * Componente de mensaje de acceso denegado por defecto
 */
const AccessDeniedMessage = ({ userRole, requiredRoles }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaLock className="mx-auto h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>
        
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-800">
                No tienes permisos para acceder a esta página
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium">Tu rol actual:</span> {userRole || 'No definido'}
            </p>
            <p>
              <span className="font-medium">Roles requeridos:</span> {
                Array.isArray(requiredRoles) 
                  ? requiredRoles.join(', ') 
                  : requiredRoles || 'No especificado'
              }
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Volver Atrás
          </button>
          
          <button
            onClick={() => window.location.href = '/home'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Variantes del HOC para casos específicos
 */

// Solo para administradores
export const withAdminProtection = (Component, options = {}) => 
  withRoleProtection(Component, ['administrador', 'admin'], options);

// Solo para psicólogos y administradores
export const withPsychologistProtection = (Component, options = {}) => 
  withRoleProtection(Component, ['psicologo', 'psicólogo', 'administrador', 'admin'], options);

// Solo para estudiantes
export const withStudentProtection = (Component, options = {}) => 
  withRoleProtection(Component, ['estudiante', 'candidato'], options);

// Para usuarios autenticados (cualquier rol)
export const withAuthProtection = (Component, options = {}) => 
  withRoleProtection(Component, [], { ...options, requireAuth: true });

export default withRoleProtection;
