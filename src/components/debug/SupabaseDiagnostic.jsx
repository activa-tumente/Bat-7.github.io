import React, { useState, useEffect } from 'react';
import supabase from '../../api/supabaseClient';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

/**
 * Componente de diagnóstico para verificar el estado de Supabase
 * Útil para debugging y verificar conectividad
 */
const SupabaseDiagnostic = ({ className = '' }) => {
  const [diagnostics, setDiagnostics] = useState({
    connection: { status: 'loading', message: 'Verificando...' },
    pacientes: { status: 'loading', message: 'Verificando...' },
    resultados: { status: 'loading', message: 'Verificando...' },
    testSessions: { status: 'loading', message: 'Verificando...' },
    aptitudes: { status: 'loading', message: 'Verificando...' }
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    // Test 1: Conexión básica
    try {
      const { data, error } = await supabase.from('pacientes').select('count').limit(1);
      if (error) throw error;
      setDiagnostics(prev => ({
        ...prev,
        connection: { status: 'success', message: 'Conexión exitosa' }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        connection: { status: 'error', message: `Error de conexión: ${error.message}` }
      }));
    }

    // Test 2: Tabla pacientes
    try {
      const { data, error } = await supabase.from('pacientes').select('id').limit(1);
      if (error) throw error;
      setDiagnostics(prev => ({
        ...prev,
        pacientes: { status: 'success', message: `Tabla accesible (${data?.length || 0} registros)` }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        pacientes: { status: 'error', message: `Error: ${error.message}` }
      }));
    }

    // Test 3: Tabla resultados
    try {
      const { data, error } = await supabase.from('resultados').select('id').limit(1);
      if (error) throw error;
      setDiagnostics(prev => ({
        ...prev,
        resultados: { status: 'success', message: `Tabla accesible (${data?.length || 0} registros)` }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        resultados: { status: 'error', message: `Error: ${error.message}` }
      }));
    }

    // Test 4: Tabla test_sessions
    try {
      const { data, error } = await supabase.from('test_sessions').select('id').limit(1);
      if (error) throw error;
      setDiagnostics(prev => ({
        ...prev,
        testSessions: { status: 'success', message: `Tabla accesible (${data?.length || 0} registros)` }
      }));
    } catch (error) {
      const isTableMissing = error.code === 'PGRST106' || error.status === 406;
      setDiagnostics(prev => ({
        ...prev,
        testSessions: { 
          status: isTableMissing ? 'warning' : 'error', 
          message: isTableMissing ? 'Tabla no existe (funcionalidad limitada)' : `Error: ${error.message}` 
        }
      }));
    }

    // Test 5: Tabla aptitudes
    try {
      const { data, error } = await supabase.from('aptitudes').select('id').limit(1);
      if (error) throw error;
      setDiagnostics(prev => ({
        ...prev,
        aptitudes: { status: 'success', message: `Tabla accesible (${data?.length || 0} registros)` }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        aptitudes: { status: 'error', message: `Error: ${error.message}` }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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

  const getStatusColor = (status) => {
    switch (status) {
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
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Diagnóstico de Supabase
        </h3>
        <button
          onClick={runDiagnostics}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(diagnostics).map(([key, diagnostic]) => (
          <div
            key={key}
            className={`p-3 rounded-lg border ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(diagnostic.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-800 capitalize">
                  {key === 'testSessions' ? 'Test Sessions' : key}
                </div>
                <div className="text-sm text-gray-600">
                  {diagnostic.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
          <p><strong>Proyecto:</strong> ydglduxhgwajqdseqzpy</p>
          <p><strong>Última verificación:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;
