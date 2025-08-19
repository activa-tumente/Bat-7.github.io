import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';
import PageHeader from '../../components/ui/PageHeader';
import { FaChartLine } from 'react-icons/fa';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // Obtener todos los resultados con información de pacientes y aptitudes
        const { data: resultados, error } = await supabase
          .from('resultados')
          .select(`
            id,
            puntaje_directo,
            percentil,
            errores,
            tiempo_segundos,
            concentracion,

            created_at,
            pacientes:paciente_id (
              id,
              nombre,
              apellido,
              documento,
              genero
            ),
            aptitudes:aptitud_id (
              codigo,
              nombre,
              descripcion
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al cargar resultados:', error);
          showToast('Error al cargar los resultados', 'error');
          return;
        }

        // Agrupar resultados por paciente
        const groupedByPatient = resultados.reduce((acc, resultado) => {
          const patientId = resultado.pacientes?.id;
          if (!patientId) return acc;

          if (!acc[patientId]) {
            acc[patientId] = {
              paciente: resultado.pacientes,
              resultados: [],
              fechaUltimaEvaluacion: resultado.created_at
            };
          }

          const interpretacion = resultado.percentil
            ? BaremosService.obtenerInterpretacionPC(resultado.percentil)
            : { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' };

          acc[patientId].resultados.push({
            id: resultado.id,
            test: resultado.aptitudes?.codigo || 'N/A',
            testName: resultado.aptitudes?.nombre || 'Test Desconocido',
            puntajePD: resultado.puntaje_directo || 0,
            puntajePC: resultado.percentil || 'N/A',
            errores: resultado.errores || 0,
            tiempo: resultado.tiempo_segundos ? `${Math.round(resultado.tiempo_segundos / 60)}:${String(resultado.tiempo_segundos % 60).padStart(2, '0')}` : 'N/A',
            concentracion: resultado.concentracion ? `${resultado.concentracion.toFixed(1)}%` : 'N/A',
            fecha: new Date(resultado.created_at).toLocaleDateString('es-ES'),
            interpretacion: interpretacion.nivel,
            interpretacionColor: interpretacion.color,
            interpretacionBg: interpretacion.bg
          });

          // Actualizar fecha más reciente
          if (new Date(resultado.created_at) > new Date(acc[patientId].fechaUltimaEvaluacion)) {
            acc[patientId].fechaUltimaEvaluacion = resultado.created_at;
          }

          return acc;
        }, {});

        // Convertir a array y ordenar por fecha más reciente
        const processedResults = Object.values(groupedByPatient).sort((a, b) =>
          new Date(b.fechaUltimaEvaluacion) - new Date(a.fechaUltimaEvaluacion)
        );

        setResults(processedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar resultados:', error);
        showToast('Error al cargar los resultados', 'error');
        setLoading(false);
      }
    };

    fetchResults();
  }, [showToast]);

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const getTestColor = (testCode) => {
    const colors = {
      'V': 'text-blue-600',
      'E': 'text-indigo-600',
      'A': 'text-red-600',
      'R': 'text-amber-600',
      'N': 'text-teal-600',
      'M': 'text-slate-600',
      'O': 'text-green-600'
    };
    return colors[testCode] || 'text-gray-600';
  };

  return (
    <div>
      {/* Header Section with Standardized Style */}
      <PageHeader
        title="Resultados de Tests"
        subtitle={`${results.length} paciente${results.length !== 1 ? 's' : ''} con resultados disponibles`}
        icon={FaChartLine}
      />

      <div className="container mx-auto py-6">

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando resultados...</p>
        </div>
      ) : (
        <>
          {results.length === 0 ? (
            <Card>
              <CardBody>
                <div className="py-8 text-center">
                  <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No hay resultados de tests disponibles.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Los resultados aparecerán aquí una vez que se completen los tests.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-6">
              {results.map((patientGroup, index) => (
                <Card key={patientGroup.paciente.id} className="overflow-hidden shadow-lg border border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-lg ${
                          patientGroup.paciente?.genero === 'masculino' ? 'bg-white bg-opacity-20 border-2 border-white border-opacity-30' : 'bg-white bg-opacity-20 border-2 border-white border-opacity-30'
                        }`}>
                          <i className={`fas ${patientGroup.paciente?.genero === 'masculino' ? 'fa-mars text-blue-100' : 'fa-venus text-pink-200'}`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {patientGroup.paciente?.nombre} {patientGroup.paciente?.apellido}
                          </h3>
                          <p className="text-blue-100 text-sm">
                            <i className="fas fa-clipboard-check mr-1"></i>
                            {patientGroup.resultados.length} test{patientGroup.resultados.length !== 1 ? 's' : ''} completado{patientGroup.resultados.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-blue-100 text-sm">Última evaluación</p>
                          <p className="text-white font-semibold">
                            {new Date(patientGroup.fechaUltimaEvaluacion).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Button
                          as={Link}
                          to={`/student/informe-completo/${patientGroup.paciente.id}`}
                          className="bg-white text-blue-600 hover:bg-blue-50 border-white shadow-lg"
                          size="sm"
                        >
                          <i className="fas fa-file-alt mr-2"></i>
                          Ver Informe Completo
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-blue-50 border-b border-blue-200">
                          <tr>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Test
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Puntaje PD
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Puntaje PC
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Errores
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Tiempo
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                              Fecha Test
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {patientGroup.resultados.map((result, resultIndex) => (
                            <tr key={result.id} className={resultIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center">
                                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 ${getTestColor(result.test)}`}>
                                    <i className={getTestIcon(result.test)}></i>
                                  </div>
                                  <div className="text-left">
                                    <div className="text-sm font-medium text-gray-900">{result.test}</div>
                                    <div className="text-xs text-gray-500">{result.testName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-lg font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                  {result.puntajePD}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {result.puntajePC !== 'N/A' ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-1">
                                      {result.puntajePC}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${result.interpretacionBg} ${result.interpretacionColor}`}>
                                      {result.interpretacion}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Pendiente</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm font-medium text-gray-700">{result.errores}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm font-medium text-gray-700">{result.tiempo}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm text-gray-500">{result.fecha}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Results;