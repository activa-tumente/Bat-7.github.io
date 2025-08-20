/**
 * @file InformeModal.jsx
 * @description Modal component for displaying generated reports based on BAT-7 model
 */

import React, { memo, useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaPrint, FaUser, FaCalendar, FaIdCard, FaChartBar } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/dateUtils';
import InformesService from '../../services/InformesService';
import { toast } from 'react-toastify';

/**
 * Modal component for displaying patient reports
 * @param {Object} props - Component props
 * @param {Object} props.patient - Patient data
 * @param {Array} props.results - Patient results
 * @param {Function} props.onClose - Close modal handler
 */
const InformeModal = memo(({ isOpen, onClose, reportData, patient, results }) => {
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState(null);

  useEffect(() => {
    if (isOpen && reportData) {
      setReportContent(reportData);
      setLoading(false);
    } else if (isOpen && patient && results) {
      // Fallback: generate report if only patient and results are provided
      generateReportFromPatientData();
    }
  }, [isOpen, reportData, patient, results]);

  const generateReportFromPatientData = async () => {
    try {
      setLoading(true);
      
      // Generate report using InformesService
      const reportId = await InformesService.generarInformeCompleto(
        patient.id,
        `Informe BAT-7 - ${patient.nombre} ${patient.apellido}`,
        `Informe completo de evaluación BAT-7`
      );
      
      // Get the generated report data
      const generatedReport = await InformesService.obtenerInforme(reportId);
      setReportContent(generatedReport);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  // Get aptitude levels
  const getAptitudeLevel = (percentil) => {
    if (percentil >= 90) return { level: 'Superior', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentil >= 75) return { level: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentil >= 50) return { level: 'Promedio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentil >= 25) return { level: 'Bajo Promedio', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Deficiente', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Downloading report...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando informe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportContent) return null;

  // Extract data from reportContent
  const patientData = reportContent.contenido?.paciente || reportContent.pacientes || patient;
  const resultsData = reportContent.contenido?.resultados || results || [];
  const estadisticas = reportContent.contenido?.estadisticas || {};
  const evaluacion = reportContent.contenido?.evaluacion || {};

  const isFemale = patientData.genero === 'femenino' || patientData.genero === 'Femenino';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Informe BAT-7</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <FaDownload className="mr-2" />
              Descargar
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <FaPrint className="mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 print:p-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">INFORME BAT-7</h1>
            <h2 className="text-xl text-gray-600 mb-4">Batería de Aptitudes Diferenciales y Generales</h2>
            <div className="text-sm text-gray-600">
              <p>Fecha de Generación: {new Date(reportContent.fecha_generacion || Date.now()).toLocaleDateString('es-ES')}</p>
              <p>ID del Informe: {reportContent.id}</p>
            </div>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-600" />
              Información del Evaluado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                <p className="text-lg font-semibold text-gray-800">
                  {patientData.nombre} {patientData.apellido}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Documento de Identidad</label>
                <p className="text-lg text-gray-800">{patientData.documento || patientData.numero_documento}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Género</label>
                <p className="text-lg text-gray-800 capitalize">{patientData.genero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Evaluación</label>
                <p className="text-lg text-gray-800">{estadisticas.fecha_ultima_evaluacion ? formatDate(estadisticas.fecha_ultima_evaluacion) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Test Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-blue-600" />
              Resumen de Evaluación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{estadisticas.total_evaluaciones || resultsData.length}</div>
                <div className="text-sm text-gray-600">Tests Aplicados</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Completitud</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{reportContent.metadatos?.promedio_pd || 'N/A'}</div>
                <div className="text-sm text-gray-600">Promedio PD</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{reportContent.metadatos?.promedio_pc || 'N/A'}</div>
                <div className="text-sm text-gray-600">Promedio PC</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultados Detallados por Aptitud</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Aptitud</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Puntaje PD</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Percentil</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Nivel</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.map((result, index) => {
                    const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                    const aptitudeLevel = getAptitudeLevel(percentil);
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          {result.aptitudes?.nombre || result.aptitud || result.testName || result.test || 'N/A'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                          {result.puntaje_directo || result.puntajes?.directo || 'N/A'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                          {percentil}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${aptitudeLevel.bg} ${aptitudeLevel.color}`}>
                            {aptitudeLevel.level}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {result.errores || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          {evaluacion.recomendaciones && evaluacion.recomendaciones.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recomendaciones</h3>
              <div className="bg-green-50 rounded-lg p-6">
                <ul className="space-y-2">
                  {evaluacion.recomendaciones.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Interpretation */}
          {evaluacion.resumen ? (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Evaluación</h3>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {evaluacion.resumen}
                </p>
                {evaluacion.observaciones && evaluacion.observaciones.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Observaciones:</h4>
                    <ul className="space-y-1">
                      {evaluacion.observaciones.map((observacion, index) => (
                        <li key={index} className="text-gray-700 text-sm">
                          • {observacion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interpretación de Resultados</h3>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Los resultados obtenidos en la evaluación BAT-7 muestran el perfil aptitudinal del evaluado 
                  en diferentes áreas cognitivas. Cada aptitud ha sido evaluada mediante pruebas específicas 
                  que permiten determinar el nivel de desarrollo en comparación con la población de referencia.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  El puntaje percentil indica la posición relativa del evaluado respecto a su grupo normativo, 
                  donde un percentil de 50 representa el promedio poblacional. Los niveles van desde 
                  "Deficiente" (percentil &lt; 25) hasta "Superior" (percentil ≥ 90).
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Fecha de Generación:</strong> {formatDate(reportContent.fecha_generacion || Date.now())}
            </p>
            <p>
              Este informe ha sido generado automáticamente por el sistema BAT-7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

InformeModal.displayName = 'InformeModal';

export default InformeModal;