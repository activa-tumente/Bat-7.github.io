import React from 'react';
import { FaUserMd, FaUser, FaLink, FaUnlink } from 'react-icons/fa';

const TestPatientAssignment = () => {
  console.log('TestPatientAssignment: Componente renderizado correctamente');
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Asignación de Pacientes</h2>
        <p className="text-gray-600">Asigna pacientes a psicólogos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
              <FaUserMd className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Psicólogos</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500">
              <FaUser className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-amber-500">
              <FaLink className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asignados</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-red-500">
              <FaUnlink className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sin Asignar</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asignaciones actuales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asignaciones Actuales</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Asignación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      DR
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Dr. Rodriguez</div>
                      <div className="text-sm text-gray-500">Psicólogo Clínico</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      JP
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Juan Pérez</div>
                      <div className="text-sm text-gray-500">Candidato</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15/07/2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    <FaUnlink className="mr-1" />
                    Desasignar
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                      DM
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Dra. Martínez</div>
                      <div className="text-sm text-gray-500">Psicóloga Educativa</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-medium">
                      MG
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">María García</div>
                      <div className="text-sm text-gray-500">Candidato</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  14/07/2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    <FaUnlink className="mr-1" />
                    Desasignar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-green-800">
          <h3 className="text-lg font-medium">¡Panel de Asignación de Pacientes funcionando!</h3>
          <p className="mt-2">El módulo de asignación de pacientes está cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default TestPatientAssignment;
