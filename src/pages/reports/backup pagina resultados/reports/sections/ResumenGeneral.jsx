import React from 'react';
import { Card, CardHeader, CardBody } from '../../ui/Card';

const ResumenGeneral = ({ estadisticas, resultados }) => {
  // Calcular estadísticas si no vienen del servicio
  const stats = estadisticas || {
    total_tests: resultados?.length || 0,
    percentil_promedio: resultados?.length > 0 ? 
      Math.round(resultados.reduce((sum, r) => sum + (r.percentil || 0), 0) / resultados.length) : 0,
    aptitudes_altas: resultados?.filter(r => (r.percentil || 0) >= 80).length || 0,
    aptitudes_bajas: resultados?.filter(r => (r.percentil || 0) <= 20).length || 0
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
            <i className="fas fa-chart-pie text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold">Resumen General</h3>
            <p className="text-blue-100 text-sm">Estadísticas generales de la evaluación</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {stats.total_tests || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tests Completados</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {stats.percentil_promedio || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Percentil Promedio</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats.aptitudes_altas || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Aptitudes Altas</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {stats.aptitudes_bajas || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">A Reforzar</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResumenGeneral;
