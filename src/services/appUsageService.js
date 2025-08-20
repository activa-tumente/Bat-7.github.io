/**
 * Servicio para control y monitoreo de uso de la aplicación
 */

import supabase from '../api/supabaseClient';

class AppUsageService {
  /**
   * Obtiene estadísticas de uso para un rango de fechas
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @param {string} userType - Tipo de usuario (opcional)
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUsageStatistics(startDate, endDate, userType = 'all') {
    try {
      const { data, error } = await supabase
        .rpc('get_usage_statistics', {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          user_type: userType
        });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener estadísticas de uso:', error);
      return { data: null, error };
    }
  }

  /**
   * Actualiza una estadística de uso
   * @param {string} metricName - Nombre de la métrica
   * @param {number} metricValue - Valor de la métrica
   * @param {string} metricType - Tipo de métrica
   * @param {string} userType - Tipo de usuario
   * @param {Date} targetDate - Fecha objetivo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async updateUsageStatistic(metricName, metricValue, metricType = 'count', userType = 'all', targetDate = new Date(), metadata = {}) {
    try {
      const { data, error } = await supabase
        .rpc('update_usage_statistics', {
          metric_name: metricName,
          metric_value: metricValue,
          metric_type: metricType,
          user_type: userType,
          target_date: targetDate.toISOString().split('T')[0],
          metadata
        });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al actualizar estadística:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene logs de actividad de usuarios
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUserActivityLogs(filters = {}) {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select(`
          *,
          usuario:usuarios(nombre, apellido, tipo_usuario)
        `);

      // Aplicar filtros
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      // Ordenamiento
      query = query.order('created_at', { ascending: false });

      // Paginación
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener logs de actividad:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene logs de sesiones de usuarios
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getSessionLogs(filters = {}) {
    try {
      let query = supabase
        .from('session_logs')
        .select(`
          *,
          usuario:usuarios(nombre, apellido, tipo_usuario)
        `);

      // Aplicar filtros
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters.startDate) {
        query = query.gte('login_time', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('login_time', filters.endDate.toISOString());
      }

      // Ordenamiento
      query = query.order('login_time', { ascending: false });

      // Paginación
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener logs de sesión:', error);
      return { data: null, error };
    }
  }

  /**
   * Registra el inicio de sesión de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} sessionId - ID de la sesión
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User agent del navegador
   * @param {Object} deviceInfo - Información del dispositivo
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async logUserLogin(userId, sessionId, ipAddress, userAgent, deviceInfo = {}) {
    try {
      const { data, error } = await supabase
        .from('session_logs')
        .insert([{
          user_id: userId,
          session_id: sessionId,
          login_time: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
          device_info: deviceInfo,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estadística de logins diarios
      await this.updateUsageStatistic('daily_logins', 1, 'count');

      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error al registrar login:', error);
      return { success: false, error };
    }
  }

  /**
   * Registra el cierre de sesión de un usuario
   * @param {string} sessionId - ID de la sesión
   * @param {string} logoutReason - Razón del logout
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async logUserLogout(sessionId, logoutReason = 'manual') {
    try {
      const logoutTime = new Date();
      
      // Obtener información de la sesión
      const { data: sessionData, error: sessionError } = await supabase
        .from('session_logs')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (sessionError) throw sessionError;

      // Calcular duración de la sesión
      const loginTime = new Date(sessionData.login_time);
      const durationSeconds = Math.floor((logoutTime - loginTime) / 1000);

      // Actualizar el log de sesión
      const { error } = await supabase
        .from('session_logs')
        .update({
          logout_time: logoutTime.toISOString(),
          duration_seconds: durationSeconds,
          is_active: false,
          logout_reason: logoutReason
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      // Actualizar estadística de duración promedio de sesión
      await this.updateUsageStatistic('avg_session_duration', durationSeconds, 'average');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error al registrar logout:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas resumidas del sistema
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getSystemSummary() {
    try {
      // Usuarios activos hoy
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data: activeToday, error: activeTodayError } = await supabase
        .from('session_logs')
        .select('user_id', { count: 'exact' })
        .gte('login_time', startOfDay.toISOString())
        .eq('is_active', true);

      if (activeTodayError) throw activeTodayError;

      // Total de usuarios
      const { data: totalUsers, error: totalUsersError } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact' })
        .eq('activo', true);

      if (totalUsersError) throw totalUsersError;

      // Evaluaciones completadas hoy
      const { data: evaluationsToday, error: evaluationsTodayError } = await supabase
        .from('evaluaciones')
        .select('id', { count: 'exact' })
        .gte('fecha_evaluacion', startOfDay.toISOString())
        .eq('estado', 'Completada');

      if (evaluationsTodayError) throw evaluationsTodayError;

      // Actividad reciente
      const { data: recentActivity, error: recentActivityError } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          usuario:usuarios(nombre, apellido)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentActivityError) throw recentActivityError;

      return {
        data: {
          activeUsersToday: activeToday.length,
          totalUsers: totalUsers.length,
          evaluationsToday: evaluationsToday.length,
          recentActivity
        },
        error: null
      };
    } catch (error) {
      console.error('Error al obtener resumen del sistema:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtiene métricas de rendimiento
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getPerformanceMetrics(startDate, endDate) {
    try {
      const { data: stats, error } = await this.getUsageStatistics(startDate, endDate);

      if (error) throw error;

      // Procesar estadísticas para métricas de rendimiento
      const metrics = stats.reduce((acc, stat) => {
        if (!acc[stat.metric_name]) {
          acc[stat.metric_name] = [];
        }
        acc[stat.metric_name].push({
          date: stat.date,
          value: stat.metric_value,
          type: stat.metric_type
        });
        return acc;
      }, {});

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error al obtener métricas de rendimiento:', error);
      return { data: null, error };
    }
  }
}

export default new AppUsageService();
