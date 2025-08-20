/**
 * Componente de filtros para la página de resultados
 * Maneja la búsqueda por paciente y filtrado por tipo de test
 */

import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';

const ResultadosFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTest, 
  onTestChange 
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de búsqueda por paciente */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Paciente
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, apellido o documento..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar paciente por nombre, apellido o documento"
                aria-describedby="search-help"
                role="searchbox"
              />
              <div id="search-help" className="sr-only">
                Escriba para filtrar los resultados por paciente
              </div>
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Filtro por tipo de test */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Test
            </label>
            <select
              value={selectedTest}
              onChange={(e) => onTestChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filtrar por tipo de test"
              aria-describedby="test-filter-help"
            >
              <option value="todos">Todos los tests</option>
              <option value="bat7">BAT-7</option>
              <option value="mmpi">MMPI-2</option>
              <option value="16pf">16PF</option>
            </select>
            <div id="test-filter-help" className="sr-only">
              Seleccione un tipo de test para filtrar los resultados
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResultadosFilters;