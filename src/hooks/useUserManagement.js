/**
 * Hook personalizado para gestión de usuarios
 */

import { useState, useEffect, useCallback } from 'react';
import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

export const useUserManagement = (initialFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    tipo_usuario: '',
    activo: undefined,
    institucion_id: '',
    sortField: 'fecha_creacion',
    sortDirection: 'desc',
    page: 1,
    pageSize: 10,
    ...initialFilters
  });
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState(null);

  /**
   * Carga la lista de usuarios
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando usuarios...');
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('✅ Usuarios cargados:', data?.length || 0);
      setUsers(data || []);
      setTotalCount(data?.length || 0);

      // Calcular estadísticas
      if (data) {
        const total = data.length;
        const active = data.filter(user => user.activo === true).length;
        const inactive = total - active;

        setStatistics({
          total,
          active,
          inactive,
          newThisWeek: 0 // Simplificado por ahora
        });
      }
    } catch (err) {
      setError(err);
      console.error('Error al cargar usuarios:', err);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga estadísticas de usuarios
   */
  const fetchStatistics = useCallback(async () => {
    try {
      // Calcular estadísticas simples basadas en los usuarios cargados
      if (users.length > 0) {
        const total = users.length;
        const active = users.filter(user => user.activo === true).length;
        const inactive = total - active;

        setStatistics({
          total,
          active,
          inactive,
          newThisWeek: 0 // Simplificado
        });
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, [users]);

  /**
   * Crea un nuevo usuario
   */
  const createUser = useCallback(async (userData) => {
    setLoading(true);

    try {
      console.log('👤 Creando usuario:', userData.email);
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          documento: userData.documento,
          tipo_usuario: userData.tipo_usuario,
          activo: true,
          fecha_creacion: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Usuario creado:', data);
      toast.success('Usuario creado exitosamente');
      await fetchUsers();

      return { success: true, data };
    } catch (err) {
      console.error('Error al crear usuario:', err);
      toast.error(`Error al crear usuario: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  /**
   * Actualiza un usuario existente
   */
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);

    try {
      console.log('📝 Actualizando usuario:', userId);
      const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Usuario actualizado:', data);
      toast.success('Usuario actualizado exitosamente');
      await fetchUsers();

      return { success: true, data };
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      toast.error(`Error al actualizar usuario: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  /**
   * Elimina un usuario (soft delete)
   */
  // Función deleteUser ya definida anteriormente - eliminando duplicado

  /**
   * Busca un usuario por documento
   */
  const searchUserByDocument = useCallback(async (documento) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('documento', documento)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error al buscar usuario por documento:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Obtiene los permisos de un usuario
   */
  const getUserPermissions = useCallback(async (userId) => {
    try {
      // Simplificado - retorna permisos básicos basados en el tipo de usuario
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const permissions = {
        administrador: ['read', 'write', 'admin'],
        psicologo: ['read', 'write'],
        candidato: ['read']
      };

      return {
        success: true,
        data: permissions[user.tipo_usuario] || ['read']
      };
    } catch (err) {
      console.error('Error al obtener permisos:', err);
      return { success: false, error: err };
    }
  }, [users]);

  /**
   * Verifica acceso a ruta
   */
  const checkRouteAccess = useCallback(async (userId, routePath) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        return { success: true, hasAccess: false };
      }

      // Lógica simplificada de acceso basada en rutas
      const adminRoutes = ['/admin', '/configuracion'];
      const psychologistRoutes = ['/resultados', '/informes'];
      const candidateRoutes = ['/cuestionario', '/home'];

      let hasAccess = false;
      if (user.tipo_usuario === 'administrador') {
        hasAccess = true; // Admin tiene acceso a todo
      } else if (user.tipo_usuario === 'psicologo') {
        hasAccess = psychologistRoutes.some(route => routePath.includes(route)) || candidateRoutes.some(route => routePath.includes(route));
      } else if (user.tipo_usuario === 'candidato') {
        hasAccess = candidateRoutes.some(route => routePath.includes(route));
      }

      return { success: true, hasAccess };
    } catch (err) {
      console.error('Error al verificar acceso:', err);
      return { success: false, hasAccess: false, error: err };
    }
  }, [users]);

  /**
   * Actualiza los filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset page when filters change
    }));
  }, []);

  /**
   * Resetea los filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      tipo_usuario: '',
      activo: undefined,
      institucion_id: '',
      sortField: 'fecha_creacion',
      sortDirection: 'desc',
      page: 1,
      pageSize: 10
    });
  }, []);

  /**
   * Cambia la página
   */
  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  /**
   * Cambia el ordenamiento
   */
  const changeSort = useCallback((field) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  }, []);

  /**
   * Elimina un usuario
   */
  const deleteUser = useCallback(async (userId) => {
    setLoading(true);

    try {
      console.log('🗑️ Eliminando usuario:', userId);
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ Usuario eliminado');
      toast.success('Usuario eliminado exitosamente');
      await fetchUsers();

      return { success: true };
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(`Error al eliminar usuario: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  const toggleUserStatus = useCallback(async (userId, currentStatus) => {
    setLoading(true);

    try {
      const newStatus = !currentStatus;
      console.log('🔄 Cambiando estado usuario:', userId, 'a', newStatus);

      const { error } = await supabase
        .from('usuarios')
        .update({ activo: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ Estado cambiado');
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
      await fetchUsers();

      return { success: true };
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      toast.error(`Error al cambiar estado: ${err.message}`);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    // Estado
    users,
    loading,
    error,
    filters,
    totalCount,
    statistics,
    stats: statistics, // Alias para compatibilidad
    
    // Acciones
    fetchUsers,
    fetchStatistics,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    searchUserByDocument,
    getUserPermissions,
    checkRouteAccess,
    
    // Filtros y paginación
    updateFilters,
    resetFilters,
    changePage,
    changeSort,
    
    // Utilidades
    totalPages: Math.ceil(totalCount / filters.pageSize),
    hasNextPage: filters.page < Math.ceil(totalCount / filters.pageSize),
    hasPrevPage: filters.page > 1
  };
};
