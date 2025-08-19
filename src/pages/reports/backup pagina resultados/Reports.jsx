import React, { Suspense } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { FaChartBar } from 'react-icons/fa';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Importaciones directas para evitar problemas de lazy loading
import VerificarPacientesNuevos from '../../components/admin/VerificarPacientesNuevos';
import InformesFaltantesGenerados from '../../components/faltantes/InformesFaltantesGenerados';

// Extract executive summary to separate component for better maintainability
const ExecutiveSummary = () => {
  const summaryData = [
    { value: 6, label: 'Pacientes Evaluados', color: 'blue' },
    { value: 24, label: 'Tests Completados', color: 'green' },
    { value: 9, label: 'Aptitudes Altas', color: 'yellow' },
    { value: 1, label: 'A Reforzar', color: 'orange' },
    { value: 67, label: 'PC Promedio Global', color: 'purple' }
  ];

  return (
    <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-indigo-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-chart-pie text-white text-xl" aria-hidden="true"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-800">
              📊 Resumen Ejecutivo - Sistema BAT-7
            </h2>
            <p className="text-sm text-indigo-600 mt-1">
              Vista general de todos los pacientes con evaluaciones completadas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {summaryData.map((item, index) => (
            <div 
              key={index}
              className={`bg-${item.color}-50 p-6 rounded-lg border border-${item.color}-200 text-center`}
            >
              <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>
                {item.value}
              </div>
              <div className={`text-sm text-${item.color}-700 font-medium`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const Reports = () => {
  return (
    <div>
      <PageHeader
        title="Informes y Reportes"
        subtitle="Gestión completa de informes psicométricos"
        icon={FaChartBar}
      />

      <div className="container mx-auto px-4 py-8">
        <ExecutiveSummary />

        {/* Componente para verificar 14 pacientes nuevos */}
        <ErrorBoundary fallbackMessage="Error cargando verificación de pacientes.">
          <VerificarPacientesNuevos />
        </ErrorBoundary>

        {/* Módulo de Informes Generados */}
        <ErrorBoundary fallbackMessage="Error cargando los informes generados. Por favor, intenta nuevamente.">
          <InformesFaltantesGenerados />
        </ErrorBoundary>


      </div>
    </div>
  );
};

export default Reports;
