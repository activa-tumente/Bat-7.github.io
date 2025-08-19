/**
 * Pruebas unitarias para el gestor de caché
 */

import cacheManager from '../utils/cacheManager';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('cacheManager', () => {
  beforeEach(() => {
    // Limpiar localStorage y mocks antes de cada prueba
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('setCache', () => {
    it('debería guardar datos en localStorage con la clave correcta', () => {
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      const expiration = 3600000; // 1 hora

      cacheManager.setCache(key, data, expiration);

      // Verificar que se llamó a localStorage.setItem con la clave correcta
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        expect.any(String)
      );

      // Verificar que los datos guardados incluyen la información correcta
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toEqual({
        data,
        expiration: expect.any(Number),
        timestamp: expect.any(Number),
        version: expect.any(String)
      });
    });

    it('debería sobrescribir datos existentes con la misma clave', () => {
      const key = 'testKey';
      const initialData = { id: 1, name: 'Initial' };
      const newData = { id: 1, name: 'Updated' };
      const expiration = 3600000; // 1 hora

      // Guardar datos iniciales
      cacheManager.setCache(key, initialData, expiration);
      
      // Sobrescribir con nuevos datos
      cacheManager.setCache(key, newData, expiration);

      // Verificar que se llamó a localStorage.setItem dos veces con la misma clave
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        `cache_${key}`,
        expect.any(String)
      );

      // Verificar que los últimos datos guardados son los nuevos
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      expect(savedData.data).toEqual(newData);
    });
  });

  describe('getCache', () => {
    it('debería devolver null si no hay datos en caché', () => {
      const key = 'nonExistentKey';
      const result = cacheManager.getCache(key);
      expect(result).toBeNull();
    });

    it('debería devolver los datos si están en caché y no han expirado', () => {
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      const expiration = 3600000; // 1 hora

      // Simular datos en caché
      const cachedData = {
        data,
        expiration,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      const result = cacheManager.getCache(key);
      expect(result).toEqual(data);
    });

    it('debería devolver null si los datos han expirado', () => {
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      const expiration = 1000; // 1 segundo

      // Simular datos en caché que han expirado
      const cachedData = {
        data,
        expiration,
        timestamp: Date.now() - 2000, // 2 segundos atrás
        version: '1.0'
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      const result = cacheManager.getCache(key);
      expect(result).toBeNull();
      
      // Verificar que se eliminó la caché expirada
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);
    });

    it('debería devolver null si la versión de caché no coincide', () => {
      const key = 'testKey';
      const data = { id: 1, name: 'Test' };
      const expiration = 3600000; // 1 hora

      // Simular datos en caché con versión antigua
      const cachedData = {
        data,
        expiration,
        timestamp: Date.now(),
        version: '0.9' // Versión antigua
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      // Cambiar la versión actual
      const originalVersion = cacheManager.CACHE_VERSION;
      cacheManager.CACHE_VERSION = '1.0';

      const result = cacheManager.getCache(key);
      expect(result).toBeNull();
      
      // Verificar que se eliminó la caché con versión antigua
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);

      // Restaurar la versión original
      cacheManager.CACHE_VERSION = originalVersion;
    });
  });

  describe('removeCache', () => {
    it('debería eliminar la caché con la clave especificada', () => {
      const key = 'testKey';
      cacheManager.removeCache(key);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cache_${key}`);
    });
  });

  describe('clearCache', () => {
    it('debería eliminar todas las claves de caché', () => {
      // Simular múltiples claves en localStorage
      localStorageMock.getItem.mockImplementation(key => {
        if (key === 'cache_key1' || key === 'cache_key2' || key === 'cache_key3') {
          return JSON.stringify({ data: 'test' });
        }
        return null;
      });

      // Simular que localStorage tiene estas claves
      Object.defineProperty(window.localStorage, 'length', { value: 5 });
      const mockKeys = ['cache_key1', 'cache_key2', 'cache_key3', 'other_key1', 'other_key2'];
      jest.spyOn(Object, 'keys').mockReturnValueOnce(mockKeys);

      cacheManager.clearCache();

      // Verificar que se eliminaron solo las claves de caché
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_key1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_key2');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cache_key3');
    });
  });
});
