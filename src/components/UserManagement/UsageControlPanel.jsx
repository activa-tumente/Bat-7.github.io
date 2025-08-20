/**
 * Panel de control de uso del sistema
 */

import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaClock, FaEye, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import { useUsageControl } from '../../hooks/useUsageControl';
import DataTable from '../ui/DataTable';

const UsageControlPanel = () => {
  const {
    usageStatistics,
    activityLogs,
    sessionLogs,
    systemSummary,
    loading,
    error,
    fetchUsageStatistics,
    fetchActivityLogs,
    fetchSessionLogs,
    fetchSystemSummary,
    dashboardStats,
    chartData,
    exportUsageData
  } = useUsageControl();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días atrás
    endDate: new Date().toISOString().split('T')[0] // Hoy
  });

  // Cargar datos cuando cambia el rango de fechas
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchUsageStatistics(new Date(dateRange.startDate), new Date(dateRange.endDate));
      fetchActivityLogs({
        startDate: new Date(dateRange.startDate),
        endDate: new Date(dateRange.endDate),
        page: 1,
        pageSize: 50
      });
      fetchSessionLogs({
        startDate: new Date(dateRange.startDate),
        endDate: new Date(dateRange.endDate),
        page: 1,
        pageSize: 50
      });
    }
  }, [dateRange, fetchUsageStatistics, fetchActivityLogs, fetchSessionLogs]);

  // Configuración de columnas para logs de actividad
  const activityColumns = [
    {
      key: 'created_at',
      label: 'Fecha/Hora',
      render: (log) => new Date(log.created_at).toLocaleString()
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (log) => log.usuario ? 
        `${log.usuario.nombre} ${log.usuario.apellido}` : 
        'Usuario desconocido'
    },
    {
      key: 'action',
      label: 'Acción',
      render: (log) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {log.action}
        </span>
      )
    },
    {
      key: 'resource',
      label: 'Recurso',
      render: (log) => log.resource || 'General'
    },
    {
      key: 'success',
      label: 'Estado',
      render: (log) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          log.success 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {log.success ? 'Éxito' : 'Error'}
        </span>
      )
    }
  ];

  // Configuración de columnas para logs de sesión
  const sessionColumns = [
    {
      key: 'login_time',
      label: 'Inicio Sesión',
      render: (session) => new Date(session.login_time).toLocaleString()
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (session) => session.usuario ? 
        `${session.usuario.nombre} ${session.usuario.apellido}` : 
        'Usuario desconocido'
    },
    {
      key: 'duration_seconds',
      label: 'Duración',
      render: (session) => {
        if (!session.duration_seconds) return 'En curso';
        const minutes = Math.floor(session.duration_seconds / 60);
        const seconds = session.duration_seconds % 60;
        return `${minutes}m ${seconds}s`;
      }
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (session) => session.ip_address || 'No disponible'
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (session) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          session.is_active 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {session.is_active ? 'Activa' : 'Cerrada'}
        </span>
      )
    }
  ];

  const handleExportData = () => {
    const dataToExport = activeTab === 'activity' ? activityLogs : sessionLogs;
    const filename = `${activeTab}_logs_${dateRange.startDate}_${dateRange.endDate}.csv`;
    exportUsageData(dataToExport, filename);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos Hoy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardStats.activeUsersToday}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUsers className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Usuarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardStats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaChartBar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Evaluaciones Hoy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardStats.evaluationsToday}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaClock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Estado Sistema
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      Operativo
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {dashboardStats.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaEye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.usuario?.nombre} {activity.usuario?.apellido}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.action} - {activity.resource}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Control de Uso del Sistema</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitorea la actividad y uso del sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleExportData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaDownload className="mr-2 h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Selector de rango de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
            >
              <FaChartBar className="mr-2 h-4 w-4" />
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`${
                activeTab === 'activity'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
            >
              <FaEye className="mr-2 h-4 w-4" />
              Actividad
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`${
                activeTab === 'sessions'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
            >
              <FaClock className="mr-2 h-4 w-4" />
              Sesiones
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'overview' && renderOverview()}

      {activeTab === 'activity' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Logs de Actividad</h3>
          <DataTable
            columns={activityColumns}
            data={activityLogs}
            loading={loading}
            emptyMessage="No hay logs de actividad en el rango seleccionado"
          />
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Logs de Sesiones</h3>
          <DataTable
            columns={sessionColumns}
            data={sessionLogs}
            loading={loading}
            emptyMessage="No hay logs de sesiones en el rango seleccionado"
          />
        </div>
      )}
    </div>
  );
};

export default UsageControlPanel;
