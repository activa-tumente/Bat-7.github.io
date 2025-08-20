import React from 'react';

/**
 * Componente que renderiza un gráfico de pie simple
 * @param {array} data - Array de objetos con propiedades name, value y color
 */
export const PieChart = ({ data }) => {
  // Calcular el total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Si no hay datos o el total es 0, mostrar un mensaje
  if (!data.length || total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Calcular los porcentajes y ángulos para el gráfico
  let startAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle,
      endAngle: startAngle + angle
    };
    startAngle += angle;
    return segment;
  });

  // Función para crear una coordenada en el círculo
  const getCoordinatesForAngle = (angle, radius = 50) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(radians),
      y: 50 + radius * Math.sin(radians)
    };
  };

  // Función para crear un arco SVG
  const createArc = (segment) => {
    const startPoint = getCoordinatesForAngle(segment.startAngle);
    const endPoint = getCoordinatesForAngle(segment.endAngle);
    const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? '0' : '1';

    return `M 50 50 L ${startPoint.x} ${startPoint.y} A 50 50 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} Z`;
  };

  // Verificar si hay un solo tipo de respuesta (por ejemplo, todas correctas)
  const isSingleSegment = segments.length === 1 || segments.some(segment => segment.percentage === 100);

  return (
    <div className="flex flex-col items-center h-full">
      <div className="w-full max-w-xs">
        <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto mb-4">
          {isSingleSegment ? (
            // Si hay un solo segmento o un segmento con 100%, mostrar un círculo completo
            <circle
              cx="50"
              cy="50"
              r="50"
              fill={segments.find(s => s.percentage === 100)?.color || segments[0].color}
            />
          ) : (
            // Si hay múltiples segmentos, mostrar los arcos
            segments.map((segment, index) => (
              <path
                key={index}
                d={createArc(segment)}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="0.5"
              />
            ))
          )}
        </svg>
      </div>

      <div className="flex flex-col items-center w-full">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center mb-2 w-full justify-between max-w-xs">
            <div className="flex items-center">
              <div
                className="w-4 h-4 mr-2"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-sm text-gray-700">{segment.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-sm mr-2">{segment.value}</span>
              <span className="text-xs text-gray-500">({segment.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
