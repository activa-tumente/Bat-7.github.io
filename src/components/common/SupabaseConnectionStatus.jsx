// src/components/common/SupabaseConnectionStatus.jsx
import React, { useState, useEffect } from 'react';
import { verifySupabaseConnection } from '../../utils/supabaseConnectionChecker';

/**
 * Componente para mostrar el estado detallado de la conexión a Supabase
 * Muestra información sobre la conexión, autenticación y acceso a la base de datos
 */
const SupabaseConnectionStatus = ({ onStatusChange = null }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const result = await verifySupabaseConnection(false); // No mostrar toasts automáticamente
      setStatus(result);
      
      // Notificar al componente padre si es necesario
      if (onStatusChange) {
        onStatusChange(result);
      }
    } catch (error) {
      console.error('Error al verificar estado de Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (componentStatus) => {
    switch (componentStatus) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'warning':
        return <span className="text-yellow-500">⚠</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      default:
        return <span className="text-gray-500">?</span>;
    }
  };

  const getOverallStatus = () => {
    if (!status) return 'loading';
    if (!status.configEnabled) return 'disabled';
    if (!status.connectionOk) return 'error';
    if (!status.authOk || !status.databaseOk) return 'warning';
    return 'success';
  };

  const getStatusColor = () => {
    const overallStatus = getOverallStatus();
    switch (overallStatus) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'error': return 'bg-red-100 border-red-300 text-red-800';
      case 'disabled': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusMessage = () => {
    const overallStatus = getOverallStatus();
    switch (overallStatus) {
      case 'success': return 'Conexión a Supabase establecida correctamente';
      case 'warning': return 'Supabase conectado con advertencias';
      case 'error': return 'Error de conexión a Supabase';
      case 'disabled': return 'Supabase está deshabilitado';
      case 'loading': return 'Verificando conexión a Supabase...';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex justify-between items-center">
        <div className="font-semibold">
          {loading ? (
            <span>Verificando conexión a Supabase...</span>
          ) : (
            <span>{getStatusMessage()}</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-sm px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-70"
          >
            {expanded ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          <button 
            onClick={checkConnection}
            className="text-sm px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-70"
            disabled={loading}
          >
            Verificar
          </button>
        </div>
      </div>

      {expanded && status && (
        <div className="mt-4 text-sm">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white bg-opacity-50 p-2 rounded">
              <p className="font-semibold mb-1">Estado de componentes:</p>
              <ul className="space-y-1">
                <li>
                  {getStatusIcon(status.configEnabled ? 'success' : 'warning')} Configuración: 
                  <span className={status.configEnabled ? 'text-green-600' : 'text-yellow-600'}>
                    {status.configEnabled ? 'Habilitada' : 'Deshabilitada'}
                  </span>
                </li>
                <li>
                  {getStatusIcon(status.connectionOk ? 'success' : 'error')} Conexión: 
                  <span className={status.connectionOk ? 'text-green-600' : 'text-red-600'}>
                    {status.connectionOk ? 'Correcta' : 'Error'}
                  </span>
                </li>
                <li>
                  {getStatusIcon(status.authOk ? 'success' : 'warning')} Autenticación: 
                  <span className={status.authOk ? 'text-green-600' : 'text-yellow-600'}>
                    {status.authOk ? 'Correcta' : 'Advertencia'}
                  </span>
                </li>
                <li>
                  {getStatusIcon(status.databaseOk ? 'success' : 'warning')} Base de datos: 
                  <span className={status.databaseOk ? 'text-green-600' : 'text-yellow-600'}>
                    {status.databaseOk ? 'Accesible' : 'Problemas de acceso'}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white bg-opacity-50 p-2 rounded">
              <p className="font-semibold mb-1">Sugerencias:</p>
              {status.suggestions.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {status.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600">No hay sugerencias, todo funciona correctamente.</p>
              )}
            </div>
          </div>

          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="font-semibold mb-1">Detalles:</p>
            <ul className="space-y-1">
              {status.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">{getStatusIcon(detail.status)}</span>
                  <span>
                    <strong>{detail.component}:</strong> {detail.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionStatus;