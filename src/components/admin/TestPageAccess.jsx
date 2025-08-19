import React from 'react';
import { FaShieldAlt, FaLock, FaUnlock, FaRoute } from 'react-icons/fa';

const TestPageAccess = () => {
  console.log('TestPageAccess: Componente renderizado correctamente');
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Control de Acceso</h2>
        <p className="text-gray-600">Gestiona permisos de acceso a páginas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
              <FaRoute className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rutas</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500">
              <FaUnlock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rutas Públicas</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-red-500">
              <FaLock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rutas Protegidas</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de rutas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuración de Rutas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol Requerido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permiso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaRoute className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">/admin/dashboard</div>
                      <div className="text-sm text-gray-500">Panel de administración</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Administrador
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaRoute className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">/cuestionario</div>
                      <div className="text-sm text-gray-500">Evaluación psicológica</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Candidato
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Lectura
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaRoute className="text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">/resultados</div>
                      <div className="text-sm text-gray-500">Resultados de evaluaciones</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Psicólogo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Escritura
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-green-800">
          <h3 className="text-lg font-medium">¡Panel de Control de Acceso funcionando!</h3>
          <p className="mt-2">El módulo de control de acceso está cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default TestPageAccess;
