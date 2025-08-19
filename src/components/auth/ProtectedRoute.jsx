import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { FaSpinner } from 'react-icons/fa';
import auditLogger from '../../services/auditLogger';

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const {
    hasAccess,
    isAuthenticated,
    userRole,
    user
  } = useRoleBasedAccess(allowedRoles);

  // Mostrar spinner mientras se carga la autenticación
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    auditLogger.warn('access_denied', 'Acceso denegado - usuario no autenticado', {
      route: location.pathname,
      requiredRoles: allowedRoles
    });
    return <Navigate to="/login" replace />;
  }

  // Si no tiene acceso a la ruta específica
  if (!hasAccess) {
    auditLogger.logRouteAccess(location.pathname, false, userRole, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  // Log de acceso exitoso
  auditLogger.logRouteAccess(location.pathname, true, userRole, allowedRoles);

  return <Outlet />;
};

export default ProtectedRoute;