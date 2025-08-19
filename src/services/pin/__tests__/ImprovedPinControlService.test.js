import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PsychologistDataFactory } from '../ImprovedPinControlService_Refactored.js';
import { PsychologistDataNormalizer } from '../PsychologistDataNormalizer.js';
import { ErrorHandlingStrategy } from '../ErrorHandlingStrategy.js';

describe('PsychologistDataFactory', () => {
  const mockPsychologist = {
    id: '123',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com'
  };

  const mockControl = {
    total_uses: 100,
    used_uses: 25,
    is_unlimited: false,
    plan_type: 'assigned',
    updated_at: '2024-01-01T00:00:00Z'
  };

  it('should create psychologist data with control', () => {
    const result = PsychologistDataFactory.createFromControl(mockPsychologist, mockControl);
    
    expect(result.psychologist_id).toBe('123');
    expect(result.psychologist_name).toBe('Juan Pérez');
    expect(result.total_pins).toBe(100);
    expect(result.used_pins).toBe(25);
    expect(result.remaining_pins).toBe(75);
    expect(result.is_unlimited).toBe(false);
  });

  it('should handle unlimited plans correctly', () => {
    const unlimitedControl = { ...mockControl, is_unlimited: true };
    const result = PsychologistDataFactory.createFromControl(mockPsychologist, unlimitedControl);
    
    expect(result.remaining_pins).toBeNull();
    expect(result.is_unlimited).toBe(true);
  });

  it('should handle missing control data', () => {
    const result = PsychologistDataFactory.createFromControl(mockPsychologist, null);
    
    expect(result.total_pins).toBe(0);
    expect(result.used_pins).toBe(0);
    expect(result.remaining_pins).toBe(0);
    expect(result.is_unlimited).toBe(false);
    expect(result.plan_type).toBe('none');
  });
});

describe('PsychologistDataNormalizer', () => {
  it('should normalize data correctly', () => {
    const psychologist = {
      id: '123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com'
    };

    const control = {
      total_uses: 100,
      used_uses: 25,
      is_unlimited: false,
      plan_type: 'assigned'
    };

    const normalized = PsychologistDataNormalizer.normalize(psychologist, control);
    
    expect(normalized.id).toBe('123');
    expect(normalized.name).toBe('Juan Pérez');
    expect(normalized.remainingPins).toBe(75);
    expect(normalized.usagePercentage).toBe(25);
    expect(normalized.status).toBe('active');
  });

  it('should convert to legacy format', () => {
    const normalized = {
      id: '123',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      pinData: {
        totalPins: 100,
        usedPins: 25,
        isUnlimited: false,
        planType: 'assigned'
      },
      remainingPins: 75,
      usagePercentage: 25,
      status: 'active'
    };

    const legacy = PsychologistDataNormalizer.toLegacyFormat(normalized);
    
    expect(legacy.psychologist_id).toBe('123');
    expect(legacy.total_pins).toBe(100);
    expect(legacy.used_pins).toBe(25);
    expect(legacy.remaining_pins).toBe(75);
    // Legacy compatibility
    expect(legacy.psych_id).toBe('123');
    expect(legacy.total_asignado).toBe(100);
  });
});

describe('ErrorHandlingStrategy', () => {
  it('should handle RPC errors with fallback', async () => {
    const mockError = { code: 'PGRST202', message: 'Function not found' };
    const mockFallback = vi.fn().mockResolvedValue('fallback result');

    const result = await ErrorHandlingStrategy.handleRPCError(
      mockError,
      mockFallback,
      'test context'
    );

    expect(result).toBe('fallback result');
    expect(mockFallback).toHaveBeenCalled();
  });

  it('should validate data structure', () => {
    const validData = [
      { id: '1', name: 'Test' },
      { id: '2', name: 'Test2' }
    ];

    expect(() => {
      ErrorHandlingStrategy.validateDataStructure(validData, ['id', 'name']);
    }).not.toThrow();

    expect(() => {
      ErrorHandlingStrategy.validateDataStructure(validData, ['id', 'missing']);
    }).toThrow('Missing required fields: missing');
  });
});