/**
 * @file Resultados.jsx
 * @description Componente para mostrar resultados de tests - Versión simplificada para debugging
 */

import React, { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useResultados } from '../../hooks/useResultados';
import ResultadosHeader from '../../components/resultados/ResultadosHeader';
import ResultadosFilters from '../../components/resultados/ResultadosFilters';
import ResultadosStats from '../../components/resultados/ResultadosStats';
import ResultadosTable from '../../components/resultados/ResultadosTable';

const Resultados = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState('todos');
  
  // Implementar debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    loading,
    error,
    filteredResultados,
    estadisticas,
    obtenerNombrePaciente,
    obtenerDocumentoPaciente,
    cargarDatos
  } = useResultados(debouncedSearchTerm, selectedTest);

  // Manejo de errores con opción de reintentar
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">{error.message}</h3>
            <p className="text-red-600 mb-4">{error.details}</p>
            {error.canRetry && (
              <button
                onClick={() => cargarDatos()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <ResultadosHeader />

      {/* Filtros de Búsqueda */}
      <ResultadosFilters
        searchTerm={searchTerm}
        selectedTest={selectedTest}
        onSearchChange={setSearchTerm}
        onTestChange={setSelectedTest}
      />

      {/* Estadísticas */}
      <ResultadosStats estadisticas={estadisticas} />

      {/* Resultados Detallados */}
      <ResultadosTable
        loading={loading}
        filteredResultados={filteredResultados}
        searchTerm={searchTerm}
        obtenerNombrePaciente={obtenerNombrePaciente}
        obtenerDocumentoPaciente={obtenerDocumentoPaciente}
      />
    </div>
  );
};

export default Resultados;