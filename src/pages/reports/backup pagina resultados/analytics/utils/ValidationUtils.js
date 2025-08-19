/**
 * @file ValidationUtils.js
 * @description Input validation and error handling utilities for trend analysis
 */

export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class ValidationUtils {
  /**
   * Validate trend analysis configuration
   */
  static validateConfig(config) {
    const errors = [];

    // Validate period
    const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly'];
    if (config.period && !validPeriods.includes(config.period)) {
      errors.push(new ValidationError(
        `Invalid period: ${config.period}. Must be one of: ${validPeriods.join(', ')}`,
        'period',
        config.period
      ));
    }

    // Validate timeRange
    if (config.timeRange !== undefined) {
      if (!Number.isInteger(config.timeRange) || config.timeRange < 1 || config.timeRange > 120) {
        errors.push(new ValidationError(
          'timeRange must be an integer between 1 and 120',
          'timeRange',
          config.timeRange
        ));
      }
    }

    // Validate groupBy
    const validGroupBy = ['genero', 'edad', 'nivel_educativo', 'institucion', null];
    if (config.groupBy !== undefined && !validGroupBy.includes(config.groupBy)) {
      errors.push(new ValidationError(
        `Invalid groupBy: ${config.groupBy}. Must be one of: ${validGroupBy.filter(v => v !== null).join(', ')} or null`,
        'groupBy',
        config.groupBy
      ));
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Configuration validation failed: ${errors.map(e => e.message).join('; ')}`,
        'config',
        config
      );
    }

    return true;
  }

  /**
   * Validate data array for trend analysis
   */
  static validateData(data) {
    if (!Array.isArray(data)) {
      throw new ValidationError('Data must be an array', 'data', typeof data);
    }

    if (data.length === 0) {
      throw new ValidationError('Data array cannot be empty', 'data', data.length);
    }

    // Validate required fields in data items
    const requiredFields = ['fecha', 'percentil', 'aptitud_codigo'];
    const sampleItem = data[0];
    
    for (const field of requiredFields) {
      if (!(field in sampleItem)) {
        throw new ValidationError(
          `Missing required field: ${field}`,
          'data.fields',
          Object.keys(sampleItem)
        );
      }
    }

    // Validate data types
    data.forEach((item, index) => {
      if (typeof item.percentil !== 'number' || item.percentil < 0 || item.percentil > 100) {
        throw new ValidationError(
          `Invalid percentil value at index ${index}: must be a number between 0 and 100`,
          'data.percentil',
          item.percentil
        );
      }

      if (!item.fecha || isNaN(new Date(item.fecha).getTime())) {
        throw new ValidationError(
          `Invalid fecha value at index ${index}: must be a valid date`,
          'data.fecha',
          item.fecha
        );
      }
    });

    return true;
  }

  /**
   * Validate time series data
   */
  static validateTimeSeries(timeSeries) {
    if (!Array.isArray(timeSeries)) {
      throw new ValidationError('Time series must be an array', 'timeSeries', typeof timeSeries);
    }

    if (timeSeries.length < 2) {
      throw new ValidationError(
        'Time series must have at least 2 data points for trend analysis',
        'timeSeries.length',
        timeSeries.length
      );
    }

    // Validate time series structure
    const requiredFields = ['period', 'date', 'percentil_promedio'];
    timeSeries.forEach((point, index) => {
      for (const field of requiredFields) {
        if (!(field in point)) {
          throw new ValidationError(
            `Missing required field '${field}' in time series point at index ${index}`,
            'timeSeries.structure',
            Object.keys(point)
          );
        }
      }
    });

    return true;
  }

  /**
   * Safe execution wrapper with error handling
   */
  static async safeExecute(operation, fallbackValue = null, context = 'operation') {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors
      }
      
      // Log other errors and return fallback
      console.warn(`Using fallback value for ${context} due to error:`, error.message);
      return fallbackValue;
    }
  }
}