import React, { useState, useEffect } from 'react';
import { Button } from './Button';
// En lugar de usar react-icons, usaremos SVG directos
// import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Componente de tabla de datos reutilizable con ordenamiento, paginación y acciones
 *
 * @param {Object} props
 * @param {Array} props.columns - Configuración de columnas
 * @param {Array} props.data - Datos a mostrar en la tabla
 * @param {string} props.sortField - Campo de ordenamiento actual
 * @param {string} props.sortDirection - Dirección de ordenamiento ('asc' o 'desc')
 * @param {Function} props.onSort - Función a ejecutar cuando se cambia el ordenamiento
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.enableActions - Habilitar columna de acciones
 * @param {Function} props.onEdit - Función para editar un registro
 * @param {Function} props.onDelete - Función para eliminar un registro
 * @param {boolean} props.isTemporaryFn - Función para determinar si un registro es temporal
 */
const DataTable = ({
  columns = [],
  data = [],
  sortField = '',
  sortDirection = 'asc',
  onSort,
  loading = false,
  enableActions = true,
  onEdit,
  onDelete,
  isTemporaryFn,
  itemsPerPage = 10,
  emptyMessage = "No hay datos disponibles",
  actionLabels = { edit: "Editar", delete: "Eliminar" }
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Resetear página actual cuando cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Manejador de ordenamiento
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Obtener renderizador de celda
  const getCellRenderer = (column, item, index) => {
    // Si la columna tiene un renderizador personalizado, utilizarlo
    if (column.render) {
      return column.render(item[column.field], item, index);
    }

    // Renderizado predeterminado según el tipo de dato
    const value = item[column.field];

    // Manejo de valores nulos o indefinidos
    if (value === null || value === undefined) {
      return column.emptyValue || '-';
    }

    return value;
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="relative">
      {/* Estado de carga */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-700">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {!loading && data.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.width ? column.width : ''}`}
                    onClick={() => column.sortable !== false && handleSort(column.field)}
                  >
                    <div className="flex items-center">
                      <span>{column.header}</span>
                      {column.sortable !== false && (
                        <span className="ml-2">
                          {sortField === column.field ? (
                            sortDirection === 'asc' ? (
                              <span className="text-blue-500">▲</span>
                            ) : (
                              <span className="text-blue-500">▼</span>
                            )
                          ) : (
                            <span className="text-gray-400">⇅</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {enableActions && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, rowIndex) => (
                <tr
                  key={item.id || rowIndex}
                  className={`hover:bg-gray-50 ${
                    isTemporaryFn && isTemporaryFn(item.id) ? 'bg-yellow-50 opacity-80 italic' : ''
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.type === 'numeric' ? 'text-right' : ''
                      } ${column.highlight ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                    >
                      {getCellRenderer(column, item, rowIndex)}
                    </td>
                  ))}
                  {enableActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors p-2 rounded-full"
                            title={actionLabels.edit}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id, item)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors p-2 rounded-full"
                            title={actionLabels.delete}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> de{' '}
                    <span className="font-medium">{data.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <span className="text-lg">&laquo;</span>
                    </button>

                    {/* Paginación dinámica con elipsis */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      // Mostrar el primer y último número, los números cercanos a la página actual y elipsis para los demás
                      const shouldRenderPageNumber =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                      if (shouldRenderPageNumber) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 font-medium'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <span className="text-lg">&raquo;</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;