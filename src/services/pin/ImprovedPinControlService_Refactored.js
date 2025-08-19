import { supabase } from '../../api/supabaseClient.js';
import { PIN_CONSTANTS } from './PinConstants.js';
import { PinValidator } from './PinValidator.js';
import { PinLogger } from './PinLogger.js';
import { PinUsageRepository } from './PinUsageRepository.js';
import { NotificationService } from './NotificationService.js';

// Extract constants for better maintainability
const RPC_FUNCTIONS = {
  GET_ALL_PSYCHOLOGISTS_PIN_BALANCE: 'get_all_psychologists_pin_balance'
};

const DEFAULT_VALUES = {
  ASSIGNED_PATIENTS: 0,
  COMPLETED_TESTS: 0
};

/**
 * Factory for creating standardized psychologist data objects
 */
class PsychologistDataFactory {
  static createFromControl(psychologist, control = null) {
    const totalUses = control?.total_uses || 0;
    const usedUses = control?.used_uses || 0;
    const isUnlimited = control?.is_unlimited || false;
    
    return {
      // Primary identifiers
      psychologist_id: psychologist.id,
      psychologist_name: `${psychologist.nombre} ${psychologist.apellido}`,
      psychologist_email: psychologist.email,
      
      // Pin usage data
      total_pins: totalUses,
      used_pins: usedUses,
      remaining_pins: isUnlimited ? null : Math.max(0, totalUses - usedUses),
      is_unlimited: isUnlimited,
      plan_type: control?.plan_type || 'none',
      
      // Metadata
      last_activity: control?.updated_at,
      assigned_patients: DEFAULT_VALUES.ASSIGNED_PATIENTS,
      completed_tests: DEFAULT_VALUES.COMPLETED_TESTS,
      
      // Legacy compatibility (consider removing in future versions)
      psych_id: psychologist.id,
      psych_name: `${psychologist.nombre} ${psychologist.apellido}`,
      psych_email: psychologist.email,
      nombre: psychologist.nombre,
      apellido: psychologist.apellido,
      email: psychologist.email,
      total_asignado: totalUses,
      total_consumido: usedUses,
      pines_disponibles: isUnlimited ? null : Math.max(0, totalUses - usedUses)
    };
  }
}

/**
 * Strategy for fetching psychologist data
 */
class PsychologistFetchStrategy {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Unified method for fetching psychologists with fallback mechanism
   */
  async fetchPsychologists(onlyWithPins = false) {
    try {
      // Try optimized RPC function first
      const optimizedData = await this._tryOptimizedFetch();
      if (optimizedData) {
        return this._filterByPinStatus(optimizedData, onlyWithPins);
      }
    } catch (error) {
      PinLogger.logError('Optimized fetch failed, falling back to manual query', error);
    }

    // Fallback to manual query
    return await this._fetchManually(onlyWithPins);
  }

  /**
   * Try to fetch using optimized RPC function
   * @private
   */
  async _tryOptimizedFetch() {
    const { data, error } = await this.supabase.rpc(RPC_FUNCTIONS.GET_ALL_PSYCHOLOGISTS_PIN_BALANCE);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }

  /**
   * Filter data based on pin status
   * @private
   */
  _filterByPinStatus(data, onlyWithPins) {
    if (!onlyWithPins) {
      return data;
    }
    
    return data.filter(item => 
      item.total_uses > 0 || item.is_unlimited
    );
  }

  /**
   * Manual fallback query with proper error handling
   * @private
   */
  async _fetchManually(onlyWithPins = false) {
    const queryBuilder = new PsychologistQueryBuilder(this.supabase);
    const query = queryBuilder
      .selectBasicFields()
      .includeUsageControl()
      .conditionallyFilterByPins(onlyWithPins)
      .build();

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }

    return this._transformManualData(data || []);
  }

  /**
   * Transform manual query results to expected format
   * @private
   */
  _transformManualData(psychologists) {
    return psychologists.map(psychologist => {
      const control = psychologist.psychologist_usage_control?.[0];
      return PsychologistDataFactory.createFromControl(psychologist, control);
    });
  }
}

/**
 * Builder for constructing Supabase queries
 */
class PsychologistQueryBuilder {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.query = this.supabase.from('psicologos');
  }

  selectBasicFields() {
    this.query = this.query.select(`
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
    return this;
  }

  includeUsageControl() {
    // Already included in selectBasicFields
    return this;
  }

  conditionallyFilterByPins(onlyWithPins) {
    if (onlyWithPins) {
      this.query = this.query.not('psychologist_usage_control.id', 'is', null);
    }
    return this;
  }

  build() {
    return this.query;
  }
}

/**
 * Improved Pin Control Service with better architecture
 */
class ImprovedPinControlService {
  constructor() {
    this.repository = new PinUsageRepository();
    this.notificationService = new NotificationService();
    this.validator = new PinValidator();
    this.logger = new PinLogger();
    this.fetchStrategy = new PsychologistFetchStrategy(supabase);
  }

  /**
   * Gets pin consumption statistics with optimized queries
   * @returns {Promise<Array>} List of psychologist statistics
   */
  async getPinConsumptionStats() {
    try {
      PinLogger.logInfo('Getting pin consumption statistics...');
      
      const rawData = await this.fetchStrategy.fetchPsychologists(true);
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
      
      const rawData = await this.fetchStrategy.fetchPsychologists(false);
      const processedData = rawData.map(item => this._transformPsychologistStats(item, true));
      
      PinLogger.logSuccess(`All psychologists retrieved: ${processedData.length}`);
      return processedData;
    } catch (error) {
      PinLogger.logError('Error getting all psychologists', error);
      throw error;
    }
  }

  // ... rest of the methods remain the same ...

  /**
   * Transforms raw psychologist data to expected format
   * @private
   */
  _transformPsychologistStats(item, includeNoControl = false) {
    const totalPins = item.total_pins || 0;
    const usedPins = item.used_pins || 0;
    const remainingPins = item.is_unlimited ? null : Math.max(0, totalPins - usedPins);
    
    const result = {
      psychologist_id: item.psychologist_id || item.id,
      psychologist_name: item.psychologist_name || `${item.nombre} ${item.apellido}`,
      psychologist_email: item.psychologist_email || item.email,
      total_pins: totalPins,
      used_pins: usedPins,
      remaining_pins: remainingPins,
      is_unlimited: item.is_unlimited || false,
      plan_type: item.plan_type || 'none',
      usage_percentage: this._calculateUsagePercentage(usedPins, totalPins, item.is_unlimited),
      assigned_patients: item.assigned_patients || 0,
      completed_tests: item.completed_tests || 0,
      status: this._determineStatus(item.is_unlimited, totalPins, remainingPins),
      last_activity: item.last_activity || item.updated_at
    };

    if (includeNoControl) {
      result.has_control = !!(item.total_pins !== undefined || item.is_unlimited);
    }

    return result;
  }

  // ... rest of the private methods remain the same ...
}

export default new ImprovedPinControlService();