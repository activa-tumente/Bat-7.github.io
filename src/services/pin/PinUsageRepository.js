import { supabase } from '../../api/supabaseClient.js';
import { PIN_CONSTANTS } from './PinConstants.js';

/**
 * Repository for pin usage data operations
 */
export class PinUsageRepository {
  /**
   * Gets psychologist usage control data
   */
  async getPsychologistUsage(psychologistId) {
    const { data, error } = await supabase
      .from('psychologist_usage_control')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Creates or updates psychologist usage control
   */
  async upsertPsychologistUsage(psychologistId, pins, isUnlimited, planType) {
    const existing = await this.getPsychologistUsage(psychologistId);

    if (existing) {
      return await this._updateExistingUsage(existing, pins, isUnlimited, planType);
    } else {
      return await this._createNewUsage(psychologistId, pins, isUnlimited, planType);
    }
  }

  /**
   * Increments used pins count
   */
  async incrementUsedPins(controlId) {
    const { data, error } = await supabase.rpc('consume_pin', { p_control_id: controlId });

    if (error) throw error;
    return data;
  }

  /**
   * Gets pin usage history with related data
   */
  async getPinUsageHistory(psychologistId = null, limit = PIN_CONSTANTS.DEFAULT_HISTORY_LIMIT) {
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
  }

  // Private methods

  /**
   * Updates existing usage control record
   * @private
   */
  async _updateExistingUsage(existing, pins, isUnlimited, planType) {
    console.log('Updating existing usage:', { existing, pins, isUnlimited, planType });
    const newTotal = isUnlimited ? existing.total_uses : (existing.total_uses + pins);
    
    const { data, error } = await supabase
      .from('psychologist_usage_control')
      .update({
        total_uses: newTotal,
        is_unlimited: isUnlimited,
        plan_type: planType,
        updated_at: new Date().toISOString(),
        is_active: true // Asegurarse de que el registro permanezca activo
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating existing usage:', error);
      throw error;
    }
    console.log('Update successful:', data);
    return data;
  }

  /**
   * Creates new usage control record
   * @private
   */
  async _createNewUsage(psychologistId, pins, isUnlimited, planType) {
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
    return data;
  }
}