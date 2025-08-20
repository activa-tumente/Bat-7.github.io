import React from 'react';
import { Button } from '../../ui/Button';

const InformeHeader = ({ informe, onClose, onGeneratePDF, isGeneratingPDF }) => {
  return (
    <div className="bg-[#121940] text-white p-6 flex items-center justify-between">
      <div className="flex items-center">
        <i className="fas fa-file-medical-alt text-2xl mr-3"></i>
        <div>
          <h2 className="text-xl font-bold">Informe Psicométrico BAT-7</h2>
          <p className="text-blue-100 text-sm">
            {informe?.paciente?.nombre} {informe?.paciente?.apellido} - {informe?.paciente?.documento}
          </p>
          <p className="text-blue-200 text-xs">
            Generado: {informe?.fechaGeneracion ? new Date(informe.fechaGeneracion).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onGeneratePDF}
          disabled={isGeneratingPDF}
          className="bg-green-600 text-white hover:bg-green-700 border border-green-500 px-4 py-2"
        >
          {isGeneratingPDF ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Generando...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf mr-2"></i>
              Descargar PDF
            </>
          )}
        </Button>
        <Button 
          onClick={onClose}
          className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30"
        >
          <i className="fas fa-times"></i>
        </Button>
      </div>
    </div>
  );
};

export default InformeHeader;
