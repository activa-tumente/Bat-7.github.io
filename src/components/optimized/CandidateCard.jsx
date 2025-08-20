import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Eye, Edit, Trash2, User } from 'lucide-react';

/**
 * Optimized CandidateCard component with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const CandidateCard = memo(({ 
  candidate, 
  onView, 
  onEdit, 
  onDelete, 
  isSelected = false,
  onSelect,
  showActions = true,
  compact = false 
}) => {
  const {
    id,
    nombre,
    apellido,
    email,
    telefono,
    estado,
    fecha_creacion,
    puntuacion_total,
    evaluaciones_completadas
  } = candidate;

  const handleView = React.useCallback(() => {
    onView?.(candidate);
  }, [onView, candidate]);

  const handleEdit = React.useCallback(() => {
    onEdit?.(candidate);
  }, [onEdit, candidate]);

  const handleDelete = React.useCallback(() => {
    onDelete?.(candidate);
  }, [onDelete, candidate]);

  const handleSelect = React.useCallback(() => {
    onSelect?.(candidate);
  }, [onSelect, candidate]);

  const getStatusColor = React.useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatDate = React.useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  if (compact) {
    return (
      <div 
        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
        onClick={handleSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{nombre} {apellido}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          <Badge className={`text-xs ${getStatusColor(estado)}`}>
            {estado}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {nombre} {apellido}
              </CardTitle>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </div>
          <Badge className={getStatusColor(estado)}>
            {estado}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Teléfono:</span>
              <p className="font-medium">{telefono || 'No especificado'}</p>
            </div>
            <div>
              <span className="text-gray-500">Fecha de registro:</span>
              <p className="font-medium">{formatDate(fecha_creacion)}</p>
            </div>
          </div>

          {/* Evaluation Stats */}
          {(puntuacion_total !== undefined || evaluaciones_completadas !== undefined) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {puntuacion_total !== undefined && (
                <div>
                  <span className="text-gray-500">Puntuación total:</span>
                  <p className="font-medium text-blue-600">{puntuacion_total}</p>
                </div>
              )}
              {evaluaciones_completadas !== undefined && (
                <div>
                  <span className="text-gray-500">Evaluaciones:</span>
                  <p className="font-medium">{evaluaciones_completadas} completadas</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Display name for debugging
CandidateCard.displayName = 'CandidateCard';

// Define prop types for better development experience
CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    telefono: PropTypes.string,
    estado: PropTypes.string,
    fecha_creacion: PropTypes.string,
    puntuacion_total: PropTypes.number,
    evaluaciones_completadas: PropTypes.number
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  showActions: PropTypes.bool,
  compact: PropTypes.bool
};

export default CandidateCard;