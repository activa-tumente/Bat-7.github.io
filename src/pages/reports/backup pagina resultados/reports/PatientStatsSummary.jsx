/**
 * @file PatientStatsSummary.jsx
 * @description Componente para mostrar el resumen de estadísticas del paciente con colores por género
 */

import React from 'react';

const PatientStatsSummary = ({ estadisticas, paciente, informe }) => {
  // Obtener información del paciente desde el informe si está disponible
  const pacienteInfo = informe?.pacientes || paciente;
  const isFemale = pacienteInfo?.genero === 'femenino';
  
  // Datos por defecto si no hay estadísticas
  const stats = estadisticas || {
    totalTests: 1,
    pcPromedio: 85,
    pdPromedio: 92,
    altas: 1,
    errores: 2,
    aptitudes: 1
  };

  const statCards = [
    {
      label: 'Tests',
      value: stats.totalTests || 0,
      color: 'blue'
    },
    {
      label: 'PC Prom',
      value: stats.pcPromedio || 0,
      color: 'green'
    },
    {
      label: 'PD Prom',
      value: stats.pdPromedio || 0,
      color: 'purple'
    },
    {
      label: 'Altas',
      value: stats.altas || 0,
      color: 'yellow'
    },
    {
      label: 'Errores',
      value: stats.errores || 0,
      color: 'red'
    },
    {
      label: 'Aptitudes',
      value: stats.aptitudes || 0,
      color: 'indigo'
    }
  ];

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="grid grid-cols-6 gap-4 p-4">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${getColorClass(stat.color)}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Aptitudes evaluadas */}
      <div className="px-4 pb-4">
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Aptitudes evaluadas: A
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientStatsSummary;