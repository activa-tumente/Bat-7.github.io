import React from 'react';
import { 
  FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, 
  FaCheckCircle, FaTimesCircle, FaClock, FaSpinner
} from 'react-icons/fa';

/**
 * Table component for displaying candidates
 */
const CandidateTable = ({ 
  candidates, 
  onEdit, 
  onDelete, 
  onSelect, 
  onSelectAll, 
  selectedCandidates, 
  onSort, 
  sortField, 
  sortDirection, 
  canEdit,
  institutions,
  psychologists,
  loading 
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="text-orange-500" /> : 
      <FaSortDown className="text-orange-500" />;
  };

  const getStatusBadge = (status) => {
    const configs = {
      activo: { icon: FaCheckCircle, color: 'text-green-600 bg-green-100', label: 'Activo' },
      inactivo: { icon: FaTimesCircle, color: 'text-red-600 bg-red-100', label: 'Inactivo' },
      pendiente: { icon: FaClock, color: 'text-yellow-600 bg-yellow-100', label: 'Pendiente' }
    };
    
    const config = configs[status] || configs.pendiente;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="mr-1" />
        {config.label}
      </span>
    );
  };

  const allSelected = candidates.length > 0 && candidates.every(c => selectedCandidates.has(c.id));
  const someSelected = candidates.some(c => selectedCandidates.has(c.id));

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('nombre')}
              >
                <div className="flex items-center">
                  Nombre
                  {getSortIcon('nombre')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('documento_identidad')}
              >
                <div className="flex items-center">
                  Documento
                  {getSortIcon('documento_identidad')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {getSortIcon('email')}
                </div>
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('estado')}
              >
                <div className="flex items-center">
                  Estado
                  {getSortIcon('estado')}
                </div>
              </th>
              
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('fecha_registro')}
              >
                <div className="flex items-center">
                  Fecha Registro
                  {getSortIcon('fecha_registro')}
                </div>
              </th>
              
              {canEdit && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-orange-500 text-2xl mr-3" />
                    <span className="text-gray-600">Cargando candidatos...</span>
                  </div>
                </td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                  No hay candidatos para mostrar
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => {
                const institution = institutions?.find(i => i.id === candidate.institucion_id);
                const psychologist = psychologists?.find(p => p.id === candidate.psicologo_id);
                
                return (
                  <tr 
                    key={candidate.id} 
                    className={`hover:bg-gray-50 ${selectedCandidates.has(candidate.id) ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.id)}
                        onChange={(e) => onSelect(candidate.id, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {candidate.nombre?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.nombre} {candidate.apellidos}
                          </div>
                          {candidate.genero && (
                            <div className="text-sm text-gray-500 capitalize">
                              {candidate.genero}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.documento_identidad}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.email}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.telefono}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(candidate.estado)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.fecha_registro ? 
                        new Date(candidate.fecha_registro).toLocaleDateString('es-ES') : 
                        '-'
                      }
                    </td>
                    
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(candidate)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar candidato"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => onDelete(candidate)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar candidato"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
