import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

const Students = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Estudiantes</h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Lista de Estudiantes</h2>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">
            Esta sección permitirá gestionar los estudiantes asignados al profesional (componente en desarrollo).
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Students;