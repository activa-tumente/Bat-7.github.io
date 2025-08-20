/**
 * Componente de encabezado para la página de resultados
 * Muestra el título y descripción de la sección
 */

import React from 'react';

const ResultadosHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Resultados de Evaluaciones</h1>
          <p className="text-blue-100">
            Consulta y gestiona los resultados de las evaluaciones psicológicas realizadas
          </p>
        </div>
        <div className="hidden md:block">
          <svg 
            className="h-16 w-16 text-blue-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ResultadosHeader;