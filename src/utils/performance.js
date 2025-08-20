/**
 * @file performance.js
 * @description Performance optimization utilities including memoization, debouncing, and throttling
 */

/**
 * Simple memoization function for expensive computations
 * @param {Function} fn - Function to memoize
 * @param {Function} [keyGenerator] - Custom key generator function
 * @returns {Function} Memoized function
 */
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  const memoized = (...args) => {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
  
  // Add cache management methods
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.delete = (key) => cache.delete(key);
  memoized.has = (key) => cache.has(key);
  
  return memoized;
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge
 * @param {boolean} options.trailing - Execute on trailing edge
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay, options = {}) => {
  const { leading = false, trailing = true } = options;
  let timeoutId;
  let lastCallTime;
  let lastInvokeTime = 0;
  let lastArgs;
  let lastThis;
  let result;
  
  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };
  
  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  };
  
  const remainingWait = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;
    
    return timeWaiting;
  };
  
  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (lastCallTime === undefined || 
            timeSinceLastCall >= delay || 
            timeSinceLastCall < 0 || 
            timeSinceLastInvoke >= delay);
  };
  
  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };
  
  const trailingEdge = (time) => {
    timeoutId = undefined;
    
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  };
  
  const debounced = function(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      timeoutId = setTimeout(timerExpired, delay);
      return leading ? invokeFunc(lastCallTime) : result;
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  };
  
  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = undefined;
  };
  
  debounced.flush = () => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };
  
  debounced.pending = () => {
    return timeoutId !== undefined;
  };
  
  return debounced;
};

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - Execute on leading edge
 * @param {boolean} options.trailing - Execute on trailing edge
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit, options = {}) => {
  const { leading = true, trailing = true } = options;
  return debounce(func, limit, { leading, trailing, maxWait: limit });
};

/**
 * Create a function that batches multiple calls into a single execution
 * @param {Function} func - Function to batch
 * @param {number} delay - Batch delay in milliseconds
 * @param {number} maxSize - Maximum batch size
 * @returns {Function} Batched function
 */
export const batch = (func, delay = 100, maxSize = 10) => {
  let batch = [];
  let timeoutId;
  
  const executeBatch = () => {
    if (batch.length > 0) {
      const currentBatch = [...batch];
      batch = [];
      func(currentBatch);
    }
    timeoutId = null;
  };
  
  return (item) => {
    batch.push(item);
    
    if (batch.length >= maxSize) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      executeBatch();
    } else if (!timeoutId) {
      timeoutId = setTimeout(executeBatch, delay);
    }
  };
};

/**
 * Create a function that only executes once
 * @param {Function} func - Function to execute once
 * @returns {Function} Function that executes only once
 */
export const once = (func) => {
  let called = false;
  let result;
  
  return function(...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
};

/**
 * Create a function with retry logic
 * @param {Function} func - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @param {Function} shouldRetry - Function to determine if retry should happen
 * @returns {Function} Function with retry logic
 */
export const withRetry = (func, maxRetries = 3, delay = 1000, shouldRetry = () => true) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await func(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !shouldRetry(error, attempt)) {
          throw error;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  };
};

/**
 * Create a function with timeout
 * @param {Function} func - Async function to add timeout to
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} timeoutMessage - Custom timeout message
 * @returns {Function} Function with timeout
 */
export const withTimeout = (func, timeout = 5000, timeoutMessage = 'Operation timed out') => {
  return async (...args) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeout);
    });
    
    return Promise.race([
      func(...args),
      timeoutPromise
    ]);
  };
};

/**
 * Create a function that caches results with TTL (Time To Live)
 * @param {Function} func - Function to cache
 * @param {number} ttl - Time to live in milliseconds
 * @param {Function} keyGenerator - Custom key generator
 * @returns {Function} Cached function
 */
export const cacheWithTTL = (func, ttl = 300000, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  const cached = (...args) => {
    const key = keyGenerator(...args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (now - timestamp < ttl) {
        return value;
      }
      cache.delete(key);
    }
    
    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  };
  
  cached.cache = cache;
  cached.clear = () => cache.clear();
  cached.delete = (key) => cache.delete(key);
  
  return cached;
};

/**
 * Performance measurement utility
 * @param {string} name - Performance mark name
 * @returns {Object} Performance measurement object
 */
export const createPerformanceMeasure = (name) => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  return {
    start() {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(startMark);
      }
      return Date.now();
    },
    
    end() {
      const endTime = Date.now();
      
      if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
        
        const measure = performance.getEntriesByName(name)[0];
        return measure ? measure.duration : null;
      }
      
      return endTime;
    },
    
    clear() {
      if (typeof performance !== 'undefined') {
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(name);
      }
    }
  };
};

/**
 * Lazy loading utility for components
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Options object
 * @returns {Object} Lazy component with loading state
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const { 
    fallback = null, 
    errorFallback = null,
    retryDelay = 1000,
    maxRetries = 3 
  } = options;
  
  let retryCount = 0;
  
  const loadComponent = async () => {
    try {
      const module = await importFunc();
      retryCount = 0; // Reset on success
      return module;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        return loadComponent();
      }
      throw error;
    }
  };
  
  return {
    load: loadComponent,
    fallback,
    errorFallback,
    retryCount: () => retryCount
  };
};

/**
 * Memory usage monitoring utility
 * @returns {Object} Memory usage information
 */
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }
  
  return {
    used: 0,
    total: 0,
    limit: 0,
    supported: false
  };
};

/**
 * Frame rate monitoring utility
 * @param {Function} callback - Callback function to receive FPS data
 * @returns {Function} Stop monitoring function
 */
export const monitorFrameRate = (callback) => {
  let frames = 0;
  let lastTime = performance.now();
  let animationId;
  
  const tick = (currentTime) => {
    frames++;
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime));
      callback(fps);
      
      frames = 0;
      lastTime = currentTime;
    }
    
    animationId = requestAnimationFrame(tick);
  };
  
  animationId = requestAnimationFrame(tick);
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};

export default {
  memoize,
  debounce,
  throttle,
  batch,
  once,
  withRetry,
  withTimeout,
  cacheWithTTL,
  createPerformanceMeasure,
  createLazyComponent,
  getMemoryUsage,
  monitorFrameRate
};