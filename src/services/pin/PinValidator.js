import { PIN_CONSTANTS } from './PinConstants.js';

/**
 * Validation utilities for pin operations
 */
export class PinValidator {
  /**
   * Validates pin assignment parameters
   */
  static validateAssignPins(psychologistId, pins, isUnlimited, planType) {
    const errors = [];

    if (!psychologistId || typeof psychologistId !== 'string') {
      errors.push('psychologistId must be a valid string');
    }

    if (!isUnlimited && (!pins || pins < 0 || !Number.isInteger(pins))) {
      errors.push('pins must be a positive integer when not unlimited');
    }

    if (planType && !Object.values(PIN_CONSTANTS.PLAN_TYPES).includes(planType)) {
      errors.push('planType must be a valid plan type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates pin consumption parameters
   */
  static validateConsumePin(psychologistId, patientId, testSessionId, reportId) {
    const errors = [];

    if (!psychologistId || typeof psychologistId !== 'string') {
      errors.push('psychologistId must be a valid string');
    }

    // Optional parameters validation
    if (patientId && typeof patientId !== 'string') {
      errors.push('patientId must be a string if provided');
    }

    if (testSessionId && typeof testSessionId !== 'string') {
      errors.push('testSessionId must be a string if provided');
    }

    if (reportId && typeof reportId !== 'string') {
      errors.push('reportId must be a string if provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}