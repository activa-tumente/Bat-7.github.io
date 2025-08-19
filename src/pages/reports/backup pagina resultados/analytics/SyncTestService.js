/**
 * @file SyncTestService.js
 * @description 🔧 Servicio para Pruebas de Sincronización
 * Verifica la integridad y estado de la sincronización de datos
 */

import supabase from '../../api/supabaseClient.js';
import DataSyncService from '../DataSyncService.js';

const SyncTestService = {
  /**
   * Ejecuta pruebas completas de sincronización
   */
  async runSyncTests() {
    console.log('🔧 [SyncTestService] Ejecutando pruebas de sincronización...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      overallStatus: 'unknown',
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    try {
      // Test 1: Conectividad básica
      const connectivityTest = await this.testConnectivity();
      testResults.tests.push(connectivityTest);

      // Test 2: Integridad de vistas
      const viewsTest = await this.testDashboardViews();
      testResults.tests.push(viewsTest);

      // Test 3: Consistencia de datos
      const dataConsistencyTest = await this.testDataConsistency();
      testResults.tests.push(dataConsistencyTest);

      // Test 4: Rendimiento de consultas
      const performanceTest = await this.testQueryPerformance();
      testResults.tests.push(performanceTest);

      // Calcular resumen
      testResults.tests.forEach(test => {
        if (test.status === 'passed') testResults.summary.passed++;
        else if (test.status === 'failed') testResults.summary.failed++;
        else if (test.status === 'warning') testResults.summary.warnings++;
      });

      // Determinar estado general
      if (testResults.summary.failed === 0) {
        testResults.overallStatus = testResults.summary.warnings > 0 ? 'warning' : 'passed';
      } else {
        testResults.overallStatus = 'failed';
      }

      console.log('✅ [SyncTestService] Pruebas completadas:', testResults);
      return testResults;

    } catch (error) {
      console.error('❌ [SyncTestService] Error ejecutando pruebas:', error);
      testResults.overallStatus = 'failed';
      testResults.tests.push({
        name: 'Error General',
        status: 'failed',
        message: error.message,
        duration: 0
      });
      return testResults;
    }
  },

  /**
   * Test de conectividad básica
   */
  async testConnectivity() {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('aptitudes')
        .select('count')
        .limit(1);

      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          name: 'Conectividad Base de Datos',
          status: 'failed',
          message: `Error de conexión: ${error.message}`,
          duration
        };
      }

      return {
        name: 'Conectividad Base de Datos',
        status: 'passed',
        message: 'Conexión exitosa',
        duration
      };
    } catch (error) {
      return {
        name: 'Conectividad Base de Datos',
        status: 'failed',
        message: `Excepción: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  },

  /**
   * Test de integridad de vistas del dashboard
   */
  async testDashboardViews() {
    const startTime = Date.now();
    const views = [
      'dashboard_estadisticas_generales',
      'dashboard_perfil_institucional',
      'dashboard_estudiantes_por_nivel',
      'dashboard_comparativa_genero',
      'dashboard_correlacion_aptitudes',
      'dashboard_distribucion_rendimiento',
      'dashboard_perfil_por_nivel'
    ];

    let passedViews = 0;
    let failedViews = [];

    for (const view of views) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('*')
          .limit(1);

        if (error || !data) {
          failedViews.push(view);
        } else {
          passedViews++;
        }
      } catch (error) {
        failedViews.push(view);
      }
    }

    const duration = Date.now() - startTime;
    const status = failedViews.length === 0 ? 'passed' : 
                  failedViews.length < views.length / 2 ? 'warning' : 'failed';

    return {
      name: 'Integridad Vistas Dashboard',
      status,
      message: `${passedViews}/${views.length} vistas funcionando. ${failedViews.length > 0 ? `Fallan: ${failedViews.join(', ')}` : ''}`,
      duration,
      details: {
        totalViews: views.length,
        passedViews,
        failedViews
      }
    };
  },

  /**
   * Test de consistencia de datos
   */
  async testDataConsistency() {
    const startTime = Date.now();
    const issues = [];

    try {
      // Verificar que todos los resultados tengan evaluaciones válidas
      const { data: resultadosSinEvaluacion } = await supabase
        .from('resultados')
        .select('id')
        .is('evaluacion_id', null);

      if (resultadosSinEvaluacion && resultadosSinEvaluacion.length > 0) {
        issues.push(`${resultadosSinEvaluacion.length} resultados sin evaluación asociada`);
      }

      // Verificar que todas las evaluaciones tengan pacientes válidos
      const { data: evaluacionesSinPaciente } = await supabase
        .from('evaluaciones')
        .select('id')
        .is('paciente_id', null);

      if (evaluacionesSinPaciente && evaluacionesSinPaciente.length > 0) {
        issues.push(`${evaluacionesSinPaciente.length} evaluaciones sin paciente asociado`);
      }

      // Verificar percentiles válidos (0-100)
      const { data: percentilesInvalidos } = await supabase
        .from('resultados')
        .select('id')
        .or('percentil.lt.0,percentil.gt.100');

      if (percentilesInvalidos && percentilesInvalidos.length > 0) {
        issues.push(`${percentilesInvalidos.length} resultados con percentiles inválidos`);
      }

      const duration = Date.now() - startTime;
      const status = issues.length === 0 ? 'passed' : 
                    issues.length <= 2 ? 'warning' : 'failed';

      return {
        name: 'Consistencia de Datos',
        status,
        message: issues.length === 0 ? 'Datos consistentes' : `${issues.length} problemas encontrados: ${issues.join('; ')}`,
        duration,
        details: { issues }
      };

    } catch (error) {
      return {
        name: 'Consistencia de Datos',
        status: 'failed',
        message: `Error verificando consistencia: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  },

  /**
   * Test de rendimiento de consultas
   */
  async testQueryPerformance() {
    const startTime = Date.now();
    const performanceTests = [];

    try {
      // Test 1: Consulta estadísticas generales
      const start1 = Date.now();
      await supabase.from('dashboard_estadisticas_generales').select('*').single();
      performanceTests.push({
        query: 'Estadísticas Generales',
        duration: Date.now() - start1
      });

      // Test 2: Consulta perfil institucional
      const start2 = Date.now();
      await supabase.from('dashboard_perfil_institucional').select('*');
      performanceTests.push({
        query: 'Perfil Institucional',
        duration: Date.now() - start2
      });

      // Test 3: Consulta resultados con joins
      const start3 = Date.now();
      await supabase
        .from('resultados')
        .select('percentil, aptitud_id, evaluacion_id')
        .limit(100);
      performanceTests.push({
        query: 'Resultados (100 registros)',
        duration: Date.now() - start3
      });

      const totalDuration = Date.now() - startTime;
      const avgDuration = performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length;
      
      const status = avgDuration < 1000 ? 'passed' : 
                    avgDuration < 3000 ? 'warning' : 'failed';

      return {
        name: 'Rendimiento de Consultas',
        status,
        message: `Tiempo promedio: ${avgDuration.toFixed(0)}ms`,
        duration: totalDuration,
        details: {
          averageDuration: avgDuration,
          tests: performanceTests
        }
      };

    } catch (error) {
      return {
        name: 'Rendimiento de Consultas',
        status: 'failed',
        message: `Error en test de rendimiento: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  },

  /**
   * Obtiene el historial de sincronizaciones
   */
  async getSyncHistory(limit = 10) {
    try {
      // Simular historial hasta implementar tabla de logs
      const history = [];
      const now = new Date();
      
      for (let i = 0; i < limit; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        history.push({
          id: i + 1,
          timestamp: date.toISOString(),
          status: Math.random() > 0.2 ? 'success' : 'warning',
          recordsProcessed: Math.floor(Math.random() * 1000) + 100,
          duration: Math.floor(Math.random() * 5000) + 1000,
          message: Math.random() > 0.2 ? 'Sincronización exitosa' : 'Sincronización con advertencias'
        });
      }

      return history;
    } catch (error) {
      console.error('Error obteniendo historial de sync:', error);
      return [];
    }
  },

  /**
   * Genera datos para gráficos de sincronización
   */
  async getSyncChartData() {
    try {
      const history = await this.getSyncHistory(30);
      
      // Datos para gráfico de líneas de rendimiento
      const performanceData = {
        labels: history.map(h => new Date(h.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Duración (ms)',
          data: history.map(h => h.duration),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      };

      // Datos para gráfico de barras de registros procesados
      const recordsData = {
        labels: history.slice(0, 7).map(h => new Date(h.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Registros Procesados',
          data: history.slice(0, 7).map(h => h.recordsProcessed),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      };

      // Datos para gráfico de estado (donut)
      const statusCounts = history.reduce((acc, h) => {
        acc[h.status] = (acc[h.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = {
        labels: Object.keys(statusCounts).map(status => 
          status === 'success' ? 'Exitosas' : 
          status === 'warning' ? 'Con Advertencias' : 'Fallidas'
        ),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2
        }]
      };

      return {
        performanceData,
        recordsData,
        statusData
      };

    } catch (error) {
      console.error('Error generando datos de gráficos:', error);
      return null;
    }
  }
};

export default SyncTestService;