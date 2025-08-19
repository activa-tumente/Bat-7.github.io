/**
 * @file SimplePinService.js
 * @description Servicio simplificado para gestión de pines que evita problemas de RLS
 * Usa directamente la tabla pines_transacciones sin depender de servicios complejos
 */

import { supabase } from '../../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Servicio simplificado para gestión de pines
 */
class SimplePinService {
  /**
   * Obtener todos los psicólogos con sus estadísticas de pines
   * @returns {Promise<Array>} Lista de psicólogos con estadísticas
   */
  async getPsychologistsWithPinStats() {
    try {
      console.log('📊 [SimplePinService] Obteniendo estadísticas de pines...');
      
      // Usar la función SQL optimizada
      const { data, error } = await supabase.rpc('get_all_psychologists_pin_balance');
      
      if (error) {
        console.error('❌ [SimplePinService] Error en función SQL:', error);
        throw error;
      }

      // Transformar los datos para el formato esperado
      const transformedData = (data || []).map(item => ({
        psicologo_id: item.psych_id,
        nombre_psicologo: item.psych_name,
        email_psicologo: item.psych_email,
        total_asignado: parseInt(item.total_asignado) || 0,
        total_consumido: parseInt(item.total_consumido) || 0,
        pines_restantes: parseInt(item.pines_disponibles) || 0,
        ultima_transaccion: item.ultima_transaccion,
        pacientes_asignados: parseInt(item.pacientes_asignados) || 0,
        tests_completados: parseInt(item.tests_completados) || 0,
        status: this._determineStatus(parseInt(item.pines_disponibles) || 0)
      }));
      
      console.log(`✅ [SimplePinService] Estadísticas obtenidas para ${transformedData.length} psicólogos.`);
      return transformedData;
      
    } catch (error) {
      console.error('❌ [SimplePinService] Error en getPsychologistsWithPinStats:', error);
      throw error;
    }
  }

