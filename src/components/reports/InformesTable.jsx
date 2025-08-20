/**
 * @file InformesTable.jsx
 * @description Optimized table component for displaying informes with virtualization and accessibility
 */

import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { FaEye, FaTrash, FaChartBar, FaCalendarAlt, FaUser, FaFileAlt } from 'react-icons/fa';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Tooltip } from '../ui/Tooltip';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

/**
 * Individual row component for the informes table
 * Memoized to prevent unnecessary re-renders
 */
const InformeRow = memo(({ index, style, data }) => {
  const { 
    informes, 
    selectedInformes, 
    onToggleSelection, 
    onViewInforme, 
    onDeleteInforme, 
    onViewChart,
    isLoading 
  } = data;

  const informe = informes[index];
  const isSelected = selectedInformes.has(informe?.id);
  const isEven = index % 2 === 0;

  const handleToggleSelection = useCallback(() => {
    onToggleSelection(informe.id);
  }, [informe?.id, onToggleSelection]);

  const handleViewInforme = useCallback(() => {
    onViewInforme(informe);
  }, [informe, onViewInforme]);

  const handleDeleteInforme = useCallback(() => {
    onDeleteInforme(informe.id);
  }, [informe?.id, onDeleteInforme]);

  const handleViewChart = useCallback(() => {
    onViewChart(informe);
  }, [informe, onViewChart]);

  if (isLoading || !informe) {
    return (
      <div style={style} className="flex items-center px-4 py-3">
        <LoadingSkeleton className="w-full h-16" />
      </div>
    );
  }

  return (
    <div 
      style={style}
      className={`
        flex items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors
        ${isEven ? 'bg-white' : 'bg-gray-25'}
        ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
      `}
      role="row"
      aria-selected={isSelected}
    >
      {/* Selection checkbox */}
      <div className="flex-shrink-0 w-12">
        <Checkbox
          checked={isSelected}
          onChange={handleToggleSelection}
          aria-label={`Seleccionar informe ${informe.titulo}`}
        />
      </div>

      {/* Patient info */}
      <div className="flex-1 min-w-0 px-3">
        <div className="flex items-center space-x-2">
          <FaUser className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium text-gray-900 truncate">
            {informe.resultados?.nombre_paciente || 'Paciente no especificado'}
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <FaFileAlt className="w-3 h-3 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-gray-600 truncate">
            {informe.titulo}
          </span>
        </div>
      </div>

      {/* Generation date */}
      <div className="flex-shrink-0 w-40 px-3">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <div className="text-sm">
            <div className="text-gray-900">
              {formatDate(informe.fecha_generacion)}
            </div>
            <div className="text-gray-500">
              {formatTime(informe.fecha_generacion)}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation date */}
      <div className="flex-shrink-0 w-40 px-3">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <div className="text-sm">
            <div className="text-gray-900">
              {informe.resultados?.fecha_evaluacion 
                ? formatDate(informe.resultados.fecha_evaluacion)
                : 'No especificada'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 w-32 px-3">
        <div className="flex items-center space-x-1">
          <Tooltip content="Ver informe">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInforme}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              aria-label={`Ver informe de ${informe.resultados?.nombre_paciente}`}
            >
              <FaEye className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Ver gráfico">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewChart}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100"
              aria-label={`Ver gráfico de ${informe.resultados?.nombre_paciente}`}
            >
              <FaChartBar className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Eliminar informe">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteInforme}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100"
              aria-label={`Eliminar informe de ${informe.resultados?.nombre_paciente}`}
            >
              <FaTrash className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

InformeRow.displayName = 'InformeRow';

/**
 * Table header component
 */
const TableHeader = memo(({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onDeselectAll,
  allSelected,
  someSelected 
}) => {
  const handleSelectAllChange = useCallback(() => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  }, [allSelected, someSelected, onSelectAll, onDeselectAll]);

  return (
    <div 
      className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700"
      role="row"
    >
      {/* Select all checkbox */}
      <div className="flex-shrink-0 w-12">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={handleSelectAllChange}
          aria-label="Seleccionar todos los informes"
        />
      </div>

      {/* Column headers */}
      <div className="flex-1 px-3">
        <span>Paciente / Título</span>
        {selectedCount > 0 && (
          <span className="ml-2 text-sm text-blue-600">
            ({selectedCount} seleccionados)
          </span>
        )}
      </div>
      
      <div className="flex-shrink-0 w-40 px-3">
        <span>Fecha Generación</span>
      </div>
      
      <div className="flex-shrink-0 w-40 px-3">
        <span>Fecha Evaluación</span>
      </div>
      
      <div className="flex-shrink-0 w-32 px-3">
        <span>Acciones</span>
      </div>
    </div>
  );
});

TableHeader.displayName = 'TableHeader';

/**
 * Empty state component
 */
const EmptyState = memo(({ searchTerm, onClearSearch }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <FaFileAlt className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {searchTerm ? 'No se encontraron informes' : 'No hay informes generados'}
    </h3>
    <p className="text-gray-600 text-center max-w-md">
      {searchTerm 
        ? `No se encontraron informes que coincidan con "${searchTerm}"`
        : 'Aún no se han generado informes. Los informes aparecerán aquí una vez que se generen.'
      }
    </p>
    {searchTerm && onClearSearch && (
      <Button
        onClick={onClearSearch}
        variant="outline"
        className="mt-4"
      >
        Limpiar búsqueda
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Main table component with virtualization
 */
const InformesTable = memo(({ 
  informes = [],
  selectedInformes = new Set(),
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onViewInforme,
  onDeleteInforme,
  onViewChart,
  isLoading = false,
  searchTerm = '',
  onClearSearch,
  height = 600
}) => {
  // Memoize calculations
  const { allSelected, someSelected, selectedCount } = useMemo(() => {
    const selected = selectedInformes.size;
    const total = informes.length;
    
    return {
      allSelected: total > 0 && selected === total,
      someSelected: selected > 0 && selected < total,
      selectedCount: selected
    };
  }, [selectedInformes.size, informes.length]);

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo(() => ({
    informes,
    selectedInformes,
    onToggleSelection,
    onViewInforme,
    onDeleteInforme,
    onViewChart,
    isLoading
  }), [
    informes,
    selectedInformes,
    onToggleSelection,
    onViewInforme,
    onDeleteInforme,
    onViewChart,
    isLoading
  ]);

  // Show empty state if no informes and not loading
  if (!isLoading && informes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <TableHeader
          selectedCount={selectedCount}
          totalCount={informes.length}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          allSelected={allSelected}
          someSelected={someSelected}
        />
        <EmptyState 
          searchTerm={searchTerm} 
          onClearSearch={onClearSearch}
        />
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      role="table"
      aria-label="Tabla de informes generados"
    >
      <TableHeader
        selectedCount={selectedCount}
        totalCount={informes.length}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        allSelected={allSelected}
        someSelected={someSelected}
      />
      
      {/* Virtualized list for performance */}
      <div className="relative">
        <List
          height={height - 60} // Subtract header height
          itemCount={isLoading ? 10 : informes.length} // Show skeleton rows when loading
          itemSize={80} // Row height
          itemData={rowData}
          overscanCount={5} // Render extra items for smooth scrolling
        >
          {InformeRow}
        </List>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Cargando informes...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with count */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        {isLoading ? (
          <span>Cargando...</span>
        ) : (
          <span>
            Mostrando {informes.length} informe{informes.length !== 1 ? 's' : ''}
            {selectedCount > 0 && (
              <span className="ml-2 text-blue-600">
                • {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
});

InformesTable.displayName = 'InformesTable';

export default InformesTable;