import { useState } from 'react';
import { FaDatabase, FaUsers, FaCog, FaPlay, FaDownload, FaCode } from 'react-icons/fa';
import SupabaseStatus from '../../components/debug/SupabaseStatus';
import { useAuth } from '../../context/AuthContext';

/**
 * Página de diagnósticos del sistema
 * Solo accesible para administradores
 */
const Diagnostics = () => {
  const { user, isAdmin } = useAuth();
  const [showDetails, setShowDetails] = useState(true);
  const [logs, setLogs] = useState([]);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
      </div>
    );
  }

  const runScript = async (scriptName) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] Ejecutando ${scriptName}...`]);

    try {
      switch (scriptName) {
        case 'checkDatabase':
          // Importar y ejecutar el script de verificación de BD
          const { runCompleteCheck } = await import('../../scripts/checkCurrentDatabase.js');
          await runCompleteCheck();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Verificación de BD completada`]);
          break;

        case 'createUsers':
          // Importar y ejecutar el script de creación de usuarios
          const { createTestUsers } = await import('../../scripts/createTestUsers.js');
          await createTestUsers();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Script ${scriptName} completado`]);
          break;

        case 'verifyConnection':
          // Importar y ejecutar el script de verificación
          const { runFullDiagnostic } = await import('../../scripts/verifySupabaseConnection.js');
          await runFullDiagnostic();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Verificación completada`]);
          break;

        case 'executeSchema':
          // Importar y ejecutar el script del esquema
          const { runSchemaSetup } = await import('../../scripts/executeSchema.js');
          const result = await runSchemaSetup();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Esquema ejecutado: ${result.automaticSteps}/${result.totalSteps} pasos automáticos`]);
          if (result.manualSteps > 0) {
            setLogs(prev => [...prev, `[${timestamp}] ⚠️ ${result.manualSteps} pasos requieren ejecución manual`]);
          }
          break;

        case 'finalVerification':
          // Importar y ejecutar la verificación final
          const { runFullVerification } = await import('../../scripts/finalVerification.js');
          const verificationResult = await runFullVerification();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Verificación completada: ${verificationResult.successful}/${verificationResult.total} tests exitosos`]);
          if (!verificationResult.allPassed) {
            setLogs(prev => [...prev, `[${timestamp}] ⚠️ ${verificationResult.failed} tests fallaron - revisar consola`]);
          }
          break;

        case 'step1':
          const { executeStep1 } = await import('../../scripts/step1_executeSchema.js');
          const step1Result = await executeStep1();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Paso 1 ejecutado - revisar consola para instrucciones SQL`]);
          break;

        case 'step2':
          const { executeStep2 } = await import('../../scripts/step2_createTestUsers.js');
          const step2Result = await executeStep2();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Paso 2: ${step2Result.successful}/${step2Result.total} usuarios creados`]);
          break;

        case 'step3':
          const { executeStep3 } = await import('../../scripts/step3_testArchitecture.js');
          const step3Result = await executeStep3();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Paso 3: ${step3Result.successful}/${step3Result.total} tests pasaron`]);
          break;

        case 'step4':
          const { executeStep4 } = await import('../../scripts/step4_cleanup.js');
          const step4Result = await executeStep4();
          setLogs(prev => [...prev, `[${timestamp}] ✅ Paso 4: Plan de limpieza generado - revisar consola`]);
          break;

        default:
          setLogs(prev => [...prev, `[${timestamp}] ❌ Script no encontrado: ${scriptName}`]);
      }
    } catch (error) {
      setLogs(prev => [...prev, `[${timestamp}] ❌ Error en ${scriptName}: ${error.message}`]);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bat7-diagnostics-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scripts = [
    // PASOS DE IMPLEMENTACIÓN
    {
      id: 'step1',
      name: '🗄️ PASO 1: Ejecutar Esquema SQL',
      description: 'Ejecuta el esquema robusto en Supabase (requiere ejecución manual)',
      icon: FaDatabase,
      color: 'bg-blue-600'
    },
    {
      id: 'step2',
      name: '👥 PASO 2: Crear Usuarios de Prueba',
      description: 'Crea usuarios de prueba para admin, psicólogo y candidato',
      icon: FaUsers,
      color: 'bg-green-600'
    },
    {
      id: 'step3',
      name: '🧪 PASO 3: Probar Nueva Arquitectura',
      description: 'Ejecuta tests automatizados para verificar funcionalidades',
      icon: FaCog,
      color: 'bg-purple-600'
    },
    {
      id: 'step4',
      name: '🧹 PASO 4: Limpieza de Archivos',
      description: 'Genera plan para limpiar archivos antiguos del proyecto',
      icon: FaCog,
      color: 'bg-amber-600'
    },

    // HERRAMIENTAS ADICIONALES
    {
      id: 'executeSchema',
      name: 'Ejecutar Esquema Robusto (Legacy)',
      description: 'Versión anterior del ejecutor de esquema',
      icon: FaDatabase,
      color: 'bg-gray-500'
    },
    {
      id: 'checkDatabase',
      name: 'Verificar Base de Datos',
      description: 'Verifica la estructura actual de la base de datos y tablas existentes',
      icon: FaDatabase,
      color: 'bg-purple-500'
    },
    {
      id: 'createUsers',
      name: 'Crear Usuarios de Prueba (Legacy)',
      description: 'Versión anterior del creador de usuarios',
      icon: FaUsers,
      color: 'bg-gray-500'
    },
    {
      id: 'verifyConnection',
      name: 'Verificar Conexión Supabase',
      description: 'Ejecuta un diagnóstico completo de la conexión con Supabase',
      icon: FaDatabase,
      color: 'bg-green-500'
    },
    {
      id: 'finalVerification',
      name: 'Verificación Final del Sistema',
      description: 'Ejecuta todos los tests para verificar que el sistema funciona correctamente',
      icon: FaCog,
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnósticos del Sistema</h1>
        <p className="text-gray-600">
          Panel de control para verificar el estado del sistema y ejecutar scripts de mantenimiento
        </p>
      </div>

      {/* Estado de Supabase */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Estado de Supabase</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Mostrar detalles</span>
          </label>
        </div>
        <SupabaseStatus showDetails={showDetails} />
      </div>

      {/* Scripts de Mantenimiento */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Scripts de Mantenimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((script) => {
            const IconComponent = script.icon;
            return (
              <div key={script.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start">
                  <div className={`p-2 rounded ${script.color} text-white mr-3`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{script.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{script.description}</p>
                    <button
                      onClick={() => runScript(script.id)}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      <FaPlay className="w-3 h-3 mr-1" />
                      Ejecutar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuración del Sistema */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Sistema</h2>
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Variables de Entorno</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Proyecto ID:</span>
                  <span className="font-mono text-xs">ydglduxhgwajqdseqzpy</span>
                </div>
                <div className="flex justify-between">
                  <span>VITE_SUPABASE_URL:</span>
                  <span className="text-green-600">
                    {import.meta.env.VITE_SUPABASE_URL ? '✓ Configurada' : '✗ No configurada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VITE_SUPABASE_ANON_KEY:</span>
                  <span className="text-green-600">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ No configurada'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Usuario Actual</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{user?.email || 'No disponible'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rol:</span>
                  <span className="capitalize">{user?.rol || 'No disponible'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre:</span>
                  <span>{user?.nombre} {user?.apellido}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consola de Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Consola de Logs</h2>
          <div className="space-x-2">
            <button
              onClick={downloadLogs}
              disabled={logs.length === 0}
              className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload className="w-3 h-3 mr-1" />
              Descargar
            </button>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCog className="w-3 h-3 mr-1" />
              Limpiar
            </button>
          </div>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No hay logs disponibles. Ejecuta un script para ver los resultados aquí.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FaCode className="text-blue-600 mt-1 mr-2" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Información para Desarrolladores</h3>
            <p className="text-sm text-blue-800 mb-2">
              Esta página proporciona herramientas de diagnóstico para verificar el estado del sistema.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verifica la conexión con Supabase y el estado de las tablas</li>
              <li>• Ejecuta scripts de mantenimiento y configuración</li>
              <li>• Monitorea logs del sistema en tiempo real</li>
              <li>• Solo accesible para usuarios con rol de administrador</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
