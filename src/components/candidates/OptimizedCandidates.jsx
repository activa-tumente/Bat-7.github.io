import React, { useEffect, useMemo, useCallback } from 'react';
import { useEntityCRUD } from '../../hooks/useEntityCRUD';
import { useFiltering } from '../../hooks/useFiltering';
import { usePagination } from '../../hooks/usePagination';
import { useSelection } from '../../hooks/useSelection';
import { candidateService } from '../../services/candidateService';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { useToast } from '../../hooks/useToast';

// Separate components for better organization
import CandidatesHeader from './CandidatesHeader';
import CandidatesFilters from './CandidatesFilters';
import CandidatesList from './CandidatesList';
import CandidatesPagination from './CandidatesPagination';
import CandidatesBulkActions from './CandidatesBulkActions';
import CandidateModal from './CandidateModal';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Optimized Candidates component using custom hooks and component decomposition
 * Demonstrates best practices for large component refactoring
 */
const OptimizedCandidates = () => {
  const { isAdmin, isPsicologo } = useRoleBasedAccess();
  const { showToast } = useToast();

  // Entity CRUD operations
  const {
    entities: candidates,
    loading,
    error,
    operationLoading,
    fetchEntities: fetchCandidates,
    createEntity: createCandidate,
    updateEntity: updateCandidate,
    deleteEntity: deleteCandidate,
    bulkDeleteEntities: bulkDeleteCandidates,
    clearError
  } = useEntityCRUD('candidate', candidateService);

  // Filtering and search
  const {
    filteredData: filteredCandidates,
    filters,
    searchTerm,
    updateFilter,
    updateSearchTerm,
    clearFilters,
    hasActiveFilters,
    filterSummary
  } = useFiltering(candidates, {}, {
    searchFields: ['nombre', 'email', 'telefono', 'institucion'],
    debounceMs: 300
  });

  // Pagination
  const {
    paginatedData: paginatedCandidates,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    changePageSize,
    paginationInfo,
    isPaginationNeeded
  } = usePagination(filteredCandidates, {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  });

  // Selection for bulk operations
  const {
    selectedIds,
    selectedItems,
    selectedCount,
    hasSelections,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    isAllSelected,
    isPartiallySelected
  } = useSelection(paginatedCandidates, {
    idField: 'id'
  });

  // Modal and dialog state
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit' | 'view'
    candidate: null
  });

  const [confirmDialog, setConfirmDialog] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // View mode state
  const [viewMode, setViewMode] = React.useState(
    localStorage.getItem('candidatesViewMode') || 'table'
  );

  // Load candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('candidatesViewMode', viewMode);
  }, [viewMode]);

  // Modal handlers
  const openModal = useCallback((mode, candidate = null) => {
    setModalState({ isOpen: true, mode, candidate });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: 'create', candidate: null });
  }, []);

  // CRUD handlers
  const handleCreate = useCallback(async (candidateData) => {
    try {
      await createCandidate(candidateData);
      showToast('Candidate created successfully', 'success');
      closeModal();
    } catch (error) {
      showToast('Failed to create candidate', 'error');
    }
  }, [createCandidate, showToast, closeModal]);

  const handleUpdate = useCallback(async (id, updates) => {
    try {
      await updateCandidate(id, updates);
      showToast('Candidate updated successfully', 'success');
      closeModal();
    } catch (error) {
      showToast('Failed to update candidate', 'error');
    }
  }, [updateCandidate, showToast, closeModal]);

  const handleDelete = useCallback((candidate) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Candidate',
      message: `Are you sure you want to delete ${candidate.nombre}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteCandidate(candidate.id);
          showToast('Candidate deleted successfully', 'success');
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        } catch (error) {
          showToast('Failed to delete candidate', 'error');
        }
      }
    });
  }, [deleteCandidate, showToast]);

  const handleBulkDelete = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Selected Candidates',
      message: `Are you sure you want to delete ${selectedCount} candidates? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await bulkDeleteCandidates(selectedIds);
          showToast(`${selectedCount} candidates deleted successfully`, 'success');
          clearSelection();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        } catch (error) {
          showToast('Failed to delete candidates', 'error');
        }
      }
    });
  }, [bulkDeleteCandidates, selectedIds, selectedCount, clearSelection, showToast]);

  // Export handlers
  const handleExport = useCallback(async (format = 'csv') => {
    try {
      const dataToExport = hasSelections ? selectedItems : filteredCandidates;
      await candidateService.exportCandidates(dataToExport, format);
      showToast(`Candidates exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to export candidates', 'error');
    }
  }, [hasSelections, selectedItems, filteredCandidates, showToast]);

  // Memoized computed values
  const stats = useMemo(() => ({
    total: candidates.length,
    filtered: filteredCandidates.length,
    selected: selectedCount,
    active: candidates.filter(c => c.estado === 'activo').length
  }), [candidates.length, filteredCandidates.length, selectedCount, candidates]);

  // Access control
  const canCreate = isAdmin || isPsicologo;
  const canEdit = isAdmin || isPsicologo;
  const canDelete = isAdmin;
  const canBulkDelete = isAdmin && hasSelections;

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading candidates..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <CandidatesHeader
        stats={stats}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateClick={() => openModal('create')}
        onRefresh={fetchCandidates}
        canCreate={canCreate}
        loading={loading}
      />

      {/* Error display */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={clearError}
          className="mb-4"
        />
      )}

      {/* Filters */}
      <CandidatesFilters
        searchTerm={searchTerm}
        filters={filters}
        onSearchChange={updateSearchTerm}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filterSummary={filterSummary}
        resultCount={filteredCandidates.length}
      />

      {/* Bulk actions */}
      {hasSelections && (
        <CandidatesBulkActions
          selectedCount={selectedCount}
          onBulkDelete={handleBulkDelete}
          onExport={handleExport}
          onClearSelection={clearSelection}
          canDelete={canBulkDelete}
          loading={operationLoading.delete}
        />
      )}

      {/* Candidates list */}
      <CandidatesList
        candidates={paginatedCandidates}
        viewMode={viewMode}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        isPartiallySelected={isPartiallySelected}
        onSelectionChange={toggleSelection}
        onSelectAll={toggleSelectAll}
        onEdit={(candidate) => openModal('edit', candidate)}
        onView={(candidate) => openModal('view', candidate)}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
        loading={loading}
      />

      {/* Pagination */}
      {isPaginationNeeded && (
        <CandidatesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          paginationInfo={paginationInfo}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      )}

      {/* Modal */}
      <CandidateModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        candidate={modalState.candidate}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        loading={operationLoading.create || operationLoading.update}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
        loading={operationLoading.delete}
      />
    </div>
  );
};

export default React.memo(OptimizedCandidates);