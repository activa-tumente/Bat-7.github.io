/**
 * Componente de tabla para mostrar los resultados de tests
 * Maneja la visualización de datos en formato tabular con accesibilidad mejorada
 */

import React from 'react';
import { Button } from '../ui/Button';

const ResultadosTable = ({ 
  filteredResultados = [], 
  loading, 
  obtenerNombrePaciente, 
  obtenerDocumentoPaciente,
  searchTerm 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando resultados...</span>
      </div>
    );
  }

  // Validación adicional para evitar errores
  if (!filteredResultados || filteredResultados.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {searchTerm ? 'No se encontraron resultados' : 'No hay resultados disponibles'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm 
            ? `No se encontraron resultados que coincidan con "${searchTerm}"`
            : 'Aún no se han registrado resultados de tests.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label="Tabla de resultados de tests">
      <table className="min-w-full divide-y divide-gray-200" role="table">
        <thead className="bg-gray-50">
          <tr role="row">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Test
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PD
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredResultados.map((resultado) => (
            <tr key={resultado.id} className="hover:bg-gray-50" role="row">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" role="cell">
                {obtenerNombrePaciente(resultado.paciente_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                {obtenerDocumentoPaciente(resultado.paciente_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {resultado.tipo_test?.toUpperCase() || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                {resultado.created_at ? new Date(resultado.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                <span className="font-medium">{resultado.puntaje_directo || 'N/A'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" role="cell">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    resultado.estado === 'completado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                  aria-label={`Estado: ${resultado.estado || 'Pendiente'}`}
                >
                  {resultado.estado || 'Pendiente'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" role="cell">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-900"
                  aria-label={`Ver detalle del resultado de ${obtenerNombrePaciente(resultado.paciente_id)}`}
                  onClick={() => {
                    // TODO: Implementar navegación al detalle
                    console.log('Ver detalle del resultado:', resultado.id);
                  }}
                >
                  Ver Detalle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Información adicional para lectores de pantalla */}
      <div className="sr-only" aria-live="polite">
        Mostrando {filteredResultados.length} resultado{filteredResultados.length !== 1 ? 's' : ''}
        {searchTerm && ` para la búsqueda "${searchTerm}"`}
      </div>
    </div>
  );
};

export default ResultadosTable;