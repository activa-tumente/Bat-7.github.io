import React from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt, 
  FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock,
  FaBuilding, FaUserMd
} from 'react-icons/fa';

/**
 * Card component for displaying candidate information
 */
const CandidateCard = ({ 
  candidate, 
  onEdit, 
  onDelete, 
  onSelect, 
  isSelected, 
  canEdit,
  institutions,
  psychologists 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'activo':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactivo':
        return <FaTimesCircle className="text-red-500" />;
      case 'pendiente':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const institution = institutions?.find(i => i.id === candidate.institucion_id);
  const psychologist = psychologists?.find(p => p.id === candidate.psicologo_id);

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
      isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
    }`}>
      {/* Header with selection and status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(candidate.id, e.target.checked)}
              className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.estado)}`}>
            <div className="flex items-center">
              {getStatusIcon(candidate.estado)}
              <span className="ml-1 capitalize">{candidate.estado}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {candidate.nombre} {candidate.apellidos}
        </h3>
        <p className="text-sm text-gray-500">
          ID: {candidate.documento_identidad}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          {candidate.email && (
            <div className="flex items-center text-sm text-gray-600">
              <FaEnvelope className="mr-2 text-gray-400" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          
          {candidate.telefono && (
            <div className="flex items-center text-sm text-gray-600">
              <FaPhone className="mr-2 text-gray-400" />
              <span>{candidate.telefono}</span>
            </div>
          )}
          
          {candidate.fecha_nacimiento && (
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span>
                {new Date(candidate.fecha_nacimiento).toLocaleDateString('es-ES')}
                {candidate.edad && ` (${candidate.edad} años)`}
              </span>
            </div>
          )}
        </div>

        {/* Institution and Psychologist */}
        {(institution || psychologist) && (
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {institution && (
              <div className="flex items-center text-sm text-gray-600">
                <FaBuilding className="mr-2 text-gray-400" />
                <span className="truncate">{institution.nombre}</span>
              </div>
            )}
            
            {psychologist && (
              <div className="flex items-center text-sm text-gray-600">
                <FaUserMd className="mr-2 text-gray-400" />
                <span className="truncate">
                  {psychologist.nombre} {psychologist.apellidos}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Registration Date */}
        {candidate.fecha_registro && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Registrado: {new Date(candidate.fecha_registro).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(candidate)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="mr-1" />
            Editar
          </button>
          <button
            onClick={() => onDelete(candidate)}
            className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <FaTrash className="mr-1" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
