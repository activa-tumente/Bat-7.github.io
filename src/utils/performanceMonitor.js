/**
 * Performance monitoring utilities for React components
 * Helps identify performance bottlenecks and optimization opportunities
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Performance metrics collector
 */
class PerformanceCollector {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start measuring a performance metric
   */
  startMeasure(name, metadata = {}) {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      startTime,
      metadata,
      type: 'measure'
    });
  }

  /**
   * End measuring a performance metric
   */
  endMeasure(name, additionalData = {}) {
    if (!this.isEnabled) return;

    const endTime = performance.now();
    const metric = this.metrics.get(name);
    
    if (metric) {
      const duration = endTime - metric.startTime;
      const result = {
        name,
        duration,
        startTime: metric.startTime,
        endTime,
        metadata: metric.metadata,
        ...additionalData
      };

      this.logMetric(result);
      this.notifyObservers(name, result);
      this.metrics.delete(name);
      
      return result;
    }
  }

  /**
   * Record a point-in-time metric
   */
  recordMetric(name, value, metadata = {}) {
    if (!this.isEnabled) return;

    const result = {
      name,
      value,
      timestamp: performance.now(),
      metadata,
      type: 'point'
    };

    this.logMetric(result);
    this.notifyObservers(name, result);
    
    return result;
  }

  /**
   * Log metric to console with formatting
   */
  logMetric(metric) {
    const { name, duration, value, metadata } = metric;
    
    if (duration !== undefined) {
      const color = duration > 100 ? 'color: red' : duration > 50 ? 'color: orange' : 'color: green';
      console.log(
        `%c[Performance] ${name}: ${duration.toFixed(2)}ms`,
        color,
        metadata
      );
    } else if (value !== undefined) {
      console.log(`[Performance] ${name}:`, value, metadata);
    }
  }

  /**
   * Add observer for specific metrics
   */
  addObserver(metricName, callback) {
    if (!this.observers.has(metricName)) {
      this.observers.set(metricName, new Set());
    }
    this.observers.get(metricName).add(callback);
  }

  /**
   * Remove observer
   */
  removeObserver(metricName, callback) {
    const observers = this.observers.get(metricName);
    if (observers) {
      observers.delete(callback);
    }
  }

  /**
   * Notify observers of metric updates
   */
  notifyObservers(metricName, metric) {
    const observers = this.observers.get(metricName);
    if (observers) {
      observers.forEach(callback => callback(metric));
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      activeMetrics: this.metrics.size,
      observers: Array.from(this.observers.keys())
    };
  }

  /**
   * Clear all metrics and observers
   */
  clear() {
    this.metrics.clear();
    this.observers.clear();
  }
}

// Create singleton instance
export const performanceCollector = new PerformanceCollector();

/**
 * React component performance monitor
 */
export class ComponentPerformanceMonitor {
  constructor(componentName) {
    this.componentName = componentName;
    this.renderCount = 0;
    this.mountTime = null;
    this.lastRenderTime = null;
    this.renderTimes = [];
    this.maxRenderHistory = 50;
  }

  /**
   * Record component mount
   */
  onMount() {
    this.mountTime = performance.now();
    performanceCollector.recordMetric(
      `${this.componentName}.mount`,
      this.mountTime,
      { component: this.componentName }
    );
  }

  /**
   * Record component render start
   */
  onRenderStart() {
    this.renderStartTime = performance.now();
    this.renderCount++;
  }

  /**
   * Record component render end
   */
  onRenderEnd(props = {}, state = {}) {
    if (this.renderStartTime) {
      const renderTime = performance.now() - this.renderStartTime;
      this.lastRenderTime = renderTime;
      
      // Keep history of render times
      this.renderTimes.push(renderTime);
      if (this.renderTimes.length > this.maxRenderHistory) {
        this.renderTimes.shift();
      }

      performanceCollector.recordMetric(
        `${this.componentName}.render`,
        renderTime,
        {
          component: this.componentName,
          renderCount: this.renderCount,
          propsCount: Object.keys(props).length,
          stateCount: Object.keys(state).length
        }
      );

      // Warn about slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(
          `[Performance Warning] ${this.componentName} render took ${renderTime.toFixed(2)}ms (>16ms)`
        );
      }
    }
  }

  /**
   * Record component unmount
   */
  onUnmount() {
    const unmountTime = performance.now();
    const totalLifetime = this.mountTime ? unmountTime - this.mountTime : 0;
    
    performanceCollector.recordMetric(
      `${this.componentName}.unmount`,
      unmountTime,
      {
        component: this.componentName,
        lifetime: totalLifetime,
        totalRenders: this.renderCount,
        averageRenderTime: this.getAverageRenderTime()
      }
    );
  }

  /**
   * Get average render time
   */
  getAverageRenderTime() {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
  }

  /**
   * Get performance stats
   */
  getStats() {
    return {
      componentName: this.componentName,
      renderCount: this.renderCount,
      lastRenderTime: this.lastRenderTime,
      averageRenderTime: this.getAverageRenderTime(),
      mountTime: this.mountTime,
      renderHistory: [...this.renderTimes]
    };
  }
}

