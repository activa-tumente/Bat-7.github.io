import React, { useState } from 'react';
import { FaFileAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import withPinControl from '../../hoc/withPinControl';
import InformesService from '../../services/InformesService';
import { usePinControl } from '../../hooks/usePinControl';

/**
 * Componente para generar informes con control automático de pines
 * Este es un ejemplo de cómo usar el HOC withPinControl
 */
const ReportGenerator = ({ 
  pacienteId, 
  psychologistId,
  pinStatus,
  refreshPinStatus,
  canUsePins,
  remainingPins,
  isUnlimitedPins 
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  
  const { consumePinOnReportGeneration } = usePinControl();

  const generateCompleteReport = async () => {
    if (!canUsePins) {
      toast.error('No tienes pines disponibles para generar informes');
      return;
    }

    try {
      setLoading(true);
      
      // Generar el informe
      const reportId = await InformesService.generarInformeCompleto(
        pacienteId,
        'Informe Completo BAT-7',
        'Informe completo de evaluación psicológica'
      );

      // El consumo de pin ya se maneja automáticamente en InformesService
      // pero podríamos usar el hook para validaciones adicionales
      
      setGeneratedReports(prev => [...prev, {
        id: reportId,
        type: 'completo',
        timestamp: new Date().toLocaleString()
      }]);

      // Refrescar el estado de pines
      refreshPinStatus();
      
      toast.success('Informe completo generado exitosamente');
    } catch (error) {
      console.error('Error generando informe:', error);
      toast.error('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const generateIndividualReport = async (resultadoId) => {
    if (!canUsePins) {
      toast.error('No tienes pines disponibles para generar informes');
      return;
    }

    try {
      setLoading(true);
      
      const reportId = await InformesService.generarInformeIndividual(
        resultadoId,
        'Informe Individual BAT-7',
        'Informe individual de evaluación psicológica'
      );

      setGeneratedReports(prev => [...prev, {
        id: reportId,
        type: 'individual',
        timestamp: new Date().toLocaleString()
      }]);

      refreshPinStatus();
      
      toast.success('Informe individual generado exitosamente');
    } catch (error) {
      console.error('Error generando informe individual:', error);
      toast.error('Error al generar el informe individual');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaFileAlt className="mr-2 text-blue-600" />
          Generador de Informes
        </h3>

        {/* Información del estado de pines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Estado:</span>
              <span className="ml-2 text-blue-900">
                {canUsePins ? 'Activo' : 'Sin acceso'}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Pines:</span>
              <span className="ml-2 text-blue-900">
                {isUnlimitedPins ? 'Ilimitados' : `${remainingPins || 0} restantes`}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Tipo:</span>
              <span className="ml-2 text-blue-900">
                {pinStatus?.plan_type || 'Sin plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de generación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={generateCompleteReport}
            disabled={loading || !canUsePins}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFileAlt />}
            <span>Generar Informe Completo</span>
          </button>

          <button
            onClick={() => generateIndividualReport('sample-result-id')}
            disabled={loading || !canUsePins}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFileAlt />}
            <span>Generar Informe Individual</span>
          </button>
        </div>

        {/* Advertencias */}
        {!canUsePins && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">
              <strong>Sin acceso:</strong> {pinStatus?.reason || 'No se puede generar informes'}
            </p>
          </div>
        )}

        {canUsePins && !isUnlimitedPins && remainingPins <= 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-700">
              <strong>Advertencia:</strong> Solo quedan {remainingPins} pines disponibles
            </p>
          </div>
        )}

        {/* Lista de informes generados */}
        {generatedReports.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Informes Generados Recientemente
            </h4>
            <div className="space-y-2">
              {generatedReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FaFileAlt className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Informe {report.type}
                      </p>
                      <p className="text-xs text-gray-500">{report.timestamp}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    <FaDownload />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Envolver el componente con el HOC de control de pines
const PinControlledReportGenerator = withPinControl(ReportGenerator, {
  requirePins: true,
  showPinStatus: true,
  blockOnNoPins: false, // Permitir mostrar el componente pero deshabilitar funciones
  psychologistIdProp: 'psychologistId'
});

export default PinControlledReportGenerator;