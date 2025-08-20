import { useMemo } from 'react';
import { useNoAuth as useAuth } from '../context/NoAuthContext';

/**
 * Hook personalizado para manejo centralizado de roles y permisos
 * Proporciona una API limpia para verificar accesos basados en roles
 */
export const useRoleBasedAccess = (requiredRoles = []) => {
  const { user, isAuthenticated, userRole } = useAuth();

  // Mapeo de alias de roles para compatibilidad
  const roleAliases = {
    admin: 'administrador',
    'psicólogo': 'psicologo',
    estudiante: 'candidato',
    candidato: 'estudiante',
  };

  // Normalizar roles requeridos
  const normalizedRequiredRoles = useMemo(() => {
    if (!Array.isArray(requiredRoles)) {
      return [requiredRoles].filter(Boolean);
    }
    return requiredRoles.map(role => 
      roleAliases[role.toLowerCase()] || role.toLowerCase()
    );
  }, [requiredRoles]);

  // Verificar si el usuario tiene acceso
  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (normalizedRequiredRoles.length === 0) return true;
    
    const currentUserRole = userRole?.toLowerCase() || '';
    return normalizedRequiredRoles.includes(currentUserRole);
  }, [isAuthenticated, user, userRole, normalizedRequiredRoles]);

  // Verificar roles específicos
  const isAdmin = useMemo(() => 
    userRole?.toLowerCase() === 'administrador', [userRole]
  );
  
  const isPsychologist = useMemo(() => 
    userRole?.toLowerCase() === 'psicologo', [userRole]
  );
  
  const isStudent = useMemo(() => 
    ['estudiante', 'candidato'].includes(userRole?.toLowerCase()), [userRole]
  );

  // Verificar permisos específicos por funcionalidad
  const permissions = useMemo(() => ({
    // Permisos de lectura
    canViewResults: isAdmin || isPsychologist,
    canViewReports: isAdmin || isPsychologist,
    canViewCandidates: isAdmin || isPsychologist,
    canViewDashboard: isAdmin,
    
    // Permisos de escritura
    canCreateUsers: isAdmin,
    canEditUsers: isAdmin,
    canDeleteUsers: isAdmin,
    canManageInstitutions: isAdmin,
    canManagePsychologists: isAdmin,
    
    // Permisos de evaluación
    canTakeTests: true, // Todos pueden tomar evaluaciones
    canCreateTests: isAdmin,
    canEditTests: isAdmin || isPsychologist,
    canDeleteTests: isAdmin,
    
    // Permisos de informes
    canGenerateReports: isAdmin || isPsychologist,
    canExportReports: isAdmin || isPsychologist,
    canShareReports: isAdmin || isPsychologist,
  }), [isAdmin, isPsychologist, isStudent]);

  // Obtener rutas permitidas para el usuario actual
  const allowedRoutes = useMemo(() => {
    const baseRoutes = ['/home', '/cuestionario'];
    
    if (isStudent) {
      return baseRoutes;
    }
    
    if (isPsychologist) {
      return [
        ...baseRoutes,
        '/results',
        '/admin/candidates',
        '/informes-guardados'
      ];
    }
    
    if (isAdmin) {
      return [
        ...baseRoutes,
        '/results',
        '/admin/candidates',
        '/informes-guardados',
        '/admin/administration',
        '/admin/institutions',
        '/admin/psychologists',
        '/admin/diagnostics',
        '/dashboard'
      ];
    }
    
    return baseRoutes;
  }, [isAdmin, isPsychologist, isStudent]);

  // Función para verificar si una ruta específica está permitida
  const canAccessRoute = (route) => {
    return allowedRoutes.some(allowedRoute => 
      route.startsWith(allowedRoute)
    );
  };

  // Función para obtener la ruta de redirección por defecto según el rol
  const getDefaultRoute = () => {
    if (isAdmin) return '/admin/administration';
    if (isPsychologist) return '/admin/candidates';
    return '/home';
  };

  return {
    // Estado de autenticación
    isAuthenticated,
    user,
    userRole,
    
    // Verificación de acceso
    hasAccess,
    canAccessRoute,
    
    // Roles específicos
    isAdmin,
    isPsychologist,
    isStudent,
    
    // Permisos granulares
    permissions,
    
    // Rutas
    allowedRoutes,
    getDefaultRoute,
    
    // Utilidades
    normalizedRequiredRoles,
  };
};

export default useRoleBasedAccess;
