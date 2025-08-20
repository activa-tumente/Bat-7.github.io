import React, { useState, useEffect } from 'react';
import { FaDatabase, FaSync, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { checkConnection, resetConnection, checkAllTables } from '../../utils/supabaseUtils';
import { supabaseConfig } from '../../api/supabaseConfig';

/**
 * Componente para verificar y corregir la conexión a Supabase
 */
const SupabaseConnectionTester = () => {
  const [status, setStatus] = useState({
    checking: false,
    connected: null,
    lastCheck: null,
    details: null,
    tables: null
  });
  const [expanded, setExpanded] = useState(false);

  // Verificar conexión al montar el componente
  useEffect(() => {
    handleCheckConnection();
  }, []);

  // Verificar conexión periódicamente si está desconectado
  useEffect(() => {
    let interval;
    
    if (status.connected === false) {
      interval = setInterval(() => {
        console.log('[SupabaseConnectionTester] Verificando conexión automáticamente...');
        handleCheckConnection(false);
      }, 30000); // Verificar cada 30 segundos si está desconectado
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.connected]);

  /**
   * Verifica la conexión con Supabase
   * @param {boolean} showLoading - Si debe mostrar el estado de carga
   */
  const handleCheckConnection = async (showLoading = true) => {
    if (showLoading) {
      setStatus(prev => ({ ...prev, checking: true }));
    }
    
    try {
      const connectionStatus = await checkConnection();
      
      setStatus({
        checking: false,
        connected: connectionStatus.connected,
        lastCheck: new Date(),
        details: connectionStatus.status,
        tables: null
      });
      
      // Si está conectado, verificar tablas
      if (connectionStatus.connected) {
        const tablesStatus = await checkAllTables();
        setStatus(prev => ({ ...prev, tables: tablesStatus }));
      }
    } catch (error) {
      console.error('[SupabaseConnectionTester] Error al verificar conexión:', error);
      setStatus({
        checking: false,
        connected: false,
        lastCheck: new Date(),
        details: {
          error: {
            message: error.message,
            stack: error.stack
          }
        },
        tables: null
      });
    }
  };

  /**
   * Intenta restablecer la conexión con Supabase
   */
  const handleResetConnection = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await resetConnection();
      
      setStatus({
        checking: false,
        connected: result.connected,
        lastCheck: new Date(),
        details: result.status,
        tables: null
      });
      
      // Si está conectado, verificar tablas
      if (result.connected) {
        const tablesStatus = await checkAllTables();
        setStatus(prev => ({ ...prev, tables: tablesStatus }));
      }
    } catch (error) {
      console.error('[SupabaseConnectionTester] Error al restablecer conexión:', error);
      setStatus({
        checking: false,
        connected: false,
        lastCheck: new Date(),
        details: {
          error: {
            message: error.message,
            stack: error.stack
          }
        },
        tables: null
      });
    }
  };

  // Renderizar estado de conexión
  const renderConnectionStatus = () => {
    if (status.checking) {
      return (
        <div className="flex items-center text-blue-500">
          <FaSync className="animate-spin mr-2" />
          <span>Verificando conexión...</span>
        </div>
      );
    }
    
    if (status.connected === true) {
      return (
        <div className="flex items-center text-green-500">
          <FaCheck className="mr-2" />
          <span>Conectado a Supabase</span>
        </div>
      );
    }
    
    if (status.connected === false) {
      return (
        <div className="flex items-center text-red-500">
          <FaTimes className="mr-2" />
          <span>Desconectado de Supabase</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-gray-500">
        <FaExclamationTriangle className="mr-2" />
        <span>Estado desconocido</span>
      </div>
    );
  };

  // Renderizar detalles de la conexión
  const renderConnectionDetails = () => {
    if (!expanded || !status.details) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">Detalles de conexión:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Estado:</div>
          <div>{status.connected ? 'Conectado' : 'Desconectado'}</div>
          
          <div className="font-medium">Última verificación:</div>
          <div>{status.lastCheck?.toLocaleString()}</div>
          
          <div className="font-medium">Supabase habilitado:</div>
          <div>{supabaseConfig.enabled ? 'Sí' : 'No'}</div>
          
          <div className="font-medium">Timeout configurado:</div>
          <div>{supabaseConfig.timeout}ms</div>
          
          <div className="font-medium">Reconexión automática:</div>
          <div>{supabaseConfig.reconnect?.enabled ? 'Habilitada' : 'Deshabilitada'}</div>
        </div>
        
        {status.details.error && (
          <div className="mt-2">
            <h4 className="font-semibold text-red-500">Error:</h4>
            <div className="p-2 bg-red-50 rounded border border-red-200 text-red-700 text-xs">
              {status.details.error.message}
            </div>
          </div>
        )}
        
        {status.tables && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Estado de tablas:</h4>
            <div className="space-y-2">
              {Object.entries(status.tables.tables).map(([table, tableStatus]) => (
                <div key={table} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${tableStatus.accessible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{table}:</span>
                  <span className="ml-2">{tableStatus.accessible ? 'Accesible' : 'No accesible'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaDatabase className="text-blue-600 mr-3 text-xl" />
          <div>
            <h3 className="font-semibold text-lg">Conexión a Supabase</h3>
            {renderConnectionStatus()}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            {expanded ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          
          <button
            onClick={handleCheckConnection}
            disabled={status.checking}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
          >
            Verificar
          </button>
          
          <button
            onClick={handleResetConnection}
            disabled={status.checking}
            className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
          >
            Reconectar
          </button>
        </div>
      </div>
      
      {renderConnectionDetails()}
    </div>
  );
};

export default SupabaseConnectionTester;
