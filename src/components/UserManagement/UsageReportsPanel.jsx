/**
 * Panel de reportes y estadísticas del sistema
 */

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaChartLine, FaDownload, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { useUsageControl } from '../../hooks/useUsageControl';

const UsageReportsPanel = () => {
  const {
    usageStatistics,
    performanceMetrics,
    loading,
    error,
    fetchUsageStatistics,
    fetchPerformanceMetrics,
    exportUsageData,
    chartData
  } = useUsageControl();

  const [reportType, setReportType] = useState('usage');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
    endDate: new Date().toISOString().split('T')[0] // Hoy
  });
  const [reportData, setReportData] = useState(null);

  // Cargar datos cuando cambia el tipo de reporte o rango de fechas
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (reportType === 'usage') {
        fetchUsageStatistics(startDate, endDate);
      } else if (reportType === 'performance') {
        fetchPerformanceMetrics(startDate, endDate);
      }
    }
  }, [reportType, dateRange, fetchUsageStatistics, fetchPerformanceMetrics]);

  // Procesar datos para reportes
  useEffect(() => {
    if (reportType === 'usage' && usageStatistics) {
      setReportData(processUsageData(usageStatistics));
    } else if (reportType === 'performance' && performanceMetrics) {
      setReportData(processPerformanceData(performanceMetrics));
    }
  }, [reportType, usageStatistics, performanceMetrics]);

  const processUsageData = (data) => {
    if (!data || data.length === 0) return null;

    // Agrupar por fecha
    const byDate = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][item.metric_name] = item.metric_value;
      return acc;
    }, {});

    // Calcular totales y promedios
    const totals = data.reduce((acc, item) => {
      if (!acc[item.metric_name]) {
        acc[item.metric_name] = { total: 0, count: 0, type: item.metric_type };
      }
      acc[item.metric_name].total += item.metric_value;
      acc[item.metric_name].count += 1;
      return acc;
    }, {});

    const summary = Object.keys(totals).map(metric => ({
      metric,
      total: totals[metric].total,
      average: totals[metric].total / totals[metric].count,
      type: totals[metric].type
    }));

    return {
      byDate,
      summary,
      dateRange: Object.keys(byDate).sort()
    };
  };

  const processPerformanceData = (data) => {
    if (!data) return null;

    const metrics = Object.keys(data).map(metricName => {
      const metricData = data[metricName];
      const values = metricData.map(d => d.value);
      
      return {
        name: metricName,
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        trend: calculateTrend(metricData),
        data: metricData
      };
    });

    return { metrics };
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return 'stable';
    
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const generateReport = () => {
    if (!reportData) return;

    const reportContent = {
      title: `Reporte de ${reportType === 'usage' ? 'Uso' : 'Rendimiento'}`,
      period: `${dateRange.startDate} a ${dateRange.endDate}`,
      generatedAt: new Date().toISOString(),
      data: reportData
    };

    const filename = `reporte_${reportType}_${dateRange.startDate}_${dateRange.endDate}.json`;
    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const renderUsageReport = () => {
    if (!reportData) return <div>No hay datos disponibles</div>;

    return (
      <div className="space-y-6">
        {/* Resumen de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.summary.map((metric, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {metric.metric.replace(/_/g, ' ').toUpperCase()}
              </h4>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.type === 'average' ? metric.average.toFixed(2) : metric.total}
                </div>
                <div className="text-sm text-gray-500">
                  {metric.type === 'average' ? 'Promedio' : 'Total'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla de datos por fecha */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datos por Fecha</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    {reportData.summary.map((metric, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {metric.metric.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.dateRange.map((date, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(date).toLocaleDateString()}
                      </td>
                      {reportData.summary.map((metric, metricIndex) => (
                        <td key={metricIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reportData.byDate[date][metric.metric] || 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceReport = () => {
    if (!reportData) return <div>No hay datos disponibles</div>;

    return (
      <div className="space-y-6">
        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.metrics.map((metric, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {metric.name.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  metric.trend === 'increasing' 
                    ? 'bg-green-100 text-green-800'
                    : metric.trend === 'decreasing'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {metric.trend === 'increasing' ? '↗ Creciente' : 
                   metric.trend === 'decreasing' ? '↘ Decreciente' : '→ Estable'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.min.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Mínimo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.average.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Promedio</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.max.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Máximo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Reportes del Sistema</h2>
            <p className="mt-1 text-sm text-gray-500">
              Genera reportes detallados de uso y rendimiento
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={!reportData}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="mr-2 h-4 w-4" />
            Descargar Reporte
          </button>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="usage">Uso del Sistema</option>
              <option value="performance">Rendimiento</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Información del reporte */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Reporte de {reportType === 'usage' ? 'Uso del Sistema' : 'Rendimiento'}
              </div>
              <div className="text-sm text-gray-500">
                Período: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Generando reporte...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error al generar el reporte: {error.message}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          {reportType === 'usage' ? renderUsageReport() : renderPerformanceReport()}
        </div>
      )}
    </div>
  );
};

export default UsageReportsPanel;
