/**
 * Normalizes psychologist data to reduce redundancy and improve performance
 */
export class PsychologistDataNormalizer {
  /**
   * Create a normalized psychologist object with minimal redundancy
   */
  static normalize(psychologist, control = null) {
    const base = {
      id: psychologist.id,
      name: `${psychologist.nombre} ${psychologist.apellido}`,
      email: psychologist.email,
      firstName: psychologist.nombre,
      lastName: psychologist.apellido
    };

    const pinData = control ? {
      totalPins: control.total_uses || 0,
      usedPins: control.used_uses || 0,
      isUnlimited: control.is_unlimited || false,
      planType: control.plan_type || 'none',
      lastActivity: control.updated_at
    } : null;

    return {
      ...base,
      pinData,
      // Computed properties using getters for lazy evaluation
      get remainingPins() {
        if (!pinData || pinData.isUnlimited) return null;
        return Math.max(0, pinData.totalPins - pinData.usedPins);
      },
      
      get usagePercentage() {
        if (!pinData || pinData.isUnlimited || pinData.totalPins === 0) return 0;
        return Math.round((pinData.usedPins / pinData.totalPins) * 100 * 100) / 100;
      },
      
      get status() {
        return PsychologistDataNormalizer._determineStatus(this);
      },
      
      get canUse() {
        return pinData?.isUnlimited || (this.remainingPins > 0);
      }
    };
  }

  /**
   * Convert normalized data to legacy format for backward compatibility
   */
  static toLegacyFormat(normalized) {
    const pinData = normalized.pinData || {};
    
    return {
      // Modern format
      psychologist_id: normalized.id,
      psychologist_name: normalized.name,
      psychologist_email: normalized.email,
      total_pins: pinData.totalPins || 0,
      used_pins: pinData.usedPins || 0,
      remaining_pins: normalized.remainingPins,
      is_unlimited: pinData.isUnlimited || false,
      plan_type: pinData.planType || 'none',
      usage_percentage: normalized.usagePercentage,
      status: normalized.status,
      last_activity: pinData.lastActivity,
      
      // Legacy compatibility (marked for deprecation)
      psych_id: normalized.id,
      psych_name: normalized.name,
      psych_email: normalized.email,
      nombre: normalized.firstName,
      apellido: normalized.lastName,
      email: normalized.email,
      total_asignado: pinData.totalPins || 0,
      total_consumido: pinData.usedPins || 0,
      pines_disponibles: normalized.remainingPins
    };
  }

  /**
   * Determine psychologist status based on pin data
   * @private
   */
  static _determineStatus(normalized) {
    const pinData = normalized.pinData;
    
    if (!pinData) return 'no_pins';
    if (pinData.isUnlimited) return 'unlimited';
    if (pinData.totalPins === 0) return 'no_pins';
    
    const remaining = normalized.remainingPins;
    if (remaining <= 0) return 'no_pins';
    if (remaining <= 5) return 'low_pins'; // Use constant from PIN_CONSTANTS
    
    return 'active';
  }

  /**
   * Batch normalize multiple psychologists efficiently
   */
  static batchNormalize(psychologists, controls = []) {
    const controlMap = new Map(controls.map(c => [c.psychologist_id, c]));
    
    return psychologists.map(psychologist => {
      const control = controlMap.get(psychologist.id);
      return this.normalize(psychologist, control);
    });
  }
}