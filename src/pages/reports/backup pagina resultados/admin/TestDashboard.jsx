import React from 'react';
import { FaUsers, FaChartLine, FaUserPlus, FaClipboardCheck } from 'react-icons/fa';

const TestDashboard = () => {
  console.log('TestDashboard: Componente renderizado correctamente');
  
  return (
    <div className="space-y-6">
      {/* Título del Dashboard */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Administración</h2>
        <p className="text-gray-600">Resumen general del sistema BAT-7</p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Totales</p>
              <p className="text-3xl font-bold text-gray-900">20</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
                <FaUsers className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium px-2 py-1 rounded text-green-700 bg-green-100">
              +12%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs ayer</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Acciones Hoy</p>
              <p className="text-3xl font-bold text-gray-900">6</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500">
                <FaChartLine className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium px-2 py-1 rounded text-green-700 bg-green-100">
              +12%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs ayer</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Nuevos (7 días)</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
                <FaUserPlus className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium px-2 py-1 rounded text-red-700 bg-red-100">
              -33%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs sem. anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Tests Completados</p>
              <p className="text-3xl font-bold text-gray-900">30</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-amber-500">
                <FaClipboardCheck className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium px-2 py-1 rounded text-green-700 bg-green-100">
              +5%
            </span>
            <span className="text-sm text-gray-500 ml-2">este mes</span>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-green-800">
          <h3 className="text-lg font-medium">¡Dashboard funcionando correctamente!</h3>
          <p className="mt-2">Los paneles de administración están cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
