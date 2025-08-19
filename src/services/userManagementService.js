/**
 * Servicio para gestión avanzada de usuarios
 * Incluye operaciones CRUD, permisos y asignaciones
 */

import supabase from '../api/supabaseClient';

class UserManagementService {
  /**
   * Obtiene todos los usuarios con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUsers(filters = {}) {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          institucion:instituciones(id, nombre)
        `);

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,apellido.ilike.%${filters.search}%,documento.ilike.%${filters.search}%`);
      }

      if (filters.tipo_usuario) {
        query = query.eq('tipo_usuario', filters.tipo_usuario);
      }

      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo);
      }

      if (filters.institucion_id) {
        query = query.eq('institucion_id', filters.institucion_id);
      }

      // Ordenamiento
      const sortField = filters.sortField || 'fecha_creacion';
      const sortDirection = filters.sortDirection || 'desc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Paginación
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, error: null, count };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { data: null, error };
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createUser(userData) {
    try {
      // Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          nombre: userData.nombre,
          apellido: userData.apellido,
          documento: userData.documento,
          tipo_usuario: userData.tipo_usuario
        }
      });

      if (authError) throw authError;

      // Crear perfil en tabla usuarios
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          nombre: userData.nombre,
          apellido: userData.apellido,
          documento: userData.documento,
          tipo_usuario: userData.tipo_usuario,
          institucion_id: userData.institucion_id,
          activo: userData.activo !== undefined ? userData.activo : true
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Registrar actividad
      await this.logActivity(authData.user.id, 'create_user', 'usuarios', authData.user.id, {
        created_by: userData.created_by,
        tipo_usuario: userData.tipo_usuario
      });

      return { data: profileData, error: null };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza un usuario existente
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateUser(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre: userData.nombre,
          apellido: userData.apellido,
          documento: userData.documento,
          tipo_usuario: userData.tipo_usuario,
          institucion_id: userData.institucion_id,
          activo: userData.activo,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Registrar actividad
      await this.logActivity(userId, 'update_user', 'usuarios', userId, {
        updated_by: userData.updated_by,
        changes: userData
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { data: null, error };
    }
  }

  /**
   * Elimina un usuario (soft delete)
   * @param {string} userId - ID del usuario
   * @param {string} deletedBy - ID del usuario que elimina
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteUser(userId, deletedBy) {
    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('usuarios')
        .update({
          activo: false,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Registrar actividad
      await this.logActivity(userId, 'delete_user', 'usuarios', userId, {
        deleted_by: deletedBy
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene los permisos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUserPermissions(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', { user_id: userId });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      return { data: null, error };
    }
  }

  /**
   * Verifica si un usuario tiene acceso a una ruta
   * @param {string} userId - ID del usuario
   * @param {string} routePath - Ruta a verificar
   * @returns {Promise<{hasAccess: boolean, error: Object}>}
   */
  async checkRouteAccess(userId, routePath) {
    try {
      const { data, error } = await supabase
        .rpc('check_route_access', { 
          user_id: userId, 
          route_path: routePath 
        });

      if (error) throw error;

      return { hasAccess: data, error: null };
    } catch (error) {
      console.error('Error al verificar acceso:', error);
      return { hasAccess: false, error };
    }
  }

  /**
   * Registra actividad del usuario
   * @param {string} userId - ID del usuario
   * @param {string} action - Acción realizada
   * @param {string} resource - Recurso afectado
   * @param {string} resourceId - ID del recurso
   * @param {Object} details - Detalles adicionales
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async logActivity(userId, action, resource, resourceId, details = {}) {
    try {
      const { data, error } = await supabase
        .rpc('log_user_activity', {
          user_id: userId,
          session_id: null, // Se puede obtener del contexto
          action,
          resource,
          resource_id: resourceId,
          details,
          ip_address: null, // Se puede obtener del cliente
          user_agent: navigator.userAgent,
          success: true
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getUserStatistics() {
    try {
      const { data: totalUsers, error: totalError } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact' });

      if (totalError) throw totalError;

      const { data: usersByType, error: typeError } = await supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('activo', true);

      if (typeError) throw typeError;

      const { data: activeUsers, error: activeError } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact' })
        .eq('activo', true);

      if (activeError) throw activeError;

      // Agrupar por tipo de usuario
      const typeStats = usersByType.reduce((acc, user) => {
        acc[user.tipo_usuario] = (acc[user.tipo_usuario] || 0) + 1;
        return acc;
      }, {});

      return {
        data: {
          total: totalUsers.length,
          active: activeUsers.length,
          inactive: totalUsers.length - activeUsers.length,
          byType: typeStats
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca usuarios por documento
   * @param {string} documento - Documento a buscar
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getUserByDocument(documento) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('documento', documento)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al buscar usuario por documento:', error);
      return { data: null, error };
    }
  }
}

export default new UserManagementService();
