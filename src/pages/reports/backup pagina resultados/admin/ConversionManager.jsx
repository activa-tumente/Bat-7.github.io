import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseConversionService } from '../../services/supabaseConversionService';

const ConversionManager = () => {
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [funcionesDisponibles, setFuncionesDisponibles] = useState(false);
  const [testValues, setTestValues] = useState({
    puntajeDirecto: 25,
    aptitudCodigo: 'V',
    edad: 13
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const stats = await SupabaseConversionService.obtenerEstadisticasConversion();
    setEstadisticas(stats);
  };

  // Función de verificación removida - ya no es necesaria

  const ejecutarRecalculo = async () => {
    setLoading(true);
    try {
      await SupabaseConversionService.recalcularTodosLosPercentiles();
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error en recálculo:', error);
    } finally {
      setLoading(false);
    }
  };

  const configurarConversion = async () => {
    setLoading(true);
    try {
      await SupabaseConversionService.configurarConversionAutomatica();
      await cargarEstadisticas();
    } catch (error) {
      console.error('Error en configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const probarConversion = async () => {
    setLoading(true);
    try {
      const resultado = await SupabaseConversionService.probarConversion(
        parseInt(testValues.puntajeDirecto),
        testValues.aptitudCodigo,
        parseInt(testValues.edad)
      );
      
      if (resultado.success) {
        alert(`Conversión exitosa: PD ${testValues.puntajeDirecto} → PC ${resultado.percentil}`);
      } else {
        alert('Error en la conversión');
      }
    } catch (error) {
      console.error('Error en prueba:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarBaremos = async () => {
    setLoading(true);
    try {
      const resultado = await SupabaseConversionService.verificarBaremos();
      if (resultado.success) {
        console.log('Baremos verificados:', resultado.baremos);
        alert('Baremos verificados correctamente. Ver consola para detalles.');
      }
    } catch (error) {
      console.error('Error en verificación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-cogs mr-2 text-blue-600"></i>
            Estado del Sistema de Conversión
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${funcionesDisponibles ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                Funciones de Supabase: {funcionesDisponibles ? 'Disponibles' : 'No disponibles'}
              </span>
            </div>
            
            {estadisticas && (
              <>
                <div className="text-sm">
                  <span className="font-medium">Total resultados:</span> {estadisticas.totalResultados}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Con percentil:</span> {estadisticas.conPercentil}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sin percentil:</span> {estadisticas.sinPercentil}
                </div>
                <div className="text-sm">
                  <span className="font-medium">% Convertido:</span> {estadisticas.porcentajeConvertido}%
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Acciones Principales */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-tools mr-2 text-green-600"></i>
            Acciones de Conversión
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={configurarConversion}
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-play mr-2"></i>
              )}
              Configurar Conversión Automática
            </Button>

            <Button
              onClick={ejecutarRecalculo}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-sync mr-2"></i>
              )}
              Recalcular Percentiles Existentes
            </Button>

            <Button
              onClick={verificarBaremos}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-check mr-2"></i>
              )}
              Verificar Baremos
            </Button>

            <Button
              onClick={cargarEstadisticas}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-refresh mr-2"></i>
              )}
              Actualizar Estadísticas
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Prueba de Conversión */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-flask mr-2 text-purple-600"></i>
            Probar Conversión PD → PC
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puntaje PD
              </label>
              <input
                type="number"
                value={testValues.puntajeDirecto}
                onChange={(e) => setTestValues({...testValues, puntajeDirecto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aptitud
              </label>
              <select
                value={testValues.aptitudCodigo}
                onChange={(e) => setTestValues({...testValues, aptitudCodigo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="V">V - Aptitud Verbal</option>
                <option value="E">E - Aptitud Espacial</option>
                <option value="A">A - Atención</option>
                <option value="R">R - Razonamiento</option>
                <option value="N">N - Aptitud Numérica</option>
                <option value="M">M - Aptitud Mecánica</option>
                <option value="O">O - Ortografía</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <select
                value={testValues.edad}
                onChange={(e) => setTestValues({...testValues, edad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12">12 años</option>
                <option value="13">13 años</option>
                <option value="14">14 años</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={probarConversion}
                disabled={loading}
                variant="primary"
                className="w-full"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-calculator mr-2"></i>
                )}
                Probar
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Ejemplo:</strong> PD 25 en Aptitud Verbal para 13 años debería dar PC 50 aproximadamente</p>
          </div>
        </CardBody>
      </Card>

      {/* Información */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-info-circle mr-2 text-blue-600"></i>
            Información del Sistema
          </h3>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Conversión Automática:</strong> Los nuevos resultados se convierten automáticamente usando triggers de Supabase.</p>
            <p><strong>Baremos:</strong> Se utilizan las tablas de baremos para edades 12-13 y 13-14 años.</p>
            <p><strong>Recálculo:</strong> Permite actualizar resultados existentes que no tienen percentil calculado.</p>
            <p><strong>Verificación:</strong> Comprueba que las funciones y baremos estén correctamente configurados en Supabase.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ConversionManager;
