import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

const Reports = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes de Estudiantes</h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Panel de Reportes</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">
            Esta sección permitirá visualizar reportes y estadísticas de los estudiantes asignados (componente en desarrollo).
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;