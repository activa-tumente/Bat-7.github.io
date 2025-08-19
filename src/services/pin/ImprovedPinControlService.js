import { supabase } from '../../api/supabaseClient.js';
import { PIN_CONSTANTS } from './PinConstants.js';
import { PinValidator } from './PinValidator.js';
import { PinLogger } from './PinLogger.js';
import { PinUsageRepository } from './PinUsageRepository.js';
import { NotificationService } from './NotificationService.js';

/**
 * Improved Pin Control Service with better architecture
 * Addresses performance issues and code smells from the original service
 */
class ImprovedPinControlService {
  constructor() {
    this.repository = new PinUsageRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Gets pin consumption statistics with optimized queries
   * @returns {Promise<Array>} List of psychologist statistics
   */
  async getPinConsumptionStats() {
    try {
      PinLogger.logInfo('Getting pin consumption statistics...');
      
      // Use optimized single query instead of N+1 queries
      const rawData = await this._fetchOptimizedPsychologistStats();
      const processedData = rawData.map(item => this._transformPsychologistStats(item));
      
      PinLogger.logSuccess(`Pin statistics retrieved: ${processedData.length} psychologists`);
      return processedData;
    } catch (error) {
      PinLogger.logError('Error getting pin consumption stats', error);
      throw error;
    }
  }

  /**
   * Gets all psychologists with their pin statistics
   * @returns {Promise<Array>} Complete list of psychologists
   */
  async getAllPsychologists() {
    try {
      PinLogger.logInfo('Getting all psychologists...');
      
      const rawData = await this._fetchAllPsychologistsOptimized();
      const processedData = rawData.map(item => this._transformPsychologistStats(item, true));
      
      PinLogger.logSuccess(`All psychologists retrieved: ${processedData.length}`);
      return processedData;
    } catch (error) {
      PinLogger.logError('Error getting all psychologists', error);
      throw error;
    }
  }

  /**
   * Assigns pins to a psychologist
   * @param {string} psychologistId - Psychologist ID
   * @param {number} pins - Number of pins to assign
   * @param {boolean} isUnlimited - Whether it's unlimited plan
   * @param {string} planType - Plan type
   * @returns {Promise<Object>} Assignment result
   */
  async assignPins(psychologistId, pins, isUnlimited = false, planType = PIN_CONSTANTS.PLAN_TYPES.ASSIGNED) {
    try {
      // Validar la asignación
      const validation = PinValidator.validateAssignPins(psychologistId, pins, isUnlimited, planType);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      PinLogger.logInfo('Assigning pins', { psychologistId, pins, isUnlimited, planType });
      
      const result = await this.repository.upsertPsychologistUsage(
        psychologistId, 
        pins, 
        isUnlimited, 
        planType
      );

      // Log the action
      await PinLogger.logAction(psychologistId, PIN_CONSTANTS.ACTION_TYPES.PIN_ASSIGNED, {
        pins_assigned: pins,
        is_unlimited: isUnlimited,
        plan_type: planType
      });

      PinLogger.logSuccess('Pins assigned successfully');
      return result;
    } catch (error) {
      PinLogger.logError('Error assigning pins', error);
      throw error;
    }
  }

  /**
   * Consumes a pin for a psychologist
   * @param {string} psychologistId - Psychologist ID
   * @param {string} patientId - Patient ID (optional)
   * @param {string} testSessionId - Test session ID (optional)
   * @param {string} reportId - Report ID (optional)
   * @returns {Promise<boolean>} Success status
   */
  async consumePin(psychologistId, patientId = null, testSessionId = null, reportId = null) {
    // Validate input
    const validation = PinValidator.validateConsumePin(psychologistId, patientId, testSessionId, reportId);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      PinLogger.logInfo('Consuming pin', { psychologistId, patientId, testSessionId, reportId });
      
      const control = await this.repository.getPsychologistUsage(psychologistId);
      
      if (!control) {
        throw new Error(PIN_CONSTANTS.ERROR_CODES.PSYCHOLOGIST_NOT_FOUND);
      }

      // Handle unlimited plan
      if (control.is_unlimited) {
        return await this._handleUnlimitedPinConsumption(psychologistId, patientId, testSessionId, reportId);
      }

      // Handle limited plan
      return await this._handleLimitedPinConsumption(control, psychologistId, patientId, testSessionId, reportId);
    } catch (error) {
      PinLogger.logError('Error consuming pin', error);
      throw error;
    }
  }

  /**
   * Checks if a psychologist can use the system
   * @param {string} psychologistId - Psychologist ID
   * @returns {Promise<Object>} Usage status
   */
  async checkPsychologistUsage(psychologistId) {
    try {
      const control = await this.repository.getPsychologistUsage(psychologistId);
      
      if (!control) {
        return {
          canUse: false,
          reason: 'No pins assigned',
          remainingPins: 0,
          isUnlimited: false
        };
      }

      if (control.is_unlimited) {
        return {
          canUse: true,
          reason: 'Unlimited plan',
          remainingPins: null,
          isUnlimited: true
        };
      }

      const remainingPins = control.total_uses - control.used_uses;
      
      return {
        canUse: remainingPins > 0,
        reason: remainingPins > 0 ? 'Pins available' : 'No pins available',
        remainingPins,
        isUnlimited: false,
        totalPins: control.total_uses,
        usedPins: control.used_uses
      };
    } catch (error) {
      PinLogger.logError('Error checking psychologist usage', error);
      throw error;
    }
  }

