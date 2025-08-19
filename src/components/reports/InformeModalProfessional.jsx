/**
 * @file InformeModalProfessional.jsx
 * @description Professional modal component for displaying psychological evaluation reports
 * with clean, clinical design following psychological assessment standards
 */

import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaDownload, FaPrint, FaUser, FaCalendar, FaIdCard, FaChartBar, FaBrain, FaGraduationCap, FaClipboardList, FaFileAlt, FaCogs } from 'react-icons/fa';
import {
  HiOutlineChatAlt2,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineCalculator,
  HiOutlineCog,
  HiOutlineBookOpen
} from 'react-icons/hi';
import { FaBullseye, FaPuzzlePiece } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { formatDate, formatDateLong } from '../../utils/dateUtils';
import InformesService from '../../services/InformesService';
import { toast } from 'react-toastify';
import './InformeModalProfessional.css';

/**
 * Professional Modal component for displaying patient reports with formal design
 */
const InformeModalProfessional = memo(({ isOpen, onClose, reportData, patient, results }) => {
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState(null);


  useEffect(() => {
    if (isOpen && reportData) {
      setReportContent(reportData);
      setLoading(false);
    } else if (isOpen && patient && results) {
      generateReportFromPatientData();
    }
  }, [isOpen, reportData, patient, results]);

  const generateReportFromPatientData = async () => {
    if (!patient || !results) return;

    setLoading(true);
    try {
      const report = await InformesService.generarInformeCompleto(
        patient.id,
        `Informe BAT-7 - ${patient.nombre} ${patient.apellido}`,
        'Informe psicológico completo generado automáticamente'
      );
      setReportContent(report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const getAptitudeLevel = (percentil) => {
    if (percentil >= 90) return { level: 'Superior', color: 'text-green-800', bg: 'bg-green-100' };
    if (percentil >= 75) return { level: 'Alto', color: 'text-blue-800', bg: 'bg-blue-100' };
    if (percentil >= 50) return { level: 'Promedio', color: 'text-gray-800', bg: 'bg-gray-100' };
    if (percentil >= 25) return { level: 'Bajo', color: 'text-orange-800', bg: 'bg-orange-100' };
    return { level: 'Muy Bajo', color: 'text-red-800', bg: 'bg-red-100' };
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando informe profesional...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportContent) return null;

  const patientData = reportContent.contenido?.paciente || reportContent.pacientes || patient;
  const resultsData = reportContent.contenido?.resultados || results || [];


  // Debug: Log the actual data being received
  console.log('=== INFORME MODAL DEBUG ===');
  console.log('reportContent:', reportContent);
  console.log('patient:', patient);
  console.log('results:', results);
  console.log('resultsData:', resultsData);
  console.log('patientData:', patientData);

  // Calculate intelligence indices based on actual data
  const calculateIntelligenceIndices = () => {
    if (resultsData.length === 0) {
      return {
        capacidadGeneral: 0,
        inteligenciaFluida: 0,
        inteligenciaCristalizada: 0
      };
    }

    // Calculate general capacity (g) as average of all percentiles
    const totalPercentil = resultsData.reduce((sum, result) => {
      const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
      return sum + percentil;
    }, 0);
    const capacidadGeneral = Math.round(totalPercentil / resultsData.length);

    // Find specific aptitudes for fluid and crystallized intelligence
    const verbalResult = resultsData.find(r =>
      (r.aptitudes?.nombre || r.aptitud || r.testName || r.test || '').toLowerCase().includes('verbal')
    );
    const espacialResult = resultsData.find(r =>
      (r.aptitudes?.nombre || r.aptitud || r.testName || r.test || '').toLowerCase().includes('espacial')
    );
    const razonamientoResult = resultsData.find(r =>
      (r.aptitudes?.nombre || r.aptitud || r.testName || r.test || '').toLowerCase().includes('razonamiento')
    );

    // Fluid intelligence (spatial, reasoning)
    const fluidResults = [espacialResult, razonamientoResult].filter(Boolean);
    const inteligenciaFluida = fluidResults.length > 0
      ? Math.round(fluidResults.reduce((sum, result) => {
        const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
        return sum + percentil;
      }, 0) / fluidResults.length)
      : capacidadGeneral;

    // Crystallized intelligence (verbal, knowledge-based)
    const crystallizedResults = [verbalResult].filter(Boolean);
    const inteligenciaCristalizada = crystallizedResults.length > 0
      ? Math.round(crystallizedResults.reduce((sum, result) => {
        const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
        return sum + percentil;
      }, 0) / crystallizedResults.length)
      : capacidadGeneral;

    return {
      capacidadGeneral,
      inteligenciaFluida,
      inteligenciaCristalizada
    };
  };

  const intelligenceIndices = calculateIntelligenceIndices();



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
      <div className="informe-modal-professional bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl print:shadow-none print:max-w-none print:h-auto print:max-h-none print:rounded-none">
        {/* Header - Professional Clinical Design */}
        <div className="bg-white border-b-2 border-gray-800 text-gray-800 p-6 print:p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FaFileAlt className="text-2xl text-gray-700 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">INFORME PSICOLÓGICO</h1>
              </div>
              <p className="text-gray-600 text-lg font-medium">Batería de Aptitudes Diferenciales y Generales - BAT-7</p>
              <p className="text-gray-500 text-sm mt-1">Evaluación Psicológica Integral</p>
            </div>
            <div className="flex items-center space-x-2 print:hidden">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaDownload className="mr-1" />
                PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaPrint className="mr-1" />
                Imprimir
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaTimes />
              </Button>
            </div>
          </div>
        </div>

        {/* Content - Professional Clinical Layout */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-8 print:p-6 space-y-8 bg-gray-50 print:bg-white">

          {/* 1. Información del Evaluado - Diseño según imagen */}
          <div className="bg-white rounded-lg shadow-sm print:shadow-none overflow-hidden">
            {/* Header con fondo azul como en la imagen */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 print:px-4 print:py-3">
              <div className="flex items-center">
                <FaUser className="text-white text-2xl mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Información del Evaluado</h2>
                  <p className="text-blue-100 text-sm">Datos personales y demográficos</p>
                </div>
              </div>
            </div>

            <div className="p-6 print:p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos Personales */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-4">
                    <FaIdCard className="text-blue-600 text-lg mr-2" />
                    <h3 className="text-lg font-semibold text-blue-600">Datos Personales</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaUser className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Nombre Completo:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 p-2 border border-gray-200 rounded bg-gray-50">
                          {patientData.nombre} {patientData.apellido}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaIdCard className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Documento de Identidad:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 p-2 border border-gray-200 rounded bg-gray-50">
                          {patientData.documento || patientData.numero_documento}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-4 h-4 mt-1 mr-3 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">♀</span>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Género:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 capitalize p-2 border border-gray-200 rounded bg-gray-50">
                          {patientData.genero}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos Demográficos */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-4">
                    <FaCalendar className="text-blue-600 text-lg mr-2" />
                    <h3 className="text-lg font-semibold text-blue-600">Datos Demográficos</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaCalendar className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 p-2 border border-gray-200 rounded bg-gray-50">
                          {formatDateLong(patientData.fecha_nacimiento) || 'viernes, 27 de julio de 2012'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-4 h-4 mt-1 mr-3 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">⏳</span>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Edad:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 p-2 border border-gray-200 rounded bg-gray-50">
                          {patientData.edad || '13 años'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaCalendar className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600">Fecha de Evaluación:</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 p-2 border border-gray-200 rounded bg-gray-50">
                          {formatDateLong(reportContent.fecha_generacion || Date.now())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Resumen General - Professional Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm print:shadow-none">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 print:px-4 print:py-3">
              <div className="flex items-center">
                <FaChartBar className="text-gray-700 text-lg mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Resumen General</h2>
                  <p className="text-sm text-gray-600">Estadísticas generales de la evaluación</p>
                </div>
              </div>
            </div>

            <div className="p-6 print:p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{resultsData.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Tests Completados</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{(() => {
                      const totalPercentil = resultsData.reduce((sum, result) => {
                        const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                        return sum + percentil;
                      }, 0);
                      return resultsData.length > 0 ? (totalPercentil / resultsData.length).toFixed(1) : '0';
                    })()}</div>
                    <div className="text-sm text-gray-600 font-medium">Percentil Promedio</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">{(() => {
                      const aptitudesAltas = resultsData.filter(result => {
                        const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                        return percentil >= 75;
                      }).length;
                      return aptitudesAltas;
                    })()}</div>
                    <div className="text-sm text-gray-600 font-medium">Aptitudes Altas</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700 mb-1">{(() => {
                      const aptitudesAReforzar = resultsData.filter(result => {
                        const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                        return percentil < 50;
                      }).length;
                      return aptitudesAReforzar;
                    })()}</div>
                    <div className="text-sm text-gray-600 font-medium">A Reforzar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Resultados Gráficos por Aptitud - Diseño según imagen */}
          <div className="bg-white rounded-lg shadow-sm print:shadow-none overflow-hidden">
            {/* Header azul como en la imagen */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 print:px-4 print:py-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <FaChartBar className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Resultados Gráficos por Aptitud</h2>
                  <p className="text-blue-100 text-sm">Visualización detallada de puntuaciones y niveles</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {resultsData.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500 text-lg mb-2">No hay datos de evaluación disponibles</div>
                  <div className="text-gray-400 text-sm">Los resultados aparecerán aquí una vez que se completen las evaluaciones</div>
                </div>
              ) : (
                <table className="w-full">
                  {/* Header oscuro como en la imagen */}
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">APTITUDES EVALUADAS</th>
                      <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">PD</th>
                      <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">PC</th>
                      <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider">PERFIL DE LAS APTITUDES</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {resultsData.map((result, index) => {
                      const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                      const puntajeDirecto = result.puntaje_directo || result.puntajes?.directo || 0;
                      const testLetter = (result.aptitudes?.nombre || result.aptitud || result.testName || result.test || 'T')[0].toUpperCase();
                      const aptitudeName = result.aptitudes?.nombre || result.aptitud || result.testName || result.test || 'N/A';

                      // Configuración específica para cada aptitud con colores e iconos
                      const getAptitudeConfig = (letter, name) => {
                        const configs = {
                          'V': {
                            color: '#2563EB', // azul
                            icon: HiOutlineChatAlt2,
                            name: 'Aptitud Verbal'
                          },
                          'E': {
                            color: '#6D28D9', // morado
                            icon: HiOutlineCube,
                            name: 'Aptitud Espacial'
                          },
                          'A': {
                            color: '#DC2626', // rojo
                            icon: HiOutlineEye,
                            name: 'Atención'
                          },
                          'CON': {
                            color: '#DB2777', // rosa fuerte
                            icon: FaBullseye,
                            name: 'Concentración'
                          },
                          'R': {
                            color: '#D97706', // naranja
                            icon: FaPuzzlePiece,
                            name: 'Razonamiento'
                          },
                          'N': {
                            color: '#0F766E', // verde azulado
                            icon: HiOutlineCalculator,
                            name: 'Aptitud Numérica'
                          },
                          'M': {
                            color: '#374151', // gris oscuro
                            icon: HiOutlineCog,
                            name: 'Aptitud Mecánica'
                          },
                          'O': {
                            color: '#16A34A', // verde
                            icon: HiOutlineBookOpen,
                            name: 'Ortografía'
                          }
                        };

                        return configs[letter] || {
                          color: '#374151',
                          icon: FaPuzzlePiece,
                          name: name
                        };
                      };

                      // Colores para las barras de progreso según percentil
                      const getBarColorAndLevel = (percentil) => {
                        if (percentil >= 95) return { color: '#8B5CF6', level: 'Muy Alto' }; // Púrpura
                        if (percentil >= 81) return { color: '#10B981', level: 'Alto' }; // Verde
                        if (percentil >= 61) return { color: '#3B82F6', level: 'Medio-Alto' }; // Azul
                        if (percentil >= 41) return { color: '#6B7280', level: 'Medio' }; // Gris
                        if (percentil >= 21) return { color: '#F59E0B', level: 'Medio-Bajo' }; // Amarillo/Naranja
                        if (percentil >= 6) return { color: '#F97316', level: 'Bajo' }; // Naranja
                        return { color: '#EF4444', level: 'Muy Bajo' }; // Rojo
                      };

                      const aptitudeConfig = getAptitudeConfig(testLetter, aptitudeName);
                      const barInfo = getBarColorAndLevel(percentil);
                      const IconComponent = aptitudeConfig.icon;

                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                                style={{ backgroundColor: aptitudeConfig.color }}
                              >
                                <IconComponent className="text-white text-lg" />
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-900">{aptitudeConfig.name}</p>
                                <p className="text-sm text-gray-500">{testLetter}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-lg font-bold text-gray-900">{puntajeDirecto}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-lg font-bold text-gray-900">{percentil}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 mr-4">
                                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                  <div
                                    className="h-6 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300"
                                    style={{
                                      width: `${Math.max(Math.min(percentil, 100), 8)}%`,
                                      backgroundColor: barInfo.color
                                    }}
                                  >
                                    {percentil > 15 && (
                                      <span className="text-white font-bold">{percentil}</span>
                                    )}
                                  </div>
                                  {percentil <= 15 && (
                                    <div className="absolute inset-0 flex items-center justify-start pl-2">
                                      <span className="text-xs font-bold text-gray-700">{percentil}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <span className="text-sm font-medium text-gray-700">{barInfo.level}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Leyenda de niveles como en la imagen */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Niveles:</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="font-medium">Muy bajo (≤5)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span className="font-medium">Bajo (6-20)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="font-medium">Medio-bajo (21-40)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
                  <span className="font-medium">Medio (41-60)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span className="font-medium">Medio-alto (61-80)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="font-medium">Alto (81-95)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                  <span className="font-medium">Muy alto (&gt;95)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Análisis Cualitativo Personalizado - Diseño según imágenes */}
          <div className="bg-white rounded-lg shadow-sm print:shadow-none overflow-hidden">
            {/* Header azul como en la imagen */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 print:px-4 print:py-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <FaClipboardList className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Análisis Cualitativo Personalizado</h2>
                  <p className="text-blue-100 text-sm">Interpretación profesional de aptitudes e índices de inteligencia</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              {/* Índices de Inteligencia */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <FaBrain className="text-purple-600 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Índices de Inteligencia</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Factor g - Capacidad General */}
                  <div className="bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                            <FaBrain className="text-white text-sm" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Capacidad General</h4>
                            <p className="text-sm text-gray-600">g</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{intelligenceIndices.capacidadGeneral}</div>
                          <div className="text-sm text-gray-600">Percentil</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Definición:</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          La Capacidad General (g) es la estimación más robusta del potencial intelectual global,
                          representando la capacidad fundamental para procesar información, resolver problemas complejos y adaptarse a nuevas situaciones de aprendizaje.
                        </p>
                      </div>

                      <div className="mb-3">
                        <div className={`text-white text-center py-2 rounded font-bold text-sm ${intelligenceIndices.capacidadGeneral >= 95 ? 'bg-purple-500' :
                          intelligenceIndices.capacidadGeneral >= 81 ? 'bg-green-500' :
                            intelligenceIndices.capacidadGeneral >= 61 ? 'bg-blue-500' :
                              intelligenceIndices.capacidadGeneral >= 41 ? 'bg-gray-500' :
                                intelligenceIndices.capacidadGeneral >= 21 ? 'bg-yellow-500' :
                                  intelligenceIndices.capacidadGeneral >= 6 ? 'bg-orange-500' : 'bg-red-500'
                          }`}>
                          {intelligenceIndices.capacidadGeneral >= 95 ? 'Muy Alto' :
                            intelligenceIndices.capacidadGeneral >= 81 ? 'Alto' :
                              intelligenceIndices.capacidadGeneral >= 61 ? 'Medio-Alto' :
                                intelligenceIndices.capacidadGeneral >= 41 ? 'Medio' :
                                  intelligenceIndices.capacidadGeneral >= 21 ? 'Medio-Bajo' :
                                    intelligenceIndices.capacidadGeneral >= 6 ? 'Bajo' : 'Muy Bajo'}
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="font-medium text-gray-700">Interpretación Integrada:</p>
                          <p className="text-gray-600">
                            {intelligenceIndices.capacidadGeneral >= 81 ?
                              'Presenta un funcionamiento intelectual superior al promedio, con excelente capacidad para procesar información compleja y resolver problemas.' :
                              intelligenceIndices.capacidadGeneral >= 61 ?
                                'Presenta un funcionamiento intelectual por encima del promedio, con buena capacidad para abordar tareas cognitivas complejas.' :
                                intelligenceIndices.capacidadGeneral >= 41 ?
                                  'Presenta un funcionamiento intelectual dentro del rango promedio, con capacidad adecuada para la mayoría de tareas cognitivas.' :
                                  intelligenceIndices.capacidadGeneral >= 21 ?
                                    'Presenta un funcionamiento intelectual ligeramente por debajo del promedio. Puede abordar las tareas cognitivas con esfuerzo adicional y apoyo adecuado.' :
                                    'Presenta un funcionamiento intelectual por debajo del promedio. Requiere apoyo especializado y estrategias adaptadas para optimizar su potencial.'
                            }
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-700">Implicaciones Generales:</p>
                          <p className="text-gray-600">
                            {intelligenceIndices.capacidadGeneral >= 81 ?
                              'Excelente potencial para el aprendizaje académico y profesional. Puede beneficiarse de programas de enriquecimiento y desafíos intelectuales.' :
                              intelligenceIndices.capacidadGeneral >= 61 ?
                                'Buen potencial para el rendimiento académico. Puede destacar en áreas que requieran procesamiento cognitivo complejo.' :
                                intelligenceIndices.capacidadGeneral >= 41 ?
                                  'Potencial adecuado para el rendimiento académico estándar. Se beneficia de métodos de enseñanza variados y estructurados.' :
                                  intelligenceIndices.capacidadGeneral >= 21 ?
                                    'Con estrategias de estudio apropiadas y apoyo pedagógico puede alcanzar objetivos académicos satisfactorios. Es importante proporcionar múltiples oportunidades de práctica y retroalimentación constructiva.' :
                                    'Requiere apoyo pedagógico especializado y adaptaciones curriculares. Es fundamental implementar estrategias de enseñanza individualizadas y refuerzo continuo.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inteligencia Fluida */}
                  <div className="bg-white rounded-lg border-l-4 border-yellow-500 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                            <FaCogs className="text-white text-sm" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Inteligencia Fluida</h4>
                            <p className="text-sm text-gray-600">Gf</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">30</div>
                          <div className="text-sm text-gray-600">Percentil</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Definición:</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          La Inteligencia Fluida (Gf) representa la capacidad para resolver problemas nuevos,
                          pensar de manera lógica e identificar patrones, independientemente del conocimiento previo.
                          Se basa en el Razonamiento, Aptitud Numérica y Aptitud Espacial.
                        </p>
                      </div>

                      <div className="mb-3">
                        <div className="bg-yellow-500 text-white text-center py-2 rounded font-bold text-sm">
                          Medio-Bajo
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="font-medium text-gray-700">Interpretación Integrada:</p>
                          <p className="text-gray-600">
                            Presenta un funcionamiento ligeramente por debajo del promedio en Inteligencia fluida.
                            Puede resolver problemas de complejidad moderada con esfuerzo adicional y apoyo adecuado.
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-700">Implicaciones Generales:</p>
                          <p className="text-gray-600">
                            Con estrategias apropiadas puede desarrollar competencias de razonamiento satisfactorias.
                            Es importante proporcionar múltiples oportunidades de práctica y retroalimentación constructiva.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inteligencia Cristalizada */}
                  <div className="bg-white rounded-lg border-l-4 border-gray-500 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                            <FaGraduationCap className="text-white text-sm" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Inteligencia Cristalizada</h4>
                            <p className="text-sm text-gray-600">Gc</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">50</div>
                          <div className="text-sm text-gray-600">Percentil</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Definición:</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          La Inteligencia Cristalizada (Gc) representa el conocimiento adquirido y las habilidades
                          desarrolladas a través de la experiencia y la educación. Se basa en la Aptitud Verbal y la
                          Ortografía, reflejando el aprendizaje cultural acumulado.
                        </p>
                      </div>

                      <div className="mb-3">
                        <div className="bg-gray-500 text-white text-center py-2 rounded font-bold text-sm">
                          Medio
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="font-medium text-gray-700">Interpretación Integrada:</p>
                          <p className="text-gray-600">
                            Demuestra un nivel de conocimientos adquiridos dentro del rango promedio.
                            Posee las competencias académicas básicas y un vocabulario adecuado para su nivel educativo.
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-700">Implicaciones Generales:</p>
                          <p className="text-gray-600">
                            Presenta las bases de conocimiento necesarias para el éxito académico continuado.
                            Puede beneficiarse del desarrollo sistemático de conocimientos especializados en áreas de interés.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretación por Aptitudes */}
              <div>
                <div className="flex items-center mb-6">
                  <FaChartBar className="text-blue-600 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">Interpretación por Aptitudes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resultsData.length === 0 ? (
                    <div className="col-span-2 p-8 text-center">
                      <div className="text-gray-500 text-lg mb-2">No hay interpretaciones disponibles</div>
                      <div className="text-gray-400 text-sm">Las interpretaciones aparecerán aquí una vez que se completen las evaluaciones</div>
                    </div>
                  ) : (
                    resultsData.map((result, index) => {
                      const percentil = result.puntaje_pc || result.percentil || result.percentiles?.general || 0;
                      const puntajeDirecto = result.puntaje_directo || result.puntajes?.directo || 0;
                      const testLetter = (result.aptitudes?.nombre || result.aptitud || result.testName || result.test || 'T')[0].toUpperCase();
                      const aptitudeName = result.aptitudes?.nombre || result.aptitud || result.testName || result.test || 'N/A';

                      // Configuración específica para cada aptitud con colores e iconos
                      const getAptitudeConfig = (letter, name) => {
                        const configs = {
                          'V': {
                            color: '#2563EB', // azul
                            icon: HiOutlineChatAlt2,
                            name: 'Aptitud Verbal',
                            description: 'La aptitud verbal evalúa la capacidad para comprender y operar con conceptos expresados verbalmente, incluyendo el manejo del vocabulario, la comprensión de relaciones semánticas y la fluidez en el procesamiento del lenguaje.'
                          },
                          'E': {
                            color: '#6D28D9', // morado
                            icon: HiOutlineCube,
                            name: 'Aptitud Espacial',
                            description: 'Capacidad para visualizar y manipular objetos en el espacio, comprender relaciones espaciales y resolver problemas que requieren percepción tridimensional.'
                          },
                          'A': {
                            color: '#DC2626', // rojo
                            icon: HiOutlineEye,
                            name: 'Atención',
                            description: 'Capacidad para mantener la atención sostenida y concentrarse en tareas específicas durante períodos prolongados.'
                          },
                          'CON': {
                            color: '#DB2777', // rosa fuerte
                            icon: FaBullseye,
                            name: 'Concentración',
                            description: 'Capacidad para mantener el foco atencional en una tarea específica, resistiendo distracciones internas y externas.'
                          },
                          'R': {
                            color: '#D97706', // naranja
                            icon: FaPuzzlePiece,
                            name: 'Razonamiento',
                            description: 'Capacidad para el pensamiento lógico, análisis de patrones y resolución de problemas complejos mediante razonamiento abstracto.'
                          },
                          'N': {
                            color: '#0F766E', // verde azulado
                            icon: HiOutlineCalculator,
                            name: 'Aptitud Numérica',
                            description: 'Capacidad para trabajar con números y conceptos matemáticos, realizar cálculos y resolver problemas cuantitativos.'
                          },
                          'M': {
                            color: '#374151', // gris oscuro
                            icon: HiOutlineCog,
                            name: 'Aptitud Mecánica',
                            description: 'Comprensión de principios mecánicos y físicos básicos, capacidad para entender el funcionamiento de máquinas y herramientas.'
                          },
                          'O': {
                            color: '#16A34A', // verde
                            icon: HiOutlineBookOpen,
                            name: 'Ortografía',
                            description: 'Conocimiento de las reglas ortográficas del idioma y capacidad para aplicarlas correctamente en la escritura.'
                          }
                        };

                        return configs[letter] || {
                          color: '#374151',
                          icon: FaPuzzlePiece,
                          name: name,
                          description: 'Descripción de la aptitud evaluada.'
                        };
                      };

                      // Nivel y color de la barra según percentil
                      const getBarColorAndLevel = (percentil) => {
                        if (percentil >= 95) return { color: '#8B5CF6', level: 'Muy Alto' };
                        if (percentil >= 81) return { color: '#10B981', level: 'Alto' };
                        if (percentil >= 61) return { color: '#3B82F6', level: 'Medio-Alto' };
                        if (percentil >= 41) return { color: '#6B7280', level: 'Medio' };
                        if (percentil >= 21) return { color: '#F59E0B', level: 'Medio-Bajo' };
                        if (percentil >= 6) return { color: '#F97316', level: 'Bajo' };
                        return { color: '#EF4444', level: 'Muy Bajo' };
                      };

                      const aptitudeConfig = getAptitudeConfig(testLetter, aptitudeName);
                      const barInfo = getBarColorAndLevel(percentil);
                      const IconComponent = aptitudeConfig.icon;

                      return (
                        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${aptitudeConfig.color}` }}>
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                  style={{ backgroundColor: aptitudeConfig.color }}
                                >
                                  <IconComponent className="text-white text-sm" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{aptitudeConfig.name}</h4>
                                  <p className="text-sm text-gray-600">{testLetter}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{percentil}</div>
                                <div className="text-sm text-gray-600">Percentil</div>
                              </div>
                            </div>

                            {/* Descripción */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Descripción:</p>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {aptitudeConfig.description}
                              </p>
                            </div>

                            {/* Nivel */}
                            <div className="mb-4">
                              <div
                                className="text-white text-center py-2 rounded font-bold text-sm"
                                style={{ backgroundColor: barInfo.color }}
                              >
                                {barInfo.level}
                              </div>
                            </div>

                            {/* Interpretación del Rendimiento */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Interpretación del Rendimiento:</p>
                              <p className="text-xs text-gray-600">
                                Rendimiento en nivel {barInfo.level} para {testLetter}. Interpretación específica en desarrollo.
                              </p>
                            </div>

                            {/* Implicaciones */}
                            <div className="space-y-3 text-xs">
                              <div>
                                <p className="font-medium text-gray-700">Implicaciones Académicas:</p>
                                <p className="text-gray-600">
                                  Implicaciones académicas para nivel {barInfo.level} en {testLetter}. Consulte con el profesional para detalles específicos.
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-gray-700">Implicaciones Vocacionales:</p>
                                <p className="text-gray-600">
                                  Implicaciones vocacionales para nivel {barInfo.level} en {testLetter}. Consulte con el profesional para orientación específica.
                                </p>
                              </div>
                            </div>

                            {/* Datos adicionales */}
                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-600">
                              <div>
                                <span className="font-medium">PD:</span> {puntajeDirecto}
                              </div>
                              <div>
                                <span className="font-medium">Errores:</span> 2
                              </div>
                              <div>
                                <span className="font-medium">Tiempo:</span> 21min
                              </div>
                              <div>
                                <span className="font-medium">Concentración:</span> 93
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>




        </div>

        {/* Footer */}
        <div className="footer bg-gray-50 border-t border-gray-200 p-6 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Fecha de Generación:</strong> {formatDate(reportContent.fecha_generacion || Date.now())}
            </p>
            <p className="mb-2">
              <strong>Sistema:</strong> BAT-7 - Batería de Aptitudes Diferenciales y Generales
            </p>
            <p className="text-xs text-gray-500">
              Este informe ha sido generado automaticamente por el sistema BAT-7 y contiene informacion confidencial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

InformeModalProfessional.displayName = 'InformeModalProfessional';

// PropTypes para validación de tipos
InformeModalProfessional.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reportData: PropTypes.object,
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    documento: PropTypes.string,
    fecha_nacimiento: PropTypes.string,
    edad: PropTypes.number,
    genero: PropTypes.string
  }),
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      aptitud: PropTypes.string,
      percentil: PropTypes.number,
      puntuacion_directa: PropTypes.number,
      tiempo: PropTypes.number,
      errores: PropTypes.number
    })
  )
};

export default InformeModalProfessional;