/**
 * @file InformesGenerados.jsx
 * @description Componente para mostrar todos los informes generados con diseño visual estético
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import supabase from '../../api/supabaseClient';
import InformeViewer from './InformeViewer';
import GraficoResultados from '../graficos/GraficoResultados';
import InformesService from '../../services/InformesService';

const InformesGenerados = () => {
  const [informesGenerados, setInformesGenerados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [informeViendose, setInformeViendose] = useState(null);
  const [expandedPatients, setExpandedPatients] = useState(new Set());
  const [graficoViendose, setGraficoViendose] = useState(null);
  const [selectedInformes, setSelectedInformes] = useState(new Set());

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 informes por página

  useEffect(() => {
    cargarInformesGenerados();
    
    // Escuchar eventos de informes generados
    const handleInformesGenerados = (event) => {
      const { count, timestamp, source } = event.detail || {};
      console.log(`📢 [InformesGenerados] Evento recibido: ${count} nuevos informes generados desde ${source} (${timestamp})`);
      console.log('🔄 [InformesGenerados] Recargando lista de informes...');
      
      // Recargar inmediatamente
      cargarInformesGenerados();
      
      // Recargar adicional después de un delay para asegurar consistencia
      setTimeout(() => {
        console.log('🔄 [InformesGenerados] Recarga adicional para asegurar consistencia...');
        cargarInformesGenerados();
      }, 2000);
    };
    
    window.addEventListener('informesGenerados', handleInformesGenerados);
    
    return () => {
      window.removeEventListener('informesGenerados', handleInformesGenerados);
    };
  }, []);

  const cargarInformesGenerados = async () => {
    try {
      setLoading(true);
      console.log('📋 [InformesGenerados] Cargando todos los informes generados...');

      // Obtener TODOS los informes generados
      const { data: informes, error: errorInformes } = await supabase
        .from('informes_generados')
        .select(`
          id,
          titulo,
          descripcion,
          fecha_generacion,
          metadatos,
          contenido,
          pacientes:paciente_id (
            id,
            nombre,
            apellido,
            documento,
            genero
          )
        `)
        .eq('tipo_informe', 'completo')
        .eq('estado', 'generado')
        .order('fecha_generacion', { ascending: false });

      if (errorInformes) throw errorInformes;

      // Obtener resultados detallados para cada paciente
      const informesConDetalles = await Promise.all(
        (informes || []).map(async (informe) => {
          const { data: resultados, error: errorResultados } = await supabase
            .from('resultados')
            .select(`
              id,
              puntaje_directo,
              percentil,
              errores,
              tiempo_segundos,
              concentracion,
              created_at,
              aptitudes:aptitud_id (
                codigo,
                nombre,
                descripcion
              )
            `)
            .eq('paciente_id', informe.pacientes.id)
            .not('puntaje_directo', 'is', null)
            .not('percentil', 'is', null)
            .order('created_at', { ascending: false });

          if (errorResultados) {
            console.error('Error obteniendo resultados para', informe.pacientes.nombre, errorResultados);
            return { ...informe, resultados: [] };
          }

          // Calcular estadísticas detalladas
          const estadisticas = {
            totalTests: resultados.length,
            promedioPC: Math.round(resultados.reduce((sum, r) => sum + r.percentil, 0) / resultados.length),
            promedioPD: Math.round(resultados.reduce((sum, r) => sum + r.puntaje_directo, 0) / resultados.length),
            aptitudesAltas: resultados.filter(r => r.percentil >= 75).length,
            aptitudesBajas: resultados.filter(r => r.percentil <= 25).length,
            totalErrores: resultados.reduce((sum, r) => sum + (r.errores || 0), 0),
            aptitudesEvaluadas: [...new Set(resultados.map(r => r.aptitudes.codigo))],
            aptitudMasAlta: resultados.reduce((max, r) => r.percentil > max.percentil ? r : max, resultados[0] || {}),
            aptitudMasBaja: resultados.reduce((min, r) => r.percentil < min.percentil ? r : min, resultados[0] || {})
          };

          return {
            ...informe,
            resultados,
            estadisticas
          };
        })
      );

      console.log('✅ [InformesGenerados] Informes con detalles cargados:', informesConDetalles.length);
      setInformesGenerados(informesConDetalles);

    } catch (error) {
      console.error('❌ [InformesGenerados] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verInforme = (informeId) => {
    setInformeViendose(informeId);
  };

  const togglePatientExpansion = (pacienteId) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(pacienteId)) {
      newExpanded.delete(pacienteId);
    } else {
      newExpanded.add(pacienteId);
    }
    setExpandedPatients(newExpanded);
  };

  const formatTiempo = (segundos) => {
    if (!segundos) return 'N/A';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${String(segs).padStart(2, '0')}`;
  };

  // Función para obtener nivel aptitudinal según nueva escala
  const getNivelAptitudinal = (percentil) => {
    if (percentil >= 98) return {
      nivel: 'Muy alto',
      text: 'text-purple-700',
      bg: 'bg-purple-100',
      interpretacion: 'Rendimiento excepcional, superior al 98% del grupo normativo.'
    };
    if (percentil >= 85) return {
      nivel: 'Alto',
      text: 'text-green-700',
      bg: 'bg-green-100',
      interpretacion: 'Rendimiento claramente por encima de la media.'
    };
    if (percentil >= 70) return {
      nivel: 'Medio-alto',
      text: 'text-blue-700',
      bg: 'bg-blue-100',
      interpretacion: 'Rendimiento ligeramente superior a la media.'
    };
    if (percentil >= 31) return {
      nivel: 'Medio',
      text: 'text-gray-700',
      bg: 'bg-gray-100',
      interpretacion: 'Rendimiento dentro del rango promedio.'
    };
    if (percentil >= 16) return {
      nivel: 'Medio-bajo',
      text: 'text-yellow-700',
      bg: 'bg-yellow-100',
      interpretacion: 'Rendimiento ligeramente inferior a la media.'
    };
    if (percentil >= 3) return {
      nivel: 'Bajo',
      text: 'text-orange-700',
      bg: 'bg-orange-100',
      interpretacion: 'Rendimiento claramente por debajo de la media.'
    };
    return {
      nivel: 'Muy bajo',
      text: 'text-red-700',
      bg: 'bg-red-100',
      interpretacion: 'Rendimiento críticamente bajo, requiere atención especial.'
    };
  };

  const generarInforme = async (pacienteId, nombrePaciente) => {
    if (!confirm(`¿Generar nuevo informe para ${nombrePaciente}?`)) {
      return;
    }

    try {
      console.log('📄 [InformesGenerados] Generando informe para:', pacienteId);

      // Generar informe usando el servicio
      const informeData = await InformesService.generarInformeCompleto(pacienteId);
      
      if (!informeData) {
        throw new Error('No se pudo generar el informe');
      }

      console.log('✅ [InformesGenerados] Informe generado exitosamente');
      alert(`Informe generado exitosamente para ${nombrePaciente}`);

      // Recargar la lista
      await cargarInformesGenerados();

    } catch (error) {
      console.error('❌ [InformesGenerados] Error generando informe:', error);
      alert('Error generando informe: ' + error.message);
    }
  };

  const eliminarInforme = async (informeId, nombrePaciente) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el informe de ${nombrePaciente}?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .eq('id', informeId);

      if (error) throw error;

      console.log('✅ [InformesGenerados] Informe eliminado:', informeId);
      alert(`Informe de ${nombrePaciente} eliminado exitosamente.`);

      const newSelection = new Set(selectedInformes);
      newSelection.delete(informeId);
      setSelectedInformes(newSelection);

      await cargarInformesGenerados(); // Recargar
    } catch (error) {
      console.error('❌ [InformesGenerados] Error eliminando informe:', error);
      alert('Error al eliminar el informe.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular paginación
  const totalPages = Math.ceil(informesGenerados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const informesPaginados = informesGenerados.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSelectInforme = (informeId) => {
    const newSelection = new Set(selectedInformes);
    if (newSelection.has(informeId)) {
      newSelection.delete(informeId);
    } else {
      newSelection.add(informeId);
    }
    setSelectedInformes(newSelection);
  };

  const handleSelectAll = () => {
    const newSelection = new Set(selectedInformes);
    const pageIds = informesPaginados.map(i => i.id);
    const allOnPageSelected = informesPaginados.length > 0 && pageIds.every(id => newSelection.has(id));

    if (allOnPageSelected) {
      pageIds.forEach(id => newSelection.delete(id));
    } else {
      pageIds.forEach(id => newSelection.add(id));
    }
    setSelectedInformes(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedInformes.size === 0) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedInformes.size} informes seleccionados?`)) {
      return;
    }

    try {
      setLoading(true);
      const idsToDelete = Array.from(selectedInformes);
      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      console.log(`✅ [InformesGenerados] ${idsToDelete.length} informes eliminados.`);
      alert(`${idsToDelete.length} informes eliminados exitosamente.`);
      setSelectedInformes(new Set());
      await cargarInformesGenerados();
    } catch (error) {
      console.error('❌ [InformesGenerados] Error eliminando informes seleccionados:', error);
      alert('Error al eliminar los informes seleccionados.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-semibold">📋 Cargando informes generados...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6 border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={informesPaginados.length > 0 && informesPaginados.every(i => selectedInformes.has(i.id))}
                className="mr-4 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white"
              />
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <i className="fas fa-file-medical-alt text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">Informes Generados</h2>
                <p className="text-blue-100 text-sm">Informes psicométricos disponibles para revisión</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedInformes.size > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2"
                  size="sm"
                >
                  <i className="fas fa-trash-alt"></i>
                  Eliminar ({selectedInformes.size})
                </Button>
              )}
              <Button
                onClick={cargarInformesGenerados}
                disabled={loading}
                className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border-white border-opacity-50"
                size="sm"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                {loading ? 'Cargando...' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {informesPaginados.map((informe) => {
              const paciente = informe.pacientes;
              const estadisticas = informe.estadisticas || {};
              const resultados = informe.resultados || [];
              const isFemale = paciente?.genero === 'femenino';
              const isExpanded = expandedPatients.has(paciente?.id);
              const datosReales = informe.metadatos?.datos_reales === 'true';

              return (
                <div key={informe.id} className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedInformes.has(informe.id)}
                    onChange={() => handleSelectInforme(informe.id)}
                    className="mt-8 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                  />
                  <Card className={`flex-grow overflow-hidden shadow-lg border-2 ${
                    datosReales ? 'border-green-200' : 'border-gray-200'
                  }`}>
                  {/* Header del paciente */}
                  <CardHeader
                    className={`cursor-pointer transition-colors ${
                      isFemale
                        ? 'bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300'
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300'
                    }`}
                    onClick={() => togglePatientExpansion(paciente?.id)}
                  >
                    <div className="flex items-center justify-between">
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
                            ? 'bg-pink-300 border-2 border-pink-200'
                            : 'bg-blue-300 border-2 border-blue-200'
                        }`}>
                          <i className={`fas ${isFemale ? 'fa-venus text-pink-700' : 'fa-mars text-blue-700'} text-xl`}></i>
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
                            Doc: {paciente?.documento} • {estadisticas.totalTests} tests completados
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
                        {/* 1. Botón Generar */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            generarInforme(paciente?.id, `${paciente?.nombre} ${paciente?.apellido}`);
                          }}
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                          size="sm"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Generar
                        </Button>

                        {/* 2. Botón Ver */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            verInforme(informe.id);
                          }}
                          className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600 shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                          size="sm"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          Ver
                        </Button>

                        {/* 3. Botón Eliminar */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarInforme(informe.id, `${paciente?.nombre} ${paciente?.apellido}`);
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

                  {/* Estadísticas resumidas */}
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">{estadisticas.totalTests || 0}</div>
                        <div className="text-xs text-gray-600">Tests</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">{estadisticas.promedioPC || 0}</div>
                        <div className="text-xs text-gray-600">PC Prom</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">{estadisticas.promedioPD || 0}</div>
                        <div className="text-xs text-gray-600">PD Prom</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-yellow-600">{estadisticas.aptitudesAltas || 0}</div>
                        <div className="text-xs text-gray-600">Altas</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-red-600">{estadisticas.totalErrores || 0}</div>
                        <div className="text-xs text-gray-600">Errores</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-2xl font-bold text-indigo-600">{estadisticas.aptitudesEvaluadas?.length || 0}</div>
                        <div className="text-xs text-gray-600">Aptitudes</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 text-center">
                      <strong>Aptitudes evaluadas:</strong> {estadisticas.aptitudesEvaluadas?.join(', ') || 'N/A'}
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <CardBody className="bg-gray-50">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          📊 Resultados Detallados por Test
                        </h4>

                        {/* Tabla de resultados */}
                        <div className="overflow-x-auto">
                          <table className="w-full bg-white rounded-lg shadow">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center">
                                    <i className="fas fa-clipboard-list mr-2"></i>
                                    Test
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <i className="fas fa-bullseye mr-2"></i>
                                    Puntaje PD
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <i className="fas fa-chart-line mr-2"></i>
                                    Puntaje PC
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <i className="fas fa-medal mr-2"></i>
                                    Nivel
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    Errores
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <i className="fas fa-clock mr-2"></i>
                                    Tiempo
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {resultados.map((resultado) => {
                                const nivelAptitudinal = getNivelAptitudinal(resultado.percentil);
                                return (
                                  <tr key={resultado.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                          resultado.aptitudes.codigo === 'E' ? 'bg-purple-100 text-purple-600' :
                                          resultado.aptitudes.codigo === 'A' ? 'bg-red-100 text-red-600' :
                                          resultado.aptitudes.codigo === 'O' ? 'bg-green-100 text-green-600' :
                                          resultado.aptitudes.codigo === 'V' ? 'bg-blue-100 text-blue-600' :
                                          resultado.aptitudes.codigo === 'N' ? 'bg-indigo-100 text-indigo-600' :
                                          resultado.aptitudes.codigo === 'R' ? 'bg-orange-100 text-orange-600' :
                                          resultado.aptitudes.codigo === 'M' ? 'bg-gray-100 text-gray-600' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          <span className="text-sm font-bold">{resultado.aptitudes.codigo}</span>
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{resultado.aptitudes.codigo}</div>
                                          <div className="text-xs text-gray-500">{resultado.aptitudes.nombre}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-lg font-bold text-orange-600">{resultado.puntaje_directo}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-lg font-bold text-blue-600">{resultado.percentil}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${nivelAptitudinal.bg} ${nivelAptitudinal.text}`}>
                                        {nivelAptitudinal.nivel}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-sm font-medium text-gray-600">{resultado.errores || 0}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="text-sm text-gray-600">{formatTiempo(resultado.tiempo_segundos)}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardBody>
                  )}
                </Card>
                </div>
              );
            })}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, informesGenerados.length)} de {informesGenerados.length} informes generados
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                  Anterior
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Visor de informes */}
      {informeViendose && (
        <InformeViewer
          informeId={informeViendose}
          onClose={() => setInformeViendose(null)}
        />
      )}

      {/* Visor de gráficos */}
      {graficoViendose && (
        <GraficoResultados
          paciente={graficoViendose.pacientes}
          resultados={graficoViendose.resultados}
          estadisticas={graficoViendose.estadisticas}
          onClose={() => setGraficoViendose(null)}
        />
      )}
    </>
  );
};

export default InformesGenerados;