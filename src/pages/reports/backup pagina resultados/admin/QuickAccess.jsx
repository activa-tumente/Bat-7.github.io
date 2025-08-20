/**
 * @file QuickAccess.jsx
 * @description Componente de acceso rápido para administradores a las nuevas funcionalidades
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../ui/Card';

const QuickAccess = () => {
  const quickLinks = [
    {
      title: '🆕 Resultados + Informes',
      description: 'Nueva página de resultados con generación manual de informes',
      path: '/admin/results',
      icon: 'fas fa-file-medical-alt',
      color: 'blue',
      isNew: true
    },
    {
      title: 'Resultados Tradicionales',
      description: 'Página de resultados original del sistema',
      path: '/admin/reports',
      icon: 'fas fa-chart-line',
      color: 'green',
      isNew: false
    },
    {
      title: 'Resultados de Estudiantes',
      description: 'Acceso directo a la vista de estudiantes',
      path: '/student/results',
      icon: 'fas fa-graduation-cap',
      color: 'purple',
      isNew: false
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          <i className="fas fa-rocket mr-2 text-blue-600"></i>
          🚀 Acceso Rápido - Nuevas Funcionalidades
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Accede directamente a las páginas de resultados con las nuevas funcionalidades de informes
        </p>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`block p-4 border-2 border-${link.color}-200 bg-${link.color}-50 rounded-lg hover:border-${link.color}-300 hover:bg-${link.color}-100 transition-all duration-200 relative`}
            >
              {link.isNew && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  NUEVO
                </div>
              )}
              
              <div className="flex items-start">
                <div className={`w-12 h-12 bg-${link.color}-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  <i className={`${link.icon} text-${link.color}-600 text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-${link.color}-800 mb-2`}>
                    {link.title}
                  </h4>
                  <p className={`text-sm text-${link.color}-700`}>
                    {link.description}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-flex items-center text-xs font-medium text-${link.color}-600`}>
                      Ir a la página
                      <i className="fas fa-arrow-right ml-1"></i>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-yellow-600 text-lg mr-3 mt-1"></i>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">
                📋 Instrucciones para probar las nuevas funcionalidades:
              </h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li><strong>1.</strong> Haz clic en "🆕 Resultados + Informes" para acceder a la nueva página</li>
                <li><strong>2.</strong> Busca la sección "Informes Generados" debajo de cada estudiante</li>
                <li><strong>3.</strong> Usa el botón "Generar Informe" para crear informes manuales</li>
                <li><strong>4.</strong> Prueba el "🧪 Componente de Prueba" al final de la página</li>
                <li><strong>5.</strong> Visualiza los informes generados con el botón "👁️ Ver"</li>
              </ol>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickAccess;
