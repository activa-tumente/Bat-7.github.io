import React, { useState, useEffect } from 'react';
import { FaUsers, FaChartLine, FaUserPlus, FaClipboardCheck, FaLock } from 'react-icons/fa';

// Componente para las tarjetas de estadísticas principales
const StatCard = ({ title, value, icon: Icon, color, percentage, trend, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
      {percentage && (
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}
          >
            {trend === 'up' ? '+' : ''}{percentage}%
          </span>
          <span className="text-sm text-gray-500 ml-2">{subtitle || 'vs sem. anterior'}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal del Dashboard
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 20,
    todayActions: 6,
    newUsers: 0,
    completedTests: 30
  });
  const [loading, setLoading] = useState(false);

  console.log('AdminDashboard: Renderizando componente');

  // Datos de estadísticas principales
  const mainStats = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: FaUsers,
      color: '#3B82F6', // blue-500
      percentage: 12,
      trend: 'up',
      subtitle: 'vs ayer'
    },
    {
      title: 'Acciones Hoy',
      value: stats.todayActions,
      icon: FaChartLine,
      color: '#10B981', // green-500
      percentage: 12,
      trend: 'up',
      subtitle: 'vs ayer'
    },
    {
      title: 'Nuevos (7 días)',
      value: stats.newUsers,
      icon: FaUserPlus,
      color: '#3B82F6', // blue-500
      percentage: -33,
      trend: 'down',
      subtitle: 'vs sem. anterior'
    },
    {
      title: 'Tests Completados',
      value: stats.completedTests,
      icon: FaClipboardCheck,
      color: '#F59E0B', // amber-500
      percentage: 5,
      trend: 'up',
      subtitle: 'este mes'
    }
  ];

  // Datos de actividad reciente
  const recentActivities = [
    {
      id: 1,
      type: 'Nuevo usuario registrado',
      user: 'admin@maci.com',
      time: 'Hace 15m',
      icon: FaUserPlus,
      color: '#10B981'
    },
    {
      id: 2,
      type: 'Test MACI-II completado',
      user: 'paciente@test.com',
      time: 'Hace 1h',
      icon: FaClipboardCheck,
      color: '#F59E0B'
    },
    {
      id: 3,
      type: 'Rol de usuario actualizado',
      user: 'admin@maci.com',
      time: 'Hace 2h',
      icon: FaLock,
      color: '#6366F1'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título del Dashboard */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Administración</h2>
        <p className="text-gray-600">Resumen general del sistema BAT-7</p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            percentage={stat.percentage}
            trend={stat.trend}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Gráfico de actividad simplificado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad de Usuarios (Últimos 7 días)</h3>
          <div className="h-48 flex items-end justify-between space-x-2">
            {[12, 8, 15, 10, 6, 14, 9].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                  style={{ height: `${(value / 15) * 100}%`, minHeight: '20px' }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: activity.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.user}</p>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
