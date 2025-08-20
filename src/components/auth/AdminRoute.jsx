import React from 'react';
import { Navigate } from 'react-router-dom';
import { useNoAuth as useAuth } from '../../context/NoAuthContext';

/**
 * Componente para proteger rutas que solo pueden acceder administradores
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es administrador, redirigir al home
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Solo los administradores pueden acceder a esta área.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver Atrás
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Ir al Inicio
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Usuario actual: <span className="font-medium">{user?.nombre || user?.email}</span>
            </p>
            <p className="text-xs text-gray-500">
              Rol: <span className="font-medium">{user?.rol || 'No definido'}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si es administrador, mostrar el contenido
  return children;
};

export default AdminRoute;
