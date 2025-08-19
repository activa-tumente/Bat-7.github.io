/**
 * @file classNames.js
 * @description Utility functions for conditional CSS class name handling
 */

/**
 * Combines class names conditionally
 * Similar to the popular 'clsx' library but lightweight
 * 
 * @param {...any} classes - Class names, objects, or arrays to combine
 * @returns {string} Combined class names
 * 
 * @example
 * cn('base-class', { 'active': isActive, 'disabled': isDisabled })
 * cn('base-class', isActive && 'active-class')
 * cn(['class1', 'class2'], { 'class3': condition })
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') {
        return cls;
      }
      
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => Boolean(condition))
          .map(([className]) => className)
          .join(' ');
      }
      
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Merges Tailwind CSS classes intelligently, handling conflicts
 * This is a simplified version - for production, consider using 'tailwind-merge'
 * 
 * @param {...string} classes - Tailwind class names to merge
 * @returns {string} Merged class names with conflicts resolved
 */
export function mergeTailwindClasses(...classes) {
  const classArray = cn(...classes).split(' ');
  const classMap = new Map();
  
  // Group classes by their property (e.g., 'bg-', 'text-', 'p-')
  classArray.forEach(className => {
    const prefix = className.split('-')[0];
    classMap.set(prefix, className);
  });
  
  return Array.from(classMap.values()).join(' ');
}

/**
 * Creates a class name builder function with default classes
 * 
 * @param {string} baseClasses - Base classes to always include
 * @returns {Function} Class name builder function
 * 
 * @example
 * const buttonClasses = createClassBuilder('btn btn-base');
 * const classes = buttonClasses('btn-primary', { 'btn-disabled': isDisabled });
 */
export function createClassBuilder(baseClasses = '') {
  return (...additionalClasses) => {
    return cn(baseClasses, ...additionalClasses);
  };
}

/**
 * Conditional class name helper for better readability
 * 
 * @param {boolean} condition - Condition to check
 * @param {string} trueClass - Class to apply when condition is true
 * @param {string} falseClass - Class to apply when condition is false
 * @returns {string} Conditional class name
 * 
 * @example
 * const statusClass = conditional(isActive, 'text-green-600', 'text-gray-400');
 */
export function conditional(condition, trueClass, falseClass = '') {
  return condition ? trueClass : falseClass;
}

/**
 * Variant-based class name selector
 * 
 * @param {string} variant - Current variant
 * @param {Object} variants - Object mapping variants to class names
 * @param {string} defaultVariant - Default variant to use if current variant not found
 * @returns {string} Variant class names
 * 
 * @example
 * const buttonClasses = variant('primary', {
 *   primary: 'bg-blue-600 text-white',
 *   secondary: 'bg-gray-600 text-white'
 * }, 'primary');
 */
export function variant(variant, variants, defaultVariant = '') {
  return variants[variant] || variants[defaultVariant] || '';
}

/**
 * Size-based class name selector
 * 
 * @param {string} size - Current size
 * @param {Object} sizes - Object mapping sizes to class names
 * @param {string} defaultSize - Default size to use if current size not found
 * @returns {string} Size class names
 * 
 * @example
 * const sizeClasses = size('lg', {
 *   sm: 'px-2 py-1 text-sm',
 *   md: 'px-4 py-2',
 *   lg: 'px-6 py-3 text-lg'
 * }, 'md');
 */
export function size(size, sizes, defaultSize = '') {
  return sizes[size] || sizes[defaultSize] || '';
}

/**
 * State-based class name selector
 * 
 * @param {Object} states - Object with state conditions and their class names
 * @returns {string} State-based class names
 * 
 * @example
 * const stateClasses = states({
 *   hover: isHovered && 'hover:bg-blue-700',
 *   focus: isFocused && 'focus:ring-2',
 *   disabled: isDisabled && 'opacity-50 cursor-not-allowed'
 * });
 */
export function states(states) {
  return cn(Object.values(states));
}

/**
 * Responsive class name helper
 * 
 * @param {Object} breakpoints - Object mapping breakpoints to class names
 * @returns {string} Responsive class names
 * 
 * @example
 * const responsiveClasses = responsive({
 *   base: 'text-sm',
 *   sm: 'sm:text-base',
 *   md: 'md:text-lg',
 *   lg: 'lg:text-xl'
 * });
 */
export function responsive(breakpoints) {
  return cn(Object.values(breakpoints));
}

// Export default as cn for convenience
export default cn;