import { supabase } from '../../api/supabaseClient.js';
import { PIN_CONSTANTS } from './PinConstants.js';
import { PinValidator } from './PinValidator.js';
import { PinLogger } from './PinLogger.js';
import { PinUsageRepository } from './PinUsageRepository.js';
import { NotificationService } from './NotificationService.js';

/**
 * Main service for pin control operations
 * Orchestrates pin assignment, consumption, and tracking
 */
class PinControlService {
  constructor() {
    this.repository = new PinUsageRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Assigns pins to a psychologist
   */
  async assignPins(psychologistId, pins, isUnlimited = false, planType = PIN_CONSTANTS.PLAN_TYPES.ASSIGNED) {
    // Validate input
    const validation = PinValidator.validateAssignPins(psychologistId, pins, isUnlimited, planType);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
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
   * Gets pin consumption statistics
   */
  async getPinConsumptionStats() {
    try {
      PinLogger.logInfo('Getting pin consumption stats');
      
      const { data, error } = await supabase.rpc('get_pin_consumption_stats');
      
      if (error) {
        throw error;
      }
      
      PinLogger.logSuccess(`Pin stats retrieved: ${data?.length || 0} psychologists`);
      return data || [];
    } catch (error) {
      PinLogger.logError('Error getting pin consumption stats', error);
      throw error;
    }
  }

  /**
   * Gets pin usage history
   */
  async getPinUsageHistory(psychologistId = null, limit = PIN_CONSTANTS.DEFAULT_HISTORY_LIMIT) {
    try {
      return await this.repository.getPinUsageHistory(psychologistId, limit);
    } catch (error) {
      PinLogger.logError('Error getting pin usage history', error);
      throw error;
    }
  }

  /**
   * Gets pin consumption alerts
   */
  async getPinConsumptionAlerts() {
    try {
      const { data, error } = await supabase.rpc('get_pin_consumption_alerts');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      PinLogger.logError('Error getting pin consumption alerts', error);
      throw error;
    }
  }

  /**
   * Gets system usage summary
   */
  async getSystemSummary() {
    try {
      const { data, error } = await supabase.rpc('get_system_usage_summary');
      
      if (error) throw error;
      
      return data || {};
    } catch (error) {
      PinLogger.logError('Error getting system summary', error);
      throw error;
    }
  }

  // Private methods

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
-    await this.repository.incrementUsedPins(control.id);
+    try {
+      await this.repository.incrementUsedPins(control.id);
+    } catch (e) {
+      if (e?.code === 'P0001') {
+        throw new Error(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
+      }
+      throw e;
+    }

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
    if (newRemainingPins <= PIN_CONSTANTS.LOW_PIN_THRESHOLD && newRemainingPins > 0) {
      await this.notificationService.createLowPinNotification(psychologistId, newRemainingPins);
    }

    PinLogger.logSuccess(`Pin consumed. Remaining pins: ${newRemainingPins}`);
    return true;
  }
}

export default new PinControlService();