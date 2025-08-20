import React, { useState, useEffect } from 'react';
import { FaChartBar, FaClock, FaCalendarAlt, FaDownload, FaEye, FaUsers, FaClipboardCheck, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UsageControlPanel = () => {
  const [usageStats, setUsageStats] = useState({
    totalSessions: 1234,
    averageSessionTime: 25,
    testsCompleted: 89,
    activeUsers: 18
  });
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [usageLogs, setUsageLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  const timeRanges = [
    { value: '24hours', label: 'Últimas 24 horas' },
    { value: '7days', label: 'Últimos 7 días' },
    { value: '30days', label: 'Últimos 30 días' },
    { value: '90days', label: 'Últimos 90 días' }
  ];

  useEffect(() => {
    loadUsageData();
  }, [timeRange]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de uso del sistema...');

      // Cargar datos estáticos
      loadUsageStats();
      loadUsageLogs();
      loadChartData();

      console.log('✅ Datos de uso cargados correctamente');
    } catch (error) {
      console.error('❌ Error loading usage data:', error);
      toast.error('Error al cargar datos de uso');
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = () => {
    // Datos estáticos de estadísticas de uso
    setUsageStats({
      totalSessions: 1234,
      averageSessionTime: 25,
      testsCompleted: 89,
      activeUsers: 18
    });
  };

  const loadUsageLogs = () => {
    // Simular logs de uso
    const logs = [
      {
        id: 1,
        user: 'ana.martinez@example.com',
        action: 'login',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        duration: null,
        details: 'Inicio de sesión exitoso'
      },
      {
        id: 2,
        user: 'carlos.lopez@example.com',
        action: 'test_completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        duration: 45,
        details: 'Test MACI-II completado'
      },
      {
        id: 3,
        user: 'laura.rodriguez@example.com',
        action: 'session_end',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        duration: 32,
        details: 'Sesión finalizada'
      },
      {
        id: 4,
        user: 'juan.perez@example.com',
        action: 'login',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        duration: null,
        details: 'Acceso a panel de administración'
      },
      {
        id: 5,
        user: 'maria.gonzalez@example.com',
        action: 'test_started',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        duration: null,
        details: 'Evaluación iniciada'
      }
    ];
    setUsageLogs(logs);
  };

  const loadChartData = () => {
    // Simular datos del gráfico basados en el rango de tiempo
    const days = timeRange === '24hours' ? 1 : 
                 timeRange === '7days' ? 7 : 
                 timeRange === '30days' ? 30 : 90;
    
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short',
          ...(days > 30 && { year: '2-digit' })
        }),
        sessions: Math.floor(Math.random() * 15) + 5,
        tests: Math.floor(Math.random() * 8) + 2,
        users: Math.floor(Math.random() * 12) + 3
      });
    }
    setChartData(data);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return <FaSignInAlt className="w-4 h-4 text-blue-600" />;
      case 'test_completed':
        return <FaClipboardCheck className="w-4 h-4 text-green-600" />;
      case 'test_started':
        return <FaEye className="w-4 h-4 text-orange-600" />;
      case 'session_end':
        return <FaClock className="w-4 h-4 text-gray-600" />;
      default:
        return <FaUsers className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'test_completed':
        return 'bg-green-100 text-green-800';
      case 'test_started':
        return 'bg-orange-100 text-orange-800';
      case 'session_end':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    }
  };

  const exportUsageReport = () => {
    // Simular exportación de reporte
    const csvContent = [
      ['Usuario', 'Acción', 'Fecha', 'Duración', 'Detalles'],
      ...usageLogs.map(log => [
        log.user,
        log.action,
        new Date(log.timestamp).toLocaleString('es-ES'),
        log.duration ? `${log.duration} min` : 'N/A',
        log.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_uso_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Reporte exportado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Control de Usos</h2>
        <p className="text-gray-600 mt-2">Monitorea el uso del sistema y estadísticas</p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <FaCalendarAlt className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportUsageReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaDownload />
            <span>Exportar Reporte</span>
          </button>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Sesiones</p>
                <p className="text-3xl font-bold">{usageStats.totalSessions}</p>
              </div>
              <FaChartBar className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tiempo Promedio</p>
                <p className="text-3xl font-bold">{usageStats.averageSessionTime}<span className="text-lg">min</span></p>
              </div>
              <FaClock className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Tests Completados</p>
                <p className="text-3xl font-bold">{usageStats.testsCompleted}</p>
              </div>
              <FaClipboardCheck className="w-8 h-8 text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Usuarios Activos</p>
                <p className="text-3xl font-bold">{usageStats.activeUsers}</p>
              </div>
              <FaUsers className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Gráfico de actividad */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad del Sistema</h3>
          <div className="h-64 flex items-end justify-between space-x-2 bg-gray-50 rounded-lg p-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                  {/* Sesiones */}
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg opacity-80"
                    style={{ height: `${(item.sessions / Math.max(...chartData.map(d => Math.max(d.sessions, d.tests, d.users)))) * 200}px` }}
                    title={`Sesiones: ${item.sessions}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{item.date}</p>
                <div className="text-xs text-center mt-1">
                  <div className="text-blue-600 font-medium">{item.sessions}</div>
                  <div className="text-gray-500">sesiones</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Sesiones</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Tests</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Usuarios</span>
            </div>
          </div>
        </div>

        {/* Log de actividad */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.duration ? `${log.duration} min` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.details}
                    </td>
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

export default UsageControlPanel;
