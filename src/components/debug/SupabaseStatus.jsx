import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner, FaDatabase, FaUsers, FaKey } from 'react-icons/fa';
import supabase from '../../api/supabaseClient';

/**
 * Componente para mostrar el estado de la conexión con Supabase
 * Útil para debugging y verificación de configuración
 */
const SupabaseStatus = ({ showDetails = false }) => {
  const [status, setStatus] = useState({
    connection: 'checking',
    tables: 'checking',
    users: 'checking',
    config: 'checking',
    details: {}
  });

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    // Verificar configuración
    const config = checkConfig();
    
    // Verificar conexión
    const connection = await checkConnection();
    
    // Verificar tablas
    const tables = await checkTables();
    
    // Verificar usuarios
    const users = await checkUsers();

    setStatus({
      connection: connection.status,
      tables: tables.status,
      users: users.status,
      config: config.status,
      details: {
        config: config.details,
        connection: connection.details,
        tables: tables.details,
        users: users.details
      }
    });
  };

  const checkConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return {
        status: 'error',
        details: 'Variables de entorno no configuradas'
      };
    }
    
    return {
      status: 'success',
      details: {
        url: url,
        keyLength: key.length
      }
    };
  };

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          status: 'error',
          details: error.message
        };
      }
      
      return {
        status: 'success',
        details: 'Conexión establecida'
      };
    } catch (error) {
      return {
        status: 'error',
        details: error.message
      };
    }
  };

  const checkTables = async () => {
    const tables = ['usuarios', 'pacientes', 'evaluaciones', 'resultados'];
    const results = {};
    let hasErrors = false;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = { status: 'error', message: error.message };
          hasErrors = true;
        } else {
          results[table] = { status: 'success', count: count || 0 };
        }
      } catch (error) {
        results[table] = { status: 'error', message: error.message };
        hasErrors = true;
      }
    }

    return {
      status: hasErrors ? 'warning' : 'success',
      details: results
    };
  };

  const checkUsers = async () => {
    try {
      const { data, error, count } = await supabase
        .from('usuarios')
        .select('rol', { count: 'exact' });

      if (error) {
        return {
          status: 'error',
          details: error.message
        };
      }

      const roleCount = data?.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        status: count > 0 ? 'success' : 'warning',
        details: {
          total: count || 0,
          roles: roleCount
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: error.message
      };
    }
  };

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaSpinner className="text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <FaDatabase className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold">Estado de Supabase</h3>
        <button
          onClick={checkSupabaseStatus}
          className="ml-auto px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {/* Configuración */}
        <div className={`p-3 border rounded ${getStatusColor(status.config)}`}>
          <div className="flex items-center">
            {getStatusIcon(status.config)}
            <span className="ml-2 font-medium">Configuración</span>
          </div>
          {showDetails && status.details.config && (
            <div className="mt-2 text-sm text-gray-600">
              {typeof status.details.config === 'string' ? (
                <p>{status.details.config}</p>
              ) : (
                <div>
                  <p>URL: {status.details.config.url}</p>
                  <p>Clave: {status.details.config.keyLength} caracteres</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conexión */}
        <div className={`p-3 border rounded ${getStatusColor(status.connection)}`}>
          <div className="flex items-center">
            {getStatusIcon(status.connection)}
            <span className="ml-2 font-medium">Conexión</span>
          </div>
          {showDetails && status.details.connection && (
            <div className="mt-2 text-sm text-gray-600">
              <p>{status.details.connection}</p>
            </div>
          )}
        </div>

        {/* Tablas */}
        <div className={`p-3 border rounded ${getStatusColor(status.tables)}`}>
          <div className="flex items-center">
            {getStatusIcon(status.tables)}
            <span className="ml-2 font-medium">Tablas</span>
          </div>
          {showDetails && status.details.tables && (
            <div className="mt-2 text-sm text-gray-600">
              {Object.entries(status.details.tables).map(([table, info]) => (
                <div key={table} className="flex justify-between">
                  <span>{table}:</span>
                  <span className={info.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {info.status === 'success' ? `${info.count} registros` : info.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usuarios */}
        <div className={`p-3 border rounded ${getStatusColor(status.users)}`}>
          <div className="flex items-center">
            {getStatusIcon(status.users)}
            <FaUsers className="ml-1 mr-2" />
            <span className="font-medium">Usuarios</span>
          </div>
          {showDetails && status.details.users && (
            <div className="mt-2 text-sm text-gray-600">
              {typeof status.details.users === 'string' ? (
                <p>{status.details.users}</p>
              ) : (
                <div>
                  <p>Total: {status.details.users.total}</p>
                  {Object.entries(status.details.users.roles || {}).map(([role, count]) => (
                    <div key={role} className="flex justify-between">
                      <span className="capitalize">{role}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resumen general */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center">
          <FaKey className="text-gray-600 mr-2" />
          <span className="text-sm font-medium">Estado General:</span>
          <span className={`ml-2 text-sm ${
            Object.values(status).every(s => s === 'success') ? 'text-green-600' :
            Object.values(status).some(s => s === 'error') ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {Object.values(status).every(s => s === 'success') ? 'Todo funcionando correctamente' :
             Object.values(status).some(s => s === 'error') ? 'Hay errores que requieren atención' :
             'Algunas advertencias detectadas'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SupabaseStatus;
