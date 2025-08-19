import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';
import ReportManagementService from '../../services/ReportManagementService';
import PatientSearchService from '../../services/PatientSearchService';
import BatchReportService from '../../services/BatchReportService';
import PageHeader from '../../components/ui/PageHeader';
import { FaChartBar, FaSearch, FaList } from 'react-icons/fa';
import PatientCard from '../../components/reports/PatientCard';
import PatientSearchForm from '../../components/reports/PatientSearchForm';
import PatientSearchResults from '../../components/reports/PatientSearchResults';
import InformeModalProfessional from '../../components/reports/InformeModalProfessional';

const Reports = () => {
  // Original states
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAptitude, setSelectedAptitude] = useState('');
  const [aptitudes, setAptitudes] = useState([]);
  const [expandedPatients, setExpandedPatients] = useState(new Set());

  // New search functionality states
  const [activeView, setActiveView] = useState('list'); // 'list' | 'search'
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  console.log('Reports component rendered');

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchResults();
    fetchAptitudes();
  }, []);

  // Función para obtener todas las aptitudes
  const fetchAptitudes = async () => {
    try {
      const { data, error } = await supabase
        .from('aptitudes')
        .select('*')
        .order('codigo');

      if (error) throw error;
      setAptitudes(data || []);
    } catch (error) {
      console.error('Error al cargar aptitudes:', error);
      toast.error('Error al cargar las aptitudes');
    }
  };

  // Función para obtener todos los resultados y agruparlos por paciente
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
        toast.error('Error al cargar los resultados');
        return;
      }

      // Debug: Log raw results to identify duplicates
      console.log('📊 Raw results from database:', resultados.length);
      console.log('📋 Sample results:', resultados.slice(0, 3).map(r => ({
        id: r.id,
        paciente: r.pacientes?.nombre,
        aptitud: r.aptitudes?.codigo,
        fecha: r.created_at
      })));

      // Eliminar duplicados manteniendo solo el resultado más reciente por paciente+aptitud
      // Usar Map para mejor performance y manejo de duplicados
      const uniqueResultsMap = new Map();

      resultados.forEach(resultado => {
        const key = `${resultado.pacientes?.id}-${resultado.aptitudes?.codigo}`;

        if (!resultado.pacientes?.id || !resultado.aptitudes?.codigo) {
          console.warn('⚠️ Resultado con datos incompletos:', resultado.id);
          return; // Skip resultados con datos incompletos
        }

        const existing = uniqueResultsMap.get(key);

        if (!existing || new Date(resultado.created_at) > new Date(existing.created_at)) {
          if (existing) {
            console.log(`🔄 Replacing duplicate for ${resultado.pacientes?.nombre} - ${resultado.aptitudes?.codigo}:`, {
              old: { id: existing.id, fecha: existing.created_at },
              new: { id: resultado.id, fecha: resultado.created_at }
            });
          }
          uniqueResultsMap.set(key, resultado);
        }
      });

      const deduplicatedResults = Array.from(uniqueResultsMap.values());
      console.log('🔄 After deduplication:', deduplicatedResults.length);
      console.log('📋 Deduplicated sample:', deduplicatedResults.slice(0, 3).map(r => ({
        id: r.id,
        paciente: r.pacientes?.nombre,
        aptitud: r.aptitudes?.codigo,
        fecha: r.created_at
      })));

      // Agrupar los resultados por paciente
      const groupedByPatient = deduplicatedResults.reduce((acc, resultado) => {
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
      toast.error('Error al cargar los resultados');
      setLoading(false);
    }
  };

  // Filtrar pacientes y sus resultados
  const filteredPatients = results.filter(patientGroup => {
    const paciente = patientGroup.paciente;
    const matchesSearch = !searchTerm ||
      (paciente?.nombre && paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paciente?.apellido && paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (paciente?.documento && paciente.documento.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Si hay un filtro de aptitud, verificar si el paciente tiene al menos un resultado para esa aptitud
    if (selectedAptitude) {
      return patientGroup.resultados.some(result => result.test === selectedAptitude);
    }
    return true; // Si no hay filtro de aptitud, incluir al paciente si coincide con la búsqueda
  });



  const expandAllPatients = () => {
    const allPatientIds = new Set(filteredPatients.map(p => p.paciente.id));
    setExpandedPatients(allPatientIds);
  };

  const collapseAllPatients = () => {
    setExpandedPatients(new Set());
  };

  // New search functionality
  const handleSearch = async (filters, pagination = { page: 1, limit: 20 }) => {
    try {
      setSearchLoading(true);
      const results = await PatientSearchService.searchPatients(filters, pagination);
      setSearchResults({
        ...results,
        currentFilters: filters
      });
    } catch (error) {
      console.error('Error in search:', error);
      toast.error('Error en la búsqueda: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (searchResults?.currentFilters) {
      await handleSearch(searchResults.currentFilters, { 
        page: newPage, 
        limit: 20 
      });
    }
  };

  const handlePatientSelection = (selectedIds) => {
    setSelectedPatients(selectedIds);
  };

  const handleBatchGenerate = async (patientIds) => {
    if (!patientIds || patientIds.length === 0) {
      toast.warning('Selecciona al menos un paciente');
      return;
    }

    try {
      setBatchProcessing(true);
      setBatchProgress({ current: 0, total: patientIds.length, percentage: 0 });

      const results = await BatchReportService.generateBatchReports(
        patientIds,
        (progress) => {
          setBatchProgress(progress);
        }
      );

      setBatchProgress(null);
      
      if (results.successful.length > 0) {
        toast.success(`${results.successful.length} informe(s) generado(s) exitosamente`);
      }
      
      if (results.failed.length > 0) {
        toast.warning(`${results.failed.length} informe(s) fallaron al generarse`);
        console.warn('Failed reports:', results.failed);
      }

      // Clear selection
      setSelectedPatients([]);
      
    } catch (error) {
      console.error('Error in batch generation:', error);
      toast.error('Error en la generación masiva: ' + error.message);
    } finally {
      setBatchProcessing(false);
      setBatchProgress(null);
    }
  };

  const handleBatchDelete = async (patientIds) => {
    if (!patientIds || patientIds.length === 0) {
      toast.warning('Selecciona al menos un paciente');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar los informes de ${patientIds.length} paciente(s) seleccionado(s)?`)) {
      return;
    }

    try {
      const result = await ReportManagementService.batchDeleteReports(patientIds);
      
      if (result.success) {
        toast.success(result.message);
        // Clear selection and refresh results
        setSelectedPatients([]);
        if (activeView === 'search' && searchResults) {
          await handleSearch(searchResults.currentFilters);
        } else {
          await fetchResults();
        }
      } else {
        toast.warning(result.message);
      }
      
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast.error('Error en la eliminación masiva');
    }
  };

  const handleViewPatient = (patientId) => {
    // Find patient in current results
    let patient = null;
    let results = [];

    if (activeView === 'search' && searchResults) {
      const searchPatient = searchResults.patients.find(p => p.id === patientId);
      if (searchPatient) {
        patient = searchPatient;
        results = searchPatient.resultados || [];
      }
    } else {
      const patientGroup = filteredPatients.find(p => p.paciente.id === patientId);
      if (patientGroup) {
        patient = patientGroup.paciente;
        results = patientGroup.resultados.map(r => ({
          id: r.id,
          aptitudes: { codigo: r.test, nombre: r.testName },
          puntaje_directo: r.puntajePD,
          percentil: r.puntajePC,
          puntaje_pc: r.puntajePC,
          errores: r.errores,
          tiempo_segundos: r.tiempo,
          created_at: r.fecha,
          test: r.test
        }));
      }
    }

    if (patient && results.length > 0) {
      setCurrentReport({ patient, results });
      setShowReportModal(true);
    } else {
      toast.warning('No se encontraron datos del paciente');
    }
  };



  const handleDeleteReport = async (patientId, deleteType = 'all') => {
    try {
      // Use the new ReportManagementService for selective deletion
      const result = await ReportManagementService.deletePatientReports(patientId, deleteType);
      
      if (result.success) {
        toast.success(result.message);
        // Reload data
        if (activeView === 'search' && searchResults) {
          // Refresh search results
          await handleSearch(searchResults.currentFilters);
        } else {
          await fetchResults();
        }
      } else {
        toast.warning(result.message);
      }
      
    } catch (error) {
      console.error('Error en handleDeleteReport:', error);
      toast.error('Error al eliminar los registros');
    }
  };



  return (
    <div>
      {/* Header Section with View Toggle */}
      <PageHeader
        title="Gestión de Informes BAT-7"
        subtitle="Busca pacientes, genera informes individuales o masivos, y gestiona reportes"
        icon={FaChartBar}
      />

      <div className="container mx-auto px-4 py-8">
        
        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
            <Button
              onClick={() => setActiveView('list')}
              variant={activeView === 'list' ? 'primary' : 'outline'}
              size="sm"
              className="flex items-center"
            >
              <FaList className="mr-2" />
              Vista Lista
            </Button>
            <Button
              onClick={() => setActiveView('search')}
              variant={activeView === 'search' ? 'primary' : 'outline'}
              size="sm"
              className="flex items-center"
            >
              <FaSearch className="mr-2" />
              Búsqueda Avanzada
            </Button>
          </div>
        </div>

        {/* Batch Processing Progress */}
        {batchProcessing && batchProgress && (
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Procesando informes en lote...
                </span>
                <span className="text-sm text-gray-500">
                  {batchProgress.current} de {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percentage}%` }}
                ></div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Search View */}
        {activeView === 'search' && (
          <div className="space-y-6">
            <PatientSearchForm 
              onSearch={handleSearch}
              onStatsUpdate={(stats) => console.log('Search stats:', stats)}
            />
            
            <PatientSearchResults
              searchResults={searchResults}
              isLoading={searchLoading}
              selectedPatients={selectedPatients}
              onSelectionChange={handlePatientSelection}
              onBatchGenerate={handleBatchGenerate}
              onBatchDelete={handleBatchDelete}
              onViewPatient={handleViewPatient}
              onPageChange={handlePageChange}
              onPatientSelect={(patient) => {
                setCurrentReport({ patient, results: patient.resultados || [] });
                setShowReportModal(true);
              }}
            />
          </div>
        )}

        {/* List View (Original) */}
        {activeView === 'list' && (
          <div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-filter mr-2 text-blue-600"></i>
            Filtros de Búsqueda
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda por paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Paciente
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre, apellido o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Filtro por aptitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Test
              </label>
              <select
                value={selectedAptitude}
                onChange={(e) => setSelectedAptitude(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tests</option>
                {aptitudes.map((aptitude) => (
                  <option key={aptitude.id} value={aptitude.codigo}>
                    {aptitude.codigo} - {aptitude.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estadísticas Generales Sincronizadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.reduce((total, patient) => 
                total + patient.resultados.filter(r => 
                  r.puntajePD !== null && r.puntajePD !== undefined && 
                  r.puntajePC !== null && r.puntajePC !== undefined && r.puntajePC !== 'N/A'
                ).length, 0
              )}
            </div>
            <div className="text-sm text-gray-600">Resultados Válidos</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.filter(patient => patient.resultados.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Pacientes con Tests</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                const aptitudesContestadas = new Set();
                results.forEach(patient => {
                  patient.resultados.forEach(r => {
                    if (r.test && r.puntajePD !== null && r.puntajePD !== undefined) {
                      aptitudesContestadas.add(r.test);
                    }
                  });
                });
                return aptitudesContestadas.size;
              })()}
            </div>
            <div className="text-sm text-gray-600">Aptitudes Contestadas</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(() => {
                const validResults = results.reduce((acc, patient) => {
                  const validPatientResults = patient.resultados.filter(r => 
                    r.puntajePC !== null && r.puntajePC !== undefined && r.puntajePC !== 'N/A' && typeof r.puntajePC === 'number'
                  );
                  return acc.concat(validPatientResults);
                }, []);
                
                if (validResults.length === 0) return 0;
                
                const totalPC = validResults.reduce((sum, r) => sum + r.puntajePC, 0);
                return Math.round(totalPC / validResults.length);
              })()}
            </div>
            <div className="text-sm text-gray-600">Promedio PC</div>
          </CardBody>
        </Card>
      </div>

      {/* Resultados por Paciente */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-800">
            <i className="fas fa-chart-line mr-3 text-blue-600"></i>
            Resultados Detallados
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} con resultados
          </p>
        </div>

        {/* Controles del Acordeón */}
        {filteredPatients.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 mr-2">
              {expandedPatients.size} de {filteredPatients.length} expandidos
            </div>
            <Button
              onClick={expandAllPatients}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <i className="fas fa-expand-arrows-alt mr-2"></i>
              Expandir Todo
            </Button>
            <Button
              onClick={collapseAllPatients}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <i className="fas fa-compress-arrows-alt mr-2"></i>
              Contraer Todo
            </Button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando resultados...</p>
        </div>
      ) : (
        <>
          {filteredPatients.length === 0 ? (
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
            <div className="grid grid-cols-1 gap-4">
              {filteredPatients.map((patientGroup) => (
                <PatientCard
                  key={patientGroup.paciente.id}
                  patient={{
                    id: patientGroup.paciente.id,
                    nombre: patientGroup.paciente.nombre,
                    apellido: patientGroup.paciente.apellido,
                    documento: patientGroup.paciente.documento,
                    genero: patientGroup.paciente.genero
                  }}
                  results={patientGroup.resultados.map(result => ({
                    id: result.id,
                    aptitudes: {
                      codigo: result.test,
                      nombre: result.testName
                    },
                    puntaje_directo: result.puntajePD,
                    percentil: result.puntajePC,
                    puntaje_pc: result.puntajePC,
                    errores: result.errores,
                    tiempo_segundos: result.tiempo,
                    created_at: result.fecha,
                    test: result.test
                  }))}
                  onGenerate={(reportData) => {
                    console.log('Report generated:', reportData);
                    toast.success('Informe generado exitosamente');
                  }}
                  onView={(patientId) => {
                    console.log(`Viewing report for patient ${patientId}`);
                    toast.info('Funcionalidad de ver reporte disponible en el botón "Ver" de cada tarjeta');
                  }}
                  onDelete={handleDeleteReport}
                />
              ))}
            </div>
          )}
        </>
      )}
        </div>
        )}

        {/* Report Modal */}
        {showReportModal && currentReport && (
          <InformeModalProfessional
            isOpen={showReportModal}
            onClose={() => {
              setShowReportModal(false);
              setCurrentReport(null);
            }}
            patient={currentReport.patient}
            results={currentReport.results}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;