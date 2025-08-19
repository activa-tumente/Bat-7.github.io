/**
 * Servicio para gestión de permisos de rutas y control de acceso
 */

import supabase from '../api/supabaseClient';

class RoutePermissionsService {
  /**
   * Obtiene todos los permisos de rutas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getRoutePermissions(filters = {}) {
    try {
      let query = supabase
        .from('route_permissions')
        .select('*');

      if (filters.search) {
        query = query.or(`route_path.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.required_role) {
        query = query.eq('required_role', filters.required_role);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      query = query.order('route_path', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener permisos de rutas:', error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo permiso de ruta
   * @param {Object} permissionData - Datos del permiso
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createRoutePermission(permissionData) {
    try {
      const { data, error } = await supabase
        .from('route_permissions')
        .insert([{
          route_path: permissionData.route_path,
          required_permission: permissionData.required_permission,
          required_role: permissionData.required_role,
          description: permissionData.description,
          is_active: permissionData.is_active !== undefined ? permissionData.is_active : true
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al crear permiso de ruta:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un permiso de ruta
   * @param {string} permissionId - ID del permiso
   * @param {Object} permissionData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateRoutePermission(permissionId, permissionData) {
    try {
      const { data, error } = await supabase
        .from('route_permissions')
        .update({
          route_path: permissionData.route_path,
          required_permission: permissionData.required_permission,
          required_role: permissionData.required_role,
          description: permissionData.description,
          is_active: permissionData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al actualizar permiso de ruta:', error);
      return { data: null, error };
    }
  }

  /**
   * Elimina un permiso de ruta
   * @param {string} permissionId - ID del permiso
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteRoutePermission(permissionId) {
    try {
      const { error } = await supabase
        .from('route_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al eliminar permiso de ruta:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene todos los permisos de roles
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getRolePermissions(filters = {}) {
    try {
      let query = supabase
        .from('role_permissions')
        .select('*');

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      query = query.order('role', { ascending: true })
                   .order('resource', { ascending: true })
                   .order('permission', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener permisos de roles:', error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo permiso de rol
   * @param {Object} permissionData - Datos del permiso
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createRolePermission(permissionData) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .insert([{
          role: permissionData.role,
          permission: permissionData.permission,
          resource: permissionData.resource,
          description: permissionData.description
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al crear permiso de rol:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un permiso de rol
   * @param {string} permissionId - ID del permiso
   * @param {Object} permissionData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateRolePermission(permissionId, permissionData) {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .update({
          role: permissionData.role,
          permission: permissionData.permission,
          resource: permissionData.resource,
          description: permissionData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', permissionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al actualizar permiso de rol:', error);
      return { data: null, error };
    }
  }

  /**
   * Elimina un permiso de rol
   * @param {string} permissionId - ID del permiso
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteRolePermission(permissionId) {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al eliminar permiso de rol:', error);
      return { success: false, error };
    }
  }

  /**
   * Verifica si un usuario tiene acceso a una ruta específica
   * @param {string} userId - ID del usuario
   * @param {string} routePath - Ruta a verificar
   * @returns {Promise<{hasAccess: boolean, error: Object}>}
   */
  async checkUserRouteAccess(userId, routePath) {
    try {
      const { data, error } = await supabase
        .rpc('check_route_access', {
          user_id: userId,
          route_path: routePath
        });

      if (error) throw error;

      return { hasAccess: data, error: null };
    } catch (error) {
      console.error('Error al verificar acceso a ruta:', error);
      return { hasAccess: false, error };
    }
  }

  /**
   * Obtiene todas las rutas disponibles en la aplicación
   * @returns {Array} Lista de rutas
   */
  getApplicationRoutes() {
    return [
      { path: '/', name: 'Inicio', description: 'Página principal' },
      { path: '/admin/administration', name: 'Administración', description: 'Panel de administración' },
      { path: '/admin/users', name: 'Gestión de Usuarios', description: 'Gestión de usuarios del sistema' },
      { path: '/admin/permissions', name: 'Gestión de Permisos', description: 'Gestión de permisos y roles' },
      { path: '/admin/assignments', name: 'Asignaciones', description: 'Asignación de pacientes a psicólogos' },
      { path: '/admin/usage', name: 'Estadísticas de Uso', description: 'Monitoreo de uso del sistema' },
      { path: '/configuracion', name: 'Configuración', description: 'Configuración personal' },
      { path: '/cuestionario', name: 'Cuestionarios', description: 'Realizar evaluaciones' },
      { path: '/resultados', name: 'Resultados', description: 'Ver resultados de evaluaciones' },
      { path: '/informes', name: 'Informes', description: 'Generar informes' },
      { path: '/pacientes', name: 'Pacientes', description: 'Gestión de pacientes' }
    ];
  }

  /**
   * Obtiene los roles disponibles en el sistema
   * @returns {Array} Lista de roles
   */
  getAvailableRoles() {
    return [
      { value: 'Administrador', label: 'Administrador', description: 'Acceso completo al sistema' },
      { value: 'Psicólogo', label: 'Psicólogo', description: 'Acceso a evaluaciones y pacientes asignados' },
      { value: 'Candidato', label: 'Candidato', description: 'Acceso a evaluaciones propias' }
    ];
  }

  /**
   * Obtiene los permisos disponibles en el sistema
   * @returns {Array} Lista de permisos
   */
  getAvailablePermissions() {
    return [
      { value: 'read', label: 'Leer', description: 'Permiso de lectura' },
      { value: 'write', label: 'Escribir', description: 'Permiso de escritura' },
      { value: 'delete', label: 'Eliminar', description: 'Permiso de eliminación' },
      { value: 'access', label: 'Acceder', description: 'Permiso de acceso' },
      { value: 'manage', label: 'Gestionar', description: 'Permiso de gestión completa' }
    ];
  }

  /**
   * Obtiene los recursos disponibles en el sistema
   * @returns {Array} Lista de recursos
   */
  getAvailableResources() {
    return [
      { value: 'users', label: 'Usuarios', description: 'Gestión de usuarios' },
      { value: 'permissions', label: 'Permisos', description: 'Gestión de permisos' },
      { value: 'assignments', label: 'Asignaciones', description: 'Asignación de pacientes' },
      { value: 'usage', label: 'Uso', description: 'Estadísticas de uso' },
      { value: 'logs', label: 'Logs', description: 'Registros del sistema' },
      { value: 'evaluations', label: 'Evaluaciones', description: 'Evaluaciones psicométricas' },
      { value: 'results', label: 'Resultados', description: 'Resultados de evaluaciones' },
      { value: 'patients', label: 'Pacientes', description: 'Gestión de pacientes' },
      { value: 'admin_panel', label: 'Panel Admin', description: 'Panel de administración' }
    ];
  }
}

export default new RoutePermissionsService();
