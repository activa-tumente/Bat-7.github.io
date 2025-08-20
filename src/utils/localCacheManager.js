/**
 * Utilidades para gestionar la caché local
 * Proporciona funciones para almacenar y recuperar datos en caché local
 * con soporte para TTL (Time To Live)
 */

// Prefijo para las claves de caché
const CACHE_PREFIX = 'bat7_cache_';

// Tiempo de vida por defecto (5 minutos)
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Guarda datos en la caché local
 * @param {string} key - Clave para identificar los datos
 * @param {any} data - Datos a almacenar
 * @param {Object} options - Opciones adicionales
 * @param {number} options.ttl - Tiempo de vida en milisegundos
 * @returns {boolean} - True si se guardó correctamente
 */
export const setCache = (key, data, options = {}) => {
  try {
    const ttl = options.ttl || DEFAULT_TTL;
    const cacheKey = `${CACHE_PREFIX}${key}`;
    
    const cacheData = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error(`[LocalCacheManager] Error al guardar en caché '${key}':`, error);
    return false;
  }
};

/**
 * Obtiene datos de la caché local
 * @param {string} key - Clave para identificar los datos
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.ignoreExpiry - Si debe ignorar la expiración
 * @returns {any|null} - Datos almacenados o null si no existen o han expirado
 */
export const getCache = (key, options = {}) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) return null;
    
    const { data, expires } = JSON.parse(cachedItem);
    
    // Verificar si ha expirado
    if (!options.ignoreExpiry && expires < Date.now()) {
      // Eliminar item expirado
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`[LocalCacheManager] Error al obtener de caché '${key}':`, error);
    return null;
  }
};

/**
 * Elimina datos de la caché local
 * @param {string} key - Clave para identificar los datos
 * @returns {boolean} - True si se eliminó correctamente
 */
export const removeCache = (key) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
    return true;
  } catch (error) {
    console.error(`[LocalCacheManager] Error al eliminar de caché '${key}':`, error);
    return false;
  }
};

/**
 * Limpia toda la caché local
 * @returns {boolean} - True si se limpió correctamente
 */
export const clearCache = () => {
  try {
    // Obtener todas las claves que comienzan con el prefijo
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    
    // Eliminar cada clave
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('[LocalCacheManager] Error al limpiar caché:', error);
    return false;
  }
};

/**
 * Limpia los elementos expirados de la caché local
 * @returns {number} - Número de elementos eliminados
 */
export const clearExpiredCache = () => {
  try {
    // Obtener todas las claves que comienzan con el prefijo
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    let removedCount = 0;
    
    // Verificar cada clave
    cacheKeys.forEach(key => {
      try {
        const cachedItem = localStorage.getItem(key);
        if (!cachedItem) return;
        
        const { expires } = JSON.parse(cachedItem);
        
        // Eliminar si ha expirado
        if (expires < Date.now()) {
          localStorage.removeItem(key);
          removedCount++;
        }
      } catch (e) {
        // Si hay error al parsear, eliminar el item
        localStorage.removeItem(key);
        removedCount++;
      }
    });
    
    return removedCount;
  } catch (error) {
    console.error('[LocalCacheManager] Error al limpiar caché expirada:', error);
    return 0;
  }
};

/**
 * Obtiene información sobre la caché local
 * @returns {Object} - Información sobre la caché
 */
export const getCacheInfo = () => {
  try {
    // Obtener todas las claves que comienzan con el prefijo
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    
    // Calcular tamaño total
    let totalSize = 0;
    let expiredCount = 0;
    let validCount = 0;
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      totalSize += (item?.length || 0) * 2; // En bytes (aproximado)
      
      try {
        const { expires } = JSON.parse(item);
        if (expires < Date.now()) {
          expiredCount++;
        } else {
          validCount++;
        }
      } catch (e) {
        expiredCount++;
      }
    });
    
    return {
      totalItems: cacheKeys.length,
      validItems: validCount,
      expiredItems: expiredCount,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  } catch (error) {
    console.error('[LocalCacheManager] Error al obtener información de caché:', error);
    return {
      totalItems: 0,
      validItems: 0,
      expiredItems: 0,
      totalSizeBytes: 0,
      totalSizeKB: 0,
      error: error.message
    };
  }
};

// Exportar todas las funciones
export default {
  setCache,
  getCache,
  removeCache,
  clearCache,
  clearExpiredCache,
  getCacheInfo
};
