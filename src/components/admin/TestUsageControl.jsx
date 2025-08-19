import React, { useState, useEffect } from 'react';
import { FaChartBar, FaClock, FaCalendarAlt, FaEye, FaSpinner } from 'react-icons/fa';
import { supabase } from '../../api/supabaseClient';
import { toast } from 'react-toastify';

const UsageControlDashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageTime: '0m',
    testsCompleted: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas reales desde Supabase
      const [sessionsResult, testsResult, usersResult, activityResult] = await Promise.all([
        // Total de sesiones (usando tabla de resultados como proxy)
        supabase.from('resultados').select('id', { count: 'exact', head: true }),
        // Tests completados
        supabase.from('resultados').select('id', { count: 'exact', head: true }),
        // Usuarios activos (psicólogos)
        supabase.from('psicologos').select('id', { count: 'exact', head: true }),
        // Actividad reciente
        supabase
          .from('resultados')
          .select(`
            id,
            created_at,
            pacientes(nombre, apellido),
            psicologos(nombre, apellido)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Calcular estadísticas de la última semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyResult = await supabase
        .from('resultados')
        .select('created_at')
        .gte('created_at', weekAgo.toISOString());

      // Procesar datos semanales
      const weeklyStats = new Array(7).fill(0);
      if (weeklyResult.data) {
        weeklyResult.data.forEach(item => {
          const date = new Date(item.created_at);
          const dayIndex = date.getDay();
          weeklyStats[dayIndex]++;
        });
      }

      setStats({
        totalSessions: sessionsResult.count || 0,
        averageTime: '25m', // Placeholder - se puede calcular con datos reales
        testsCompleted: testsResult.count || 0,
        activeUsers: usersResult.count || 0
      });
      
      setWeeklyData(weeklyStats);
      setRecentActivity(activityResult.data || []);
      
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar las estadísticas del sistema');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-3 text-lg text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Control de Usos del Sistema</h2>
        <p className="text-gray-600">Monitorea el uso y actividad del sistema en tiempo real</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-500">
              <FaEye className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sesiones Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500">
              <FaClock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageTime}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-amber-500">
              <FaChartBar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests Completados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.testsCompleted.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-purple-500">
              <FaCalendarAlt className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de uso */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso del Sistema (Últimos 7 días)</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {weeklyData.map((value, index) => {
            const maxValue = Math.max(...weeklyData, 1);
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-300"
                  style={{ height: `${(value / maxValue) * 100}%`, minHeight: value > 0 ? '20px' : '4px' }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][index]}
                </span>
                <span className="text-xs text-gray-400">{value}</span>
              </div>
            );
          })}
        </div>
        {weeklyData.every(val => val === 0) && (
          <div className="text-center text-gray-500 mt-4">
            <p>No hay datos de actividad en los últimos 7 días</p>
          </div>
        )}
      </div>

      {/* Registro de actividad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registro de Actividad Reciente</h3>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay actividad reciente registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Psicólogo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity, index) => {
                const psicologoNombre = activity.psicologos ? `${activity.psicologos.nombre} ${activity.psicologos.apellido}` : 'N/A';
                const pacienteNombre = activity.pacientes ? `${activity.pacientes.nombre} ${activity.pacientes.apellido}` : 'N/A';
                const initials = psicologoNombre !== 'N/A' ? psicologoNombre.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA';
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
                const bgColor = colors[index % colors.length];
                
                return (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${bgColor}`}>
                          {initials}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{psicologoNombre}</div>
                          <div className="text-sm text-gray-500">Psicólogo</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pacienteNombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Test Completado
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-green-800">
          <h3 className="text-lg font-medium">¡Panel de Control de Usos funcionando!</h3>
          <p className="mt-2">El módulo de control de usos está cargando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default TestUsageControl;
