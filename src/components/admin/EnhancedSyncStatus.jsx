import React, { useState, useEffect } from 'react';
// Eliminamos importaciones no usadas
// import { toast } from 'react-toastify';
// import enhancedSupabaseService from '../../services/enhancedSupabaseService';
// import { showErrorToast, showSuccessToast } from '../../utils/errorHandler';
import supabase from '../../api/supabaseClient'; // Importamos supabase para verificar conexión

/**
 * Componente simplificado que muestra el estado de conexión a Supabase
 */
const EnhancedSyncStatus = () => {
  const [isConnected, setIsConnected] = useState(true); // Asumimos conectado inicialmente
  const [isChecking, setIsChecking] = useState(false);

  // Verificar conexión al montar y periódicamente
  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        // Intenta una operación simple, como obtener el usuario actual
        const { error } = await supabase.auth.getUser();
        setIsConnected(!error); // Si no hay error, estamos conectados
      } catch (error) {
        setIsConnected(false); // Si hay error, asumimos desconectado
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection(); // Verificar al montar
    const interval = setInterval(checkConnection, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, []);

  // Determinar el estado y el color
  let statusText = 'Desconocido';
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let dotColor = 'bg-gray-500';
  let title = 'Estado de conexión';

  if (isChecking) {
    statusText = 'Verificando...';
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
    dotColor = 'bg-blue-500';
    title = 'Verificando conexión con Supabase...';
  } else if (isConnected) {
    statusText = 'Conectado';
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    dotColor = 'bg-green-500';
    title = 'Conectado a Supabase';
  } else {
    statusText = 'Desconectado';
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    dotColor = 'bg-red-500';
    title = 'Desconectado de Supabase. Verifique su conexión a internet.';
  }

  return (
    <div className="relative">
      <div
        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${bgColor} ${textColor}`}
        title={title}
      >
        {isChecking ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${dotColor} ${!isConnected ? 'animate-pulse' : ''}`}></span>
        )}
        {statusText}
      </div>
      {/* Eliminamos el panel de detalles y el botón de información */}
    </div>
  );
};

export default EnhancedSyncStatus;
