/**
 * Utilidad para gestionar caché en la aplicación
 * Permite almacenar y recuperar datos del localStorage con control de expiración
 */
class CacheManager {
  constructor() {
    this.prefix = 'app_cache_';
    this.defaultTTL = 60 * 5; // 5 minutos en segundos
  }

  /**
   * Genera una clave única para el caché con prefijo
   * @param {string} key - Clave base
   * @returns {string} - Clave con prefijo
   */
  _getKeyWithPrefix(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Guarda datos en caché con tiempo de expiración
   * @param {string} key - Clave para identificar los datos
   * @param {any} data - Datos a almacenar
   * @param {number} ttl - Tiempo de vida en segundos (opcional)
   * @returns {boolean} - true si se guardó correctamente
   */
  setItem(key, data, ttl = this.defaultTTL) {
    try {
      const cacheKey = this._getKeyWithPrefix(key);
      const now = new Date().getTime();
      const expiry = now + (ttl * 1000);
      
      const cacheItem = {
        data,
        expiry,
        created: now
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error('Error al guardar en caché:', error);
      return false;
    }
  }

  /**
   * Recupera datos del caché si no han expirado
   * @param {string} key - Clave de los datos a recuperar
   * @returns {any|null} - Datos almacenados o null si no existen o expiraron
   */
  getItem(key) {
    try {
      const cacheKey = this._getKeyWithPrefix(key);
      const cacheItemStr = localStorage.getItem(cacheKey);
      
      if (!cacheItemStr) return null;
      
      const cacheItem = JSON.parse(cacheItemStr);
      const now = new Date().getTime();
      
      // Verificar si ha expirado
      if (cacheItem.expiry < now) {
        // Eliminar automáticamente si expiró
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Error al recuperar del caché:', error);
      return null;
    }
  }

  /**
   * Elimina un elemento del caché
   * @param {string} key - Clave del elemento a eliminar
   * @returns {boolean} - true si se eliminó correctamente
   */
  removeItem(key) {
    try {
      const cacheKey = this._getKeyWithPrefix(key);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error('Error al eliminar del caché:', error);
      return false;
    }
  }

  /**
   * Verifica si un elemento está en caché y no ha expirado
   * @param {string} key - Clave a verificar
   * @returns {boolean} - true si existe y no ha expirado
   */
  hasValidItem(key) {
    return this.getItem(key) !== null;
  }

  /**
   * Recupera tiempo de creación y expiración de un elemento en caché
   * @param {string} key - Clave del elemento
   * @returns {Object|null} - { created, expiry, ttl } o null
   */
  getItemMeta(key) {
    try {
      const cacheKey = this._getKeyWithPrefix(key);
      const cacheItemStr = localStorage.getItem(cacheKey);
      
      if (!cacheItemStr) return null;
      
      const { created, expiry } = JSON.parse(cacheItemStr);
      const now = new Date().getTime();
      const ttlRemaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      return {
        created: new Date(created),
        expiry: new Date(expiry),
        ttlRemaining
      };
    } catch (error) {
      console.error('Error al obtener metadata del caché:', error);
      return null;
    }
  }

  /**
   * Limpia todo el caché de la aplicación
   * @returns {boolean} - true si se limpió correctamente
   */
  clearAll() {
    try {
      // Eliminar solo elementos con el prefijo de la aplicación
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error al limpiar el caché:', error);
      return false;
    }
  }

  /**
   * Limpia elementos expirados del caché
   * @returns {number} - Cantidad de elementos eliminados
   */
  purgeExpired() {
    try {
      let purgedCount = 0;
      const now = new Date().getTime();
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const cacheItemStr = localStorage.getItem(key);
            if (cacheItemStr) {
              const { expiry } = JSON.parse(cacheItemStr);
              if (expiry < now) {
                localStorage.removeItem(key);
                purgedCount++;
              }
            }
          } catch (e) {
            // Ignorar errores de elementos individuales
            console.warn('Error al limpiar elemento expirado:', key);
          }
        }
      });
      
      return purgedCount;
    } catch (error) {
      console.error('Error al purgar elementos expirados:', error);
      return 0;
    }
  }
}

// Exportar una instancia única
const cacheManager = new CacheManager();

export default cacheManager;
