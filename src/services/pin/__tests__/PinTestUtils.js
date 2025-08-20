/**
 * @file PinTestUtils.js
 * @description Testing utilities for pin management system
 */

import { vi } from 'vitest';
import { PIN_CONSTANTS } from '../PinConstants.js';

/**
 * Mock data generators for testing
 */
export class PinTestDataGenerator {
  /**
   * Generate mock psychologist data
   */
  static generatePsychologist(overrides = {}) {
    return {
      id: `psych_${Math.random().toString(36).substr(2, 9)}`,
      nombre: 'Dr. Test',
      apellido: 'Psychologist',
      email: 'test@example.com',
      ...overrides
    };
  }

  /**
   * Generate mock pin usage control data
   */
  static generatePinUsageControl(overrides = {}) {
    return {
      id: `control_${Math.random().toString(36).substr(2, 9)}`,
      psychologist_id: this.generatePsychologist().id,
      total_uses: 100,
      used_uses: 25,
      is_unlimited: false,
      plan_type: PIN_CONSTANTS.PLAN_TYPES.ASSIGNED,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate mock pin usage log
   */
  static generatePinUsageLog(overrides = {}) {
    return {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      psychologist_id: this.generatePsychologist().id,
      action_type: PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED,
      pins_before: 10,
      pins_after: 9,
      pins_consumed: 1,
      description: 'Test pin consumption',
      created_at: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate test scenarios for different pin states
   */
  static generateTestScenarios() {
    return {
      unlimited: {
        psychologist: this.generatePsychologist({ id: 'unlimited_psych' }),
        control: this.generatePinUsageControl({
          psychologist_id: 'unlimited_psych',
          is_unlimited: true,
          total_uses: 0
        })
      },
      
      active: {
        psychologist: this.generatePsychologist({ id: 'active_psych' }),
        control: this.generatePinUsageControl({
          psychologist_id: 'active_psych',
          total_uses: 100,
          used_uses: 25
        })
      },
      
      lowPins: {
        psychologist: this.generatePsychologist({ id: 'low_pins_psych' }),
        control: this.generatePinUsageControl({
          psychologist_id: 'low_pins_psych',
          total_uses: 10,
          used_uses: 7
        })
      },
      
      noPins: {
        psychologist: this.generatePsychologist({ id: 'no_pins_psych' }),
        control: this.generatePinUsageControl({
          psychologist_id: 'no_pins_psych',
          total_uses: 10,
          used_uses: 10
        })
      }
    };
  }
}

/**
 * Mock implementations for testing
 */
export class PinTestMocks {
  /**
   * Create mock Supabase client
   */
  static createMockSupabaseClient() {
    return {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      rpc: vi.fn()
    };
  }

  /**
   * Create mock pin repository
   */
  static createMockPinRepository() {
    return {
      getPsychologistUsage: vi.fn(),
      upsertPsychologistUsage: vi.fn(),
      incrementUsedPins: vi.fn(),
      getPinUsageHistory: vi.fn()
    };
  }

  /**
   * Create mock notification service
   */
  static createMockNotificationService() {
    return {
      createLowPinNotification: vi.fn(),
      createPinExhaustedNotification: vi.fn()
    };
  }
}

/**
 * Test assertion helpers
 */
export class PinTestAssertions {
  /**
   * Assert pin consumption result
   */
  static assertPinConsumption(result, expected) {
    expect(result).toHaveProperty('success', expected.success);
    expect(result).toHaveProperty('psychologistId', expected.psychologistId);
    
    if (expected.remainingPins !== undefined) {
      expect(result).toHaveProperty('remainingPins', expected.remainingPins);
    }
  }

  /**
   * Assert availability check result
   */
  static assertAvailability(result, expected) {
    expect(result).toHaveProperty('canConsume', expected.canConsume);
    expect(result).toHaveProperty('psychologistId', expected.psychologistId);
    
    if (expected.remainingPins !== undefined) {
      expect(result).toHaveProperty('remainingPins', expected.remainingPins);
    }
  }

  /**
   * Assert error properties
   */
  static assertPinError(error, expectedType, expectedCode = null) {
    expect(error).toBeInstanceOf(expectedType);
    
    if (expectedCode) {
      expect(error).toHaveProperty('code', expectedCode);
    }
    
    expect(error).toHaveProperty('timestamp');
    expect(error).toHaveProperty('toJSON');
    expect(error).toHaveProperty('getUserMessage');
  }
}

/**
 * Performance testing utilities
 */
export class PinPerformanceTestUtils {
  /**
   * Measure operation performance
   */
  static async measurePerformance(operation, iterations = 100) {
    const startTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      await operation();
    }
    
    const endTime = process.hrtime.bigint();
    const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    return {
      totalTime,
      averageTime: totalTime / iterations,
      iterations
    };
  }

  /**
   * Test cache performance
   */
  static async testCachePerformance(service, psychologistId, iterations = 1000) {
    // First call to populate cache
    await service.checkAvailability(psychologistId);
    
    // Measure cached calls
    const cachedPerformance = await this.measurePerformance(
      () => service.checkAvailability(psychologistId, { useCache: true }),
      iterations
    );
    
    // Measure non-cached calls
    const nonCachedPerformance = await this.measurePerformance(
      () => service.checkAvailability(psychologistId, { useCache: false }),
      iterations / 10 // Fewer iterations for non-cached to avoid overwhelming DB
    );
    
    return {
      cached: cachedPerformance,
      nonCached: nonCachedPerformance,
      speedupFactor: nonCachedPerformance.averageTime / cachedPerformance.averageTime
    };
  }
}

/**
 * Integration test helpers
 */
export class PinIntegrationTestUtils {
  /**
   * Setup test database state
   */
  static async setupTestData(supabaseClient, scenarios) {
    const setupPromises = Object.values(scenarios).map(async (scenario) => {
      // Insert psychologist
      await supabaseClient
        .from('psicologos')
        .insert(scenario.psychologist);
      
      // Insert usage control
      await supabaseClient
        .from('psychologist_usage_control')
        .insert(scenario.control);
    });
    
    await Promise.all(setupPromises);
  }

  /**
   * Cleanup test data
   */
  static async cleanupTestData(supabaseClient, scenarios) {
    const psychologistIds = Object.values(scenarios).map(s => s.psychologist.id);
    
    // Cleanup in reverse order of dependencies
    await supabaseClient
      .from('pin_usage_logs')
      .delete()
      .in('psychologist_id', psychologistIds);
    
    await supabaseClient
      .from('psychologist_usage_control')
      .delete()
      .in('psychologist_id', psychologistIds);
    
    await supabaseClient
      .from('psicologos')
      .delete()
      .in('id', psychologistIds);
  }

  /**
   * Verify data consistency
   */
  static async verifyDataConsistency(supabaseClient, psychologistId) {
    const [control, logs] = await Promise.all([
      supabaseClient
        .from('psychologist_usage_control')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .single(),
      
      supabaseClient
        .from('pin_usage_logs')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('action_type', PIN_CONSTANTS.ACTION_TYPES.PIN_CONSUMED)
    ]);
    
    const loggedConsumptions = logs.data?.length || 0;
    const recordedUsage = control.data?.used_uses || 0;
    
    return {
      consistent: loggedConsumptions === recordedUsage,
      loggedConsumptions,
      recordedUsage,
      difference: Math.abs(loggedConsumptions - recordedUsage)
    };
  }
}