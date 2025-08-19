/**
 * UI Constants for consistent styling and behavior
 */

export const COLORS = {
  primary: 'blue',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'purple'
};

export const STATUS_COLORS = {
  unlimited: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  low_pins: 'bg-yellow-100 text-yellow-800',
  no_pins: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};

export const ACTION_COLORS = {
  pin_assigned: 'bg-green-100 text-green-800',
  pin_consumed: 'bg-orange-100 text-orange-800',
  test_completed: 'bg-blue-100 text-blue-800',
  report_generated: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

export const TIMEOUTS = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  RETRY_DELAY: 1000
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};