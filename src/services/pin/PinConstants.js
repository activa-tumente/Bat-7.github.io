/**
 * Pin Control System Constants
 * Centralized constants for pin management with environment-aware configuration
 */

// Environment-based configuration
const ENV_CONFIG = {
  development: {
    CACHE_TTL: 60000, // 1 minute for development
    BATCH_SIZE: 10,
    LOG_LEVEL: 'debug'
  },
  production: {
    CACHE_TTL: 300000, // 5 minutes for production
    BATCH_SIZE: 100,
    LOG_LEVEL: 'info'
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
const envConfig = ENV_CONFIG[currentEnv] || ENV_CONFIG.development;

export const PIN_CONSTANTS = {
  // Environment configuration
  ENV: envConfig,

  // Database RPC Functions
  RPC_FUNCTIONS: {
    GET_ALL_PSYCHOLOGISTS_PIN_BALANCE: 'get_all_psychologists_pin_balance',
    GET_PIN_CONSUMPTION_STATS: 'get_pin_consumption_stats',
    CREATE_LOW_PIN_NOTIFICATION: 'create_low_pin_notification',
    CREATE_PIN_EXHAUSTED_NOTIFICATION: 'create_pin_exhausted_notification'
  },

  // Default values for data initialization
  DEFAULTS: {
    ASSIGNED_PATIENTS: 0,
    COMPLETED_TESTS: 0,
    PLAN_TYPE: 'none',
    TOTAL_PINS: 0,
    USED_PINS: 0
  },

  // Thresholds with business logic documentation
  THRESHOLDS: {
    LOW_PIN_WARNING: 5,        // Warn when <= 5 pins remain
    CRITICAL_PIN_WARNING: 2,   // Critical alert when <= 2 pins remain
    NO_PINS: 0,               // No pins available
    BULK_ASSIGNMENT_MIN: 10,   // Minimum for bulk operations
    BULK_ASSIGNMENT_MAX: 1000  // Maximum pins in single assignment
  },

  // Status types
  STATUS: {
    UNLIMITED: 'unlimited',
    ACTIVE: 'active',
    LOW_PINS: 'low_pins',
    NO_PINS: 'no_pins',
    INACTIVE: 'inactive'
  },

  // Plan types
  PLAN_TYPES: {
    UNLIMITED: 'unlimited',
    ASSIGNED: 'assigned',
    TRIAL: 'trial',
    NONE: 'none'
  },

  // Action types for logging
  ACTION_TYPES: {
    PIN_ASSIGNED: 'pin_assigned',
    PIN_CONSUMED: 'pin_consumed',
    TEST_COMPLETED: 'test_completed',
    REPORT_GENERATED: 'report_generated',
    NOTIFICATION_CREATED: 'notification_created'
  },

  // Error codes
  ERROR_CODES: {
    PSYCHOLOGIST_NOT_FOUND: 'PSYCHOLOGIST_NOT_FOUND',
    NO_PINS_AVAILABLE: 'NO_PINS_AVAILABLE',
    INVALID_PARAMETERS: 'INVALID_PARAMETERS',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
  },

  // Default values with environment awareness
  DEFAULTS: {
    HISTORY_LIMIT: 50,
    CACHE_TTL: envConfig.CACHE_TTL,
    RETRY_ATTEMPTS: 3,
    BATCH_SIZE: envConfig.BATCH_SIZE,
    LOG_LEVEL: envConfig.LOG_LEVEL,
    CONNECTION_TIMEOUT: 30000,
    QUERY_TIMEOUT: 10000
  },

  // Performance optimization settings
  PERFORMANCE: {
    ENABLE_CACHING: true,
    ENABLE_BATCH_OPERATIONS: true,
    MAX_CONCURRENT_OPERATIONS: 10,
    DEBOUNCE_DELAY: 300, // ms
    THROTTLE_LIMIT: 100  // requests per minute
  },

  // Monitoring and alerting
  MONITORING: {
    HEALTH_CHECK_INTERVAL: 60000, // 1 minute
    METRICS_COLLECTION_INTERVAL: 300000, // 5 minutes
    ERROR_THRESHOLD: 0.05, // 5% error rate threshold
    RESPONSE_TIME_THRESHOLD: 2000 // 2 seconds
  }
};

export default PIN_CONSTANTS;