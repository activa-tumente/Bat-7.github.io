import React from 'react';
import { 
  FaFileAlt, 
  FaDownload, 
  FaEye, 
  FaShare, 
  FaTrash,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaChartBar
} from 'react-icons/fa';

/**
 * Componente de tarjeta para mostrar información de un informe
 * Incluye acciones como ver, descargar, compartir y eliminar
 */
const ReportCard = ({ 
  report, 
  isSelected, 
  onSelect, 
  onView, 
  onDownload, 
  onShare, 
  onDelete,
  showActions = true,
  compact = false 
}) => {
  
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completado',
      draft: 'Borrador',
      processing: 'Procesando',
      error: 'Error'
    };
    return labels[status] || 'Desconocido';
  };

  const getTypeIcon = (type) => {
    return type === 'group' ? FaUsers : FaUser;
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-600';
    
    const firstChar = grade.charAt(0);
    const colors = {
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600'
    };
    return colors[firstChar] || 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TypeIcon = getTypeIcon(report.type);

  if (compact) {
    return (
      <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(report.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFileAlt className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {report.title}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(report.createdAt)}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {getStatusLabel(report.status)}
            </span>
          </div>
          
          {showActions && (
            <div className="flex-shrink-0 flex space-x-1">
              <button
                onClick={() => onView(report.id)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="Ver informe"
              >
                <FaEye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDownload(report.id)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Descargar"
              >
                <FaDownload className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Checkbox de selección */}
          {onSelect && (
            <div className="flex-shrink-0 pt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(report.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          )}

          {/* Icono del tipo de informe */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TypeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {report.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {report.summary}
                </p>

                {/* Información del candidato/grupo */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <TypeIcon className="h-4 w-4 mr-1" />
                    {report.type === 'group' ? (
                      <span>{report.candidateCount} candidatos</span>
                    ) : (
                      <span>{report.candidateName}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <FaUser className="h-4 w-4 mr-1" />
                    <span>{report.psychologistName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 mr-1" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                {/* Información del cuestionario */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <FaChartBar className="h-4 w-4 mr-1" />
                    <span>{report.questionnaireName}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaClock className="h-4 w-4 mr-1" />
                    <span>{report.fileSize}</span>
                  </div>
                </div>

                {/* Tags */}
                {report.tags && report.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {report.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <FaTag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {report.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{report.tags.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Puntuación y estado */}
              <div className="flex-shrink-0 text-right">
                <div className="mb-2">
                  <span className={`text-2xl font-bold ${getGradeColor(report.grade)}`}>
                    {report.grade}
                  </span>
                  <div className="text-sm text-gray-500">
                    {report.score || report.averageScore}% 
                    {report.type === 'group' && ' promedio'}
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
                
                {report.shared && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FaShare className="h-3 w-3 mr-1" />
                      Compartido
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Actualizado: {formatDate(report.updatedAt)}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(report.id)}
                  className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                >
                  <FaEye className="h-4 w-4 mr-1" />
                  Ver
                </button>
                
                <button
                  onClick={() => onDownload(report.id)}
                  className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200"
                >
                  <FaDownload className="h-4 w-4 mr-1" />
                  Descargar
                </button>
                
                <button
                  onClick={() => onShare(report.id)}
                  className="flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors duration-200"
                >
                  <FaShare className="h-4 w-4 mr-1" />
                  Compartir
                </button>
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(report.id)}
                    className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <FaTrash className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
