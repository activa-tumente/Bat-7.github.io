import { supabase } from '../api/supabaseClient';

// Constants for pin control
const PIN_THRESHOLDS = {
  LOW_PIN_WARNING: 5,
  CRITICAL_PIN_WARNING: 2
};

const PIN_STATUS = {
  UNLIMITED: 'unlimited',
  ACTIVE: 'active',
  LOW_PINS: 'low_pins',
  NO_PINS: 'no_pins'
};

const PLAN_TYPES = {
  UNLIMITED: 'unlimited',
  ASSIGNED: 'assigned',
  TRIAL: 'trial',
  NONE: 'none'
};

/**
 * Servicio para el control de pines por psicólogo
 * Maneja la asignación, consumo y seguimiento de pines
 * 
 * @deprecated Considerar migrar a ImprovedPinControlService para mejor rendimiento
 */
class PinControlService {
  /**
   * Obtiene todos los psicólogos con sus estadísticas de pines
   * Utiliza consulta optimizada para evitar N+1 queries
   * @returns {Promise<Array>} Lista completa de psicólogos
   */
  async getAllPsychologists() {
    try {
      console.log('🔍 Obteniendo todos los psicólogos...');
      
      // Usar función SQL optimizada que maneja todo en una sola consulta
      const { data, error } = await supabase.rpc('get_all_psychologists_with_stats');
      
      if (error) {
        console.error('❌ Error en función SQL optimizada:', error);
        // Fallback a método manual si la función SQL no existe
        return await this._getAllPsychologistsManual();
      }

      const processedData = (data || []).map(item => this._transformPsychologistData(item, true));
      
      console.log('✅ Todos los psicólogos obtenidos (optimizado):', processedData.length);
      return processedData;
    } catch (error) {
      console.error('❌ Error en getAllPsychologists:', error);
      // Fallback en caso de error
      return await this._getAllPsychologistsManual();
    }
  }

  /**
   * Método manual como fallback (mantiene funcionalidad existente)
   * @private
   */
  async _getAllPsychologistsManual() {
    console.log('⚠️ Usando método manual como fallback');
    
    // Obtener todos los psicólogos
    const { data: psychologists, error: psychError } = await supabase
      .from('psicologos')
      .select('id, nombre, apellido, email')
      .order('nombre');
    
    if (psychError) throw psychError;

    // Obtener controles de uso existentes
    const { data: controls, error: controlError } = await supabase
      .from('psychologist_usage_control')
      .select('*')
      .eq('is_active', true);
    
    if (controlError) throw controlError;

    // Obtener conteos agregados para reducir queries
    const { data: patientCounts, error: patientError } = await supabase
      .from('pacientes')
      .select('psicologo_id')
      .not('psicologo_id', 'is', null);
    
    if (patientError) throw patientError;

    const { data: testCounts, error: testError } = await supabase
      .from('resultados')
      .select(`
        pacientes!inner(psicologo_id)
      `);
    
    if (testError) throw testError;

    // Crear mapas de conteos para evitar queries en loop
    const patientCountMap = this._createCountMap(patientCounts, 'psicologo_id');
    const testCountMap = this._createCountMap(testCounts.map(t => ({ psicologo_id: t.pacientes.psicologo_id })), 'psicologo_id');

    const processedData = (psychologists || []).map(psychologist => {
      const control = controls?.find(c => c.psychologist_id === psychologist.id);
      const assignedPatients = patientCountMap.get(psychologist.id) || 0;
      const completedTests = testCountMap.get(psychologist.id) || 0;

      return this._transformPsychologistData({
        psychologist_id: psychologist.id,
        nombre: psychologist.nombre,
        apellido: psychologist.apellido,
        email: psychologist.email,
        total_uses: control?.total_uses || 0,
        used_uses: control?.used_uses || 0,
        is_unlimited: control?.is_unlimited || false,
        plan_type: control?.plan_type || 'none',
        updated_at: control?.updated_at,
        assigned_patients: assignedPatients,
        completed_tests: completedTests
      }, true);
    });
    
    return processedData;
  }

