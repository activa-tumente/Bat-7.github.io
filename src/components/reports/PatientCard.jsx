/**
 * @file PatientCard.jsx
 * @description Card component for displaying patient information based on the new design.
 */

import React, { memo, useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FaFileAlt, FaEye, FaTrashAlt, FaChevronDown, FaChevronUp, FaClock, FaCheckCircle, FaTimesCircle, FaBrain, FaEye as FaEyeIcon, FaEdit, FaCalculator, FaCog, FaSpellCheck, FaLightbulb } from 'react-icons/fa';
import { toast } from 'react-toastify';
import InformesService from '../../services/InformesService';
import ResultadosService from '../../services/resultadosService';
import ReportManagementService from '../../services/ReportManagementService';
import AptitudeConfigService from '../../services/AptitudeConfigService';
import ScoreProcessingService from '../../services/ScoreProcessingService';
import InformeModalProfessional from './InformeModalProfessional';

const MetricBox = ({ value, label, color }) => (
  <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const TestDetailsTable = ({ patientId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const data = await ResultadosService.getResultadosByPaciente(patientId);
        setResults(data);
      } catch (error) {
        console.error('Error fetching patient results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [patientId]);

  // Mapeo de códigos de aptitud a iconos de react-icons/fa, nombres y colores
  const aptitudeConfig = {
    'E': { icon: FaBrain, name: 'Espacial', bgColor: 'bg-purple-500', color: '#6b5bff' },
    'A': { icon: FaEyeIcon, name: 'Atención', bgColor: 'bg-red-500', color: '#e74c3c' },
    'O': { icon: FaSpellCheck, name: 'Ortografía', bgColor: 'bg-green-500', color: '#2ecc71' },
    'V': { icon: FaEdit, name: 'Verbal', bgColor: 'bg-blue-500', color: '#3498db' },
    'N': { icon: FaCalculator, name: 'Numérico', bgColor: 'bg-teal-500', color: '#1abc9c' },
    'R': { icon: FaLightbulb, name: 'Razonamiento', bgColor: 'bg-orange-500', color: '#e67e22' },
    'M': { icon: FaCog, name: 'Mecánico', bgColor: 'bg-gray-600', color: '#7f8c8d' }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>No hay resultados de pruebas disponibles para este paciente.</p>
      </div>
    );
  }

  // Función para obtener el nivel y color del percentil
  const getPercentilLevel = (percentil) => {
    if (percentil >= 80) return { level: 'Alto', color: 'bg-blue-100 text-blue-800', bgColor: '#e6f0ff' };
    if (percentil >= 60) return { level: 'Medio-Alto', color: 'bg-blue-200 text-blue-900', bgColor: '#e6f0ff' };
    if (percentil >= 40) return { level: 'Medio', color: 'bg-blue-100 text-blue-700', bgColor: '#e6f0ff' };
    if (percentil >= 20) return { level: 'Medio-Bajo', color: 'bg-yellow-100 text-yellow-800', bgColor: '#fff9e6' };
    return { level: 'Bajo', color: 'bg-red-100 text-red-800', bgColor: '#ffe6e6' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <thead style={{ backgroundColor: '#f6f9ff' }}>
          <tr>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">TEST</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">PUNTAJE PD</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">PUNTAJE PC</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">ACIERTOS</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">ERRORES</th>
            <th className="px-4 py-4 text-center text-sm font-bold text-gray-800">TIEMPO</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const aptitudeCode = result.aptitudes?.codigo || '';
            const config = aptitudeConfig[aptitudeCode] || { icon: FaBrain, name: 'Desconocido', bgColor: 'bg-gray-500', color: '#7f8c8d' };
            const aciertos = result.respuestas_correctas || 0;
            const errores = result.respuestas_incorrectas || 0;
            const tiempo = result.tiempo_total || 0;
            const percentil = result.percentil || 0;
            const puntajePD = result.puntaje_directo || 0;
            const percentilInfo = getPercentilLevel(percentil);
            
            return (
              <tr key={result.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ height: '70px' }}>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${config.bgColor}`}
                      style={{ backgroundColor: config.color }}
                    >
                      <config.icon size={20} />                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{aptitudeCode}</div>
                      <div className="text-base text-gray-600">{result.aptitudes?.nombre || config.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span 
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full text-lg font-bold text-orange-700"
                    style={{ backgroundColor: '#ffe6cc', color: '#ff6600' }}
                  >
                    {puntajePD}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <span 
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-lg font-bold ${percentilInfo.color}`}
                      style={{ backgroundColor: percentilInfo.bgColor }}
                    >
                      {percentil}
                    </span>
                    <span className="text-base text-gray-600">{percentilInfo.level}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <FaCheckCircle className="text-green-500" size={18} />
                    <span className="text-lg font-medium text-green-700">{aciertos}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <FaTimesCircle className="text-red-500" size={18} />
                    <span className="text-lg font-medium text-red-700">{errores}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <FaClock className="text-gray-400" size={18} />
                    <span className="text-lg font-medium text-gray-600">{Math.round(tiempo / 60)} min</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PatientCard = memo(({ patient, results, onGenerate, onView = () => {}, onDelete = () => {} }) => {
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate metrics synchronized with answered aptitudes
  const testCount = results.length;
  const validResults = results.filter(r => 
    r.puntaje_directo !== null && 
    r.puntaje_directo !== undefined && 
    (r.puntaje_pc || r.percentil) !== null && 
    (r.puntaje_pc || r.percentil) !== undefined
  );
  
  const pdScores = validResults.map(r => r.puntaje_directo);
  const pcScores = validResults.map(r => r.puntaje_pc || r.percentil);
  
  const avgPdScore = pdScores.length > 0 ? Math.round(pdScores.reduce((sum, score) => sum + score, 0) / pdScores.length) : 0;
  const avgPcScore = pcScores.length > 0 ? Math.round(pcScores.reduce((sum, score) => sum + score, 0) / pcScores.length) : 0;
  
  // Altas: scores >= 75 percentile (Alto), Bajas: scores <= 25 percentile (Bajo)
  const altasCount = pcScores.filter(score => score >= 75).length;
  const bajasCount = pcScores.filter(score => score <= 25).length;

  const aptitudes = results
    .map(r => r.aptitudes?.codigo || r.test)
    .filter((aptitude, index, arr) => arr.indexOf(aptitude) === index)
    .filter(Boolean);

  // Gender-based styling
  const isFemale = patient.genero?.toLowerCase().startsWith('f');

  const genderStyling = {
    female: {
      card: 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-300',
      iconBg: 'bg-pink-500',
      iconColor: 'text-white',
      icon: '♀',
      button: 'bg-pink-500 hover:bg-pink-600',
    },
    male: {
      card: 'bg-gradient-to-br from-blue-50 to-sky-100 border-blue-300',
      iconBg: 'bg-blue-500',
      iconColor: 'text-white',
      icon: '♂',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = isFemale ? genderStyling.female : genderStyling.male;

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Verificar que hay resultados disponibles
      if (!results || results.length === 0) {
        toast.warning('No hay resultados de evaluación disponibles para generar el informe');
        return;
      }

      // Obtener resultados actualizados del paciente para sincronizar métricas
      const resultadosActualizados = await ResultadosService.getResultadosByPaciente(patient.id);
      
      if (resultadosActualizados.length === 0) {
        toast.warning('No se encontraron resultados actualizados para este paciente');
        return;
      }

      // Generar informe con datos sincronizados
      const reportId = await InformesService.generarInformeCompleto(
        patient.id,
        `Informe BAT-7 - ${patient.nombre} ${patient.apellido}`,
        `Informe completo de evaluación BAT-7 para ${patient.nombre} ${patient.apellido} - ${resultadosActualizados.length} aptitudes evaluadas`
      );
      
      const reportData = await InformesService.obtenerInforme(reportId);
      
      // Enriquecer el reporte con datos sincronizados
      const reporteEnriquecido = {
        ...reportData,
        contenido: {
          ...reportData.contenido,
          paciente: patient,
          resultados: resultadosActualizados,
          estadisticas: {
            totalTests: resultadosActualizados.length,
            aptitudesEvaluadas: resultadosActualizados.map(r => r.aptitudes?.codigo).filter(Boolean),
            promedioPercentil: Math.round(
              resultadosActualizados.reduce((sum, r) => sum + (r.percentil || 0), 0) / resultadosActualizados.length
            ),
            promedioPuntajeDirecto: Math.round(
              resultadosActualizados.reduce((sum, r) => sum + (r.puntaje_directo || 0), 0) / resultadosActualizados.length
            ),
            aptitudesAltas: resultadosActualizados.filter(r => (r.percentil || 0) >= 75).length,
            aptitudesBajas: resultadosActualizados.filter(r => (r.percentil || 0) <= 25).length,
            fechaUltimaEvaluacion: resultadosActualizados[0]?.created_at
          }
        }
      };
      
      setGeneratedReport(reporteEnriquecido);
      setShowInformeModal(true);
      
      toast.success(`Informe generado exitosamente con ${resultadosActualizados.length} aptitudes evaluadas`);
      if (onGenerate) onGenerate(reporteEnriquecido);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el informe: ' + (error.message || 'Error desconocido'));
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <>
      <Card className={`rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 border ${styles.card}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
              <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-md font-bold text-gray-800">
                {patient.nombre} {patient.apellido}
              </h3>
              <p className="text-xs text-gray-500">
                Documento: {patient.documento || patient.numero_documento}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className={`${styles.button} text-white font-semibold py-2 px-3 rounded-lg flex items-center text-sm`}
            >
              <FaFileAlt className="mr-2" />
              {generatingReport ? '...' : 'Generar'}
            </Button>
            <Button
              onClick={() => setShowInformeModal(true)}
              className={`${styles.button} text-white font-semibold py-2 px-3 rounded-lg flex items-center text-sm`}
            >
              <FaEye className="mr-2" />
              Ver
            </Button>
            <div className="relative group">
              <Button
                onClick={() => onDelete(patient.id, 'all')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg flex items-center text-sm"
              >
                <FaTrashAlt className="mr-2" />
                Eliminar
              </Button>
              
              {/* Dropdown menu for delete options */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => onDelete(patient.id, 'all')}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <FaTrashAlt className="mr-2" />
                    Eliminar todos los registros
                  </button>
                  <button
                    onClick={() => onDelete(patient.id, 'single')}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <FaTrashAlt className="mr-2" />
                    Eliminar último registro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center mb-4">
          <MetricBox value={testCount} label="Tests" color="text-blue-600" />
          <MetricBox value={avgPdScore} label="Puntaje PD" color="text-purple-600" />
          <MetricBox value={avgPcScore} label="Puntaje PC" color="text-green-600" />
          <MetricBox value={altasCount} label="Aptitud Alta" color="text-yellow-500" />
          <MetricBox value={bajasCount} label="Aptitud Bajas" color="text-red-600" />
        </div>

        <div className="flex items-center mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 mr-3"
          >
            {isExpanded ? <FaChevronUp className="text-lg" /> : <FaChevronDown className="text-lg" />}
          </button>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Aptitudes evaluadas:</span> {aptitudes.join(', ')}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t pt-3">
            <TestDetailsTable patientId={patient.id} />
          </div>
        )}
      </Card>

      {showInformeModal && (
        <InformeModalProfessional
          isOpen={showInformeModal}
          onClose={() => setShowInformeModal(false)}
          reportData={generatedReport}
          patient={patient}
          results={results}
        />
      )}
    </>
  );
});

export default PatientCard;