/**
 * Servicio de cache inteligente con múltiples estrategias
 * Optimizado para performance y gestión de memoria
 */

class CacheService {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutos
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minuto
    
    // Diferentes tipos de cache
    this.memoryCache = new Map();
    this.sessionCache = new Map();
    this.persistentCache = new Map();
    
    // Metadatos para gestión
    this.metadata = new Map();
    this.accessTimes = new Map();
    this.hitCounts = new Map();
    
    // Iniciar limpieza automática
    this.startCleanupTimer();
  }

  /**
   * Obtener valor del cache
   */
  get(key, options = {}) {
    const { type = 'memory', updateAccessTime = true } = options;
    const cache = this.getCache(type);
    
    if (!cache.has(key)) {
      return null;
    }

    const metadata = this.metadata.get(key);
    
    // Verificar expiración
    if (metadata && metadata.expiresAt && Date.now() > metadata.expiresAt) {
      this.delete(key, { type });
      return null;
    }

    // Actualizar estadísticas
    if (updateAccessTime) {
      this.accessTimes.set(key, Date.now());
      this.hitCounts.set(key, (this.hitCounts.get(key) || 0) + 1);
    }

    return cache.get(key);
  }

  /**
   * Establecer valor en cache
   */
  set(key, value, options = {}) {
    const {
      type = 'memory',
      ttl = this.defaultTTL,
      priority = 'normal',
      tags = []
    } = options;

    const cache = this.getCache(type);
    
    // Verificar límite de tamaño
    if (cache.size >= this.maxSize) {
      this.evictLRU(type);
    }

    // Establecer valor
    cache.set(key, value);
    
    // Establecer metadatos
    this.metadata.set(key, {
      type,
      createdAt: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : null,
      priority,
      tags,
      size: this.calculateSize(value)
    });

    this.accessTimes.set(key, Date.now());
    this.hitCounts.set(key, 0);

    // Persistir si es necesario
    if (type === 'persistent') {
      this.persistToStorage(key, value, options);
    }

    return true;
  }

  /**
   * Eliminar del cache
   */
  delete(key, options = {}) {
    const { type = 'memory' } = options;
    const cache = this.getCache(type);
    
    const deleted = cache.delete(key);
    this.metadata.delete(key);
    this.accessTimes.delete(key);
    this.hitCounts.delete(key);

    if (type === 'persistent') {
      this.removeFromStorage(key);
    }

    return deleted;
  }

  /**
   * Limpiar cache por tipo o completamente
   */
  clear(type = null) {
    if (type) {
      const cache = this.getCache(type);
      const keys = Array.from(cache.keys());
      
      keys.forEach(key => {
        if (this.metadata.get(key)?.type === type) {
          this.delete(key, { type });
        }
      });
    } else {
      this.memoryCache.clear();
      this.sessionCache.clear();
      this.persistentCache.clear();
      this.metadata.clear();
      this.accessTimes.clear();
      this.hitCounts.clear();
    }
  }

  /**
   * Invalidar por tags
   */
  invalidateByTags(tags) {
    const keysToDelete = [];
    
    this.metadata.forEach((metadata, key) => {
      if (metadata.tags && metadata.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      const metadata = this.metadata.get(key);
      this.delete(key, { type: metadata.type });
    });

    return keysToDelete.length;
  }

  /**
   * Obtener o establecer con función factory
   */
  async getOrSet(key, factory, options = {}) {
    let value = this.get(key, options);
    
    if (value === null) {
      value = await factory();
      this.set(key, value, options);
    }
    
    return value;
  }

  /**
   * Memoización con cache
   */
  memoize(fn, options = {}) {
    const { keyGenerator, ...cacheOptions } = options;
    
    return async (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      return this.getOrSet(key, () => fn(...args), cacheOptions);
    };
  }

  /**
   * Cache con refresh automático
   */
  setWithRefresh(key, factory, options = {}) {
    const { refreshInterval = 60000, ...cacheOptions } = options;
    
    // Establecer valor inicial
    factory().then(value => {
      this.set(key, value, cacheOptions);
    });

    // Configurar refresh automático
    const intervalId = setInterval(async () => {
      try {
        const newValue = await factory();
        this.set(key, newValue, cacheOptions);
      } catch (error) {
        console.error(`Error refreshing cache key ${key}:`, error);
      }
    }, refreshInterval);

    // Retornar función para cancelar refresh
    return () => clearInterval(intervalId);
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    const stats = {
      memory: { size: this.memoryCache.size, keys: Array.from(this.memoryCache.keys()) },
      session: { size: this.sessionCache.size, keys: Array.from(this.sessionCache.keys()) },
      persistent: { size: this.persistentCache.size, keys: Array.from(this.persistentCache.keys()) },
      totalSize: this.memoryCache.size + this.sessionCache.size + this.persistentCache.size,
      hitRates: {},
      memoryUsage: 0
    };

    // Calcular hit rates y uso de memoria
    this.metadata.forEach((metadata, key) => {
      const hits = this.hitCounts.get(key) || 0;
      stats.hitRates[key] = hits;
      stats.memoryUsage += metadata.size || 0;
    });

    return stats;
  }

  /**
   * Métodos privados
   */
  getCache(type) {
    switch (type) {
      case 'session':
        return this.sessionCache;
      case 'persistent':
        return this.persistentCache;
      default:
        return this.memoryCache;
    }
  }

  evictLRU(type) {
    const cache = this.getCache(type);
    let oldestKey = null;
    let oldestTime = Date.now();

    // Encontrar el elemento menos recientemente usado
    cache.forEach((value, key) => {
      const metadata = this.metadata.get(key);
      if (metadata?.type === type) {
        const accessTime = this.accessTimes.get(key) || 0;
        if (accessTime < oldestTime) {
          oldestTime = accessTime;
          oldestKey = key;
        }
      }
    });

    if (oldestKey) {
      this.delete(oldestKey, { type });
    }
  }

  calculateSize(value) {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 1; // Fallback para valores no serializables
    }
  }

  persistToStorage(key, value, options) {
    try {
      const data = {
        value,
        metadata: this.metadata.get(key)
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist to localStorage:', error);
    }
  }

  removeFromStorage(key) {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    this.metadata.forEach((metadata, key) => {
      if (metadata.expiresAt && now > metadata.expiresAt) {
        keysToDelete.push({ key, type: metadata.type });
      }
    });

    keysToDelete.forEach(({ key, type }) => {
      this.delete(key, { type });
    });

    return keysToDelete.length;
  }

  // Cargar cache persistente al inicializar
  loadPersistentCache() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          const cacheKey = key.replace('cache_', '');
          const data = JSON.parse(localStorage.getItem(key));
          
          if (data.metadata.expiresAt && Date.now() > data.metadata.expiresAt) {
            localStorage.removeItem(key);
            continue;
          }

          this.persistentCache.set(cacheKey, data.value);
          this.metadata.set(cacheKey, data.metadata);
        }
      }
    } catch (error) {
      console.warn('Failed to load persistent cache:', error);
    }
  }
}

// Instancia singleton
const cacheService = new CacheService({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 2 * 60 * 1000 // 2 minutos
});

// Cargar cache persistente
cacheService.loadPersistentCache();

export default cacheService;
