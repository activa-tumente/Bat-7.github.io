/**
 * @file DiagnosticPanel.jsx
 * @description Panel de diagnóstico para problemas del dashboard BAT-7
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import supabase from '../../api/supabaseClient';
import { toast } from 'react-toastify';

const DiagnosticPanel = () => {
  const [diagnostics, setDiagnostics] = useState({
    loading: true,
    percentileIssues: [],
    missingData: [],
    triggerStatus: null,
    baremosStatus: null,
    summary: null
  });

  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  /**
   * Ejecutar diagnósticos completos
   */
  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, loading: true }));

    try {
      const results = await Promise.all([
        checkPercentileConsistency(),
        checkMissingData(),
        checkTriggerStatus(),
        checkBaremosIntegrity()
      ]);

      setDiagnostics({
        loading: false,
        percentileIssues: results[0],
        missingData: results[1],
        triggerStatus: results[2],
        baremosStatus: results[3],
        summary: generateSummary(results)
      });

    } catch (error) {
      console.error('Error en diagnósticos:', error);
      toast.error('Error ejecutando diagnósticos');
      setDiagnostics(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Verificar consistencia de percentiles
   */
  const checkPercentileConsistency = async () => {
    try {
      // Obtener muestra de resultados para verificar
      const { data: resultados, error } = await supabase
        .from('resultados')
        .select(`
          id,
          puntaje_directo,
          percentil,
          created_at,
          aptitudes:aptitud_id (codigo, nombre),
          pacientes:paciente_id (nombre, apellido)
        `)
        .not('puntaje_directo', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const issues = [];
      
      for (const resultado of resultados) {
        if (!resultado.percentil) {
          issues.push({
            type: 'missing_percentile',
            resultado_id: resultado.id,
            paciente: `${resultado.pacientes.nombre} ${resultado.pacientes.apellido}`,
            aptitud: resultado.aptitudes.codigo,
            puntaje_directo: resultado.puntaje_directo,
            fecha: resultado.created_at
          });
          continue;
        }

        // Verificar contra baremos
        const { data: baremo } = await supabase
          .from('baremos')
          .select('percentil')
          .eq('factor', resultado.aptitudes.codigo)
          .lte('puntaje_min', resultado.puntaje_directo)
          .gte('puntaje_max', resultado.puntaje_directo)
          .single();

        if (baremo && baremo.percentil !== resultado.percentil) {
          issues.push({
            type: 'incorrect_percentile',
            resultado_id: resultado.id,
            paciente: `${resultado.pacientes.nombre} ${resultado.pacientes.apellido}`,
            aptitud: resultado.aptitudes.codigo,
            puntaje_directo: resultado.puntaje_directo,
            percentil_actual: resultado.percentil,
            percentil_esperado: baremo.percentil,
            fecha: resultado.created_at
          });
        }
      }

      return issues;

    } catch (error) {
      console.error('Error verificando percentiles:', error);
      return [];
    }
  };

  /**
   * Verificar datos faltantes
   */
  const checkMissingData = async () => {
    try {
      // Verificar datos del 22/07/2025 (fecha mencionada en el problema)
      const { data: datos22Julio, error } = await supabase
        .from('resultados')
        .select('id, created_at')
        .gte('created_at', '2025-07-22T00:00:00Z')
        .lt('created_at', '2025-07-23T00:00:00Z');

      if (error) throw error;

      const issues = [];

      if (datos22Julio.length === 0) {
        issues.push({
          type: 'missing_date_data',
          fecha: '2025-07-22',
          descripcion: 'No se encontraron datos para la fecha 22/07/2025'
        });
      }

      return issues;

    } catch (error) {
      console.error('Error verificando datos faltantes:', error);
      return [];
    }
  };

  /**
   * Verificar estado del trigger
   */
  const checkTriggerStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, event_object_table')
        .eq('event_object_table', 'resultados');

      if (error) throw error;

      const triggerConversion = data?.find(t => 
        t.trigger_name.includes('convertir') || t.trigger_name.includes('percentil')
      );

      return {
        exists: !!triggerConversion,
        name: triggerConversion?.trigger_name || null,
        status: triggerConversion ? 'active' : 'missing'
      };

    } catch (error) {
      console.error('Error verificando trigger:', error);
      return { exists: false, status: 'error' };
    }
  };

  /**
   * Verificar integridad de baremos
   */
  const checkBaremosIntegrity = async () => {
    try {
      const { data: baremos, error } = await supabase
        .from('baremos')
        .select('factor')
        .group('factor');

      if (error) throw error;

      const aptitudesEsperadas = ['V', 'E', 'A', 'R', 'N', 'M', 'O'];
      const aptitudesEncontradas = baremos?.map(b => b.factor) || [];
      const faltantes = aptitudesEsperadas.filter(a => !aptitudesEncontradas.includes(a));

      return {
        complete: faltantes.length === 0,
        missing: faltantes,
        found: aptitudesEncontradas
      };

    } catch (error) {
      console.error('Error verificando baremos:', error);
      return { complete: false, missing: [], found: [] };
    }
  };

  /**
   * Generar resumen de diagnósticos
   */
  const generateSummary = (results) => {
    const [percentileIssues, missingData, triggerStatus, baremosStatus] = results;
    
    const totalIssues = percentileIssues.length + missingData.length + 
                       (!triggerStatus.exists ? 1 : 0) + 
                       (!baremosStatus.complete ? 1 : 0);

    return {
      totalIssues,
      percentileProblems: percentileIssues.length,
      missingDataProblems: missingData.length,
      triggerProblems: !triggerStatus.exists ? 1 : 0,
      baremosProblems: !baremosStatus.complete ? 1 : 0,
      status: totalIssues === 0 ? 'healthy' : totalIssues < 5 ? 'warning' : 'critical'
    };
  };

  /**
   * Aplicar correcciones automáticas
   */
  const applyFixes = async () => {
    setFixing(true);
    
    try {
      let fixedCount = 0;

      // Corregir percentiles inconsistentes
      for (const issue of diagnostics.percentileIssues) {
        if (issue.type === 'incorrect_percentile') {
          const { error } = await supabase
            .from('resultados')
            .update({ 
              percentil: issue.percentil_esperado,
              updated_at: new Date().toISOString()
            })
            .eq('id', issue.resultado_id);

          if (!error) {
            fixedCount++;
          }
        }
      }

      toast.success(`${fixedCount} problemas corregidos automáticamente`);
      
      // Reejecutar diagnósticos
      await runDiagnostics();

    } catch (error) {
      console.error('Error aplicando correcciones:', error);
      toast.error('Error aplicando correcciones');
    } finally {
      setFixing(false);
    }
  };

  if (diagnostics.loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Ejecutando diagnósticos...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            🏥 Estado General del Sistema
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
              diagnostics.summary?.status === 'healthy' ? 'bg-green-100 text-green-800' :
              diagnostics.summary?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {diagnostics.summary?.status === 'healthy' ? 'Saludable' :
               diagnostics.summary?.status === 'warning' ? 'Advertencia' : 'Crítico'}
            </span>
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {diagnostics.summary?.totalIssues || 0}
              </div>
              <div className="text-sm text-gray-600">Problemas Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {diagnostics.summary?.percentileProblems || 0}
              </div>
              <div className="text-sm text-gray-600">Percentiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {diagnostics.summary?.missingDataProblems || 0}
              </div>
              <div className="text-sm text-gray-600">Datos Faltantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(diagnostics.summary?.triggerProblems || 0) + (diagnostics.summary?.baremosProblems || 0)}
              </div>
              <div className="text-sm text-gray-600">Sistema</div>
            </div>
          </div>

          {diagnostics.summary?.totalIssues > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={applyFixes}
                disabled={fixing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {fixing ? 'Aplicando Correcciones...' : 'Aplicar Correcciones Automáticas'}
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Problemas de Percentiles */}
      {diagnostics.percentileIssues.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-orange-600">
              ⚠️ Problemas de Percentiles ({diagnostics.percentileIssues.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {diagnostics.percentileIssues.map((issue, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{issue.paciente}</div>
                      <div className="text-sm text-gray-600">
                        {issue.aptitud} - PD: {issue.puntaje_directo}
                        {issue.type === 'incorrect_percentile' && (
                          <span className="ml-2">
                            PC: {issue.percentil_actual} → {issue.percentil_esperado}
                          </span>
                        )}
                        {issue.type === 'missing_percentile' && (
                          <span className="ml-2 text-red-600">Sin percentil</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(issue.fecha).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Datos Faltantes */}
      {diagnostics.missingData.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-blue-600">
              📅 Datos Faltantes ({diagnostics.missingData.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {diagnostics.missingData.map((issue, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium">{issue.descripcion}</div>
                  <div className="text-sm text-gray-600">Fecha: {issue.fecha}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-purple-600">🔧 Estado del Sistema</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Trigger de Conversión PD→PC</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                diagnostics.triggerStatus?.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {diagnostics.triggerStatus?.exists ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Baremos Completos</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                diagnostics.baremosStatus?.complete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {diagnostics.baremosStatus?.complete ? 'Completos' : 'Incompletos'}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🔄 Acciones</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reejecutar Diagnósticos
            </button>
            <button
              onClick={() => window.open('/admin/conversion-manager', '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gestor de Conversiones
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DiagnosticPanel;
