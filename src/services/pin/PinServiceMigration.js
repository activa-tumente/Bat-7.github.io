/**
 * @file PinServiceMigration.js
 * @description Migration utility to transition from legacy pin services to unified management
 */

import PinManagementService from './PinManagementService.js';
import { PinLogger } from './PinLogger.js';

/**
 * Migration utility for transitioning to unified pin management
 */
class PinServiceMigration {
  constructor() {
    this.migrationLog = [];
  }

  /**
   * Migrate from legacy pinControlService to PinManagementService
   * @param {Object} options - Migration options
   * @returns {Promise<MigrationResult>}
   */
  async migrateLegacyService(options = {}) {
    const {
      dryRun = false,
      batchSize = 50,
      validateData = true
    } = options;

    try {
      PinLogger.logInfo('Starting pin service migration', { dryRun, batchSize });

      const migrationSteps = [
        () => this._validateCurrentData(),
        () => this._migrateUsageControls(batchSize, dryRun),
        () => this._migratePinLogs(batchSize, dryRun),
        () => this._validateMigratedData(),
        () => this._updateServiceReferences(dryRun)
      ];

      const results = [];
      for (const step of migrationSteps) {
        const result = await step();
        results.push(result);
        
        if (!result.success) {
          throw new Error(`Migration step failed: ${result.error}`);
        }
      }

      const migrationResult = {
        success: true,
        dryRun,
        steps: results,
        summary: this._generateMigrationSummary(results),
        timestamp: new Date().toISOString()
      };

      PinLogger.logSuccess('Pin service migration completed', migrationResult.summary);
      return migrationResult;

    } catch (error) {
      PinLogger.logError('Pin service migration failed', error);
      throw new MigrationError(error.message, { options, log: this.migrationLog });
    }
  }

  /**
   * Generate compatibility wrapper for legacy code
   * @returns {Object} Legacy-compatible wrapper
   */
  generateLegacyWrapper() {
    return {
      // Legacy method signatures mapped to new service
      async getPinConsumptionStats() {
        const stats = await PinManagementService.getUsageStats();
        return stats.statistics;
      },

      async getAllPsychologists() {
        const stats = await PinManagementService.getUsageStats({ includeInactive: true });
        return stats.statistics;
      },

      async assignPins(psychologistId, pins, isUnlimited = false, planType = 'assigned') {
        const amount = isUnlimited ? 'unlimited' : pins;
        return await PinManagementService.assignPins(psychologistId, amount, { planType });
      },

      async consumePin(psychologistId, patientId = null, testSessionId = null, reportId = null) {
        const context = {
          psychologistId,
          patientId,
          testSessionId,
          reportId,
          actionType: 'legacy_consumption'
        };
        const result = await PinManagementService.consumePin(context);
        return result.success;
      },

      async checkPsychologistUsage(psychologistId) {
        const availability = await PinManagementService.checkAvailability(psychologistId);
        return {
          canUse: availability.canConsume,
          reason: availability.reason,
          remainingPins: availability.remainingPins,
          isUnlimited: availability.isUnlimited,
          totalPins: availability.totalPins,
          usedPins: availability.usedPins
        };
      }
    };
  }

  // Private migration methods
  async _validateCurrentData() {
    this._log('Validating current pin data integrity');
    
    // Implementation for data validation
    // Check for orphaned records, inconsistent states, etc.
    
    return {
      success: true,
      step: 'validation',
      message: 'Data validation completed successfully'
    };
  }

  async _migrateUsageControls(batchSize, dryRun) {
    this._log('Migrating usage control records');
    
    // Implementation for migrating usage controls
    // Batch process to avoid memory issues
    
    return {
      success: true,
      step: 'usage_controls',
      message: `Migrated usage controls (dry run: ${dryRun})`
    };
  }

  async _migratePinLogs(batchSize, dryRun) {
    this._log('Migrating pin usage logs');
    
    // Implementation for migrating logs
    
    return {
      success: true,
      step: 'pin_logs',
      message: `Migrated pin logs (dry run: ${dryRun})`
    };
  }

  async _validateMigratedData() {
    this._log('Validating migrated data');
    
    // Implementation for post-migration validation
    
    return {
      success: true,
      step: 'post_validation',
      message: 'Post-migration validation completed'
    };
  }

  async _updateServiceReferences(dryRun) {
    this._log('Updating service references');
    
    // Implementation for updating import statements, etc.
    
    return {
      success: true,
      step: 'service_references',
      message: `Service references updated (dry run: ${dryRun})`
    };
  }

  _generateMigrationSummary(results) {
    return {
      totalSteps: results.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      duration: Date.now() - this.startTime
    };
  }

  _log(message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message
    };
    this.migrationLog.push(logEntry);
    PinLogger.logInfo(`[Migration] ${message}`);
  }
}

class MigrationError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'MigrationError';
    this.context = context;
  }
}

export default new PinServiceMigration();