  /**
   * Crea un mapa de conteos para evitar loops anidados
   * @private
   */
  _createCountMap(items, keyField) {
    const countMap = new Map();
    items.forEach(item => {
      const key = item[keyField];
      if (key) {
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    });
    return countMap;
  }

  /**
   * Transforma datos de psicólogo a formato esperado
   * @private
   */
  _transformPsychologistData(item, includeHasControl = false) {
    const totalPins = item.total_uses || 0;
    const usedPins = item.used_uses || 0;
    const remainingPins = item.is_unlimited ? null : Math.max(0, totalPins - usedPins);
    
    const status = this._determineStatus(item.is_unlimited, totalPins, remainingPins);

    const result = {
      psychologist_id: item.psychologist_id || item.id,
      psychologist_name: `${item.nombre} ${item.apellido}`,
      psychologist_email: item.email,
      total_pins: totalPins,
      used_pins: usedPins,
      remaining_pins: remainingPins,
      is_unlimited: item.is_unlimited || false,
      plan_type: item.plan_type || 'none',
      usage_percentage: this._calculateUsagePercentage(usedPins, totalPins, item.is_unlimited),
      assigned_patients: item.assigned_patients || 0,
      completed_tests: item.completed_tests || 0,
      status,
      last_activity: item.updated_at
    };

    if (includeHasControl) {
      result.has_control = !!(item.total_uses !== undefined || item.is_unlimited);
    }

    return result;
  }

  /**
   * Transforma datos de la función get_pin_stats_v2 a formato esperado
   * @private
   */
  _transformPinStatsData(item) {
    return {
      psychologist_id: item.psych_id,
      psychologist_name: item.psych_name,
      psychologist_email: item.psych_email,
      total_pins: item.total_pins,
      used_pins: item.used_pins,
      remaining_pins: item.remaining_pins,
      is_unlimited: item.is_unlimited,
      plan_type: item.plan_type,
      usage_percentage: parseFloat(item.usage_percentage) || 0,
      assigned_patients: item.assigned_patients,
      completed_tests: item.completed_tests,
      pins_consumed_today: item.pins_consumed_today,
      status: item.status,
      last_activity: item.last_activity
    };
  }

  /**
   * Obtiene las estadísticas de consumo de pines (solo psicólogos con control activo)
   * Utiliza consulta optimizada para evitar N+1 queries
   * @returns {Promise<Array>} Lista de estadísticas por psicólogo
   */
  async getPinConsumptionStats() {
    try {
      console.log('🔍 Obteniendo estadísticas de consumo de pines...');
      
      // Usar función SQL corregida
      const { data, error } = await supabase.rpc('get_pin_stats_v2');
      
      if (error) {
        console.error('❌ Error en función SQL:', error);
        // Fallback a método manual
        return await this._getPinConsumptionStatsManual();
      }

      const processedData = (data || []).map(item => this._transformPinStatsData(item));
      
      console.log('✅ Estadísticas de pines obtenidas (optimizado):', processedData.length, 'psicólogos');
      return processedData;
    } catch (error) {
      console.error('❌ Error en getPinConsumptionStats:', error);
      // Fallback en caso de error
      return await this._getPinConsumptionStatsManual();
    }
  }

  /**
   * Método manual como fallback para estadísticas
   * @private
   */
  async _getPinConsumptionStatsManual() {
    console.log('⚠️ Usando método manual para estadísticas como fallback');
    
    const { data, error } = await supabase
      .from('psicologos')
      .select(`
        id,
        nombre,
        apellido,
        email,
        psychologist_usage_control!inner (
          total_uses,
          used_uses,
          is_unlimited,
          plan_type,
          updated_at,
          is_active
        )
      `)
      .eq('psychologist_usage_control.is_active', true);
    
    if (error) throw error;

    // Obtener conteos agregados
    const psychologistIds = data.map(p => p.id);
    
    const { data: patientCounts } = await supabase
      .from('pacientes')
      .select('psicologo_id')
      .in('psicologo_id', psychologistIds);
    
    const { data: testCounts } = await supabase
      .from('resultados')
      .select('pacientes!inner(psicologo_id)')
      .in('pacientes.psicologo_id', psychologistIds);

    // Crear mapas de conteos
    const patientCountMap = this._createCountMap(patientCounts || [], 'psicologo_id');
    const testCountMap = this._createCountMap((testCounts || []).map(t => ({ psicologo_id: t.pacientes.psicologo_id })), 'psicologo_id');

    const processedData = (data || []).map(psychologist => {
      const control = psychologist.psychologist_usage_control[0];
      const assignedPatients = patientCountMap.get(psychologist.id) || 0;
      const completedTests = testCountMap.get(psychologist.id) || 0;

      return this._transformPsychologistData({
        psychologist_id: psychologist.id,
        nombre: psychologist.nombre,
        apellido: psychologist.apellido,
        email: psychologist.email,
        total_uses: control?.total_uses || 0,
        used_uses: control?.used_uses || 0,
        is_unlimited: control?.is_unlimited || false,
        plan_type: control?.plan_type || 'none',
        updated_at: control?.updated_at,
        assigned_patients: assignedPatients,
        completed_tests: completedTests
      });
    });
    
    return processedData;
  }

  /**
   * Asigna pines a un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {number} pins - Cantidad de pines a asignar
   * @param {boolean} isUnlimited - Si es plan ilimitado
   * @param {string} planType - Tipo de plan
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignPins(psychologistId, pins, isUnlimited = false, planType = 'assigned') {
    try {
      console.log('📌 Asignando pines:', { psychologistId, pins, isUnlimited, planType });
      
      // Verificar si ya existe un control para este psicólogo
      const { data: existing, error: checkError } = await supabase
        .from('psychologist_usage_control')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('is_active', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      
      if (existing) {
        // Actualizar registro existente (incrementar pines)
        const newTotal = isUnlimited ? 0 : (existing.total_uses + pins);
        
        const { data, error } = await supabase
          .from('psychologist_usage_control')
          .update({
            total_uses: newTotal,
            is_unlimited: isUnlimited,
            plan_type: planType,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Crear nuevo registro
        const { data, error } = await supabase
          .from('psychologist_usage_control')
          .insert({
            psychologist_id: psychologistId,
            total_uses: isUnlimited ? 0 : pins,
            used_uses: 0,
            is_unlimited: isUnlimited,
            plan_type: planType,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Registrar en logs
      await this.logPinAction(psychologistId, 'pin_assigned', {
        pins_assigned: pins,
        is_unlimited: isUnlimited,
        plan_type: planType
      });

      console.log('✅ Pines asignados correctamente');
      return result;
    } catch (error) {
      console.error('❌ Error al asignar pines:', error);
      throw error;
    }
  }

  /**
   * Consume un pin del psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {string} patientId - ID del paciente
   * @param {string} testSessionId - ID de la sesión de test
   * @param {string} reportId - ID del informe generado
   * @returns {Promise<boolean>} True si se pudo consumir el pin
   */
  async consumePin(psychologistId, patientId = null, testSessionId = null, reportId = null) {
    try {
      console.log('🔥 Consumiendo pin:', { psychologistId, patientId, testSessionId, reportId });
      
      // Obtener el control actual del psicólogo
      const { data: control, error: controlError } = await supabase
        .from('psychologist_usage_control')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('is_active', true)
        .single();

      if (controlError) {
        console.error('❌ No se encontró control de uso para el psicólogo:', controlError);
        throw new Error('No se encontró control de uso para este psicólogo');
      }

      // Si es ilimitado, no consumir pin pero registrar la acción
      if (control.is_unlimited) {
        await this.logPinAction(psychologistId, 'pin_consumed', {
          patient_id: patientId,
          test_session_id: testSessionId,
          report_id: reportId,
          is_unlimited: true
        }, patientId, testSessionId, reportId);
        
        console.log('✅ Pin consumido (plan ilimitado)');
        return true;
      }

      // Verificar si tiene pines disponibles
      const remainingPins = control.total_uses - control.used_uses;
      if (remainingPins <= 0) {
        console.error('❌ No hay pines disponibles');
        throw new Error('No hay pines disponibles para este psicólogo');
      }

      // Consumir el pin
      const { data, error } = await supabase
        .from('psychologist_usage_control')
        .update({
          used_uses: control.used_uses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', control.id)
        .select()
        .single();

      if (error) throw error;

      // Registrar en logs
      await this.logPinAction(psychologistId, 'pin_consumed', {
        pins_before: remainingPins,
        pins_after: remainingPins - 1,
        patient_id: patientId,
        test_session_id: testSessionId,
        report_id: reportId
      }, patientId, testSessionId, reportId);

      // Crear notificación si quedan pocos pines
      const newRemainingPins = remainingPins - 1;
      if (newRemainingPins <= PIN_THRESHOLDS.LOW_PIN_WARNING && newRemainingPins > 0) {
        await this.createLowPinNotification(psychologistId, newRemainingPins);
      }

      console.log('✅ Pin consumido correctamente. Pines restantes:', remainingPins - 1);
      return true;
    } catch (error) {
      console.error('❌ Error al consumir pin:', error);
      throw error;
    }
  }

  /**
   * Verifica si un psicólogo puede usar el sistema
   * @param {string} psychologistId - ID del psicólogo
   * @returns {Promise<Object>} Estado del psicólogo
   */
  async checkPsychologistUsage(psychologistId) {
    try {
      const { data, error } = await supabase
        .from('psychologist_usage_control')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return {
          canUse: false,
          reason: 'No tiene pines asignados',
          remainingPins: 0,
          isUnlimited: false
        };
      }

      if (data.is_unlimited) {
        return {
          canUse: true,
          reason: 'Plan ilimitado',
          remainingPins: null,
          isUnlimited: true
        };
      }

      const remainingPins = data.total_uses - data.used_uses;
      
      return {
        canUse: remainingPins > 0,
        reason: remainingPins > 0 ? 'Pines disponibles' : 'Sin pines disponibles',
        remainingPins,
        isUnlimited: false,
        totalPins: data.total_uses,
        usedPins: data.used_uses
      };
    } catch (error) {
      console.error('❌ Error al verificar uso del psicólogo:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de uso de pines
   * @param {string} psychologistId - ID del psicólogo (opcional)
   * @param {number} limit - Límite de registros
   * @returns {Promise<Array>} Historial de uso
   */
  async getPinUsageHistory(psychologistId = null, limit = 50) {
    try {
      let query = supabase
        .from('pin_usage_logs')
        .select(`
          *,
          psychologist:psicologos(nombre, apellido, email),
          patient:pacientes(nombre, apellido, documento)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (psychologistId) {
        query = query.eq('psychologist_id', psychologistId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error al obtener historial de pines:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas de consumo de pines
   * @returns {Promise<Array>} Lista de alertas
   */
  async getPinConsumptionAlerts() {
    try {
      const stats = await this.getPinConsumptionStats();
      const alerts = [];

      stats.forEach(stat => {
        if (stat.status === 'low_pins') {
          alerts.push({
            type: 'warning',
            psychologist_id: stat.psychologist_id,
            psychologist_name: stat.psychologist_name,
            message: `${stat.psychologist_name} tiene solo ${stat.remaining_pins} pines restantes`,
            severity: 'warning'
          });
        } else if (stat.status === 'no_pins') {
          alerts.push({
            type: 'error',
            psychologist_id: stat.psychologist_id,
            psychologist_name: stat.psychologist_name,
            message: `${stat.psychologist_name} no tiene pines disponibles`,
            severity: 'error'
          });
        }
      });
      
      return alerts;
    } catch (error) {
      console.error('❌ Error al obtener alertas de pines:', error);
      throw error;
    }
  }

  /**
   * Registra una acción de pin en los logs
   * @private
   */
  async logPinAction(psychologistId, actionType, metadata = {}, patientId = null, testSessionId = null, reportId = null) {
    try {
      const { error } = await supabase
        .from('pin_usage_logs')
        .insert({
          psychologist_id: psychologistId,
          patient_id: patientId,
          test_session_id: testSessionId,
          report_id: reportId,
          action_type: actionType,
          pins_before: metadata.pins_before || 0,
          pins_after: metadata.pins_after || 0,
          pins_consumed: actionType === 'pin_consumed' ? 1 : 0,
          description: this.getActionDescription(actionType, metadata),
          metadata: metadata
        });

      if (error) {
        console.error('❌ Error al registrar log de pin:', error);
      }
    } catch (error) {
      console.error('❌ Error en logPinAction:', error);
    }
  }

  /**
   * Crea una notificación de pines bajos
   * @private
   */
  async createLowPinNotification(psychologistId, remainingPins) {
    try {
      const { error } = await supabase.rpc('create_low_pin_notification', {
        p_psychologist_id: psychologistId,
        p_remaining_pins: remainingPins
      });

      if (error) {
        console.error('❌ Error al crear notificación de pines bajos:', error);
      }
    } catch (error) {
      console.error('❌ Error en createLowPinNotification:', error);
    }
  }

  /**
   * Determina el estado del psicólogo basado en sus pines
   * @private
   */
  _determineStatus(isUnlimited, totalPins, remainingPins) {
    if (isUnlimited) {
      return PIN_STATUS.UNLIMITED;
    }
    
    if (totalPins === 0) {
      return PIN_STATUS.NO_PINS;
    }
    
    if (remainingPins <= 0) {
      return PIN_STATUS.NO_PINS;
    }
    
    if (remainingPins <= PIN_THRESHOLDS.LOW_PIN_WARNING) {
      return PIN_STATUS.LOW_PINS;
    }
    
    return PIN_STATUS.ACTIVE;
  }

  /**
   * Calcula el porcentaje de uso de pines
   * @private
   */
  _calculateUsagePercentage(usedPins, totalPins, isUnlimited) {
    if (isUnlimited || totalPins === 0) {
      return 0;
    }
    return Math.round((usedPins / totalPins) * 100 * 100) / 100;
  }

  /**
   * Obtiene la descripción de una acción
   * @private
   */
  getActionDescription(actionType, metadata) {
    switch (actionType) {
      case 'pin_assigned':
        return `Se asignaron ${metadata.pins_assigned || 0} pines${metadata.is_unlimited ? ' (plan ilimitado)' : ''}`;
      case 'pin_consumed':
        return metadata.is_unlimited 
          ? 'Pin consumido (plan ilimitado)' 
          : `Pin consumido. Quedan ${metadata.pins_after || 0} pines`;
      case 'test_completed':
        return 'Test completado - Pin consumido automáticamente';
      case 'report_generated':
        return 'Informe generado - Pin consumido automáticamente';
      default:
        return `Acción: ${actionType}`;
    }
  }

  /**
   * Obtiene resumen del sistema de pines
   * @returns {Promise<Object>} Resumen del sistema
   */
  async getSystemSummary() {
    try {
      const stats = await this.getPinConsumptionStats();
      
      const summary = {
        totalPsychologists: stats.length,
        totalPinsAssigned: stats.reduce((acc, stat) => acc + (stat.is_unlimited ? 0 : stat.total_pins), 0),
        totalPinsUsed: stats.reduce((acc, stat) => acc + stat.used_pins, 0),
        totalPinsRemaining: stats.reduce((acc, stat) => acc + (stat.is_unlimited ? 0 : (stat.remaining_pins || 0)), 0),
        unlimitedPsychologists: stats.filter(stat => stat.is_unlimited).length,
        activePsychologists: stats.filter(stat => stat.status === 'active').length,
        lowPinsPsychologists: stats.filter(stat => stat.status === 'low_pins').length,
        noPinsPsychologists: stats.filter(stat => stat.status === 'no_pins').length,
        totalPatients: stats.reduce((acc, stat) => acc + stat.assigned_patients, 0),
        totalTests: stats.reduce((acc, stat) => acc + stat.completed_tests, 0)
      };
      
      return summary;
    } catch (error) {
      console.error('❌ Error al obtener resumen del sistema:', error);
      throw error;
    }
  }
}

// Export singleton instance
const pinControlServiceInstance = new PinControlService();

// Add migration helper
pinControlServiceInstance.getMigrationRecommendation = () => {
  console.warn(`
    ⚠️  MIGRATION RECOMMENDATION ⚠️
    
    This service (pinControlService.js) has performance issues with N+1 queries.
    Consider migrating to ImprovedPinControlService for better performance:
    
    // Instead of:
    import pinControlService from './pinControlService';
    
    // Use:
    import pinControlService from './pin/ImprovedPinControlService';
    
    The API is compatible, but performance is significantly better.
    See PIN_SERVICE_IMPROVEMENTS_ANALYSIS.md for details.
  `);
};

export default pinControlServiceInstance;