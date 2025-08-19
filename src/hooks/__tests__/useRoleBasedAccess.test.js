import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRoleBasedAccess } from '../useRoleBasedAccess';
import { createHookWrapper, createMockAuthUser } from '../../test/utils/testUtils';

// Mock del contexto de autenticación
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  userRole: null
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

describe('useRoleBasedAccess', () => {
  beforeEach(() => {
    // Reset mock antes de cada test
    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.userRole = null;
  });

  describe('Usuario no autenticado', () => {
    it('debe retornar hasAccess false para usuario no autenticado', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['administrador']));
      
      expect(result.current.hasAccess).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isPsychologist).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });

    it('debe retornar rutas vacías para usuario no autenticado', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.allowedRoutes).toEqual([]);
    });
  });

  describe('Usuario administrador', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'administrador' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'administrador';
    });

    it('debe identificar correctamente al administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isPsychologist).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });

    it('debe permitir acceso a rutas de administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['administrador']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe permitir acceso con alias de rol', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['admin']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe tener todos los permisos de administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.permissions.canCreateUsers).toBe(true);
      expect(result.current.permissions.canEditUsers).toBe(true);
      expect(result.current.permissions.canDeleteUsers).toBe(true);
      expect(result.current.permissions.canViewDashboard).toBe(true);
      expect(result.current.permissions.canManageInstitutions).toBe(true);
    });

    it('debe tener acceso a todas las rutas', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      const expectedRoutes = [
        '/home',
        '/cuestionario',
        '/results',
        '/admin/candidates',
        '/informes-guardados',
        '/admin/administration',
        '/admin/institutions',
        '/admin/psychologists',
        '/admin/diagnostics',
        '/dashboard'
      ];
      
      expect(result.current.allowedRoutes).toEqual(expectedRoutes);
    });

    it('debe retornar ruta por defecto de administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.getDefaultRoute()).toBe('/admin/administration');
    });
  });

  describe('Usuario psicólogo', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'psicologo' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'psicologo';
    });

    it('debe identificar correctamente al psicólogo', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isPsychologist).toBe(true);
      expect(result.current.isStudent).toBe(false);
    });

    it('debe permitir acceso a rutas de psicólogo', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['psicologo']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe permitir acceso con alias de rol', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['psicólogo']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe tener permisos de psicólogo pero no de administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.permissions.canViewResults).toBe(true);
      expect(result.current.permissions.canViewReports).toBe(true);
      expect(result.current.permissions.canGenerateReports).toBe(true);
      expect(result.current.permissions.canCreateUsers).toBe(false);
      expect(result.current.permissions.canViewDashboard).toBe(false);
    });

    it('debe tener acceso a rutas de psicólogo', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      const expectedRoutes = [
        '/home',
        '/cuestionario',
        '/results',
        '/admin/candidates',
        '/informes-guardados'
      ];
      
      expect(result.current.allowedRoutes).toEqual(expectedRoutes);
    });

    it('debe retornar ruta por defecto de psicólogo', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.getDefaultRoute()).toBe('/admin/candidates');
    });
  });

  describe('Usuario estudiante/candidato', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'estudiante' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'estudiante';
    });

    it('debe identificar correctamente al estudiante', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isPsychologist).toBe(false);
      expect(result.current.isStudent).toBe(true);
    });

    it('debe permitir acceso a rutas de estudiante', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['estudiante']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe permitir acceso con alias candidato', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['candidato']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe denegar acceso a rutas de administrador', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['administrador']));
      
      expect(result.current.hasAccess).toBe(false);
    });

    it('debe tener permisos limitados de estudiante', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.permissions.canTakeTests).toBe(true);
      expect(result.current.permissions.canViewResults).toBe(false);
      expect(result.current.permissions.canCreateUsers).toBe(false);
      expect(result.current.permissions.canViewDashboard).toBe(false);
    });

    it('debe tener acceso solo a rutas básicas', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      const expectedRoutes = ['/home', '/cuestionario'];
      
      expect(result.current.allowedRoutes).toEqual(expectedRoutes);
    });

    it('debe retornar ruta por defecto de estudiante', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.getDefaultRoute()).toBe('/home');
    });
  });

  describe('Verificación de acceso a rutas', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'psicologo' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'psicologo';
    });

    it('debe verificar correctamente el acceso a rutas permitidas', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccessRoute('/home')).toBe(true);
      expect(result.current.canAccessRoute('/results')).toBe(true);
      expect(result.current.canAccessRoute('/admin/candidates')).toBe(true);
    });

    it('debe denegar acceso a rutas no permitidas', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccessRoute('/admin/administration')).toBe(false);
      expect(result.current.canAccessRoute('/admin/institutions')).toBe(false);
      expect(result.current.canAccessRoute('/dashboard')).toBe(false);
    });

    it('debe manejar rutas con parámetros', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.canAccessRoute('/results/123')).toBe(true);
      expect(result.current.canAccessRoute('/admin/candidates/456')).toBe(true);
    });
  });

  describe('Roles múltiples', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'psicologo' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'psicologo';
    });

    it('debe permitir acceso cuando el usuario tiene uno de los roles requeridos', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['administrador', 'psicologo']));
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe denegar acceso cuando el usuario no tiene ninguno de los roles requeridos', () => {
      const { result } = renderHook(() => useRoleBasedAccess(['administrador', 'estudiante']));
      
      expect(result.current.hasAccess).toBe(false);
    });
  });

  describe('Sin roles requeridos', () => {
    beforeEach(() => {
      mockAuthContext.user = createMockAuthUser({ tipo_usuario: 'estudiante' });
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.userRole = 'estudiante';
    });

    it('debe permitir acceso cuando no se especifican roles requeridos', () => {
      const { result } = renderHook(() => useRoleBasedAccess());
      
      expect(result.current.hasAccess).toBe(true);
    });

    it('debe permitir acceso con array vacío de roles', () => {
      const { result } = renderHook(() => useRoleBasedAccess([]));
      
      expect(result.current.hasAccess).toBe(true);
    });
  });
});
