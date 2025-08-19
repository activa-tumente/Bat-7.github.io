import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaUsers, FaSearch, FaFilter, FaTh, FaList, FaPlus, FaDownload,
  FaSync, FaTrash, FaEdit, FaEye, FaSpinner, FaUserPlus, FaCalendarAlt,
  FaEnvelope, FaIdCard, FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';

// Components
import LoadingFallback from '../../components/ui/LoadingFallback';
import CandidateCard from '../../components/candidates/CandidateCard';
import CandidateTable from '../../components/candidates/CandidateTable';
import CandidateModal from '../../components/candidates/CandidateModal';
import FilterPanel from '../../components/candidates/FilterPanel';
import BulkActions from '../../components/candidates/BulkActions';
import ExportModal from '../../components/candidates/ExportModal';

// Services
import { services } from '../../components/tabs/candidates/CandidatesConfig';
import useRelatedData from '../../hooks/useRelatedData';

/**
 * Enhanced Candidates Management Page
 * Comprehensive candidate management with advanced features
 */
const Candidates = () => {
  const { user, isAdmin, isPsychologist, loading: authLoading } = useAuth();

  // Load related data
  const { data: institutions, loading: loadingInstitutions } = useRelatedData('getInstitutions');
  const { data: psychologists, loading: loadingPsychologists } = useRelatedData('getPsychologists');

  // Main state
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // View and UI state
  const [viewMode, setViewMode] = useState(() =>
    localStorage.getItem('candidatesViewMode') || 'table'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: { start: '', end: '' },
    evaluationStatus: '',
    institution: '',
    psychologist: '',
    gender: ''
  });

  // Selection and bulk actions
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Sorting
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');

  if (authLoading || loadingInstitutions || loadingPsychologists) {
    return <LoadingFallback message="Cargando..." />;
  }

  // Access control
  if (!isAdmin && !isPsychologist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            Solo los administradores y psicólogos pueden gestionar candidatos.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Load candidates data
  const loadCandidates = useCallback(async (forceRefresh = false) => {
    if (loading && !forceRefresh) return;

    setLoading(true);
    setError(null);

    try {
      const result = await services.get(sortField, sortDirection);
      if (result.error) throw result.error;

      setCandidates(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setError(error);
      toast.error('Error al cargar los candidatos');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection]);

  // Load data on mount and when sorting changes
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('candidatesViewMode', viewMode);
  }, [viewMode]);

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search filter
      const searchMatch = !searchTerm ||
        candidate.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.documento_identidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = !filters.status || candidate.estado === filters.status;

      // Date range filter
      const dateMatch = (!filters.dateRange.start && !filters.dateRange.end) ||
        (candidate.fecha_registro >= filters.dateRange.start &&
         candidate.fecha_registro <= filters.dateRange.end);

      // Evaluation status filter
      const evaluationMatch = !filters.evaluationStatus ||
        candidate.estado_evaluacion === filters.evaluationStatus;

      // Institution filter
      const institutionMatch = !filters.institution ||
        candidate.institucion_id === filters.institution;

      // Psychologist filter
      const psychologistMatch = !filters.psychologist ||
        candidate.psicologo_id === filters.psychologist;

      // Gender filter
      const genderMatch = !filters.gender || candidate.genero === filters.gender;

      return searchMatch && statusMatch && dateMatch && evaluationMatch &&
             institutionMatch && psychologistMatch && genderMatch;
    });
  }, [candidates, searchTerm, filters]);

  // Paginated candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedCandidates(new Set()); // Clear selections when changing view
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      dateRange: { start: '', end: '' },
      evaluationStatus: '',
      institution: '',
      psychologist: '',
      gender: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle candidate selection
  const handleSelectCandidate = (candidateId, selected) => {
    const newSelected = new Set(selectedCandidates);
    if (selected) {
      newSelected.add(candidateId);
    } else {
      newSelected.delete(candidateId);
    }
    setSelectedCandidates(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Handle select all
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedCandidates(new Set(paginatedCandidates.map(c => c.id)));
    } else {
      setSelectedCandidates(new Set());
    }
    setShowBulkActions(selected && paginatedCandidates.length > 0);
  };

  // CRUD Operations
  const handleCreate = () => {
    setCurrentCandidate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (candidate) => {
    setCurrentCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDelete = async (candidate) => {
    if (!window.confirm(`¿Está seguro de eliminar al candidato ${candidate.nombre} ${candidate.apellidos}?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await services.delete(candidate.id);
      if (result.error) throw result.error;

      toast.success('Candidato eliminado correctamente');
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Error al eliminar el candidato');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (candidateData) => {
    try {
      setLoading(true);

      if (currentCandidate) {
        const result = await services.update(currentCandidate.id, candidateData);
        if (result.error) throw result.error;
        toast.success('Candidato actualizado correctamente');
      } else {
        const result = await services.create(candidateData);
        if (result.error) throw result.error;
        toast.success('Candidato creado correctamente');
      }

      setIsModalOpen(false);
      loadCandidates();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Error al guardar el candidato');
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Está seguro de eliminar ${selectedCandidates.size} candidatos seleccionados?`)) {
      return;
    }

    try {
      setLoading(true);
      const deletePromises = Array.from(selectedCandidates).map(id => services.delete(id));
      await Promise.all(deletePromises);

      toast.success(`${selectedCandidates.size} candidatos eliminados correctamente`);
      setSelectedCandidates(new Set());
      setShowBulkActions(false);
      loadCandidates();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Error al eliminar los candidatos seleccionados');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const updatePromises = Array.from(selectedCandidates).map(id =>
        services.update(id, { estado: newStatus })
      );
      await Promise.all(updatePromises);

      toast.success(`Estado actualizado para ${selectedCandidates.size} candidatos`);
      setSelectedCandidates(new Set());
      setShowBulkActions(false);
      loadCandidates();
    } catch (error) {
      console.error('Error in bulk status change:', error);
      toast.error('Error al actualizar el estado de los candidatos');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = (format, selectedOnly = false) => {
    const dataToExport = selectedOnly ?
      candidates.filter(c => selectedCandidates.has(c.id)) :
      filteredCandidates;

    if (format === 'csv') {
      exportToCSV(dataToExport);
    } else if (format === 'pdf') {
      exportToPDF(dataToExport);
    }
  };

  const exportToCSV = (data) => {
    const headers = ['Nombre', 'Apellidos', 'Documento', 'Email', 'Teléfono', 'Estado', 'Fecha Registro'];
    const csvContent = [
      headers.join(','),
      ...data.map(candidate => [
        candidate.nombre,
        candidate.apellidos,
        candidate.documento_identidad,
        candidate.email,
        candidate.telefono,
        candidate.estado,
        candidate.fecha_registro
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data) => {
    // This would require a PDF library like jsPDF
    toast.info('Funcionalidad de exportación a PDF en desarrollo');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Candidatos
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra la información de los candidatos para evaluaciones psicométricas
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <FaUsers className="text-blue-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Candidatos</p>
                  <p className="text-2xl font-bold text-blue-800">{candidates.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Activos</p>
                  <p className="text-2xl font-bold text-green-800">
                    {candidates.filter(c => c.estado === 'activo').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <FaClock className="text-yellow-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {candidates.filter(c => c.estado === 'pendiente').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <FaCalendarAlt className="text-orange-600 text-xl mr-3" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Este Mes</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {candidates.filter(c => {
                      const candidateDate = new Date(c.fecha_registro);
                      const now = new Date();
                      return candidateDate.getMonth() === now.getMonth() &&
                             candidateDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="mr-2" />
                Filtros
                {Object.values(filters).some(v => v && v !== '') && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </div>

            {/* View Mode and Actions */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('table')}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaList className="mr-2" />
                  Tabla
                </button>
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaTh className="mr-2" />
                  Tarjetas
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Exportar
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => loadCandidates(true)}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              {/* Add New Button */}
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <FaUserPlus className="mr-2" />
                  Nuevo Candidato
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            institutions={institutions}
            psychologists={psychologists}
          />
        )}

        {/* Bulk Actions */}
        {showBulkActions && (
          <BulkActions
            selectedCount={selectedCandidates.size}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onClearSelection={() => {
              setSelectedCandidates(new Set());
              setShowBulkActions(false);
            }}
          />
        )}

        {/* Loading State */}
        {loading && candidates.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <FaSpinner className="animate-spin text-orange-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando candidatos...</p>
              <p className="text-gray-500 text-sm mt-2">Esto puede tardar unos momentos</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {paginatedCandidates.length} de {filteredCandidates.length} candidatos
                {filteredCandidates.length !== candidates.length && (
                  <span className="ml-1">
                    (filtrados de {candidates.length} total)
                  </span>
                )}
              </div>

              {filteredCandidates.length > 0 && (
                <div className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </div>
              )}
            </div>

            {/* Content based on view mode */}
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FaUsers className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {candidates.length === 0 ? 'No hay candidatos registrados' : 'No se encontraron candidatos'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {candidates.length === 0
                    ? 'Comience agregando su primer candidato al sistema'
                    : 'Intente ajustar los filtros de búsqueda'
                  }
                </p>
                {isAdmin && candidates.length === 0 && (
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FaUserPlus className="mr-2" />
                    Agregar Primer Candidato
                  </button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCandidates.map(candidate => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSelect={handleSelectCandidate}
                    isSelected={selectedCandidates.has(candidate.id)}
                    canEdit={isAdmin}
                    institutions={institutions}
                    psychologists={psychologists}
                  />
                ))}
              </div>
            ) : (
              <CandidateTable
                candidates={paginatedCandidates}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={handleSelectCandidate}
                onSelectAll={handleSelectAll}
                selectedCandidates={selectedCandidates}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
                canEdit={isAdmin}
                institutions={institutions}
                psychologists={psychologists}
                loading={loading}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="mr-1" />
                    Anterior
                  </button>

                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <FaChevronRight className="ml-1" />
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {itemsPerPage * (currentPage - 1) + 1} - {Math.min(itemsPerPage * currentPage, filteredCandidates.length)} de {filteredCandidates.length}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <CandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidate={currentCandidate}
          onSave={handleSave}
          institutions={institutions}
          psychologists={psychologists}
          loading={loading}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          totalCount={filteredCandidates.length}
          selectedCount={selectedCandidates.size}
        />
      )}
    </div>
  );
};

export default Candidates;
