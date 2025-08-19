import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import PatientResultsTable from './PatientResultsTable';
import PatientStatsSummary from './PatientStatsSummary';

const PatientReportCard = ({
  informe,
  isExpanded,
  onToggleExpansion,
  onViewReport,
  onGenerateReport,
  onDeleteReport
}) => {
  const { pacientes: paciente, estadisticas, resultados } = informe;
  const isFemale = paciente?.genero === 'femenino';
  const datosReales = informe.metadatos?.datos_reales === 'true';

  const handleHeaderClick = () => {
    onToggleExpansion(paciente?.id);
  };

  return (
    <Card className={`overflow-hidden shadow-lg border-2 ${
      datosReales ? 'border-green-200' : 'border-gray-200'
    }`}>
      <CardHeader
        className={`cursor-pointer transition-colors ${
          isFemale
            ? 'bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500'
            : 'bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500'
        }`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center flex-1">
            <button className={`mr-3 transition-colors ${
              isFemale 
                ? 'text-pink-900 hover:text-pink-800' 
                : 'text-blue-900 hover:text-blue-800'
            }`}>
              <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-lg`}></i>
            </button>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              isFemale
                ? 'bg-pink-500 border-2 border-pink-300'
                : 'bg-blue-500 border-2 border-blue-300'
            }`}>
              <i className={`fas ${isFemale ? 'fa-venus text-white' : 'fa-mars text-white'} text-xl`}></i>
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-bold ${
                isFemale ? 'text-pink-900' : 'text-blue-900'
              }`}>
                {paciente?.nombre} {paciente?.apellido}
              </h3>
              <p className={`text-sm font-medium ${
                isFemale ? 'text-pink-800' : 'text-blue-800'
              }`}>
                Doc: {paciente?.documento} • {estadisticas?.totalTests || 0} tests completados
                {!isExpanded && (
                  <span className={`ml-2 text-xs ${
                    isFemale ? 'text-pink-700' : 'text-blue-700'
                  }`}>
                    • Haz clic para expandir
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateReport(paciente?.id, `${paciente?.nombre} ${paciente?.apellido}`);
              }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              size="sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Generar
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewReport(informe.id);
              }}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              size="sm"
            >
              <i className="fas fa-eye mr-2"></i>
              Ver
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReport(informe.id, `${paciente?.nombre} ${paciente?.apellido}`);
              }}
              className="bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              size="sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Eliminar
            </Button>

            <span className={`text-xs font-bold ${
              isFemale ? 'text-pink-900' : 'text-blue-900'
            } ml-3 bg-white bg-opacity-20 px-2 py-1 rounded-full`}>
              <i className={`fas fa-calendar-alt mr-1 ${
                isFemale ? 'text-pink-800' : 'text-blue-800'
              }`}></i>
              {new Date(informe.fecha_generacion).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </CardHeader>

      <PatientStatsSummary estadisticas={estadisticas} paciente={paciente} informe={informe} />

      {isExpanded && (
        <CardBody className="bg-gray-50">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Resultados Detallados por Test
            </h4>
            <PatientResultsTable resultados={resultados} />
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default PatientReportCard;