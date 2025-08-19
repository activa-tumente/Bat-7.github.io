import { useEffect } from 'react';
import { ComponentFactory } from '../services/componentFactory';

/**
 * Custom hook for preloading components
 * Improves perceived performance by loading components in background
 */
export const useComponentPreloader = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    // Preload components after initial render
    const timeoutId = setTimeout(() => {
      ComponentFactory.preloadComponents();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [enabled]);
};

export default useComponentPreloader;