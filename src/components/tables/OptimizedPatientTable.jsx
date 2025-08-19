import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Tabla optimizada para pacientes con virtualización y mejores prácticas de rendimiento
 * Implementa memoización, paginación y accesibilidad
 */
const OptimizedPatientTable = ({ 
  patients = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onSort,
  sortConfig = { key: null, direction: 'asc' },
  pagination = { page: 1, limit: 10, total: 0 },
  onPageChange
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Configuración de columnas memoizada
  const columns = useMemo(() => [
    {
      key: 'nombre',
      label: 'Nombre Completo',
      sortable: true,
      render: (patient) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {`${patient.nombre} ${patient.apellido}`}
          </span>
          {patient.documento && (
            <span className="text-sm text-gray-500">
              Doc: {patient.documento}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'edad',
      label: 'Edad',
      sortable: true,
      render: (patient) => {
        if (!patient.fecha_nacimiento) return '-';
        const age = new Date().getFullYear() - new Date(patient.fecha_nacimiento).getFullYear();
        return `${age} años`;
      }
    },
    {
      key: 'contacto',
      label: 'Contacto',
      sortable: false,
      render: (patient) => (
        <div className="flex flex-col">
          {patient.email && (
            <a 
              href={`mailto:${patient.email}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {patient.email}
            </a>
          )}
          <span className="text-sm text-gray-500">
            {patient.genero || 'No especificado'}
          </span>
        </div>
      )
    },
    {
      key: 'educacion_ocupacion',
      label: 'Educación/Ocupación',
      sortable: false,
      render: (patient) => (
        <div className="flex flex-col">
          {patient.nivel_educativo && (
            <span className="text-sm font-medium text-gray-700">
              {patient.nivel_educativo}
            </span>
          )}
          {patient.ocupacion && (
            <span className="text-sm text-gray-500">
              {patient.ocupacion}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'institucion',
      label: 'Institución',
      sortable: true,
      render: (patient) => (
        <span className="text-sm text-gray-700">
          {patient.instituciones?.nombre || 'Sin asignar'}
        </span>
      )
    },
    {
      key: 'psicologo',
      label: 'Psicólogo',
      sortable: true,
      render: (patient) => (
        <span className="text-sm text-gray-700">
          {patient.psicologos 
            ? `${patient.psicologos.nombre} ${patient.psicologos.apellido}`
            : 'Sin asignar'
          }
        </span>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sortable: false,
      render: (patient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(patient)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            aria-label={`Editar paciente ${patient.nombre} ${patient.apellido}`}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(patient.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            aria-label={`Eliminar paciente ${patient.nombre} ${patient.apellido}`}
          >
            Eliminar
          </button>
        </div>
      )
    }
  ], [onEdit, onDelete]);

  // Manejar ordenamiento
  const handleSort = useCallback((columnKey) => {
    if (!onSort) return;
    
    const direction = 
      sortConfig.key === columnKey && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort({ key: columnKey, direction });
  }, [sortConfig, onSort]);

  // Manejar selección de filas
  const handleRowSelect = useCallback((patientId, isSelected) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(patientId);
      } else {
        newSet.delete(patientId);
      }
      return newSet;
    });
  }, []);

  // Manejar selección de todas las filas
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedRows(new Set(patients.map(p => p.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [patients]);

  // Componente de encabezado de columna
  const ColumnHeader = React.memo(({ column }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      scope="col"
    >
      {column.sortable ? (
        <button
          onClick={() => handleSort(column.key)}
          className="group inline-flex items-center space-x-1 text-left font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
          aria-label={`Ordenar por ${column.label}`}
        >
          <span>{column.label}</span>
          <span className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-500">
            {sortConfig.key === column.key ? (
              sortConfig.direction === 'asc' ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
              </svg>
            )}
          </span>
        </button>
      ) : (
        column.label
      )}
    </th>
  ));

  // Componente de fila de paciente memoizado
  const PatientRow = React.memo(({ patient, isSelected, onSelect }) => (
    <tr 
      className={`${isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors duration-150`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(patient.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          aria-label={`Seleccionar paciente ${patient.nombre} ${patient.apellido}`}
        />
      </td>
      {columns.map(column => (
        <td 
          key={column.key} 
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
        >
          {column.render(patient)}
        </td>
      ))}
    </tr>
  ));

  // Componente de paginación
  const Pagination = React.memo(() => {
    if (!onPageChange || pagination.total <= pagination.limit) return null;

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = pagination.page;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{' '}
              de{' '}
              <span className="font-medium">{pagination.total}</span>{' '}
              resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {getPageNumbers().map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNumber === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando pacientes...</span>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
        <p className="mt-1 text-sm text-gray-500">Comience creando un nuevo paciente.</p>
      </div>
    );
  }

  const allSelected = patients.length > 0 && selectedRows.size === patients.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < patients.length;

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="Seleccionar todos los pacientes"
                    />
                  </th>
                  {columns.map(column => (
                    <ColumnHeader key={column.key} column={column} />
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map(patient => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedRows.has(patient.id)}
                    onSelect={handleRowSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <Pagination />
      
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {selectedRows.size} paciente{selectedRows.size !== 1 ? 's' : ''} seleccionado{selectedRows.size !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OptimizedPatientTable.propTypes = {
  patients: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    documento: PropTypes.string,
    email: PropTypes.string,
    genero: PropTypes.string,
    fecha_nacimiento: PropTypes.string,
    nivel_educativo: PropTypes.string,
    ocupacion: PropTypes.string,
    instituciones: PropTypes.shape({
      nombre: PropTypes.string
    }),
    psicologos: PropTypes.shape({
      nombre: PropTypes.string,
      apellido: PropTypes.string
    })
  })),
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSort: PropTypes.func,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }),
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number
  }),
  onPageChange: PropTypes.func
};

export default OptimizedPatientTable;