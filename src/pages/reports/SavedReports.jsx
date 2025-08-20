import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileAlt, 
  FaDownload, 
  FaEye, 
  FaShare, 
  FaTrash, 
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaChartBar,
  FaPlus
} from 'react-icons/fa';
import { withPsychologistProtection } from '../../hoc/withRoleProtection';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import FilterPanel from './components/FilterPanel';
import ReportCard from './components/ReportCard';

/**
 * Página principal de informes guardados
 * Permite ver, filtrar, buscar y gestionar informes de evaluaciones
 */
const SavedReports = () => {
  const { isAdmin, isPsychologist } = useRoleBasedAccess();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Datos de ejemplo de informes
  const mockReports = [
    {
      id: 'report-001',
      title: 'Evaluación BAT-7 - María González',
      type: 'individual',
      candidateName: 'María González',
      candidateId: 'candidate-001',
      psychologistName: 'Dr. Juan Pérez',
      psychologistId: 'psych-001',
      questionnaireName: 'BAT-7 Evaluación Verbal',
      questionnaireId: 'bat7-verbal',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      status: 'completed',
      score: 78,
      grade: 'B+',
      tags: ['verbal', 'aptitud', 'individual'],
      fileSize: '2.4 MB',
      format: 'PDF',
      shared: false,
      summary: 'Evaluación completa de aptitudes verbales con resultados satisfactorios.',
      category: 'Aptitud Verbal'
    },
    {
      id: 'report-002',
      title: 'Informe Grupal - Evaluación Numérica Q1 2024',
      type: 'group',
      candidateCount: 25,
      psychologistName: 'Dra. Ana Martín',
      psychologistId: 'psych-002',
      questionnaireName: 'BAT-7 Evaluación Numérica',
      questionnaireId: 'bat7-numerical',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-12T16:30:00Z',
      status: 'completed',
      averageScore: 72,
      grade: 'B',
      tags: ['numérico', 'grupal', 'trimestral'],
      fileSize: '5.8 MB',
      format: 'PDF',
      shared: true,
      summary: 'Análisis comparativo de 25 candidatos en evaluación numérica.',
      category: 'Aptitud Numérica'
    },
    {
      id: 'report-003',
      title: 'Evaluación de Personalidad - Carlos Ruiz',
      type: 'individual',
      candidateName: 'Carlos Ruiz',
      candidateId: 'candidate-003',
      psychologistName: 'Dr. Juan Pérez',
      psychologistId: 'psych-001',
      questionnaireName: 'Evaluación de Personalidad',
      questionnaireId: 'personality-test',
      createdAt: '2024-01-08T09:15:00Z',
      updatedAt: '2024-01-08T10:30:00Z',
      status: 'draft',
      score: 85,
      grade: 'A-',
      tags: ['personalidad', 'individual', 'borrador'],
      fileSize: '1.9 MB',
      format: 'PDF',
      shared: false,
      summary: 'Evaluación de características psicológicas y rasgos de personalidad.',
      category: 'Personalidad'
    }
  ];

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        // Aquí harías la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReports(mockReports);
        setFilteredReports(mockReports);
      } catch (error) {
        console.error('Error cargando informes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // Filtrar y buscar informes
  useEffect(() => {
    let filtered = [...reports];

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.psychologistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.questionnaireName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'score':
          aValue = a.score || a.averageScore || 0;
          bValue = b.score || b.averageScore || 0;
          break;
        case 'candidate':
          aValue = a.candidateName?.toLowerCase() || '';
          bValue = b.candidateName?.toLowerCase() || '';
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchTerm, sortBy, sortOrder]);

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleBulkDownload = () => {
    console.log('Descargando informes seleccionados:', selectedReports);
    // Implementar descarga masiva
  };

  const handleBulkDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedReports.length} informes?`)) {
      setReports(prev => prev.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completado',
      draft: 'Borrador',
      processing: 'Procesando',
      error: 'Error'
    };
    return labels[status] || 'Desconocido';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando informes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Informes Guardados</h1>
              <p className="text-gray-600 mt-2">
                Gestiona y revisa todos los informes de evaluaciones
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to="/reports/create"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Nuevo Informe
              </Link>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFileAlt className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Informes</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaChartBar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaUser className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Individuales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.type === 'individual').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaShare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Compartidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.shared).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Búsqueda */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar informes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-4">
              {/* Ordenamiento */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Más recientes</option>
                <option value="date-asc">Más antiguos</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="score-desc">Mayor puntuación</option>
                <option value="score-asc">Menor puntuación</option>
                <option value="candidate-asc">Candidato A-Z</option>
              </select>

              {/* Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 border rounded-md text-sm ${
                  showFilters 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Filtros
              </button>

              {/* Acciones masivas */}
              {selectedReports.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDownload}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700"
                  >
                    <FaDownload className="h-4 w-4 mr-1" />
                    Descargar ({selectedReports.length})
                  </button>
                  {isAdmin && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center px-3 py-2 text-red-600 hover:text-red-700"
                    >
                      <FaTrash className="h-4 w-4 mr-1" />
                      Eliminar ({selectedReports.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <FilterPanel
                reports={reports}
                onFilterChange={(filters) => {
                  // Implementar lógica de filtros
                  console.log('Filtros aplicados:', filters);
                }}
              />
            </div>
          )}
        </div>

        {/* Lista de informes */}
        <div className="space-y-4">
          {/* Header de selección */}
          {filteredReports.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Seleccionar todos ({filteredReports.length} informes)
                </label>
              </div>
            </div>
          )}

          {/* Informes */}
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedReports.includes(report.id)}
                onSelect={handleSelectReport}
                onView={(id) => window.open(`/reports/view/${id}`, '_blank')}
                onDownload={(id) => console.log('Descargar informe:', id)}
                onShare={(id) => console.log('Compartir informe:', id)}
                onDelete={isAdmin ? (id) => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar este informe?')) {
                    setReports(prev => prev.filter(r => r.id !== id));
                    setSelectedReports(prev => prev.filter(reportId => reportId !== id));
                  }
                } : null}
                showActions={true}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron informes
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros.'
                  : 'Aún no tienes informes guardados. Crea tu primer informe.'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/reports/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Crear Primer Informe
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Paginación (si es necesaria) */}
        {filteredReports.length > 20 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600">
                Mostrando {Math.min(20, filteredReports.length)} de {filteredReports.length} informes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withPsychologistProtection(SavedReports);