/**
 * Hook for monitoring component performance
 */
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const monitorRef = useRef(null);
  const renderStartRef = useRef(null);
  const [stats, setStats] = useState(null);

  // Initialize monitor
  if (!monitorRef.current) {
    monitorRef.current = new ComponentPerformanceMonitor(componentName);
  }

  const monitor = monitorRef.current;

  // Track mount/unmount
  useEffect(() => {
    monitor.onMount();
    
    return () => {
      monitor.onUnmount();
    };
  }, []);

  // Track renders
  useEffect(() => {
    if (renderStartRef.current) {
      monitor.onRenderEnd();
      setStats(monitor.getStats());
    }
    renderStartRef.current = performance.now();
    monitor.onRenderStart();
  });

  // Track dependency changes
  useEffect(() => {
    performanceCollector.recordMetric(
      `${componentName}.dependencyChange`,
      dependencies.length,
      { dependencies: dependencies.map(dep => typeof dep) }
    );
  }, dependencies);

  return {
    stats,
    monitor
  };
};

/**
 * Hook for measuring custom operations
 */
export const usePerformanceMeasure = () => {
  const startMeasure = useCallback((name, metadata) => {
    performanceCollector.startMeasure(name, metadata);
  }, []);

  const endMeasure = useCallback((name, additionalData) => {
    return performanceCollector.endMeasure(name, additionalData);
  }, []);

  const recordMetric = useCallback((name, value, metadata) => {
    return performanceCollector.recordMetric(name, value, metadata);
  }, []);

  return {
    startMeasure,
    endMeasure,
    recordMetric
  };
};

/**
 * Hook for monitoring render performance
 */
export const useRenderPerformance = (componentName) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());
  const [renderStats, setRenderStats] = useState({
    renderCount: 0,
    timeSinceLastRender: 0,
    averageRenderInterval: 0
  });

  useEffect(() => {
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    renderCountRef.current += 1;

    setRenderStats(prev => ({
      renderCount: renderCountRef.current,
      timeSinceLastRender,
      averageRenderInterval: prev.averageRenderInterval === 0 
        ? timeSinceLastRender 
        : (prev.averageRenderInterval + timeSinceLastRender) / 2
    }));

    lastRenderTimeRef.current = now;

    // Log excessive re-renders
    if (renderCountRef.current > 10 && timeSinceLastRender < 100) {
      console.warn(
        `[Performance Warning] ${componentName} has rendered ${renderCountRef.current} times. ` +
        `Last render was ${timeSinceLastRender.toFixed(2)}ms ago.`
      );
    }
  });

  return renderStats;
};

/**
 * Hook for monitoring memory usage
 */
export const useMemoryMonitor = (componentName, interval = 5000) => {
  const [memoryStats, setMemoryStats] = useState(null);

  useEffect(() => {
    if (!performance.memory) {
      console.warn('Memory monitoring not supported in this browser');
      return;
    }

    const measureMemory = () => {
      const memory = performance.memory;
      const stats = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: performance.now()
      };

      setMemoryStats(stats);
      
      performanceCollector.recordMetric(
        `${componentName}.memory`,
        stats.usedJSHeapSize,
        stats
      );
    };

    measureMemory();
    const intervalId = setInterval(measureMemory, interval);

    return () => clearInterval(intervalId);
  }, [componentName, interval]);

  return memoryStats;
};

/**
 * Performance optimization helpers
 */
export const PerformanceHelpers = {
  /**
   * Debounce function calls
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureFunction(func, name) {
    return function(...args) {
      const start = performance.now();
      const result = func.apply(this, args);
      const end = performance.now();
      
      performanceCollector.recordMetric(
        `function.${name}`,
        end - start,
        { args: args.length }
      );
      
      return result;
    };
  },

  /**
   * Check if component should update (shallow comparison)
   */
  shouldComponentUpdate(prevProps, nextProps, prevState, nextState) {
    const propsChanged = !this.shallowEqual(prevProps, nextProps);
    const stateChanged = !this.shallowEqual(prevState, nextState);
    
    return propsChanged || stateChanged;
  },

  /**
   * Shallow equality check
   */
  shallowEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  }
};

/**
 * Performance monitoring HOC
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const MonitoredComponent = (props) => {
    const { stats } = usePerformanceMonitor(componentName || WrappedComponent.name);
    const renderStats = useRenderPerformance(componentName || WrappedComponent.name);
    
    return (
      <WrappedComponent 
        {...props} 
        __performanceStats={stats}
        __renderStats={renderStats}
      />
    );
  };
  
  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName || WrappedComponent.name})`;
  
  return MonitoredComponent;
};

/**
 * Bundle size analyzer
 */
export const BundleAnalyzer = {
  /**
   * Estimate component bundle impact
   */
  estimateComponentSize(component) {
    const componentString = component.toString();
    const sizeInBytes = new Blob([componentString]).size;
    
    return {
      estimatedSize: sizeInBytes,
      complexity: this.calculateComplexity(componentString)
    };
  },

  /**
   * Calculate code complexity score
   */
  calculateComplexity(code) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|=>/g) || []).length;
    const conditionals = (code.match(/if|switch|\?|&&|\|\|/g) || []).length;
    const loops = (code.match(/for|while|map|filter|reduce/g) || []).length;
    
    return {
      lines,
      functions,
      conditionals,
      loops,
      score: lines + functions * 2 + conditionals * 3 + loops * 2
    };
  }
};

export default {
  performanceCollector,
  ComponentPerformanceMonitor,
  usePerformanceMonitor,
  usePerformanceMeasure,
  useRenderPerformance,
  useMemoryMonitor,
  PerformanceHelpers,
  withPerformanceMonitoring,
  BundleAnalyzer
};