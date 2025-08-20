import React, { useState, useEffect } from 'react';
import { Input } from './Input';

export const Table = ({
  data = [],
  columns = [],
  pagination = null,
  searchable = false,
  className = '',
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  
  const pageSize = pagination?.pageSize || 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  useEffect(() => {
    // Filtrar datos cuando cambia la consulta de búsqueda
    if (searchable && searchQuery) {
      const filtered = data.filter(item => {
        return columns.some(column => {
          if (!column.accessor) return false;
          
          const value = item[column.accessor];
          if (value === undefined || value === null) return false;
          
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
      
      setFilteredData(filtered);
      setCurrentPage(1); // Resetear a la primera página al buscar
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data, columns, searchable]);
  
  // Paginar datos
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="overflow-hidden">
      {searchable && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.cell 
                        ? column.cell({ value: row[column.accessor], row })
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{' '}
              de <span className="font-medium">{filteredData.length}</span> resultados
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <div className="hidden md:flex mx-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === index + 1
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Table;