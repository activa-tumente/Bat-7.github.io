import { PinLogger } from './PinLogger.js';

/**
 * Error handling strategy for pin control operations
 */
export class ErrorHandlingStrategy {
  /**
   * Handle RPC function errors with proper logging and fallback
   */
  static async handleRPCError(error, fallbackFn, context = '') {
    const errorInfo = {
      message: error.message,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    };

    // Log the specific error for debugging
    PinLogger.logError(`RPC function failed: ${context}`, errorInfo);

    // Determine if we should attempt fallback
    if (this._shouldAttemptFallback(error)) {
      PinLogger.logInfo(`Attempting fallback for: ${context}`);
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        PinLogger.logError(`Fallback also failed for: ${context}`, fallbackError);
        throw new Error(`Both primary and fallback methods failed: ${error.message}`);
      }
    }

    // Re-throw if fallback is not appropriate
    throw error;
  }

  /**
   * Determine if fallback should be attempted based on error type
   * @private
   */
  static _shouldAttemptFallback(error) {
    // Attempt fallback for function not found or permission errors
    const fallbackCodes = [
      'PGRST202', // Function not found
      'PGRST301', // Permission denied
      '42883',    // PostgreSQL function does not exist
      '42P01'     // PostgreSQL relation does not exist
    ];

    return fallbackCodes.includes(error.code) || 
           error.message?.includes('function') ||
           error.message?.includes('does not exist');
  }

  /**
   * Validate data structure before processing
   */
  static validateDataStructure(data, expectedFields = []) {
    if (!Array.isArray(data)) {
      throw new Error('Expected data to be an array');
    }

    if (expectedFields.length > 0 && data.length > 0) {
      const firstItem = data[0];
      const missingFields = expectedFields.filter(field => !(field in firstItem));
      
      if (missingFields.length > 0) {
        PinLogger.logError('Data structure validation failed', {
          missingFields,
          receivedFields: Object.keys(firstItem)
        });
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }

    return data;
  }
}