  /**
   * Gets pin usage history
   * @param {string} psychologistId - Psychologist ID (optional)
   * @param {number} limit - Record limit
   * @returns {Promise<Array>} Usage history
   */
  async getPinUsageHistory(psychologistId = null, limit = PIN_CONSTANTS.DEFAULTS.HISTORY_LIMIT) {
    try {
      return await this.repository.getPinUsageHistory(psychologistId, limit);
    } catch (error) {
      PinLogger.logError('Error getting pin usage history', error);
      throw error;
    }
  }

  /**
   * Gets pin consumption alerts
   * @returns {Promise<Array>} List of alerts
   */
  async getPinConsumptionAlerts() {
    try {
      const stats = await this.getPinConsumptionStats();
      return this._generateAlertsFromStats(stats);
    } catch (error) {
      PinLogger.logError('Error getting pin consumption alerts', error);
      throw error;
    }
  }

  /**
   * Gets system usage summary
   * @returns {Promise<Object>} System summary
   */
  async getSystemSummary() {
    try {
      const stats = await this.getPinConsumptionStats();
      return this._calculateSystemSummary(stats);
    } catch (error) {
      PinLogger.logError('Error getting system summary', error);
      throw error;
    }
  }

  // Private methods for better organization

  /**
   * Fetches optimized psychologist statistics with single query
   * @private
   */
  async _fetchOptimizedPsychologistStats() {
    // Use the function we created that works with the new transaction system
    const { data, error } = await supabase.rpc('get_all_psychologists_pin_balance');
    
    if (error) {
      // Fallback to manual query if function doesn't exist
      return await this._fetchPsychologistsManual(true);
    }

    return data || [];
  }

  /**
   * Fetches all psychologists with optimized query
   * @private
   */
  async _fetchAllPsychologistsOptimized() {
    // Use the function we created that works with the new transaction system
    const { data, error } = await supabase.rpc('get_all_psychologists_pin_balance');
    
    if (error) {
      // Fallback to manual query if function doesn't exist
      return await this._fetchPsychologistsManual(false);
    }

    return data || [];
  }

  /**
   * Manual fallback method to fetch psychologists
   * @private
   */
  async _fetchPsychologistsManual(onlyWithPins = false) {
    let query = supabase
      .from('psicologos')
      .select(`
        id,
        nombre,
        apellido,
        email,
        psychologist_usage_control!left (
          total_uses,
          used_uses,
          is_unlimited,
          plan_type,
          updated_at,
          is_active
        )
      `);

    if (onlyWithPins) {
      query = query.not('psychologist_usage_control.id', 'is', null);
    }

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }

