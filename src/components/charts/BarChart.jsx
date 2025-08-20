import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const BarChart = ({ data, options = {} }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Si ya existe una instancia del gráfico, destruirla
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Asegurarse de que tenemos un canvas y datos
    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      
      // Opciones por defecto
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      };

      // Crear nueva instancia del gráfico
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { ...defaultOptions, ...options }
      });
    }

    // Limpieza al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};
