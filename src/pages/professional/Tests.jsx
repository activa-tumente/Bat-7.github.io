import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

const Tests = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Tests</h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Asignación y Administración de Tests</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">
            Esta sección permitirá asignar y gestionar tests para estudiantes (componente en desarrollo).
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Tests;