// src/components/common/SupabaseStatus.jsx
import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../../utils/supabaseTest';

const SupabaseStatus = () => {
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    error: null,
    data: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        setStatus({
          loading: false,
          success: result.success,
          error: result.error || null,
          data: result.success ? result : null
        });
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          error: error.message,
          data: null
        });
      }
    };

    checkConnection();
  }, []);

  if (status.loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
        <p className="text-gray-600">Verificando conexión con Supabase...</p>
      </div>
    );
  }

  if (!status.success) {
    return (
      <div className="p-4 bg-red-100 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-red-800">Error de conexión</h3>
        <p className="text-red-600">{status.error || 'No se pudo conectar con Supabase'}</p>
      </div>
    );
  }

  // Si estamos usando el cliente mock (Supabase deshabilitado)
  if (status.data?.mock) {
    return (
      <div className="p-4 bg-yellow-100 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-yellow-800">Modo sin conexión</h3>
        <p className="text-yellow-600">{status.data.message}</p>
        <div className="mt-2">
          <p className="text-sm text-yellow-700">
            Usando datos de ejemplo para desarrollo
          </p>
          {/* Test data references removed - using real data only */}
        </div>
        <div className="mt-3 text-xs text-yellow-800">
          Para habilitar Supabase, modifica el archivo src/api/supabaseConfig.js y establece enabled: true
        </div>
      </div>
    );
  }

  // Si la conexión con Supabase es exitosa
  return (
    <div className="p-4 bg-green-100 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-green-800">Conexión establecida</h3>
      <p className="text-green-600">La conexión con Supabase está funcionando correctamente.</p>
      {status.data?.session && (
        <p className="mt-2 text-sm text-green-700">
          {status.data.session ? 'Usuario autenticado' : 'No hay sesión activa'}
        </p>
      )}
      {/* Test data references removed - using real data only */}
    </div>
  );
};

export default SupabaseStatus;
