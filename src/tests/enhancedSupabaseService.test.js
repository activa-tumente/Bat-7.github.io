/**
 * Pruebas unitarias para el servicio mejorado de Supabase
 */

import enhancedSupabaseService from '../services/enhancedSupabaseService';
import cacheManager from '../utils/cacheManager';
import { supabase } from '../api/supabaseClient';

// Mock de supabase
jest.mock('../api/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

// Mock de cacheManager
jest.mock('../utils/cacheManager', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  clearCache: jest.fn(),
  removeCache: jest.fn()
}));

describe('enhancedSupabaseService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getInstitutions', () => {
    it('debería obtener instituciones de Supabase correctamente', async () => {
      // Configurar el mock para devolver datos
      const mockData = [
        { id: '1', nombre: 'Institución 1' },
        { id: '2', nombre: 'Institución 2' }
      ];
      supabase.select.mockReturnThis();
      supabase.order.mockReturnThis();
      supabase.single.mockResolvedValue({ data: mockData, error: null });

      // Ejecutar la función
      const result = await enhancedSupabaseService.getInstitutions();

      // Verificar que se llamó a Supabase correctamente
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.order).toHaveBeenCalledWith('nombre', { ascending: true });

      // Verificar que se actualizó la caché
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        mockData,
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({ data: mockData, error: null });
    });

    it('debería usar datos de caché cuando hay error en Supabase', async () => {
      // Configurar el mock para devolver error
      const mockError = { message: 'Error de conexión' };
      supabase.select.mockReturnThis();
      supabase.order.mockReturnThis();
      supabase.single.mockResolvedValue({ data: null, error: mockError });

      // Configurar datos de caché
      const cachedData = [
        { id: '1', nombre: 'Institución 1 (caché)' },
        { id: '2', nombre: 'Institución 2 (caché)' }
      ];
      cacheManager.getCache.mockReturnValue(cachedData);

      // Ejecutar la función
      const result = await enhancedSupabaseService.getInstitutions();

      // Verificar que se intentó obtener de Supabase
      expect(supabase.from).toHaveBeenCalledWith('instituciones');

      // Verificar que se consultó la caché
      expect(cacheManager.getCache).toHaveBeenCalledWith('institutions');

      // Verificar el resultado
      expect(result).toEqual({
        data: cachedData,
        error: null
      });
    });
  });

  describe('createInstitution', () => {
    it('debería crear una institución correctamente', async () => {
      // Configurar mock de usuario actual
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      // Configurar el mock para devolver datos
      const mockInstitution = { nombre: 'Nueva Institución', direccion: 'Dirección 1' };
      const mockCreatedInstitution = {
        id: '123',
        ...mockInstitution,
        created_by: 'user-123',
        created_at: expect.any(String),
        updated_at: expect.any(String)
      };

      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: mockCreatedInstitution,
        error: null
      });

      // Configurar caché existente
      const existingCache = [{ id: '1', nombre: 'Institución Existente' }];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.createInstitution(mockInstitution);

      // Verificar que se llamó a Supabase correctamente
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.insert).toHaveBeenCalledWith([expect.objectContaining({
        nombre: mockInstitution.nombre,
        direccion: mockInstitution.direccion,
        created_by: 'user-123'
      })]);

      // Verificar que se actualizó la caché
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        [...existingCache, mockCreatedInstitution],
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: mockCreatedInstitution,
        error: null
      });
    });

    it('debería manejar errores de Supabase y crear un registro temporal', async () => {
      // Configurar mock de usuario actual
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      // Configurar el mock para devolver error
      const mockInstitution = { nombre: 'Nueva Institución', direccion: 'Dirección 1' };
      const mockError = { message: 'Error de conexión' };

      supabase.insert.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: null,
        error: mockError
      });

      // Configurar caché existente
      const existingCache = [{ id: '1', nombre: 'Institución Existente' }];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.createInstitution(mockInstitution);

      // Verificar que se intentó insertar en Supabase
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.insert).toHaveBeenCalled();

      // Verificar que se actualizó la caché con un registro temporal
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        expect.arrayContaining([
          ...existingCache,
          expect.objectContaining({
            nombre: mockInstitution.nombre,
            is_temporary: true
          })
        ]),
        expect.any(Number)
      );

      // Verificar que se guardó la operación pendiente
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'pending_operations',
        expect.arrayContaining([
          expect.objectContaining({
            type: 'CREATE',
            entity: 'instituciones',
            data: expect.objectContaining({
              nombre: mockInstitution.nombre
            })
          })
        ]),
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: expect.objectContaining({
          nombre: mockInstitution.nombre,
          is_temporary: true
        }),
        error: null,
        isOffline: true
      });
    });
  });

  describe('updateInstitution', () => {
    it('debería actualizar una institución correctamente', async () => {
      // Configurar el mock para devolver datos
      const institutionId = '123';
      const mockInstitution = { nombre: 'Institución Actualizada', direccion: 'Nueva Dirección' };
      const mockUpdatedInstitution = {
        id: institutionId,
        ...mockInstitution,
        updated_at: expect.any(String)
      };

      supabase.update.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: mockUpdatedInstitution,
        error: null
      });

      // Configurar caché existente
      const existingCache = [
        { id: '1', nombre: 'Institución 1' },
        { id: institutionId, nombre: 'Institución Original' }
      ];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.updateInstitution(institutionId, mockInstitution);

      // Verificar que se llamó a Supabase correctamente
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        nombre: mockInstitution.nombre,
        direccion: mockInstitution.direccion
      }));
      expect(supabase.eq).toHaveBeenCalledWith('id', institutionId);

      // Verificar que se actualizó la caché
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        [
          { id: '1', nombre: 'Institución 1' },
          mockUpdatedInstitution
        ],
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: mockUpdatedInstitution,
        error: null
      });
    });

    it('debería manejar errores de Supabase y actualizar localmente', async () => {
      // Configurar el mock para devolver error
      const institutionId = '123';
      const mockInstitution = { nombre: 'Institución Actualizada', direccion: 'Nueva Dirección' };
      const mockError = { message: 'Error de conexión' };

      supabase.update.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: null,
        error: mockError
      });

      // Configurar caché existente
      const existingCache = [
        { id: '1', nombre: 'Institución 1' },
        { id: institutionId, nombre: 'Institución Original' }
      ];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.updateInstitution(institutionId, mockInstitution);

      // Verificar que se intentó actualizar en Supabase
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.update).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', institutionId);

      // Verificar que se actualizó la caché con los cambios locales
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        expect.arrayContaining([
          { id: '1', nombre: 'Institución 1' },
          expect.objectContaining({
            id: institutionId,
            nombre: mockInstitution.nombre,
            direccion: mockInstitution.direccion,
            is_pending_update: true
          })
        ]),
        expect.any(Number)
      );

      // Verificar que se guardó la operación pendiente
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'pending_operations',
        expect.arrayContaining([
          expect.objectContaining({
            type: 'UPDATE',
            entity: 'instituciones',
            id: institutionId,
            data: expect.objectContaining({
              nombre: mockInstitution.nombre
            })
          })
        ]),
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: expect.objectContaining({
          id: institutionId,
          nombre: mockInstitution.nombre,
          is_pending_update: true
        }),
        error: null,
        isOffline: true
      });
    });
  });

  describe('deleteInstitution', () => {
    it('debería eliminar una institución correctamente', async () => {
      // Configurar el mock para devolver éxito
      const institutionId = '123';
      
      supabase.delete.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: { success: true },
        error: null
      });

      // Configurar caché existente
      const existingCache = [
        { id: '1', nombre: 'Institución 1' },
        { id: institutionId, nombre: 'Institución a Eliminar' }
      ];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.deleteInstitution(institutionId);

      // Verificar que se llamó a Supabase correctamente
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', institutionId);

      // Verificar que se actualizó la caché
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        [{ id: '1', nombre: 'Institución 1' }],
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: { success: true },
        error: null
      });
    });

    it('debería manejar errores de Supabase y marcar como pendiente de eliminación', async () => {
      // Configurar el mock para devolver error
      const institutionId = '123';
      const mockError = { message: 'Error de conexión' };

      supabase.delete.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.single.mockResolvedValue({
        data: null,
        error: mockError
      });

      // Configurar caché existente
      const existingCache = [
        { id: '1', nombre: 'Institución 1' },
        { id: institutionId, nombre: 'Institución a Eliminar' }
      ];
      cacheManager.getCache.mockReturnValue(existingCache);

      // Ejecutar la función
      const result = await enhancedSupabaseService.deleteInstitution(institutionId);

      // Verificar que se intentó eliminar en Supabase
      expect(supabase.from).toHaveBeenCalledWith('instituciones');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', institutionId);

      // Verificar que se actualizó la caché marcando como pendiente de eliminación
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'institutions',
        expect.arrayContaining([
          { id: '1', nombre: 'Institución 1' },
          expect.objectContaining({
            id: institutionId,
            is_pending_delete: true
          })
        ]),
        expect.any(Number)
      );

      // Verificar que se guardó la operación pendiente
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'pending_operations',
        expect.arrayContaining([
          expect.objectContaining({
            type: 'DELETE',
            entity: 'instituciones',
            id: institutionId
          })
        ]),
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        data: { success: true },
        error: null,
        isOffline: true
      });
    });
  });

  describe('syncPendingOperations', () => {
    it('debería sincronizar operaciones pendientes correctamente', async () => {
      // Configurar operaciones pendientes
      const pendingOperations = [
        {
          type: 'CREATE',
          entity: 'instituciones',
          data: { nombre: 'Nueva Institución' },
          tempId: 'temp-123'
        },
        {
          type: 'UPDATE',
          entity: 'instituciones',
          id: '456',
          data: { nombre: 'Institución Actualizada' }
        },
        {
          type: 'DELETE',
          entity: 'instituciones',
          id: '789'
        }
      ];
      cacheManager.getCache.mockReturnValue(pendingOperations);

      // Configurar respuestas de Supabase para cada operación
      supabase.insert.mockReturnThis();
      supabase.update.mockReturnThis();
      supabase.delete.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValueOnce({ data: { id: 'new-123' }, error: null }) // CREATE
        .mockResolvedValueOnce({ data: { id: '456' }, error: null }) // UPDATE
        .mockResolvedValueOnce({ data: { success: true }, error: null }); // DELETE

      // Ejecutar la función
      const result = await enhancedSupabaseService.syncPendingOperations();

      // Verificar que se llamó a Supabase para cada operación
      expect(supabase.from).toHaveBeenCalledTimes(4); // 3 operaciones + 1 getInstitutions
      expect(supabase.insert).toHaveBeenCalledWith([pendingOperations[0].data]);
      expect(supabase.update).toHaveBeenCalledWith(pendingOperations[1].data);
      expect(supabase.delete).toHaveBeenCalled();

      // Verificar que se actualizó la caché de operaciones pendientes
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'pending_operations',
        [],
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        success: true,
        syncedCount: 3,
        errors: []
      });
    });

    it('debería manejar errores durante la sincronización', async () => {
      // Configurar operaciones pendientes
      const pendingOperations = [
        {
          type: 'CREATE',
          entity: 'instituciones',
          data: { nombre: 'Nueva Institución' },
          tempId: 'temp-123'
        },
        {
          type: 'UPDATE',
          entity: 'instituciones',
          id: '456',
          data: { nombre: 'Institución Actualizada' }
        }
      ];
      cacheManager.getCache.mockReturnValue(pendingOperations);

      // Configurar respuestas de Supabase con un error
      const mockError = { message: 'Error de conexión' };
      supabase.insert.mockReturnThis();
      supabase.update.mockReturnThis();
      supabase.eq.mockReturnThis();
      supabase.select.mockReturnThis();
      supabase.single.mockResolvedValueOnce({ data: null, error: mockError }) // CREATE falla
        .mockResolvedValueOnce({ data: { id: '456' }, error: null }); // UPDATE exitoso

      // Ejecutar la función
      const result = await enhancedSupabaseService.syncPendingOperations();

      // Verificar que se llamó a Supabase para cada operación
      expect(supabase.from).toHaveBeenCalledTimes(3); // 2 operaciones + 1 getInstitutions
      expect(supabase.insert).toHaveBeenCalledWith([pendingOperations[0].data]);
      expect(supabase.update).toHaveBeenCalledWith(pendingOperations[1].data);

      // Verificar que se actualizó la caché de operaciones pendientes, manteniendo la fallida
      expect(cacheManager.setCache).toHaveBeenCalledWith(
        'pending_operations',
        expect.arrayContaining([pendingOperations[0]]),
        expect.any(Number)
      );

      // Verificar el resultado
      expect(result).toEqual({
        success: false,
        syncedCount: 1,
        errors: [expect.objectContaining({
          operation: pendingOperations[0],
          error: expect.anything()
        })]
      });
    });
  });
});
