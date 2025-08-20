/**
 * @file InformeCompletoResultados.jsx
 * @description Componente para generar informes completos con gráficos de barras e interpretación cualitativa
 * Ajustado a la nueva estructura de la tabla 'resultados' de Supabase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import supabase from '../../api/supabaseClient';
import PatientResultsExtractor from '../../services/patientResultsExtractor';

const InformeCompletoResultados = ({ pacienteId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [interpretacion, setInterpretacion] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pacienteId) {
      cargarDatosCompletos();
    }
  }, [pacienteId]);

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener resultados del paciente usando el servicio
      const resultadosData = await PatientResultsExtractor.getPatientResults(pacienteId);
      const estadisticasData = await PatientResultsExtractor.getPatientStats(pacienteId);
      
      if (resultadosData.length === 0) {
        setError('No se encontraron resultados para este paciente');
        return;
      }

      // Obtener información del paciente
      const pacienteInfo = resultadosData[0]?.pacientes;
      
      setResultados(resultadosData);
      setEstadisticas(estadisticasData);
      setPaciente(pacienteInfo);
      
      // Generar interpretación cualitativa
      const interpretacionTexto = generarInterpretacionCualitativa(resultadosData, estadisticasData);
      setInterpretacion(interpretacionTexto);

    } catch (error) {
      console.error('Error cargando datos del informe:', error);
      setError('Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const generarInterpretacionCualitativa = (resultados, stats) => {
    const interpretaciones = [];
    
    // Análisis general
    interpretaciones.push(`**ANÁLISIS GENERAL DE RESULTADOS**`);
    interpretaciones.push(`El paciente ${stats.patientInfo?.nombre} ${stats.patientInfo?.apellido} ha completado ${stats.totalTests} evaluaciones.`);
    
    // Análisis de rendimiento
    if (stats.averagePercentile >= 75) {
      interpretaciones.push(`\n**RENDIMIENTO GENERAL: ALTO**`);
      interpretaciones.push(`Con un percentil promedio de ${stats.averagePercentile}, el paciente demuestra un rendimiento superior al 75% de la población de referencia.`);
    } else if (stats.averagePercentile >= 50) {
      interpretaciones.push(`\n**RENDIMIENTO GENERAL: MEDIO-ALTO**`);
      interpretaciones.push(`Con un percentil promedio de ${stats.averagePercentile}, el paciente se encuentra en el rango medio-alto de la población.`);
    } else if (stats.averagePercentile >= 25) {
      interpretaciones.push(`\n**RENDIMIENTO GENERAL: MEDIO-BAJO**`);
      interpretaciones.push(`Con un percentil promedio de ${stats.averagePercentile}, el paciente se encuentra en el rango medio-bajo, sugiriendo áreas de mejora.`);
    } else {
      interpretaciones.push(`\n**RENDIMIENTO GENERAL: BAJO**`);
      interpretaciones.push(`Con un percentil promedio de ${stats.averagePercentile}, se recomienda apoyo adicional y estrategias de refuerzo.`);
    }

    // Análisis por aptitudes
    interpretaciones.push(`\n**ANÁLISIS POR APTITUDES:**`);
    
    resultados.forEach(resultado => {
      const aptitud = resultado.aptitudes;
      const percentil = resultado.percentil;
      const errores = resultado.errores || 0;
      
      let nivelRendimiento = '';
      let recomendacion = '';
      
      if (percentil >= 75) {
        nivelRendimiento = 'ALTO';
        recomendacion = 'Mantener y potenciar esta fortaleza.';
      } else if (percentil >= 50) {
        nivelRendimiento = 'MEDIO-ALTO';
        recomendacion = 'Continuar desarrollando esta habilidad.';
      } else if (percentil >= 25) {
        nivelRendimiento = 'MEDIO-BAJO';
        recomendacion = 'Requiere práctica adicional y refuerzo.';
      } else {
        nivelRendimiento = 'BAJO';
        recomendacion = 'Necesita intervención específica y apoyo intensivo.';
      }
      
      interpretaciones.push(`\n• **${aptitud?.codigo} - ${aptitud?.nombre}**: Percentil ${percentil} (${nivelRendimiento})`);
      interpretaciones.push(`  Puntaje directo: ${resultado.puntaje_directo}, Errores: ${errores}`);
      interpretaciones.push(`  ${recomendacion}`);
    });

    // Análisis de errores
    if (stats.totalErrors > 0) {
      interpretaciones.push(`\n**ANÁLISIS DE ERRORES:**`);
      interpretaciones.push(`Total de errores: ${stats.totalErrors} (Promedio: ${stats.averageErrors.toFixed(1)} por test)`);
      
      if (stats.averageErrors > 5) {
        interpretaciones.push(`Se observa un patrón de errores elevado que puede indicar impulsividad o dificultades de concentración.`);
      } else if (stats.averageErrors > 2) {
        interpretaciones.push(`Nivel de errores moderado, dentro de rangos esperados.`);
      } else {
        interpretaciones.push(`Excelente control de errores, indicando buena concentración y precisión.`);
      }
    }

    // Recomendaciones generales
    interpretaciones.push(`\n**RECOMENDACIONES GENERALES:**`);
    
    if (stats.averagePercentile >= 75) {
      interpretaciones.push(`• Explorar programas de enriquecimiento académico`);
      interpretaciones.push(`• Considerar roles de liderazgo o tutoría`);
      interpretaciones.push(`• Mantener desafíos apropiados para evitar aburrimiento`);
    } else if (stats.averagePercentile >= 50) {
      interpretaciones.push(`• Continuar con el programa académico regular`);
      interpretaciones.push(`• Reforzar áreas específicas identificadas como más débiles`);
      interpretaciones.push(`• Establecer metas de mejora gradual`);
    } else {
      interpretaciones.push(`• Implementar estrategias de apoyo individualizado`);
      interpretaciones.push(`• Considerar evaluaciones adicionales si es necesario`);
      interpretaciones.push(`• Establecer un plan de seguimiento regular`);
    }

    return interpretaciones.join('\n');
  };

  const getColorByAptitud = (codigo) => {
    const colores = {
      'E': { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
      'A': { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600' },
      'O': { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
      'V': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
      'N': { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600' },
      'R': { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
      'M': { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-600' }
    };
    return colores[codigo] || colores['M'];
  };

  const getNivelInterpretacion = (percentil) => {
    if (percentil >= 75) return { nivel: 'Alto', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentil >= 50) return { nivel: 'Medio-Alto', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentil >= 25) return { nivel: 'Medio-Bajo', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { nivel: 'Bajo', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const imprimirInforme = () => {
    window.print();
  };

  const exportarPDF = async () => {
    // Implementar exportación a PDF
    alert('Función de exportación a PDF en desarrollo');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando informe completo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-red-600 text-white">
            <h2 className="text-xl font-bold">Error</h2>
          </CardHeader>
          <CardBody>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const maxPercentil = Math.max(...resultados.map(r => r.percentil), 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white print:bg-white print:text-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                📊 Informe Completo de Resultados
              </h1>
              <p className="text-blue-100 print:text-gray-600 text-sm mt-1">
                {paciente?.nombre} {paciente?.apellido} - Evaluación Psicológica BAT-7
              </p>
            </div>
            <div className="flex space-x-2 print:hidden">
              <Button
                onClick={imprimirInforme}
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                size="sm"
              >
                <i className="fas fa-print mr-2"></i>
                Imprimir
              </Button>
              <Button
                onClick={exportarPDF}
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                size="sm"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                PDF
              </Button>
              <Button
                onClick={onClose}
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="print:p-4">
          {/* Información del paciente */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg print:bg-white print:border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Información del Paciente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Nombre:</strong> {paciente?.nombre} {paciente?.apellido}</p>
                <p><strong>Documento:</strong> {paciente?.documento}</p>
                <p><strong>Género:</strong> {paciente?.genero}</p>
              </div>
              <div>
                <p><strong>Fecha de evaluación:</strong> {new Date(estadisticas.lastTestDate).toLocaleDateString('es-ES')}</p>
                <p><strong>Total de tests:</strong> {estadisticas.totalTests}</p>
                <p><strong>Tiempo total:</strong> {Math.round(estadisticas.totalTimeSeconds / 60)} minutos</p>
              </div>
            </div>
          </div>

          {/* Estadísticas generales */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Resumen Estadístico</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center print:border">
                <div className="text-3xl font-bold text-blue-600">{estadisticas.totalTests}</div>
                <div className="text-sm text-blue-700">Tests Completados</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center print:border">
                <div className="text-3xl font-bold text-green-600">{estadisticas.averagePercentile}</div>
                <div className="text-sm text-green-700">PC Promedio</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center print:border">
                <div className="text-3xl font-bold text-purple-600">{estadisticas.averageDirectScore}</div>
                <div className="text-sm text-purple-700">PD Promedio</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center print:border">
                <div className="text-3xl font-bold text-red-600">{estadisticas.totalErrors}</div>
                <div className="text-sm text-red-700">Total Errores</div>
              </div>
            </div>
          </div>

          {/* Gráfico de barras - Percentiles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Gráfico de Percentiles por Aptitud</h2>
            <div className="bg-gray-50 p-6 rounded-lg print:border">
              <div className="flex items-end justify-center space-x-4 h-80">
                {resultados.map((resultado, index) => {
                  const color = getColorByAptitud(resultado.aptitudes?.codigo);
                  const altura = (resultado.percentil / maxPercentil) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative flex flex-col justify-end h-64 w-16">
                        <div 
                          className={`${color.bg} rounded-t-lg transition-all duration-1000 ease-out flex items-end justify-center text-white font-bold text-sm`}
                          style={{ height: `${altura}%`, minHeight: '20px' }}
                        >
                          {resultado.percentil}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                          {resultado.aptitudes?.codigo}
                        </div>
                      </div>
                      <div className="mt-8 text-center">
                        <div className="text-xs text-gray-600 max-w-16 break-words">
                          {resultado.aptitudes?.nombre}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Leyenda del gráfico */}
              <div className="mt-6 flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Escala de Percentiles</h4>
                  <div className="flex space-x-4 text-xs">
                    <span className="text-green-600">■ 75-100: Alto</span>
                    <span className="text-blue-600">■ 50-74: Medio-Alto</span>
                    <span className="text-yellow-600">■ 25-49: Medio-Bajo</span>
                    <span className="text-red-600">■ 0-24: Bajo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla detallada de resultados */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Resultados Detallados</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">Nombre y Apellidos</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">Aptitud Contestada</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">PD</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">PC</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Interpretación Cualitativa</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((resultado, index) => {
                    const nivel = getNivelInterpretacion(resultado.percentil);
                    
                    // Generar interpretación cualitativa específica para cada aptitud
                    let interpretacionAptitud = '';
                    if (resultado.percentil >= 75) {
                      interpretacionAptitud = `Rendimiento alto en ${resultado.aptitudes?.nombre}. Fortaleza destacada que debe mantenerse y potenciarse.`;
                    } else if (resultado.percentil >= 50) {
                      interpretacionAptitud = `Rendimiento medio-alto en ${resultado.aptitudes?.nombre}. Habilidad en desarrollo con buen potencial.`;
                    } else if (resultado.percentil >= 25) {
                      interpretacionAptitud = `Rendimiento medio-bajo en ${resultado.aptitudes?.nombre}. Área que requiere atención y refuerzo.`;
                    } else {
                      interpretacionAptitud = `Rendimiento bajo en ${resultado.aptitudes?.nombre}. Se recomienda apoyo especializado y estrategias de mejora.`;
                    }
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">{paciente?.nombre} {paciente?.apellido}</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className="font-medium">{resultado.aptitudes?.nombre}</div>
                          <div className="text-sm text-gray-600">({resultado.aptitudes?.codigo})</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className="text-lg font-bold text-orange-600">{resultado.puntaje_directo}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <span className="text-lg font-bold text-blue-600">{resultado.percentil}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm text-gray-700">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${nivel.bg} ${nivel.color} mr-2`}>
                              {nivel.nivel}
                            </span>
                            {interpretacionAptitud}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interpretación cualitativa */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">💡 Interpretación Cualitativa</h2>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg print:border-gray-300">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                  {interpretacion}
                </div>
              </div>
            </div>
          </div>

          {/* Pie del informe */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Informe generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
            <p className="mt-2">Sistema de Evaluación Psicológica BAT-7 - Versión 2.0</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InformeCompletoResultados;