    // Transform to expected format
    return (data || []).map(psychologist => {
      const control = psychologist.psychologist_usage_control?.[0];
      return {
        psychologist_id: psychologist.id,
        psych_id: psychologist.id,
        psych_name: `${psychologist.nombre} ${psychologist.apellido}`,
        psych_email: psychologist.email,
        nombre: psychologist.nombre,
        apellido: psychologist.apellido,
        email: psychologist.email,
        total_uses: control?.total_uses || 0,
        used_uses: control?.used_uses || 0,
        is_unlimited: control?.is_unlimited || false,
        plan_type: control?.plan_type || 'none',
        updated_at: control?.updated_at,
        assigned_patients: 0, // Will be calculated separately if needed
        completed_tests: 0, // Will be calculated separately if needed
        total_asignado: control?.total_uses || 0,
        total_consumido: control?.used_uses || 0,
        pines_disponibles: control ? Math.max(0, (control.total_uses || 0) - (control.used_uses || 0)) : 0
      };
    });
  }

  /**
   * Transforms raw psychologist data to expected format
   * @private
   */
  _transformPsychologistStats(item, includeNoControl = false) {
    // Handle both formats: SQL function result and manual query result
    const totalPins = item.total_uses || item.total_asignado || 0;
    const usedPins = item.used_uses || item.total_consumido || 0;
    const remainingPins = item.is_unlimited ? null : Math.max(0, totalPins - usedPins);
    
    // Handle name from different formats
    const psychName = item.psych_name || `${item.nombre} ${item.apellido}`;
    const psychEmail = item.psych_email || item.email;
    
    const result = {
      psychologist_id: item.psychologist_id || item.psych_id || item.id,
      psychologist_name: psychName,
      psychologist_email: psychEmail,
      total_pins: totalPins,
      used_pins: usedPins,
      remaining_pins: remainingPins,
      is_unlimited: item.is_unlimited || false,
      plan_type: item.plan_type || 'none',
      usage_percentage: this._calculateUsagePercentage(usedPins, totalPins, item.is_unlimited),
      assigned_patients: item.assigned_patients || item.pacientes_asignados || 0,
      completed_tests: item.completed_tests || item.tests_completados || 0,
      status: this._determineStatus(item.is_unlimited, totalPins, remainingPins),
      last_activity: item.updated_at || item.ultima_transaccion
    };

    if (includeNoControl) {
      result.has_control = !!(totalPins > 0 || item.is_unlimited);
    }

    return result;
  }

  /**
   * Calculates usage percentage
   * @private
   */
  _calculateUsagePercentage(usedPins, totalPins, isUnlimited) {
    if (isUnlimited || totalPins === 0) return 0;
    return Math.round((usedPins / totalPins) * 100 * 100) / 100;
  }

  /**
   * Determines psychologist status
   * @private
   */
  _determineStatus(isUnlimited, totalPins, remainingPins) {
    if (isUnlimited) return PIN_CONSTANTS.STATUS.UNLIMITED;
    if (totalPins === 0) return PIN_CONSTANTS.STATUS.NO_PINS;
    if (remainingPins <= 0) return PIN_CONSTANTS.STATUS.NO_PINS;
    if (remainingPins <= PIN_CONSTANTS.THRESHOLDS.LOW_PIN_WARNING) return PIN_CONSTANTS.STATUS.LOW_PINS;
    return PIN_CONSTANTS.STATUS.ACTIVE;
  }

  /**
   * Handles pin consumption for unlimited plans
   * @private
   */
  async _handleUnlimitedPinConsumption(psychologistId, patientId, testSessionId, reportId) {
    await PinLogger.logAction(psychologistId, PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED, {
      patient_id: patientId,
      test_session_id: testSessionId,
      report_id: reportId,
      is_unlimited: true
    }, patientId, testSessionId, reportId);
    
    PinLogger.logSuccess('Pin consumed (unlimited plan)');
    return true;
  }

  /**
   * Handles pin consumption for limited plans
   * @private
   */
  async _handleLimitedPinConsumption(control, psychologistId, patientId, testSessionId, reportId) {
    const remainingPins = control.total_uses - control.used_uses;
    
    if (remainingPins <= 0) {
      throw new Error(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
    }

    // Consume the pin
    try {
      await this.repository.incrementUsedPins(control.id);
    } catch (e) {
      if (e?.code === 'P0001') {
        throw new Error(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
      }
      throw e;
    }

    // Log the action
    await PinLogger.logAction(psychologistId, PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED, {
      pins_before: remainingPins,
      pins_after: remainingPins - 1,
      patient_id: patientId,
      test_session_id: testSessionId,
      report_id: reportId
    }, patientId, testSessionId, reportId);

    // Check for low pin notification
    const newRemainingPins = remainingPins - 1;
    if (newRemainingPins <= PIN_CONSTANTS.THRESHOLDS.LOW_PIN_WARNING && newRemainingPins > 0) {
      await this.notificationService.createLowPinNotification(psychologistId, newRemainingPins);
    }

    PinLogger.logSuccess(`Pin consumed. Remaining pins: ${newRemainingPins}`);
    return true;
  }

  /**
   * Generates alerts from statistics
   * @private
   */
  _generateAlertsFromStats(stats) {
    const alerts = [];

    stats.forEach(stat => {
      if (stat.status === PIN_CONSTANTS.STATUS.LOW_PINS) {
        alerts.push({
          type: 'warning',
          psychologist_id: stat.psychologist_id,
          psychologist_name: stat.psychologist_name,
          message: `${stat.psychologist_name} has only ${stat.remaining_pins} pins remaining`,
          severity: 'warning'
        });
      } else if (stat.status === PIN_CONSTANTS.STATUS.NO_PINS) {
        alerts.push({
          type: 'error',
          psychologist_id: stat.psychologist_id,
          psychologist_name: stat.psychologist_name,
          message: `${stat.psychologist_name} has no pins available`,
          severity: 'error'
        });
      }
    });

    return alerts;
  }

  /**
   * Calculates system summary from statistics
   * @private
   */
  _calculateSystemSummary(stats) {
    return {
      totalPsychologists: stats.length,
      totalPinsAssigned: stats.reduce((acc, stat) => acc + (stat.is_unlimited ? 0 : stat.total_pins), 0),
      totalPinsUsed: stats.reduce((acc, stat) => acc + stat.used_pins, 0),
      totalPinsRemaining: stats.reduce((acc, stat) => acc + (stat.is_unlimited ? 0 : (stat.remaining_pins || 0)), 0),
      unlimitedPsychologists: stats.filter(stat => stat.is_unlimited).length,
      activePsychologists: stats.filter(stat => stat.status === PIN_CONSTANTS.STATUS.ACTIVE).length,
      lowPinsPsychologists: stats.filter(stat => stat.status === PIN_CONSTANTS.STATUS.LOW_PINS).length,
      noPinsPsychologists: stats.filter(stat => stat.status === PIN_CONSTANTS.STATUS.NO_PINS).length,
      totalPatients: stats.reduce((acc, stat) => acc + stat.assigned_patients, 0),
      totalTests: stats.reduce((acc, stat) => acc + stat.completed_tests, 0)
    };
  }
}

export { ImprovedPinControlService };
export default new ImprovedPinControlService();