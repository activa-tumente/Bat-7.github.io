import { supabase } from '../../api/supabaseClient.js';
import { PinLogger } from './PinLogger.js';

/**
 * Handles pin-related notifications
 */
export class NotificationService {
  /**
   * Creates a low pin notification
   */
  async createLowPinNotification(psychologistId, remainingPins) {
    try {
      const { error } = await supabase.rpc('create_low_pin_notification', {
        p_psychologist_id: psychologistId,
        p_remaining_pins: remainingPins
      });

      if (error) {
        PinLogger.logError('Error creating low pin notification', error);
        throw error;
      }

      PinLogger.logInfo(`Low pin notification created for psychologist ${psychologistId}`);
    } catch (error) {
      PinLogger.logError('Error in createLowPinNotification', error);
      throw error;
    }
  }

  /**
   * Creates a pin exhausted notification
   */
  async createPinExhaustedNotification(psychologistId) {
    try {
      const { error } = await supabase.rpc('create_pin_exhausted_notification', {
        p_psychologist_id: psychologistId
      });

      if (error) {
        PinLogger.logError('Error creating pin exhausted notification', error);
        throw error;
      }

      PinLogger.logInfo(`Pin exhausted notification created for psychologist ${psychologistId}`);
    } catch (error) {
      PinLogger.logError('Error in createPinExhaustedNotification', error);
      throw error;
    }
  }
}