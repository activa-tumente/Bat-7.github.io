/**
 * Componente para mostrar estadísticas de usuarios
 */

import React from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserShield, FaUserMd, FaGraduationCap } from 'react-icons/fa';

const UserStatistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      name: 'Total de Usuarios',
      value: statistics.total || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Usuarios Activos',
      value: statistics.active || 0,
      icon: FaUserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Usuarios Inactivos',
      value: statistics.inactive || 0,
      icon: FaUserTimes,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'Administradores',
      value: statistics.byType?.Administrador || 0,
      icon: FaUserShield,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const typeStats = [
    {
      name: 'Psicólogos',
      value: statistics.byType?.Psicólogo || 0,
      icon: FaUserMd,
      color: 'bg-amber-500',
      percentage: statistics.total > 0 ? Math.round(((statistics.byType?.Psicólogo || 0) / statistics.total) * 100) : 0
    },
    {
      name: 'Candidatos',
      value: statistics.byType?.Candidato || 0,
      icon: FaGraduationCap,
      color: 'bg-indigo-500',
      percentage: statistics.total > 0 ? Math.round(((statistics.byType?.Candidato || 0) / statistics.total) * 100) : 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} p-2 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className={`text-lg font-medium ${stat.textColor}`}>
                        {stat.value.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribución por tipo de usuario */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distribución por Tipo de Usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {typeStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`${stat.color} p-2 rounded-md mr-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stat.name}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {stat.percentage}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">Tasa de Actividad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(statistics.byType || {}).length}
              </div>
              <div className="text-sm text-gray-500">Tipos de Usuario</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.byType?.Psicólogo && statistics.byType?.Candidato 
                  ? Math.round(statistics.byType.Candidato / statistics.byType.Psicólogo) 
                  : 0}
              </div>
              <div className="text-sm text-gray-500">Candidatos por Psicólogo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
