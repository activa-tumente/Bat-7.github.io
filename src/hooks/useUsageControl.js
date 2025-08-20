/**
 * Hook personalizado para control y monitoreo de uso de la aplicación
 */

import { useState, useEffect, useCallback } from 'react';
import appUsageService from '../services/appUsageService';
import { toast } from 'react-toastify';

export const useUsageControl = () => {
  const [usageStatistics, setUsageStatistics] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [systemSummary, setSystemSummary] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene estadísticas de uso
   */
  const fetchUsageStatistics = useCallback(async (startDate, endDate, userType = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await appUsageService.getUsageStatistics(startDate, endDate, userType);
      
      if (error) {
        throw error;
      }

      setUsageStatistics(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar estadísticas de uso:', err);
      toast.error('Error al cargar estadísticas de uso');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene logs de actividad de usuarios
   */
  const fetchActivityLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await appUsageService.getUserActivityLogs(filters);
      
      if (error) {
        throw error;
      }

      setActivityLogs(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar logs de actividad:', err);
      toast.error('Error al cargar logs de actividad');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene logs de sesiones
   */
  const fetchSessionLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await appUsageService.getSessionLogs(filters);
      
      if (error) {
        throw error;
      }

      setSessionLogs(data || []);
    } catch (err) {
      setError(err);
      console.error('Error al cargar logs de sesión:', err);
      toast.error('Error al cargar logs de sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene resumen del sistema
   */
  const fetchSystemSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await appUsageService.getSystemSummary();
      
      if (error) {
        throw error;
      }

      setSystemSummary(data);
    } catch (err) {
      setError(err);
      console.error('Error al cargar resumen del sistema:', err);
      toast.error('Error al cargar resumen del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene métricas de rendimiento
   */
  const fetchPerformanceMetrics = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await appUsageService.getPerformanceMetrics(startDate, endDate);
      
      if (error) {
        throw error;
      }

      setPerformanceMetrics(data);
    } catch (err) {
      setError(err);
      console.error('Error al cargar métricas de rendimiento:', err);
      toast.error('Error al cargar métricas de rendimiento');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una estadística de uso
   */
  const updateUsageStatistic = useCallback(async (metricName, metricValue, metricType = 'count', userType = 'all', targetDate = new Date(), metadata = {}) => {
    try {
      const { success, error } = await appUsageService.updateUsageStatistic(
        metricName, 
        metricValue, 
        metricType, 
        userType, 
        targetDate, 
        metadata
      );
      
      if (!success) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Error al actualizar estadística:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Registra el login de un usuario
   */
  const logUserLogin = useCallback(async (userId, sessionId, ipAddress, userAgent, deviceInfo = {}) => {
    try {
      const { success, data, error } = await appUsageService.logUserLogin(
        userId, 
        sessionId, 
        ipAddress, 
        userAgent, 
        deviceInfo
      );
      
      if (!success) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error al registrar login:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Registra el logout de un usuario
   */
  const logUserLogout = useCallback(async (sessionId, logoutReason = 'manual') => {
    try {
      const { success, error } = await appUsageService.logUserLogout(sessionId, logoutReason);
      
      if (!success) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Error al registrar logout:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Procesa estadísticas para gráficos
   */
  const processStatisticsForCharts = useCallback((statistics) => {
    if (!statistics || statistics.length === 0) {
      return {
        dailyLogins: [],
        userTypeDistribution: [],
        activityTrends: []
      };
    }

    // Agrupar por tipo de métrica
    const groupedStats = statistics.reduce((acc, stat) => {
      if (!acc[stat.metric_name]) {
        acc[stat.metric_name] = [];
      }
      acc[stat.metric_name].push(stat);
      return acc;
    }, {});

    // Procesar logins diarios
    const dailyLogins = (groupedStats.daily_logins || []).map(stat => ({
      date: stat.date,
      value: stat.metric_value,
      userType: stat.user_type
    }));

    // Procesar distribución por tipo de usuario
    const userTypeStats = statistics.filter(stat => stat.user_type !== 'all');
    const userTypeDistribution = userTypeStats.reduce((acc, stat) => {
      const existing = acc.find(item => item.userType === stat.user_type);
      if (existing) {
        existing.value += stat.metric_value;
      } else {
        acc.push({
          userType: stat.user_type,
          value: stat.metric_value
        });
      }
      return acc;
    }, []);

    // Procesar tendencias de actividad
    const activityTrends = Object.keys(groupedStats).map(metricName => ({
      metric: metricName,
      data: groupedStats[metricName].map(stat => ({
        date: stat.date,
        value: stat.metric_value
      }))
    }));

    return {
      dailyLogins,
      userTypeDistribution,
      activityTrends
    };
  }, []);

  /**
   * Obtiene estadísticas resumidas para el dashboard
   */
  const getDashboardStats = useCallback(() => {
    if (!systemSummary) {
      return null;
    }

    return {
      activeUsersToday: systemSummary.activeUsersToday || 0,
      totalUsers: systemSummary.totalUsers || 0,
      evaluationsToday: systemSummary.evaluationsToday || 0,
      recentActivity: systemSummary.recentActivity || [],
      userGrowthRate: 0, // Se puede calcular con datos históricos
      systemHealth: 'good' // Se puede determinar basado en métricas
    };
  }, [systemSummary]);

  /**
   * Exporta datos de uso a CSV
   */
  const exportUsageData = useCallback((data, filename = 'usage_data.csv') => {
    if (!data || data.length === 0) {
      toast.warning('No hay datos para exportar');
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Datos exportados exitosamente');
    } catch (err) {
      console.error('Error al exportar datos:', err);
      toast.error('Error al exportar datos');
    }
  }, []);

  // Cargar resumen del sistema al montar el componente
  useEffect(() => {
    fetchSystemSummary();
  }, [fetchSystemSummary]);

  return {
    // Estado
    usageStatistics,
    activityLogs,
    sessionLogs,
    systemSummary,
    performanceMetrics,
    loading,
    error,
    
    // Acciones de carga
    fetchUsageStatistics,
    fetchActivityLogs,
    fetchSessionLogs,
    fetchSystemSummary,
    fetchPerformanceMetrics,
    
    // Acciones de registro
    updateUsageStatistic,
    logUserLogin,
    logUserLogout,
    
    // Utilidades
    processStatisticsForCharts,
    getDashboardStats,
    exportUsageData,
    
    // Datos procesados
    dashboardStats: getDashboardStats(),
    chartData: processStatisticsForCharts(usageStatistics)
  };
};