  /**
   * Asignar pines a un psicólogo usando solo la tabla pines_transacciones
   * @param {string} psychologistId - ID del psicólogo
   * @param {number} amount - Cantidad de pines a asignar
   * @param {string} reason - Motivo de la asignación
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignPins(psychologistId, amount, reason = 'Asignación manual') {
    // Validaciones de entrada
    if (!psychologistId || !amount || amount <= 0) {
      const errorMessage = 'Se requiere ID del psicólogo y una cantidad positiva de pines.';
      console.error(`❌ [SimplePinService] ${errorMessage}`);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      console.log(`➕ [SimplePinService] Asignando ${amount} pines a psicólogo ${psychologistId}...`);
      
      // Verificar que el psicólogo existe
      const { data: psychologist, error: psychError } = await supabase
        .from('psicologos')
        .select('id, nombre, apellido, email')
        .eq('id', psychologistId)
        .single();

      if (psychError || !psychologist) {
        const errorMessage = 'Psicólogo no encontrado.';
        console.error(`❌ [SimplePinService] ${errorMessage}`, psychError);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Crear la transacción de asignación directamente
      const transaction = {
        psicologo_id: psychologistId,
        cantidad: amount,
        tipo: 'asignacion',
        motivo: reason,
        metadata: {
          psychologist_name: `${psychologist.nombre} ${psychologist.apellido}`,
          psychologist_email: psychologist.email,
          assigned_at: new Date().toISOString(),
          method: 'simple_service'
        }
      };

      const { data, error } = await supabase
        .from('pines_transacciones')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('❌ [SimplePinService] Error al registrar la transacción:', error);
        toast.error('No se pudo completar la asignación de pines.');
        throw error;
      }

      console.log('✅ [SimplePinService] Pines asignados exitosamente. Transacción:', data.id);
      toast.success(`Se asignaron ${amount} pines a ${psychologist.nombre} ${psychologist.apellido} correctamente.`);
      
      return data;

    } catch (error) {
      console.error('❌ [SimplePinService] Error en assignPins:', error);
      throw error;
    }
  }

  /**
   * Obtener balance de un psicólogo específico
   * @param {string} psychologistId - ID del psicólogo
   * @returns {Promise<Object>} Balance del psicólogo
   */
  async getPsychologistBalance(psychologistId) {
    try {
      const { data, error } = await supabase.rpc('get_psychologist_pin_balance', {
        p_psicologo_id: psychologistId
      });

      if (error) {
        console.error('❌ [SimplePinService] Error obteniendo balance:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          psicologo_id: psychologistId,
          total_asignado: 0,
          total_consumido: 0,
          pines_disponibles: 0,
          ultima_transaccion: null
        };
      }

      return data[0];

    } catch (error) {
      console.error('❌ [SimplePinService] Error en getPsychologistBalance:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de transacciones
   * @param {string} psychologistId - ID del psicólogo (opcional)
   * @param {number} limit - Límite de registros
   * @returns {Promise<Array>} Historial de transacciones
   */
  async getTransactionHistory(psychologistId = null, limit = 50) {
    try {
      let query = supabase
        .from('pines_transacciones')
        .select(`
          *,
          psicologos (
            nombre,
            apellido,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (psychologistId) {
        query = query.eq('psicologo_id', psychologistId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SimplePinService] Error obteniendo historial:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('❌ [SimplePinService] Error en getTransactionHistory:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del sistema
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getSystemStats() {
    try {
      const psychologists = await this.getPsychologistsWithPinStats();
      
      const stats = {
        total_psychologists: psychologists.length,
        total_pins_assigned: psychologists.reduce((sum, p) => sum + p.total_asignado, 0),
        total_pins_consumed: psychologists.reduce((sum, p) => sum + p.total_consumido, 0),
        total_pins_available: psychologists.reduce((sum, p) => sum + p.pines_restantes, 0),
        psychologists_with_pins: psychologists.filter(p => p.pines_restantes > 0).length,
        psychologists_without_pins: psychologists.filter(p => p.pines_restantes === 0).length,
        total_patients: psychologists.reduce((sum, p) => sum + p.pacientes_asignados, 0),
        total_tests: psychologists.reduce((sum, p) => sum + p.tests_completados, 0)
      };

      return stats;

    } catch (error) {
      console.error('❌ [SimplePinService] Error en getSystemStats:', error);
      throw error;
    }
  }

  /**
   * Consumir un pin (registrar consumo)
   * @param {string} psychologistId - ID del psicólogo
   * @param {string} reason - Motivo del consumo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Resultado del consumo
   */
  async consumePin(psychologistId, reason = 'Consumo automático', metadata = {}) {
    try {
      console.log(`🔥 [SimplePinService] Registrando consumo de pin para psicólogo ${psychologistId}...`);
      
      // Verificar balance actual
      const balance = await this.getPsychologistBalance(psychologistId);
      if (balance.pines_disponibles <= 0) {
        const errorMessage = 'El psicólogo no tiene pines disponibles.';
        console.error(`❌ [SimplePinService] ${errorMessage}`);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Crear la transacción de consumo
      const transaction = {
        psicologo_id: psychologistId,
        cantidad: -1, // Negativo para indicar consumo
        tipo: 'consumo',
        motivo: reason,
        metadata: {
          ...metadata,
          consumed_at: new Date().toISOString(),
          remaining_pins_before: balance.pines_disponibles,
          remaining_pins_after: balance.pines_disponibles - 1
        }
      };

      const { data, error } = await supabase
        .from('pines_transacciones')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('❌ [SimplePinService] Error al registrar consumo:', error);
        throw error;
      }

      console.log('✅ [SimplePinService] Pin consumido exitosamente. Transacción:', data.id);
      return data;

    } catch (error) {
      console.error('❌ [SimplePinService] Error en consumePin:', error);
      throw error;
    }
  }

  /**
   * Determinar el estado de un psicólogo basado en sus pines disponibles
   * @private
   * @param {number} availablePins - Pines disponibles
   * @returns {string} Estado del psicólogo
   */
  _determineStatus(availablePins) {
    if (availablePins === 0) return 'sin_pines';
    if (availablePins <= 5) return 'pocos_pines';
    return 'activo';
  }

  /**
   * Eliminar una transacción de pines específica
   * @param {string} transactionId - ID de la transacción a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteTransaction(transactionId) {
    try {
      console.log(`🗑️ [SimplePinService] Eliminando transacción ${transactionId}...`);
      
      // Obtener información de la transacción antes de eliminarla
      const { data: transactionData, error: fetchError } = await supabase
        .from('pines_transacciones')
        .select('psicologo_id, cantidad, tipo')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        console.error('❌ [SimplePinService] Error al obtener transacción:', fetchError);
        throw fetchError;
      }

      // Eliminar la transacción
      const { data, error } = await supabase
        .from('pines_transacciones')
        .delete()
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('❌ [SimplePinService] Error al eliminar transacción:', error);
        throw error;
      }

      console.log('✅ [SimplePinService] Transacción eliminada exitosamente:', data.id);
      
      // Recalcular métricas del psicólogo afectado
      await this._refreshPsychologistMetrics(transactionData.psicologo_id);
      
      return { success: true, data, affectedPsychologist: transactionData.psicologo_id };
    } catch (error) {
      console.error('❌ [SimplePinService] Error en deleteTransaction:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar múltiples transacciones de pines
   * @param {Array<string>} ids - Array de IDs de transacciones a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteMultipleTransactions(ids) {
    try {
      console.log(`🗑️ [SimplePinService] Eliminando múltiples transacciones:`, ids);
      
      if (!ids || ids.length === 0) {
        throw new Error('No se proporcionaron IDs para eliminar');
      }

      // Obtener información de las transacciones antes de eliminarlas
      const { data: transactionsData, error: fetchError } = await supabase
        .from('pines_transacciones')
        .select('psicologo_id, cantidad, tipo')
        .in('id', ids);

      if (fetchError) {
        console.error('❌ [SimplePinService] Error al obtener transacciones:', fetchError);
        throw fetchError;
      }

      // Obtener psicólogos únicos afectados
      const affectedPsychologists = [...new Set(transactionsData.map(t => t.psicologo_id))];

      // Eliminar las transacciones
      const { data, error } = await supabase
        .from('pines_transacciones')
        .delete()
        .in('id', ids)
        .select();

      if (error) {
        console.error('❌ [SimplePinService] Error al eliminar múltiples transacciones:', error);
        throw error;
      }

      console.log(`✅ [SimplePinService] ${data.length} transacciones eliminadas exitosamente`);
      
      // Recalcular métricas para todos los psicólogos afectados
      for (const psychologistId of affectedPsychologists) {
        await this._refreshPsychologistMetrics(psychologistId);
      }
      
      return { 
        success: true, 
        deletedCount: data.length, 
        data, 
        affectedPsychologists 
      };
    } catch (error) {
      console.error('❌ [SimplePinService] Error en deleteMultipleTransactions:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar cantidad específica de pines de un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {number} amount - Cantidad de pines a eliminar
   * @param {string} reason - Motivo de la eliminación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removePinsFromPsychologist(psychologistId, amount, reason = 'Eliminación manual de pines') {
    try {
      console.log(`➖ [SimplePinService] Eliminando ${amount} pines del psicólogo ${psychologistId}...`);
      
      // Validaciones de entrada
      if (!psychologistId || !amount || amount <= 0) {
        throw new Error('Se requiere ID del psicólogo y una cantidad positiva de pines.');
      }

      // Verificar que el psicólogo existe
      const { data: psychologist, error: psychError } = await supabase
        .from('psicologos')
        .select('id, nombre, apellido, email')
        .eq('id', psychologistId)
        .single();

      if (psychError || !psychologist) {
        throw new Error('Psicólogo no encontrado.');
      }

      // Obtener balance actual del psicólogo
      const balance = await this.getPsychologistBalance(psychologistId);
      if (balance.pines_disponibles < amount) {
        throw new Error(`No se pueden eliminar ${amount} pines. Solo hay ${balance.pines_disponibles} disponibles.`);
      }

      // Crear transacción de eliminación (cantidad negativa)
      const transaction = {
        psicologo_id: psychologistId,
        cantidad: -amount, // Cantidad negativa para indicar eliminación
        tipo: 'eliminacion',
        motivo: reason,
        metadata: {
          psychologist_name: `${psychologist.nombre} ${psychologist.apellido}`,
          psychologist_email: psychologist.email,
          removed_at: new Date().toISOString(),
          method: 'manual_removal',
          original_amount: amount
        }
      };

      const { data, error } = await supabase
        .from('pines_transacciones')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        console.error('❌ [SimplePinService] Error al crear transacción de eliminación:', error);
        throw error;
      }

      console.log(`✅ [SimplePinService] ${amount} pines eliminados exitosamente del psicólogo ${psychologistId}`);
      
      // Refrescar métricas
      await this._refreshPsychologistMetrics(psychologistId);
      
      return { success: true, data, removedAmount: amount };
    } catch (error) {
      console.error('❌ [SimplePinService] Error en removePinsFromPsychologist:', error);
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar completamente la asignación de pines de un psicólogo (solo pines, no datos del psicólogo)
   * @param {string} psychologistId - ID del psicólogo
   * @param {string} reason - Motivo de la eliminación completa
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removePsychologistPinAssignment(psychologistId, reason = 'Eliminación completa de asignación') {
    try {
      console.log(`🗑️ [SimplePinService] Eliminando asignación completa de pines del psicólogo ${psychologistId}...`);
      
      // Verificar que el psicólogo existe
      const { data: psychologist, error: psychError } = await supabase
        .from('psicologos')
        .select('id, nombre, apellido, email')
        .eq('id', psychologistId)
        .single();

      if (psychError || !psychologist) {
        throw new Error('Psicólogo no encontrado.');
      }

      // Obtener todas las transacciones del psicólogo
      const { data: transactions, error: fetchError } = await supabase
        .from('pines_transacciones')
        .select('id, cantidad, tipo')
        .eq('psicologo_id', psychologistId);

      if (fetchError) {
        console.error('❌ [SimplePinService] Error al obtener transacciones:', fetchError);
        throw fetchError;
      }

      if (!transactions || transactions.length === 0) {
        console.log(`ℹ️ [SimplePinService] No hay transacciones para eliminar del psicólogo ${psychologistId}. Ya está limpio.`);
        
        // Refrescar métricas de todas formas
        await this._refreshPsychologistMetrics(psychologistId);
        
        return { 
          success: true, 
          data: [], 
          deletedTransactions: 0,
          psychologist: `${psychologist.nombre} ${psychologist.apellido}`,
          psychologist_name: `${psychologist.nombre} ${psychologist.apellido}`,
          message: 'No había transacciones para eliminar'
        };
      }

      // Eliminar todas las transacciones del psicólogo
      const transactionIds = transactions.map(t => t.id);
      const { data, error } = await supabase
        .from('pines_transacciones')
        .delete()
        .in('id', transactionIds)
        .select();

      if (error) {
        console.error('❌ [SimplePinService] Error al eliminar transacciones:', error);
        throw error;
      }

      console.log(`✅ [SimplePinService] Asignación completa eliminada para psicólogo ${psychologistId}. ${data.length} transacciones eliminadas.`);
      
      // Refrescar métricas
      await this._refreshPsychologistMetrics(psychologistId);
      
      return { 
        success: true, 
        data, 
        deletedTransactions: data.length,
        psychologist: `${psychologist.nombre} ${psychologist.apellido}`,
        psychologist_name: `${psychologist.nombre} ${psychologist.apellido}`
      };
    } catch (error) {
      console.error('❌ [SimplePinService] Error en removePsychologistPinAssignment:', error);
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar múltiples asignaciones de psicólogos (solo pines, no datos de psicólogos)
   * @param {Array<string>} psychologistIds - Array de IDs de psicólogos
   * @param {string} reason - Motivo de la eliminación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeMultiplePsychologistAssignments(psychologistIds, reason = 'Eliminación múltiple de asignaciones') {
    try {
      console.log(`🗑️ [SimplePinService] Eliminando asignaciones de ${psychologistIds.length} psicólogos...`);
      
      if (!psychologistIds || psychologistIds.length === 0) {
        throw new Error('No se proporcionaron IDs de psicólogos para eliminar');
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;
      let totalDeletedTransactions = 0;
      let totalDeletedUsageControl = 0;
      
      for (const psychologistId of psychologistIds) {
        try {
          const result = await this.removePsychologistPinAssignment(psychologistId, reason);
          
          if (result.success) {
            successCount++;
            totalDeletedTransactions += result.deletedTransactions;
            results.push({
              psychologistId,
              success: true,
              deletedTransactions: result.deletedTransactions,
              psychologist: result.psychologist,
              psychologist_name: result.psychologist_name
            });
          } else {
            errorCount++;
            results.push({
              psychologistId,
              success: false,
              error: result.message
            });
          }
        } catch (error) {
          errorCount++;
          results.push({
            psychologistId,
            success: false,
            error: error.message
          });
        }

        // Pequeña pausa entre eliminaciones para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ [SimplePinService] Eliminación múltiple completada: ${successCount} exitosos, ${errorCount} errores`);
      
      return {
        success: successCount > 0,
        message: `Procesados ${psychologistIds.length} psicólogos: ${successCount} exitosos, ${errorCount} errores`,
        successCount,
        errorCount,
        totalDeletedTransactions,
        totalDeletedUsageControl,
        results
      };
    } catch (error) {
      console.error('❌ [SimplePinService] Error en removeMultiplePsychologistAssignments:', error);
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Método privado para refrescar métricas de un psicólogo específico
   * @param {string} psychologistId - ID del psicólogo
   * @private
   */
  async _refreshPsychologistMetrics(psychologistId) {
    try {
      console.log(`🔄 [SimplePinService] Refrescando métricas para psicólogo ${psychologistId}`);
      
      // Llamar a la función SQL que recalcula el balance
      const { data, error } = await supabase
        .rpc('get_psychologist_pin_balance', { p_psicologo_id: psychologistId });

      if (error) {
        console.warn('⚠️ [SimplePinService] Error al refrescar métricas:', error);
        // No lanzamos error aquí para no interrumpir el flujo principal
        return;
      }

      console.log('✅ [SimplePinService] Métricas refrescadas exitosamente');
      return data;
    } catch (error) {
      console.warn('⚠️ [SimplePinService] Error al refrescar métricas:', error);
      // No lanzamos error aquí para no interrumpir el flujo principal
    }
  }
}

// Exportar instancia singleton
const simplePinService = new SimplePinService();
export default simplePinService;