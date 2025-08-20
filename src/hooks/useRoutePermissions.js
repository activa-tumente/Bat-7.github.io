/**
 * Hook personalizado para gestión de permisos de rutas
 */

import { useState, useEffect, useCallback } from 'react';
import routePermissionsService from '../services/routePermissionsService';
import { toast } from 'react-toastify';

export const useRoutePermissions = () => {
  const [routePermissions, setRoutePermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga los permisos de rutas
   */
  const fetchRoutePermissions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await routePermissionsService.getRoutePermissions(filters);
      
      if (error) {
        throw error;
      }

      setRoutePermissions(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar permisos de rutas:', err);
      toast.error('Error al cargar permisos de rutas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga los permisos de roles
   */
  const fetchRolePermissions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await routePermissionsService.getRolePermissions(filters);
      
      if (error) {
        throw error;
      }

      setRolePermissions(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar permisos de roles:', err);
      toast.error('Error al cargar permisos de roles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo permiso de ruta
   */
  const createRoutePermission = useCallback(async (permissionData) => {
    setLoading(true);
    
    try {
      const { data, error } = await routePermissionsService.createRoutePermission(permissionData);
      
      if (error) {
        throw error;
      }

      toast.success('Permiso de ruta creado exitosamente');
      await fetchRoutePermissions();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error al crear permiso de ruta:', err);
      toast.error(`Error al crear permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRoutePermissions]);

  /**
   * Actualiza un permiso de ruta
   */
  const updateRoutePermission = useCallback(async (permissionId, permissionData) => {
    setLoading(true);
    
    try {
      const { data, error } = await routePermissionsService.updateRoutePermission(permissionId, permissionData);
      
      if (error) {
        throw error;
      }

      toast.success('Permiso de ruta actualizado exitosamente');
      await fetchRoutePermissions();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error al actualizar permiso de ruta:', err);
      toast.error(`Error al actualizar permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRoutePermissions]);

  /**
   * Elimina un permiso de ruta
   */
  const deleteRoutePermission = useCallback(async (permissionId) => {
    setLoading(true);
    
    try {
      const { success, error } = await routePermissionsService.deleteRoutePermission(permissionId);
      
      if (!success) {
        throw error;
      }

      toast.success('Permiso de ruta eliminado exitosamente');
      await fetchRoutePermissions();
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar permiso de ruta:', err);
      toast.error(`Error al eliminar permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRoutePermissions]);

  /**
   * Crea un nuevo permiso de rol
   */
  const createRolePermission = useCallback(async (permissionData) => {
    setLoading(true);
    
    try {
      const { data, error } = await routePermissionsService.createRolePermission(permissionData);
      
      if (error) {
        throw error;
      }

      toast.success('Permiso de rol creado exitosamente');
      await fetchRolePermissions();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error al crear permiso de rol:', err);
      toast.error(`Error al crear permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRolePermissions]);

  /**
   * Actualiza un permiso de rol
   */
  const updateRolePermission = useCallback(async (permissionId, permissionData) => {
    setLoading(true);
    
    try {
      const { data, error } = await routePermissionsService.updateRolePermission(permissionId, permissionData);
      
      if (error) {
        throw error;
      }

      toast.success('Permiso de rol actualizado exitosamente');
      await fetchRolePermissions();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error al actualizar permiso de rol:', err);
      toast.error(`Error al actualizar permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRolePermissions]);

  /**
   * Elimina un permiso de rol
   */
  const deleteRolePermission = useCallback(async (permissionId) => {
    setLoading(true);
    
    try {
      const { success, error } = await routePermissionsService.deleteRolePermission(permissionId);
      
      if (!success) {
        throw error;
      }

      toast.success('Permiso de rol eliminado exitosamente');
      await fetchRolePermissions();
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar permiso de rol:', err);
      toast.error(`Error al eliminar permiso: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchRolePermissions]);

  /**
   * Verifica si un usuario tiene acceso a una ruta
   */
  const checkUserRouteAccess = useCallback(async (userId, routePath) => {
    try {
      const { hasAccess, error } = await routePermissionsService.checkUserRouteAccess(userId, routePath);
      
      if (error) {
        throw error;
      }

      return { success: true, hasAccess };
    } catch (err) {
      console.error('Error al verificar acceso:', err);
      return { success: false, hasAccess: false, error: err };
    }
  }, []);

  /**
   * Obtiene las rutas disponibles en la aplicación
   */
  const getApplicationRoutes = useCallback(() => {
    return routePermissionsService.getApplicationRoutes();
  }, []);

  /**
   * Obtiene los roles disponibles
   */
  const getAvailableRoles = useCallback(() => {
    return routePermissionsService.getAvailableRoles();
  }, []);

  /**
   * Obtiene los permisos disponibles
   */
  const getAvailablePermissions = useCallback(() => {
    return routePermissionsService.getAvailablePermissions();
  }, []);

  /**
   * Obtiene los recursos disponibles
   */
  const getAvailableResources = useCallback(() => {
    return routePermissionsService.getAvailableResources();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchRoutePermissions();
    fetchRolePermissions();
  }, [fetchRoutePermissions, fetchRolePermissions]);

  return {
    // Estado
    routePermissions,
    rolePermissions,
    loading,
    error,
    
    // Acciones para permisos de rutas
    fetchRoutePermissions,
    createRoutePermission,
    updateRoutePermission,
    deleteRoutePermission,
    
    // Acciones para permisos de roles
    fetchRolePermissions,
    createRolePermission,
    updateRolePermission,
    deleteRolePermission,
    
    // Verificación de acceso
    checkUserRouteAccess,
    
    // Datos de referencia
    getApplicationRoutes,
    getAvailableRoles,
    getAvailablePermissions,
    getAvailableResources,
    
    // Datos estáticos
    applicationRoutes: getApplicationRoutes(),
    availableRoles: getAvailableRoles(),
    availablePermissions: getAvailablePermissions(),
    availableResources: getAvailableResources()
  };
};
