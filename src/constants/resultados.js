/**
 * Constants for Resultados module
 * Centralizes configuration values and magic numbers
 */

// Debounce and timing constants
export const SEARCH_DEBOUNCE_DELAY = 300; // ms
export const RETRY_DELAY = 2000; // ms
export const LOADING_TIMEOUT = 30000; // ms

// Test types
export const TEST_TYPES = {
  TODOS: 'todos',
  BAT7: 'bat7',
  MMPI: 'mmpi',
  WAIS: 'wais'
};

// Status types
export const RESULT_STATUS = {
  COMPLETED: 'completado',
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_progreso',
  CANCELLED: 'cancelado'
};

// UI Configuration
export const UI_CONFIG = {
  RESULTS_PER_PAGE: 20,
  MAX_SEARCH_LENGTH: 100,
  MIN_SEARCH_LENGTH: 2
};

// Error messages
export const ERROR_MESSAGES = {
  LOAD_DATA: 'Error al cargar los datos',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  PERMISSION_ERROR: 'No tiene permisos para acceder a estos datos',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado'
};

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Datos cargados correctamente',
  FILTER_APPLIED: 'Filtros aplicados'
};

// Accessibility labels
export const ARIA_LABELS = {
  SEARCH_INPUT: 'Buscar paciente por nombre, apellido o documento',
  TEST_FILTER: 'Filtrar resultados por tipo de test',
  RESULTS_TABLE: 'Tabla de resultados de tests',
  LOADING_INDICATOR: 'Cargando datos',
  ERROR_MESSAGE: 'Mensaje de error',
  RETRY_BUTTON: 'Reintentar carga de datos'
};