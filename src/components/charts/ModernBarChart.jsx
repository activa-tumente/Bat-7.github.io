import React, { useEffect, useRef } from 'react';

const ModernBarChart = ({ data, title, height = 300 }) => {
  const chartRef = useRef(null);

  const getTestColor = (testCode) => {
    const colors = {
      'V': { primary: '#3B82F6', secondary: '#93C5FD', gradient: 'from-blue-500 to-blue-400' },
      'E': { primary: '#6366F1', secondary: '#A5B4FC', gradient: 'from-indigo-500 to-indigo-400' },
      'A': { primary: '#EF4444', secondary: '#FCA5A5', gradient: 'from-red-500 to-red-400' },
      'R': { primary: '#F59E0B', secondary: '#FCD34D', gradient: 'from-amber-500 to-amber-400' },
      'N': { primary: '#14B8A6', secondary: '#5EEAD4', gradient: 'from-teal-500 to-teal-400' },
      'M': { primary: '#64748B', secondary: '#CBD5E1', gradient: 'from-slate-500 to-slate-400' },
      'O': { primary: '#10B981', secondary: '#6EE7B7', gradient: 'from-green-500 to-green-400' }
    };
    return colors[testCode] || { primary: '#6B7280', secondary: '#D1D5DB', gradient: 'from-gray-500 to-gray-400' };
  };

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const maxValue = Math.max(...data.map(item => item.value), 100);
  const chartHeight = height - 80; // Espacio para labels

  useEffect(() => {
    // Animación de entrada para las barras
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll('.chart-bar');
      bars.forEach((bar, index) => {
        bar.style.transform = 'scaleY(0)';
        bar.style.transformOrigin = 'bottom';
        setTimeout(() => {
          bar.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          bar.style.transform = 'scaleY(1)';
        }, index * 100);
      });
    }
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {title && (
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
      )}
      
      <div ref={chartRef} className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map((value) => (
            <div key={value} className="flex items-center">
              <span className="text-xs text-gray-400 w-8 text-right mr-2">{value}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          ))}
        </div>

        {/* Chart container */}
        <div className="ml-10 mr-4" style={{ height: `${chartHeight}px` }}>
          <div className="flex items-end justify-center space-x-4 h-full">
            {data.map((item, index) => {
              const colors = getTestColor(item.code);
              const barHeight = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg transform -translate-y-2">
                    <div className="font-semibold">{item.name}</div>
                    <div>Percentil: {item.value}</div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>

                  {/* Bar container */}
                  <div className="relative flex flex-col justify-end h-full">
                    {/* Value label on top of bar */}
                    <div className="text-center mb-1">
                      <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-full shadow-sm border">
                        {item.value}
                      </span>
                    </div>

                    {/* Bar */}
                    <div 
                      className={`chart-bar w-16 bg-gradient-to-t ${colors.gradient} rounded-t-lg shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow duration-200`}
                      style={{ height: `${barHeight}%`, minHeight: '20px' }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 group-hover:animate-pulse"></div>
                      
                      {/* Icon in the middle of the bar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className={`${getTestIcon(item.code)} text-white text-lg drop-shadow-lg`}></i>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className="text-sm font-bold text-gray-700">{item.code}</div>
                    <div className="text-xs text-gray-500 max-w-16 truncate" title={item.name}>
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 border-t pt-4">
          <div className="text-xs text-gray-500 text-center mb-2">Escala de Percentiles</div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-blue-200 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 rounded-full opacity-30"></div>
          </div>
          
          {/* Interpretation legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
              <span className="text-gray-600">Bajo (0-25)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
              <span className="text-gray-600">Medio-Bajo (26-50)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
              <span className="text-gray-600">Medio-Alto (51-75)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
              <span className="text-gray-600">Alto (76-100)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBarChart;
