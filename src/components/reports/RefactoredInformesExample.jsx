/**
 * @file RefactoredInformesExample.jsx
 * @description Example implementation showing how to use the refactored components together
 * This demonstrates the improved architecture with better separation of concerns
 */

import React, { useState, useCallback, useMemo } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import InformesTable from './InformesTable';
import { useInformesData } from '../../hooks/useInformesData';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../ui/Button';
import { FaPlus, FaDownload, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

/**
 * Search and filter component
 */
const InformesFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch,
  totalCount,
  selectedCount 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por paciente o título..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Buscar informes"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Stats and actions */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {totalCount} informe{totalCount !== 1 ? 's' : ''}
            {selectedCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Bulk actions component
 */
const BulkActions = ({ selectedCount, onBulkDelete, onBulkExport, disabled }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} informe{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <FaDownload className="w-4 h-4" />
            Exportar
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main refactored component
 */
const RefactoredInformesExample = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInformes, setSelectedInformes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounced search to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Data fetching with custom hook
  const {
    informes,
    loading,
    error,
    totalCount,
    totalPages,
    refetch,
    deleteInforme,
    deleteBulkInformes
  } = useInformesData({
    page: currentPage,
    search: debouncedSearchTerm,
    pageSize: 20
  });

  // Memoized calculations
  const selectedCount = selectedInformes.size;
  const allSelected = informes.length > 0 && selectedCount === informes.length;
  const someSelected = selectedCount > 0 && selectedCount < informes.length;

  // Event handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleToggleSelection = useCallback((informeId) => {
    setSelectedInformes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(informeId)) {
        newSet.delete(informeId);
      } else {
        newSet.add(informeId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedInformes(new Set(informes.map(informe => informe.id)));
  }, [informes]);

  const handleDeselectAll = useCallback(() => {
    setSelectedInformes(new Set());
  }, []);

  const handleViewInforme = useCallback((informe) => {
    // Navigate to informe view
    console.log('Viewing informe:', informe.id);
    toast.success(`Abriendo informe: ${informe.titulo}`);
  }, []);

  const handleDeleteInforme = useCallback(async (informeId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este informe?')) {
      try {
        await deleteInforme(informeId);
        setSelectedInformes(prev => {
          const newSet = new Set(prev);
          newSet.delete(informeId);
          return newSet;
        });
        toast.success('Informe eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el informe');
      }
    }
  }, [deleteInforme]);

  const handleViewChart = useCallback((informe) => {
    // Navigate to chart view
    console.log('Viewing chart for informe:', informe.id);
    toast.success(`Abriendo gráfico: ${informe.titulo}`);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const count = selectedCount;
    if (window.confirm(`¿Está seguro de que desea eliminar ${count} informe${count !== 1 ? 's' : ''}?`)) {
      try {
        await deleteBulkInformes(Array.from(selectedInformes));
        setSelectedInformes(new Set());
        toast.success(`${count} informe${count !== 1 ? 's' : ''} eliminado${count !== 1 ? 's' : ''} correctamente`);
      } catch (error) {
        toast.error('Error al eliminar los informes');
      }
    }
  }, [selectedCount, selectedInformes, deleteBulkInformes]);

  const handleBulkExport = useCallback(() => {
    // Export selected informes
    console.log('Exporting informes:', Array.from(selectedInformes));
    toast.success(`Exportando ${selectedCount} informe${selectedCount !== 1 ? 's' : ''}...`);
  }, [selectedInformes, selectedCount]);

  // Error handling
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar informes</h3>
        <p className="text-red-700 mb-4">{error.message}</p>
        <Button onClick={refetch} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informes Generados</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y visualiza los informes de evaluación generados
            </p>
          </div>
          
          <Button className="flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Nuevo Informe
          </Button>
        </div>

        {/* Filters */}
        <InformesFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          totalCount={totalCount}
          selectedCount={selectedCount}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedCount}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          disabled={loading}
        />

        {/* Table */}
        <InformesTable
          informes={informes}
          selectedInformes={selectedInformes}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onViewInforme={handleViewInforme}
          onDeleteInforme={handleDeleteInforme}
          onViewChart={handleViewChart}
          isLoading={loading}
          searchTerm={debouncedSearchTerm}
          onClearSearch={handleClearSearch}
          height={600}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default RefactoredInformesExample;