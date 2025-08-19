import React, { useState, useEffect } from 'react';
import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';
import { SupabaseConversionService } from '../services/supabaseConversionService';

/**
 * Componente mejorado para probar la conexión a Supabase
 * Incluye pruebas de conversión PD a PC y diagnósticos avanzados
 * @param {Function} onConnectionChange - Función para notificar cambios en el estado de la conexión
 */
const SupabaseTest = ({ onConnectionChange }) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('No probado');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [conversionTest, setConversionTest] = useState({
    status: 'No probado',
    result: null,
    loading: false
  });
  const [diagnostics, setDiagnostics] = useState({
    environment: null,
    database: null,
    functions: null,
    permissions: null
  });

  // Ejecutar diagnósticos completos
  const runCompleteDiagnostics = async () => {
    setLoading(true);
    console.log('🔍 Iniciando diagnósticos completos de Supabase...');
    
    try {
      // 1. Verificar variables de entorno
      const envDiagnostic = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        urlValid: import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co'),
        status: 'success'
      };
      
      if (!envDiagnostic.supabaseUrl || !envDiagnostic.hasAnonKey) {
        envDiagnostic.status = 'error';
        envDiagnostic.message = 'Variables de entorno faltantes';
      }
      
      setDiagnostics(prev => ({ ...prev, environment: envDiagnostic }));

      // 2. Probar conexión básica
      let dbDiagnostic = { status: 'checking' };
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.columns')
          .select('table_name')
          .eq('table_schema', 'public')
          .order('table_name');

        if (tablesError) throw tablesError;

        const uniqueTables = [...new Set(tablesData.map(item => item.table_name))];
        const formattedTables = uniqueTables.map(name => ({ name, schema: 'public' }));

        dbDiagnostic = {
          status: 'success',
          tablesCount: uniqueTables.length,
          tables: formattedTables
        };
        
        setTables(formattedTables);
        setConnectionStatus('Conectado');
        
      } catch (error) {
        dbDiagnostic = {
          status: 'error',
          error: error.message,
          code: error.code
        };
        setConnectionStatus(`Error: ${error.message}`);
      }
      
      setDiagnostics(prev => ({ ...prev, database: dbDiagnostic }));

      // 3. Verificar funciones de conversión (simplificado)
      let functionsDiagnostic = {
        status: 'info',
        available: true,
        message: 'Verificación de funciones de conversión deshabilitada'
      };
      
      // Nota: La verificación automática de funciones fue removida
      
      setDiagnostics(prev => ({ ...prev, functions: functionsDiagnostic }));

      // 4. Verificar permisos básicos
      let permissionsDiagnostic = { status: 'checking' };
      try {
        // Probar lectura en tabla resultados
        const { data: resultadosTest, error: resultadosError } = await supabase
          .from('resultados')
          .select('id')
          .limit(1);

        if (resultadosError) throw resultadosError;

        permissionsDiagnostic = {
          status: 'success',
          canRead: true,
          message: 'Permisos de lectura verificados'
        };
      } catch (error) {
        permissionsDiagnostic = {
          status: 'warning',
          canRead: false,
          error: error.message,
          message: 'Permisos limitados detectados'
        };
      }
      
      setDiagnostics(prev => ({ ...prev, permissions: permissionsDiagnostic }));

      // Notificar resultado general
      const allSuccess = dbDiagnostic.status === 'success' && 
                        functionsDiagnostic.status === 'success' && 
                        permissionsDiagnostic.status === 'success';
      
      if (allSuccess) {
        toast.success('✅ Todos los diagnósticos completados exitosamente');
        if (onConnectionChange) onConnectionChange(true);
      } else {
        toast.warning('⚠️ Diagnósticos completados con advertencias');
        if (onConnectionChange) onConnectionChange(dbDiagnostic.status === 'success');
      }

    } catch (error) {
      console.error('❌ Error en diagnósticos:', error);
      toast.error(`Error en diagnósticos: ${error.message}`);
      if (onConnectionChange) onConnectionChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Probar conversión PD a PC
  const testConversion = async () => {
    setConversionTest(prev => ({ ...prev, loading: true, status: 'Probando...' }));
    
    try {
      const resultado = await SupabaseConversionService.probarConversion(25, 'V', 13);
      
      if (resultado.success) {
        setConversionTest({
          loading: false,
          status: 'Exitoso',
          result: {
            input: { pd: 25, aptitud: 'V', edad: 13 },
            output: { percentil: resultado.percentil },
            message: `PD 25 → PC ${resultado.percentil}`
          }
        });
        toast.success(`✅ Conversión exitosa: PC ${resultado.percentil}`);
      } else {
        setConversionTest({
          loading: false,
          status: 'Error',
          result: {
            error: resultado.error,
            validationErrors: resultado.validationErrors
          }
        });
        toast.error('❌ Error en conversión PD a PC');
      }
    } catch (error) {
      setConversionTest({
        loading: false,
        status: 'Error',
        result: { error: error.message }
      });
      toast.error(`❌ Error inesperado: ${error.message}`);
    }
  };

  // Cargar datos de una tabla
  const loadTableData = async (tableName) => {
    if (!tableName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);

      if (error) throw error;

      setTableData(data || []);
      toast.success(`Datos de la tabla ${tableName} cargados correctamente`);
    } catch (error) {
      console.error(`Error al cargar datos de la tabla ${tableName}:`, error);
      toast.error(`Error al cargar datos: ${error.message || 'Desconocido'}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando se selecciona una tabla
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Prueba de Conexión a Supabase</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Estado de la conexión:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'Conectado'
              ? 'bg-green-100 text-green-800'
              : connectionStatus === 'No probado'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={runCompleteDiagnostics}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Ejecutando diagnósticos...' : 'Diagnósticos Completos'}
          </button>
          
          <button
            onClick={testConversion}
            disabled={conversionTest.loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
          >
            {conversionTest.loading ? 'Probando...' : 'Probar Conversión'}
          </button>
        </div>
      </div>

      {/* Resultados de diagnósticos */}
      {Object.keys(diagnostics).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Resultados de Diagnósticos</h3>
          
          {/* Variables de entorno */}
          {diagnostics.environment && (
            <div className={`p-4 rounded-lg border ${
              diagnostics.environment.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className="font-medium text-gray-800 mb-2">🔧 Variables de Entorno</h4>
              <div className="text-sm space-y-1">
                <p>URL: {diagnostics.environment.supabaseUrl || 'No definida'}</p>
                <p>Anon Key: {diagnostics.environment.hasAnonKey ? '✅ Definida' : '❌ Faltante'}</p>
                <p>URL Válida: {diagnostics.environment.urlValid ? '✅ Sí' : '❌ No'}</p>
                {diagnostics.environment.message && (
                  <p className="text-red-600">{diagnostics.environment.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Base de datos */}
          {diagnostics.database && (
            <div className={`p-4 rounded-lg border ${
              diagnostics.database.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className="font-medium text-gray-800 mb-2">🗄️ Base de Datos</h4>
              <div className="text-sm space-y-1">
                {diagnostics.database.status === 'success' ? (
                  <>
                    <p>✅ Conexión exitosa</p>
                    <p>Tablas encontradas: {diagnostics.database.tablesCount}</p>
                  </>
                ) : (
                  <>
                    <p>❌ Error de conexión</p>
                    <p className="text-red-600">{diagnostics.database.error}</p>
                    {diagnostics.database.code && (
                      <p className="text-red-500">Código: {diagnostics.database.code}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Funciones de conversión */}
          {diagnostics.functions && (
            <div className={`p-4 rounded-lg border ${
              diagnostics.functions.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : diagnostics.functions.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <h4 className="font-medium text-gray-800 mb-2">⚙️ Funciones de Conversión</h4>
              <div className="text-sm space-y-1">
                <p>{diagnostics.functions.available ? '✅' : '❌'} {diagnostics.functions.message}</p>
                {diagnostics.functions.error && (
                  <p className="text-red-600">{diagnostics.functions.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Permisos */}
          {diagnostics.permissions && (
            <div className={`p-4 rounded-lg border ${
              diagnostics.permissions.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className="font-medium text-gray-800 mb-2">🔐 Permisos</h4>
              <div className="text-sm space-y-1">
                <p>{diagnostics.permissions.canRead ? '✅' : '❌'} {diagnostics.permissions.message}</p>
                {diagnostics.permissions.error && (
                  <p className="text-yellow-600">{diagnostics.permissions.error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados de conversión */}
      {conversionTest.status && conversionTest.status !== 'Pendiente' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Prueba de Conversión PD→PC</h3>
          <div className={`p-4 rounded-lg border ${
            conversionTest.status === 'Exitoso' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm space-y-2">
              <p><strong>Estado:</strong> {conversionTest.status}</p>
              {conversionTest.result && (
                <>
                  {conversionTest.result.message && (
                    <p className="text-green-700 font-medium">{conversionTest.result.message}</p>
                  )}
                  {conversionTest.result.input && (
                    <p><strong>Entrada:</strong> PD={conversionTest.result.input.pd}, Aptitud={conversionTest.result.input.aptitud}, Edad={conversionTest.result.input.edad}</p>
                  )}
                  {conversionTest.result.output && (
                    <p><strong>Resultado:</strong> PC={conversionTest.result.output.percentil}</p>
                  )}
                  {conversionTest.result.error && (
                    <p className="text-red-600"><strong>Error:</strong> {conversionTest.result.error}</p>
                  )}
                  {conversionTest.result.validationErrors && (
                    <div className="text-red-600">
                      <strong>Errores de validación:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {conversionTest.result.validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tables.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar tabla:
          </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3"
            disabled={loading}
          >
            <option value="">Seleccione una tabla</option>
            {tables.map((table) => (
              <option key={table.name} value={table.name}>
                {table.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {tableData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Datos de {selectedTable}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(tableData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
