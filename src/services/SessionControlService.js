/**
 * @file SessionControlService.js
 * @description Servicio para controlar las sesiones de test y evaluaciones
 */

import { supabase } from '../api/supabaseClient';
import { toast } from 'react-toastify';

class SessionControlService {
  /**
   * Inicia una nueva sesión de test para un paciente
   * @param {string} pacienteId - ID del paciente
   * @param {string} testId - ID del test
   * @param {Object} user - Usuario que inicia la sesión
   * @param {string} aptitudId - ID de la aptitud (opcional)
   * @returns {Promise<Object>} Sesión creada
   */
  static async startSession(pacienteId, testId, user, aptitudId = null) {
    try {
      console.log('🚀 [SessionControlService] Iniciando sesión:', { pacienteId, testId, user: user?.id });

      const sessionData = {
        paciente_id: pacienteId,
        test_id: testId,
        usuario_id: user?.id,
        aptitud_id: aptitudId,
        fecha_inicio: new Date().toISOString(),
        estado: 'iniciado',
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const { data, error } = await supabase
        .from('test_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        // Si es error 406 (tabla no existe), crear sesión mock
        if (error.status === 406) {
          console.warn('⚠️ [SessionControlService] Tabla test_sessions no existe, creando sesión mock');
          return {
            id: `mock-session-${Date.now()}`,
            paciente_id: pacienteId,
            test_id: testId,
            estado: 'iniciado',
            fecha_inicio: new Date().toISOString()
          };
        }
        console.error('❌ [SessionControlService] Error creando sesión:', error);
        throw error;
      }

      console.log('✅ [SessionControlService] Sesión iniciada:', data.id);
      return data;
    } catch (error) {
      // Manejar errores HTTP 406 (tabla no existe)
      if (error.status === 406) {
        console.warn('⚠️ [SessionControlService] Tabla test_sessions no existe, creando sesión mock');
        return {
          id: `mock-session-${Date.now()}`,
          paciente_id: pacienteId,
          test_id: testId,
          estado: 'iniciado',
          fecha_inicio: new Date().toISOString()
        };
      }
      console.error('❌ [SessionControlService] Error en startSession:', error);
      throw error;
    }
  }

  /**
   * Finaliza una sesión de test
   * @param {string} sessionId - ID de la sesión
   * @param {Object} user - Usuario que finaliza la sesión
   * @param {Object} resultados - Resultados de la sesión (opcional)
   * @returns {Promise<Object>} Sesión actualizada
   */
  static async finishSession(sessionId, user, resultados = null) {
    try {
      console.log('🏁 [SessionControlService] Finalizando sesión:', sessionId);

      // Si es una sesión mock, retornar datos mock
      if (sessionId && sessionId.startsWith('mock-session-')) {
        console.warn('⚠️ [SessionControlService] Finalizando sesión mock');
        return {
          id: sessionId,
          estado: 'finalizado',
          fecha_fin: new Date().toISOString()
        };
      }

      const updateData = {
        fecha_fin: new Date().toISOString(),
        estado: 'finalizado',
        updated_at: new Date().toISOString()
      };

      if (resultados) {
        updateData.resultados = resultados;
      }

      const { data, error } = await supabase
        .from('test_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        // Si es error 406 (tabla no existe), retornar datos mock
        if (error.status === 406) {
          console.warn('⚠️ [SessionControlService] Tabla test_sessions no existe, retornando finalización mock');
          return {
            id: sessionId,
            estado: 'finalizado',
            fecha_fin: new Date().toISOString()
          };
        }
        console.error('❌ [SessionControlService] Error finalizando sesión:', error);
        throw error;
      }

      console.log('✅ [SessionControlService] Sesión finalizada:', data.id);
      return data;
    } catch (error) {
      // Manejar errores HTTP 406 (tabla no existe)
      if (error.status === 406) {
        console.warn('⚠️ [SessionControlService] Tabla test_sessions no existe, retornando finalización mock');
        return {
          id: sessionId,
          estado: 'finalizado',
          fecha_fin: new Date().toISOString()
        };
      }
      console.error('❌ [SessionControlService] Error en finishSession:', error);
      throw error;
    }
  }

  /**
   * Cancela una sesión de test
   * @param {string} sessionId - ID de la sesión
   * @param {Object} user - Usuario que cancela la sesión
   * @param {string} reason - Razón de la cancelación
   * @returns {Promise<Object>} Sesión actualizada
   */
  static async cancelSession(sessionId, user, reason = 'Cancelado por usuario') {
    try {
      console.log('❌ [SessionControlService] Cancelando sesión:', sessionId);

      const { data, error } = await supabase
        .from('test_sessions')
        .update({
          fecha_fin: new Date().toISOString(),
          estado: 'cancelado',
          updated_at: new Date().toISOString(),
          resultados: { cancelled: true, reason }
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('❌ [SessionControlService] Error cancelando sesión:', error);
        throw error;
      }

      console.log('✅ [SessionControlService] Sesión cancelada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ [SessionControlService] Error en cancelSession:', error);
      throw error;
    }
  }

  /**
   * Obtiene la sesión activa de un paciente
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Object|null>} Sesión activa o null
   */
  static async getActiveSession(pacienteId) {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'iniciado')
        .order('fecha_inicio', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si es error 406 (tabla no existe) o PGRST116 (no hay resultados), retornar null silenciosamente
        if (error.code === 'PGRST116' || error.status === 406) {
          console.warn('⚠️ [SessionControlService] Tabla test_sessions no disponible o sin resultados');
          return null;
        }
        console.error('❌ [SessionControlService] Error obteniendo sesión activa:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      // Manejar errores HTTP 406 (tabla no existe)
      if (error.status === 406) {
        console.warn('⚠️ [SessionControlService] Tabla test_sessions no existe en la base de datos');
        return null;
      }
      console.error('❌ [SessionControlService] Error en getActiveSession:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las sesiones de un paciente
   * @param {string} pacienteId - ID del paciente
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de sesiones
   */
  static async getPatientSessions(pacienteId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select(`
          *,
          aptitudes (
            codigo,
            nombre
          )
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha_inicio', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [SessionControlService] Error obteniendo sesiones del paciente:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [SessionControlService] Error en getPatientSessions:', error);
      throw error;
    }
  }

  /**
   * Verifica si un paciente tiene sesiones finalizadas sin consumo de pin
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Array>} Sesiones pendientes de consumo
   */
  static async getSessionsPendingPinConsumption(pacienteId) {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'finalizado')
        .is('pin_consumed_at', null)
        .order('fecha_fin', { ascending: false });

      if (error) {
        console.error('❌ [SessionControlService] Error obteniendo sesiones pendientes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [SessionControlService] Error en getSessionsPendingPinConsumption:', error);
      throw error;
    }
  }

  /**
   * Marca una sesión como consumida para pines
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Object>} Sesión actualizada
   */
  static async markSessionPinConsumed(sessionId) {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .update({ 
          pin_consumed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('❌ [SessionControlService] Error marcando sesión como consumida:', error);
        throw error;
      }

      console.log('✅ [SessionControlService] Sesión marcada como consumida:', sessionId);
      return data;
    } catch (error) {
      console.error('❌ [SessionControlService] Error en markSessionPinConsumed:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de sesiones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas
   */
  static async getSessionStats(filters = {}) {
    try {
      let query = supabase
        .from('test_sessions')
        .select('*');

      // Aplicar filtros si se proporcionan
      if (filters.pacienteId) {
        query = query.eq('paciente_id', filters.pacienteId);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.fechaDesde) {
        query = query.gte('fecha_inicio', filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        query = query.lte('fecha_inicio', filters.fechaHasta);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SessionControlService] Error obteniendo estadísticas:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        iniciadas: data.filter(s => s.estado === 'iniciado').length,
        finalizadas: data.filter(s => s.estado === 'finalizado').length,
        canceladas: data.filter(s => s.estado === 'cancelado').length,
        pendientesPinConsumo: data.filter(s => s.estado === 'finalizado' && !s.pin_consumed_at).length,
        conPinConsumido: data.filter(s => s.pin_consumed_at).length
      };

      return stats;
    } catch (error) {
      console.error('❌ [SessionControlService] Error en getSessionStats:', error);
      throw error;
    }
  }

  /**
   * Obtiene la IP del cliente (método auxiliar)
   * @private
   * @returns {Promise<string>} IP del cliente
   */
  static async getClientIP() {
    try {
      // En un entorno real, esto podría venir del servidor
      // Por ahora retornamos un placeholder
      return '127.0.0.1';
    } catch (error) {
      console.warn('⚠️ [SessionControlService] No se pudo obtener IP del cliente');
      return 'unknown';
    }
  }

  /**
   * Limpia sesiones antiguas (utilidad de mantenimiento)
   * @param {number} daysOld - Días de antigüedad para limpiar
   * @returns {Promise<number>} Número de sesiones limpiadas
   */
  static async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('test_sessions')
        .delete()
        .lt('fecha_inicio', cutoffDate.toISOString())
        .eq('estado', 'cancelado')
        .select();

      if (error) {
        console.error('❌ [SessionControlService] Error limpiando sesiones:', error);
        throw error;
      }

      console.log(`✅ [SessionControlService] ${data?.length || 0} sesiones limpiadas`);
      return data?.length || 0;
    } catch (error) {
      console.error('❌ [SessionControlService] Error en cleanupOldSessions:', error);
      throw error;
    }
  }
}

export default SessionControlService;