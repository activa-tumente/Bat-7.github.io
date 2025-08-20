/**
 * @file PinControlServiceIntegration.test.js
 * @description Integration tests for pin control services with P0001 error mapping and smoke tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PinControlService } from '../PinControlService.js';
import { ImprovedPinControlService } from '../ImprovedPinControlService.js';
import { PinUsageRepository } from '../PinUsageRepository.js';
import { PIN_CONSTANTS } from '../PinConstants.js';
import { PinTestDataGenerator, PinTestMocks } from './PinTestUtils.js';

// Mock supabase client for controlled testing
vi.mock('../../../api/supabaseClient.js', () => ({
  supabase: PinTestMocks.createMockSupabaseClient()
}));

describe('Pin Control Services - P0001 Error Mapping & Smoke Tests', () => {
  let pinControlService;
  let improvedPinControlService;
  let mockRepository;
  let testPsychologist;
  let testControl;

  beforeEach(() => {
    // Create fresh instances for each test
    pinControlService = new PinControlService();
    improvedPinControlService = new ImprovedPinControlService();
    
    // Create mock repository with controlled behavior
    mockRepository = PinTestMocks.createMockPinRepository();
    
    // Replace repository instances with mocks
    pinControlService.repository = mockRepository;
    improvedPinControlService.repository = mockRepository;
    
    // Generate test data
    testPsychologist = PinTestDataGenerator.generatePsychologist({
      id: 'test-psych-123'
    });
    
    testControl = PinTestDataGenerator.generatePinUsageControl({
      psychologist_id: testPsychologist.id,
      total_uses: 5,
      used_uses: 4, // Only 1 pin remaining
      is_unlimited: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('P0001 Error Code Mapping', () => {
    it('should map P0001 error to NO_PINS_AVAILABLE in PinControlService', async () => {
      // Arrange: Mock repository to return control data
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // Mock incrementUsedPins to throw P0001 error (race condition scenario)
      const p0001Error = new Error('Pin consumption failed due to race condition');
      p0001Error.code = 'P0001';
      mockRepository.incrementUsedPins.mockRejectedValue(p0001Error);
      
      // Act & Assert: Expect specific error mapping
      await expect(
        pinControlService.consumePin(testPsychologist.id, 'patient-123', 'session-456')
      ).rejects.toThrow(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
      
      // Verify repository calls
      expect(mockRepository.getPsychologistUsage).toHaveBeenCalledWith(testPsychologist.id);
      expect(mockRepository.incrementUsedPins).toHaveBeenCalledWith(testControl.id);
    });

    it('should map P0001 error to NO_PINS_AVAILABLE in ImprovedPinControlService', async () => {
      // Arrange: Mock repository to return control data
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // Mock incrementUsedPins to throw P0001 error
      const p0001Error = new Error('Race condition in consume_pin RPC');
      p0001Error.code = 'P0001';
      mockRepository.incrementUsedPins.mockRejectedValue(p0001Error);
      
      // Act & Assert: Expect specific error mapping
      await expect(
        improvedPinControlService.consumePin(testPsychologist.id, 'patient-123', 'session-456')
      ).rejects.toThrow(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
      
      // Verify repository calls
      expect(mockRepository.getPsychologistUsage).toHaveBeenCalledWith(testPsychologist.id);
      expect(mockRepository.incrementUsedPins).toHaveBeenCalledWith(testControl.id);
    });

    it('should propagate non-P0001 errors without mapping', async () => {
      // Arrange: Mock repository to return control data
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // Mock incrementUsedPins to throw different error
      const networkError = new Error('Network connection failed');
      networkError.code = 'NETWORK_ERROR';
      mockRepository.incrementUsedPins.mockRejectedValue(networkError);
      
      // Act & Assert: Expect original error to be propagated
      await expect(
        pinControlService.consumePin(testPsychologist.id)
      ).rejects.toThrow('Network connection failed');
      
      await expect(
        improvedPinControlService.consumePin(testPsychologist.id)
      ).rejects.toThrow('Network connection failed');
    });
  });

  describe('Limited Plan Smoke Tests', () => {
    it('should successfully consume pin with limited plan when pins available', async () => {
      // Arrange: Mock successful pin consumption
      const updatedControl = { ...testControl, used_uses: testControl.used_uses + 1 };
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      mockRepository.incrementUsedPins.mockResolvedValue(updatedControl);
      
      // Act: Consume pin
      const result = await pinControlService.consumePin(
        testPsychologist.id, 
        'patient-123', 
        'session-456', 
        'report-789'
      );
      
      // Assert: Successful consumption
      expect(result).toBe(true);
      expect(mockRepository.incrementUsedPins).toHaveBeenCalledWith(testControl.id);
    });

    it('should handle pin exhaustion scenario gracefully', async () => {
      // Arrange: Mock exhausted control
      const exhaustedControl = { ...testControl, used_uses: testControl.total_uses };
      mockRepository.getPsychologistUsage.mockResolvedValue(exhaustedControl);
      
      // Act & Assert: Expect exhaustion error
      await expect(
        pinControlService.consumePin(testPsychologist.id)
      ).rejects.toThrow(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
      
      // Verify incrementUsedPins was not called for exhausted control
      expect(mockRepository.incrementUsedPins).not.toHaveBeenCalled();
    });

    it('should handle concurrent pin consumption attempts', async () => {
      // Arrange: Simulate race condition where multiple requests hit simultaneously
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // First call succeeds, second gets P0001 (pins exhausted by first call)
      mockRepository.incrementUsedPins
        .mockResolvedValueOnce({ ...testControl, used_uses: testControl.used_uses + 1 })
        .mockRejectedValueOnce(Object.assign(new Error('No pins available'), { code: 'P0001' }));
      
      // Act: Simulate concurrent calls
      const [result1, result2Error] = await Promise.allSettled([
        pinControlService.consumePin(testPsychologist.id, 'patient-1'),
        pinControlService.consumePin(testPsychologist.id, 'patient-2')
      ]);
      
      // Assert: First succeeds, second gets mapped error
      expect(result1.status).toBe('fulfilled');
      expect(result1.value).toBe(true);
      
      expect(result2Error.status).toBe('rejected');
      expect(result2Error.reason.message).toContain(PIN_CONSTANTS.ERROR_CODES.NO_PINS_AVAILABLE);
    });
  });

  describe('Unlimited Plan Smoke Tests', () => {
    beforeEach(() => {
      // Setup unlimited plan control
      testControl = PinTestDataGenerator.generatePinUsageControl({
        psychologist_id: testPsychologist.id,
        total_uses: 0,
        used_uses: 0,
        is_unlimited: true,
        plan_type: PIN_CONSTANTS.PLAN_TYPES.UNLIMITED
      });
    });

    it('should consume pins without limit for unlimited plans', async () => {
      // Arrange: Mock unlimited control
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // Act: Consume multiple pins
      const results = await Promise.all([
        improvedPinControlService.consumePin(testPsychologist.id, 'patient-1'),
        improvedPinControlService.consumePin(testPsychologist.id, 'patient-2'),
        improvedPinControlService.consumePin(testPsychologist.id, 'patient-3')
      ]);
      
      // Assert: All consumptions succeed
      expect(results).toEqual([true, true, true]);
      
      // Verify incrementUsedPins was not called for unlimited plans
      expect(mockRepository.incrementUsedPins).not.toHaveBeenCalled();
    });

    it('should check unlimited plan availability correctly', async () => {
      // Arrange: Mock unlimited control
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      
      // Act: Check availability
      const availability = await improvedPinControlService.checkPsychologistUsage(testPsychologist.id);
      
      // Assert: Unlimited availability
      expect(availability.canUse).toBe(true);
      expect(availability.isUnlimited).toBe(true);
      expect(availability.remainingPins).toBeNull();
      expect(availability.reason).toBe('Unlimited plan');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing psychologist gracefully', async () => {
      // Arrange: Mock repository to return null (psychologist not found)
      mockRepository.getPsychologistUsage.mockResolvedValue(null);
      
      // Act & Assert: Expect psychologist not found error
      await expect(
        pinControlService.consumePin('non-existent-psych')
      ).rejects.toThrow(PIN_CONSTANTS.ERROR_CODES.PSYCHOLOGIST_NOT_FOUND);
    });

    it('should validate input parameters', async () => {
      // Act & Assert: Test invalid inputs
      await expect(
        pinControlService.consumePin(null)
      ).rejects.toThrow('Validation failed');
      
      await expect(
        pinControlService.consumePin('')
      ).rejects.toThrow('Validation failed');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange: Mock repository to throw database error
      const dbError = new Error('Database connection failed');
      mockRepository.getPsychologistUsage.mockRejectedValue(dbError);
      
      // Act & Assert: Expect error propagation
      await expect(
        pinControlService.consumePin(testPsychologist.id)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('Performance and Logging Verification', () => {
    it('should complete pin consumption within acceptable time limits', async () => {
      // Arrange: Mock fast repository responses
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      mockRepository.incrementUsedPins.mockResolvedValue(testControl);
      
      // Act: Measure performance
      const startTime = performance.now();
      await improvedPinControlService.consumePin(testPsychologist.id);
      const endTime = performance.now();
      
      // Assert: Performance within threshold
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms for mocked operations
    });

    it('should maintain consistent behavior across service implementations', async () => {
      // Arrange: Setup identical test scenario for both services
      mockRepository.getPsychologistUsage.mockResolvedValue(testControl);
      mockRepository.incrementUsedPins.mockResolvedValue(testControl);
      
      // Act: Test both services
      const [originalResult, improvedResult] = await Promise.all([
        pinControlService.consumePin(testPsychologist.id, 'patient-1'),
        improvedPinControlService.consumePin(testPsychologist.id, 'patient-2')
      ]);
      
      // Assert: Consistent results
      expect(originalResult).toBe(improvedResult);
      expect(originalResult).toBe(true);
    });
  });
});