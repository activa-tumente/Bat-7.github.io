import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import InformeViewer from './InformeViewer';

const InformeViewerTest = () => {
  const [mostrarInforme, setMostrarInforme] = useState(false);

  // Datos de prueba
  const informeIdPrueba = '7700b3e8-8ff5-402c-a0f6-20f454cd5f4f';

  const abrirInforme = () => {
    setMostrarInforme(true);
  };

  const cerrarInforme = () => {
    setMostrarInforme(false);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-vial text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-800">Prueba de InformeViewer</h2>
            <p className="text-purple-600 text-sm">Componente de prueba para verificar funcionalidad</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-center py-8">
          <i className="fas fa-flask text-purple-500 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Probar InformeViewer</h3>
          <p className="text-gray-600 mb-6">
            Haz clic en el botón para abrir el InformeViewer con datos de prueba
          </p>
          <Button
            onClick={abrirInforme}
            className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-3"
          >
            <i className="fas fa-eye mr-2"></i>
            Abrir Informe de Prueba
          </Button>
        </div>
      </CardBody>

      {/* Modal del InformeViewer */}
      {mostrarInforme && (
        <InformeViewer
          informeId={informeIdPrueba}
          onClose={cerrarInforme}
        />
      )}
    </Card>
  );
};

export default InformeViewerTest;
