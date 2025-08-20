/**
 * Pruebas unitarias para el componente EnhancedSyncStatus
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedSyncStatus from '../components/admin/EnhancedSyncStatus';
import enhancedSupabaseService from '../services/enhancedSupabaseService';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Mock de los servicios
jest.mock('../services/enhancedSupabaseService', () => ({
  getSyncStatus: jest.fn(),
  syncPendingOperations: jest.fn()
}));

// Mock de los manejadores de errores
jest.mock('../utils/errorHandler', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn()
}));

describe('EnhancedSyncStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mock por defecto
    enhancedSupabaseService.getSyncStatus.mockReturnValue({
      pendingCount: 0,
      lastSyncAttempt: null,
      operations: []
    });
  });

  it('debería mostrar "Sincronizado" cuando no hay operaciones pendientes', () => {
    render(<EnhancedSyncStatus />);
    expect(screen.getByText('Sincronizado')).toBeInTheDocument();
  });

  it('debería mostrar el número de operaciones pendientes cuando existen', () => {
    enhancedSupabaseService.getSyncStatus.mockReturnValue({
      pendingCount: 3,
      lastSyncAttempt: null,
      operations: [
        { type: 'CREATE', entity: 'instituciones', id: 'temp-1', timestamp: Date.now() },
        { type: 'UPDATE', entity: 'instituciones', id: '123', timestamp: Date.now() },
        { type: 'DELETE', entity: 'instituciones', id: '456', timestamp: Date.now() }
      ]
    });
    
    render(<EnhancedSyncStatus />);
    expect(screen.getByText('3 pendientes')).toBeInTheDocument();
  });

  it('debería mostrar el panel de detalles al hacer clic en el botón de información', () => {
    render(<EnhancedSyncStatus />);
    
    // El panel de detalles no debería estar visible inicialmente
    expect(screen.queryByText('Estado de sincronización')).not.toBeInTheDocument();
    
    // Hacer clic en el botón de información
    fireEvent.click(screen.getByTitle('Ver detalles de sincronización'));
    
    // El panel de detalles debería estar visible
    expect(screen.getByText('Estado de sincronización')).toBeInTheDocument();
  });

  it('debería mostrar las operaciones pendientes en el panel de detalles', () => {
    enhancedSupabaseService.getSyncStatus.mockReturnValue({
      pendingCount: 2,
      lastSyncAttempt: Date.now(),
      operations: [
        { type: 'CREATE', entity: 'instituciones', id: 'temp-1', timestamp: Date.now() },
        { type: 'UPDATE', entity: 'instituciones', id: '123', timestamp: Date.now() }
      ]
    });
    
    render(<EnhancedSyncStatus />);
    
    // Abrir el panel de detalles
    fireEvent.click(screen.getByTitle('Ver detalles de sincronización'));
    
    // Verificar que se muestran las operaciones pendientes
    expect(screen.getByText('Operaciones pendientes:')).toBeInTheDocument();
    expect(screen.getByText('Crear institución')).toBeInTheDocument();
    expect(screen.getByText('Actualizar institución')).toBeInTheDocument();
  });

  it('debería sincronizar las operaciones pendientes al hacer clic en el botón', async () => {
    enhancedSupabaseService.getSyncStatus.mockReturnValue({
      pendingCount: 2,
      lastSyncAttempt: null,
      operations: [
        { type: 'CREATE', entity: 'instituciones', id: 'temp-1', timestamp: Date.now() },
        { type: 'UPDATE', entity: 'instituciones', id: '123', timestamp: Date.now() }
      ]
    });
    
    enhancedSupabaseService.syncPendingOperations.mockResolvedValue({
      success: true,
      syncedCount: 2,
      errors: []
    });
    
    render(<EnhancedSyncStatus />);
    
    // Abrir el panel de detalles
    fireEvent.click(screen.getByTitle('Ver detalles de sincronización'));
    
    // Hacer clic en el botón de sincronización
    fireEvent.click(screen.getByText('Sincronizar ahora'));
    
    // Verificar que se llamó a la función de sincronización
    expect(enhancedSupabaseService.syncPendingOperations).toHaveBeenCalled();
    
    // Esperar a que se complete la sincronización
    await waitFor(() => {
      expect(showSuccessToast).toHaveBeenCalledWith(
        'Sincronización completada. 2 operaciones sincronizadas.'
      );
    });
  });

  it('debería mostrar un error si la sincronización falla', async () => {
    enhancedSupabaseService.getSyncStatus.mockReturnValue({
      pendingCount: 2,
      lastSyncAttempt: null,
      operations: [
        { type: 'CREATE', entity: 'instituciones', id: 'temp-1', timestamp: Date.now() },
        { type: 'UPDATE', entity: 'instituciones', id: '123', timestamp: Date.now() }
      ]
    });
    
    enhancedSupabaseService.syncPendingOperations.mockResolvedValue({
      success: false,
      syncedCount: 1,
      errors: [{ message: 'Error de conexión' }]
    });
    
    render(<EnhancedSyncStatus />);
    
    // Abrir el panel de detalles
    fireEvent.click(screen.getByTitle('Ver detalles de sincronización'));
    
    // Hacer clic en el botón de sincronización
    fireEvent.click(screen.getByText('Sincronizar ahora'));
    
    // Verificar que se llamó a la función de sincronización
    expect(enhancedSupabaseService.syncPendingOperations).toHaveBeenCalled();
    
    // Esperar a que se complete la sincronización
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith({
        message: 'Sincronización parcial. 1 operaciones sincronizadas, 1 errores.'
      });
    });
  });
});
