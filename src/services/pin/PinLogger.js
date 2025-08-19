import { supabase } from '../../api/supabaseClient.js';
import { PIN_CONSTANTS } from './PinConstants.js';

/**
 * Handles all pin-related logging operations
 */
export class PinLogger {
  /**
   * Logs a pin action to the database
   */
  static async logAction(psychologistId, actionType, metadata = {}, patientId = null, testSessionId = null, reportId = null) {
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
          pins_consumed: actionType === PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED ? 1 : 0,
          description: this.getActionDescription(actionType, metadata),
          metadata: metadata
        });

      if (error) {
        console.error('Error logging pin action:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logAction:', error);
      throw error;
    }
  }

  /**
   * Gets a human-readable description for an action
   */
  static getActionDescription(actionType, metadata) {
    switch (actionType) {
      case PIN_CONSTANTS.ACTION_TYPES.PIN_ASSIGNED:
        return `Assigned ${metadata.pins_assigned || 0} pins${metadata.is_unlimited ? ' (unlimited plan)' : ''}`;
      case PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED:
        return metadata.is_unlimited 
          ? 'Pin consumed (unlimited plan)' 
          : `Pin consumed. ${metadata.pins_after || 0} pins remaining`;
      case PIN_CONSTANTS.ACTION_TYPES.TEST_COMPLETED:
        return 'Test completed - Pin consumed automatically';
      case PIN_CONSTANTS.ACTION_TYPES.REPORT_GENERATED:
        return 'Report generated - Pin consumed automatically';
      default:
        return `Action: ${actionType}`;
    }
  }

  /**
   * Console logging with consistent format
   */
  static logInfo(message, data = null) {
    console.log(`[PinControl] ${message}`, data || '');
  }

  static logError(message, error = null) {
    console.error(`[PinControl] ${message}`, error || '');
  }

  static logSuccess(message, data = null) {
    console.log(`[PinControl] ✅ ${message}`, data || '');
  }
}