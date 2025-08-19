import React, { useState } from 'react';
import { FaDatabase, FaExclamationTriangle, FaCheckCircle, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Componente que muestra instrucciones para configurar la base de datos
 * Se muestra cuando hay errores de conexión a la BD
 */
const DatabaseSetupGuide = ({ onRetry }) => {
  const [copiedStep, setCopiedStep] = useState(null);

  const copyToClipboard = (text, step) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-8 w-8 mr-4" />
              <div>
                <h1 className="text-2xl font-bold">Base de Datos No Configurada</h1>
                <p className="text-red-100 mt-1">
                  Las tablas de la base de datos no existen. Sigue estos pasos para configurarlas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Información del proyecto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <FaDatabase className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Información del Proyecto</h3>
              </div>
              <div className="text-sm text-blue-700">
                <p><strong>URL de Supabase:</strong> {supabaseUrl}</p>
                <p><strong>ID del Proyecto:</strong> {projectId}</p>
              </div>
            </div>

            {/* Pasos de configuración */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📋 Pasos para Configurar la Base de Datos
              </h2>

              {/* Paso 1 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Abrir Supabase Dashboard
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Ve al editor SQL de tu proyecto en Supabase para ejecutar el esquema de la base de datos.
                    </p>
                    <a
                      href={`https://app.supabase.com/project/${projectId}/sql`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                    >
                      <FaExternalLinkAlt className="h-4 w-4 mr-2" />
                      Abrir SQL Editor
                    </a>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Ejecutar Esquema de Base de Datos
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Copia y ejecuta el siguiente comando SQL para crear todas las tablas y funciones necesarias:
                    </p>
                    
                    <div className="bg-gray-100 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Comando SQL:</span>
                        <button
                          onClick={() => copyToClipboard(schemaSQL, 'schema')}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FaCopy className="h-4 w-4 mr-1" />
                          {copiedStep === 'schema' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                        {schemaSQL}
                      </pre>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>💡 Tip:</strong> El esquema completo está en el archivo <code>database/schema.sql</code> del proyecto.
                        Puedes copiarlo desde ahí si prefieres.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Agregar Datos de Ejemplo (Opcional)
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Para tener datos de prueba, ejecuta también el archivo de datos de ejemplo:
                    </p>
                    
                    <div className="bg-gray-100 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Datos de ejemplo:</span>
                        <button
                          onClick={() => copyToClipboard('-- Ver archivo database/seed_data.sql para datos completos', 'seed')}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <FaCopy className="h-4 w-4 mr-1" />
                          {copiedStep === 'seed' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Los datos de ejemplo incluyen usuarios de prueba, cuestionarios y respuestas.
                        Consulta el archivo <code>database/seed_data.sql</code> para el SQL completo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Verificar Configuración
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Una vez ejecutado el SQL, haz clic en el botón de abajo para verificar que todo funciona correctamente.
                    </p>
                    
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
                    >
                      <FaCheckCircle className="h-5 w-5 mr-2" />
                      Verificar Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📚 Información Adicional</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• El esquema incluye todas las tablas necesarias para el sistema BAT-7</li>
                <li>• Se configuran políticas de seguridad (RLS) automáticamente</li>
                <li>• Los datos de ejemplo incluyen usuarios de prueba para cada rol</li>
                <li>• Puedes encontrar documentación completa en <code>database/README.md</code></li>
              </ul>
            </div>

            {/* Usuarios de ejemplo */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">👥 Usuarios de Ejemplo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-800">Administrador</p>
                  <p className="text-blue-600">admin@bat7.com</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Psicólogo</p>
                  <p className="text-blue-600">psicologo1@bat7.com</p>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Candidato</p>
                  <p className="text-blue-600">candidato1@email.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SQL simplificado para mostrar en la interfaz
const schemaSQL = `-- Esquema básico BAT-7 (versión simplificada)
-- Para el esquema completo, consulta database/schema.sql

-- Crear tipos ENUM
CREATE TYPE user_type AS ENUM ('administrador', 'psicologo', 'candidato');

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    tipo_usuario user_type NOT NULL DEFAULT 'candidato',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'total_candidatos', COALESCE((SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'candidato'), 0),
        'total_psicologos', COALESCE((SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'psicologo'), 0),
        'total_cuestionarios', 0,
        'total_respuestas', 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecuta el archivo database/schema.sql completo para todas las funcionalidades`;

export default DatabaseSetupGuide;
