import { lazy } from 'react';

/**
 * Utilidades para lazy loading optimizado con preloading inteligente
 */

// Cache para componentes ya cargados
const componentCache = new Map();

// Cache para promesas de carga en progreso
const loadingPromises = new Map();

/**
 * Lazy loading con cache y preloading
 */
export const lazyWithPreload = (importFunc, componentName) => {
  // Si ya está en cache, retornarlo
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName);
  }

  // Crear componente lazy
  const LazyComponent = lazy(() => {
    // Si ya hay una promesa de carga en progreso, usarla
    if (loadingPromises.has(componentName)) {
      return loadingPromises.get(componentName);
    }

    // Crear nueva promesa de carga
    const loadPromise = importFunc()
      .then(module => {
        // Guardar en cache una vez cargado
        componentCache.set(componentName, LazyComponent);
        loadingPromises.delete(componentName);
        return module;
      })
      .catch(error => {
        // Limpiar promesa en caso de error
        loadingPromises.delete(componentName);
        throw error;
      });

    loadingPromises.set(componentName, loadPromise);
    return loadPromise;
  });

  // Agregar método de preload
  LazyComponent.preload = () => {
    if (!loadingPromises.has(componentName) && !componentCache.has(componentName)) {
      const loadPromise = importFunc()
        .then(module => {
          componentCache.set(componentName, LazyComponent);
          loadingPromises.delete(componentName);
          return module;
        })
        .catch(error => {
          loadingPromises.delete(componentName);
          throw error;
        });

      loadingPromises.set(componentName, loadPromise);
    }
    
    return loadingPromises.get(componentName);
  };

  return LazyComponent;
};

/**
 * Preload múltiples componentes
 */
export const preloadComponents = (components) => {
  return Promise.allSettled(
    components.map(component => {
      if (component.preload) {
        return component.preload();
      }
      return Promise.resolve();
    })
  );
};

/**
 * Preload basado en rutas probables
 */
export const preloadByRoute = (currentRoute, routeMap) => {
  const probableRoutes = routeMap[currentRoute] || [];
  const componentsToPreload = probableRoutes
    .map(route => route.component)
    .filter(component => component && component.preload);

  return preloadComponents(componentsToPreload);
};

/**
 * Preload en hover (para navegación)
 */
export const preloadOnHover = (component, delay = 100) => {
  let timeoutId;

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => {
      if (component && component.preload) {
        component.preload();
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };
};

/**
 * Preload en idle (cuando el navegador está inactivo)
 */
export const preloadOnIdle = (components, timeout = 2000) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        preloadComponents(components);
      },
      { timeout }
    );
  } else {
    // Fallback para navegadores que no soportan requestIdleCallback
    setTimeout(() => {
      preloadComponents(components);
    }, timeout);
  }
};

/**
 * Preload basado en intersección (cuando elementos entran en viewport)
 */
export const preloadOnIntersection = (components, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        preloadComponents(components);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  return observer;
};

/**
 * Limpiar cache de componentes
 */
export const clearComponentCache = () => {
  componentCache.clear();
  loadingPromises.clear();
};

/**
 * Obtener estadísticas de cache
 */
export const getCacheStats = () => {
  return {
    cachedComponents: componentCache.size,
    loadingComponents: loadingPromises.size,
    cacheKeys: Array.from(componentCache.keys()),
    loadingKeys: Array.from(loadingPromises.keys())
  };
};

/**
 * Hook para preloading automático basado en rutas
 */
export const useRoutePreloading = (currentRoute, routeMap) => {
  React.useEffect(() => {
    // Preload inmediato para rutas críticas
    const criticalRoutes = routeMap.critical || [];
    preloadComponents(criticalRoutes);

    // Preload con delay para rutas probables
    const probableRoutes = routeMap[currentRoute] || [];
    setTimeout(() => {
      preloadComponents(probableRoutes);
    }, 1000);

    // Preload en idle para rutas menos probables
    const idleRoutes = routeMap.idle || [];
    preloadOnIdle(idleRoutes);
  }, [currentRoute, routeMap]);
};

/**
 * Configuración de rutas con prioridades de preloading
 */
export const createRouteMap = () => {
  return {
    // Rutas críticas (preload inmediato)
    critical: [],
    
    // Rutas probables por ruta actual
    '/login': ['Home', 'Dashboard'],
    '/home': ['QuestionnaireList', 'Results'],
    '/questionnaire': ['QuestionnaireForm', 'QuestionnaireResults'],
    '/admin': ['Candidates', 'Administration'],
    
    // Rutas para preload en idle
    idle: ['Reports', 'Institutions', 'Psychologists']
  };
};

export default {
  lazyWithPreload,
  preloadComponents,
  preloadByRoute,
  preloadOnHover,
  preloadOnIdle,
  preloadOnIntersection,
  clearComponentCache,
  getCacheStats,
  useRoutePreloading,
  createRouteMap
};
