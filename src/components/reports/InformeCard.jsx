/**
 * @file InformeCard.jsx
 * @description Refactored individual report card component with improved accessibility and performance
 */

import React, { memo } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { FaEye, FaTrash, FaChartBar, FaUser, FaCalendar } from 'react-icons/fa';

/**
 * Individual report card component with proper memoization and accessibility
 * @param {Object} props - Component props
 * @param {Object} props.informe - Report data
 * @param {Function} props.onView - View report handler
 * @param {Function} props.onDelete - Delete report handler
 * @param {Function} props.onViewChart - View chart handler
 * @param {boolean} props.isSelected - Selection state
 * @param {Function} props.onSelect - Selection handler
 * @param {number} props.index - Item index for accessibility
 * @param {number} props.total - Total items for accessibility
 */
const InformeCard = memo(({ 
  informe, 
  onView, 
  onDelete, 
  onViewChart, 
  isSelected, 
  onSelect, 
  index, 
  total 
}) => {
  const pacienteNombre = `${informe.pacientes?.nombre || ''} ${informe.pacientes?.apellido || ''}`.trim();
  const fechaFormateada = new Date(informe.fecha_generacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <Card 
      className={`
        mb-4 transition-all duration-200 hover:shadow-lg 
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        focus-within:ring-2 focus-within:ring-blue-500
      `}
      role="article"
      aria-labelledby={`informe-title-${informe.id}`}
      aria-describedby={`informe-desc-${informe.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {onSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(informe.id)}
                  aria-label={`Seleccionar informe de ${pacienteNombre}`}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
              <h3 
                id={`informe-title-${informe.id}`}
                className="text-lg font-semibold text-gray-800 truncate"
                title={informe.titulo}
              >
                {informe.titulo}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaUser className="w-3 h-3" aria-hidden="true" />
                <span>{pacienteNombre}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaCalendar className="w-3 h-3" aria-hidden="true" />
                <time dateTime={informe.fecha_generacion}>
                  {fechaFormateada}
                </time>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="sr-only">
              Informe {index + 1} de {total}
            </span>
            
            <div role="group" aria-label="Acciones del informe">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(informe.id)}
                onKeyDown={(e) => handleKeyDown(e, () => onView(informe.id))}
                aria-label={`Ver informe completo de ${pacienteNombre}`}
                className="mr-2 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
              >
                <FaEye className="w-4 h-4 mr-1" aria-hidden="true" />
                Ver
              </Button>

              {onViewChart && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewChart(informe)}
                  onKeyDown={(e) => handleKeyDown(e, () => onViewChart(informe))}
                  aria-label={`Ver gráfico de resultados de ${pacienteNombre}`}
                  className="mr-2 hover:bg-green-50 focus:ring-2 focus:ring-green-500"
                >
                  <FaChartBar className="w-4 h-4 mr-1" aria-hidden="true" />
                  Gráfico
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(informe.id)}
                onKeyDown={(e) => handleKeyDown(e, () => onDelete(informe.id))}
                aria-label={`Eliminar informe de ${pacienteNombre}`}
                className="text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
              >
                <FaTrash className="w-4 h-4 mr-1" aria-hidden="true" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {informe.descripcion && (
        <CardBody className="pt-0">
          <p 
            id={`informe-desc-${informe.id}`}
            className="text-sm text-gray-600 line-clamp-2"
          >
            {informe.descripcion}
          </p>
          
          {/* Results summary if available */}
          {informe.resultados && informe.resultados.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {informe.resultados.length} resultado{informe.resultados.length !== 1 ? 's' : ''}
                </span>
                <span>
                  Promedio: {(
                    informe.resultados.reduce((sum, r) => sum + (r.percentil || 0), 0) / 
                    informe.resultados.length
                  ).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
});

InformeCard.displayName = 'InformeCard';

export default InformeCard;