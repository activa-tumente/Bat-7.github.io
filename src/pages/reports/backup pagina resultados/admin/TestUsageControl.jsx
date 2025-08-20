import React from 'react';
import { FaChartBar, FaClock, FaCalendarAlt, FaEye } from 'react-icons/fa';

const TestUsageControl = () => {
  console.log('TestUsageControl: Componente renderizado correctamente');
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Control de Usos</h2>
        <p className="text-gray-600">Monitorea el uso del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
              <FaEye className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sesiones Totales</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500">
              <FaClock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">25m</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-amber-500">
              <FaChartBar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests Completados</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-purple-500">
              <FaCalendarAlt className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de uso */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso del Sistema (Últimos 7 días)</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[45, 52, 38, 67, 73, 56, 61].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                style={{ height: `${(value / 80) * 100}%`, minHeight: '20px' }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}
              </span>
              <span className="text-xs text-gray-400">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registro de actividad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registro de Actividad Reciente</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      JP
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Juan Pérez</div>
                      <div className="text-sm text-gray-500">Candidato</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Test MACI-II Completado
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  32 minutos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15/07/2025 11:30 AM
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      MG
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">María García</div>
                      <div className="text-sm text-gray-500">Candidato</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Sesión Iniciada
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  En progreso
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15/07/2025 11:45 AM
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                      DR
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Dr. Rodriguez</div>
                      <div className="text-sm text-gray-500">Psicólogo</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    Revisión de Resultados
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15 minutos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15/07/2025 10:15 AM
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-green-800">
          <h3 className="text-lg font-medium">¡Panel de Control de Usos funcionando!</h3>
          <p className="mt-2">El módulo de control de usos está cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default TestUsageControl;
