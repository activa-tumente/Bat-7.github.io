import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'react-toastify';
import supabaseService from '../../services/supabaseService';

/**
 * Componente que muestra el estado de sincronización con Supabase
 * y permite sincronizar manualmente los datos pendientes
 */
const SyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState({
    pendingOperations: 0,
    lastSync: null
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Obtener el estado de sincronización al montar el componente
  useEffect(() => {
    const status = supabaseService.getSyncStatus();
    setSyncStatus(status);
    
    // Actualizar el estado cada 30 segundos
    const interval = setInterval(() => {
      const status = supabaseService.getSyncStatus();
      setSyncStatus(status);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para sincronizar manualmente
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const result = await supabaseService.syncPendingOperations();
      
      if (result.success) {
        toast.success(`Sincronización completada. ${result.syncedCount} operaciones sincronizadas.`);
        
        if (result.failedCount > 0) {
          toast.warning(`${result.failedCount} operaciones fallaron. Se intentará nuevamente más tarde.`);
        }
        
        // Actualizar el estado de sincronización
        setSyncStatus({
          pendingOperations: result.pendingCount,
          lastSync: new Date().toISOString()
        });
        
        // Guardar la marca de tiempo de la última sincronización
        localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
      } else {
        toast.error('Error al sincronizar. Intente nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      toast.error('Error al sincronizar. Intente nuevamente más tarde.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Formatear la fecha de la última sincronización
  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
      <div className="flex items-center">
        <span className="mr-2">
          <i className="fas fa-cloud-upload-alt"></i>
        </span>
        <span>
          {syncStatus.pendingOperations > 0 ? (
            <span className="text-orange-600 font-medium">
              {syncStatus.pendingOperations} {syncStatus.pendingOperations === 1 ? 'cambio' : 'cambios'} pendiente{syncStatus.pendingOperations === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="text-green-600">Todos los cambios sincronizados</span>
          )}
        </span>
      </div>
      
      <div className="flex items-center">
        <span className="text-gray-500 mr-4 text-xs">
          Última sincronización: {formatLastSync(syncStatus.lastSync)}
        </span>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing || syncStatus.pendingOperations === 0}
          className="flex items-center py-1"
        >
          {isSyncing ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1"></i>
              Sincronizando...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt mr-1"></i>
              Sincronizar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SyncStatus;
