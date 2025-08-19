import React, { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { InterpretacionCualitativaService } from '../../../services/interpretacionCualitativaService';
import {
  APTITUDES_CONFIG,
  INDICES_INTELIGENCIA,
  getLevelConfigByPercentile,
  getLevelNameByPercentile,
  calcularIndicesInteligencia
} from '../constants/reportConstants';
import {
  INTERPRETACIONES_INDICES,
  INTERPRETACIONES_APTITUDES,
  obtenerNivel,
  NIVELES_RENDIMIENTO
} from '../constants/interpretacionesCualitativas';

const AnalisisCualitativo = ({ resultados, paciente }) => {
  // Memoizar la interpretación personalizada para optimizar rendimiento
  const interpretacionPersonalizada = useMemo(() => {
    if (!resultados || !paciente) return null;
    return InterpretacionCualitativaService.generarInterpretacionPersonalizada(resultados, paciente);
  }, [resultados, paciente]);

  // Memoizar el cálculo de índices de inteligencia
  const indicesInteligencia = useMemo(() => {
    return calcularIndicesInteligencia(resultados);
  }, [resultados]);

  if (!interpretacionPersonalizada) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
            <i className="fas fa-brain text-2xl text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">Análisis Cualitativo Personalizado</h2>
            <p className="text-blue-100 text-sm">Interpretación profesional de aptitudes e índices de inteligencia</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-6">
        
        {/* Índices de Inteligencia */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b border-gray-200 pb-3">
            <i className="fas fa-lightbulb mr-3 text-purple-600"></i>
            Índices de Inteligencia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(indicesInteligencia).map(([codigo, percentil]) => {
              const indiceConfig = INDICES_INTELIGENCIA[codigo];
              const nivelConfig = getLevelConfigByPercentile(percentil);
              const nivelNombre = getLevelNameByPercentile(percentil);

              // Obtener interpretación cualitativa profesional
              const nivel = obtenerNivel(percentil);
              const interpretacionIndice = INTERPRETACIONES_INDICES[codigo];
              const interpretacionNivel = interpretacionIndice?.interpretaciones[nivel];

              if (!indiceConfig) return null;

              return (
                <div key={codigo} className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${nivelConfig.borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <i className={`fas ${indiceConfig.icon} text-2xl ${nivelConfig.textColor} mr-3`}></i>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{indiceConfig.nombre}</h4>
                        <p className="text-sm text-gray-600">{codigo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${nivelConfig.textColor}`}>
                        {percentil}
                      </div>
                      <div className="text-xs text-gray-500">Percentil</div>
                    </div>
                  </div>

                  {/* Descripción del índice */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm font-medium mb-2">Definición:</p>
                    <p className="text-gray-600 text-sm">{interpretacionIndice?.descripcion || indiceConfig.descripcion}</p>
                  </div>

                  <div className={`px-3 py-2 rounded-lg ${nivelConfig.color} text-white text-center font-semibold mb-4`}>
                    {nivelNombre}
                  </div>

                  {/* Interpretación cualitativa profesional */}
                  {interpretacionNivel && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-700 text-sm font-medium mb-1">Interpretación Integrada:</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{interpretacionNivel.integrada}</p>
                      </div>

                      <div>
                        <p className="text-gray-700 text-sm font-medium mb-1">Implicaciones Generales:</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{interpretacionNivel.implicaciones}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <strong>Componentes:</strong> {indiceConfig.componentes.join(', ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aptitudes Específicas */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b border-gray-200 pb-3">
            <i className="fas fa-cogs mr-3 text-indigo-600"></i>
            Interpretación por Aptitudes
          </h3>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resultados.map((resultado, index) => {
              const aptitudConfig = APTITUDES_CONFIG[resultado.aptitud?.codigo];
              const nivelConfig = getLevelConfigByPercentile(resultado.percentil);
              const nivelNombre = getLevelNameByPercentile(resultado.percentil);

              // Obtener interpretación cualitativa profesional para aptitudes
              const percentil = resultado.percentil || 0;
              const codigoAptitud = resultado.aptitud?.codigo;
              const nivel = obtenerNivel(percentil);
              const interpretacionAptitud = INTERPRETACIONES_APTITUDES[codigoAptitud];
              const interpretacionNivel = interpretacionAptitud?.interpretaciones[nivel];





              if (!aptitudConfig) return null;

              return (
                <div key={index} className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${nivelConfig.borderColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <i className={`fas ${aptitudConfig.icon} text-2xl ${nivelConfig.textColor} mr-3`}></i>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{aptitudConfig.nombre}</h4>
                        <p className="text-sm text-gray-600">{resultado.aptitud?.codigo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${nivelConfig.textColor}`}>
                        {resultado.percentil || 0}
                      </div>
                      <div className="text-xs text-gray-500">Percentil</div>
                    </div>
                  </div>

                  {/* Descripción de la aptitud */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm font-medium mb-2">Descripción:</p>
                    <p className="text-gray-600 text-sm">{interpretacionAptitud?.descripcion || aptitudConfig.descripcion}</p>
                  </div>

                  <div className={`px-3 py-2 rounded-lg ${nivelConfig.color} text-white text-center font-semibold mb-4`}>
                    {nivelNombre}
                  </div>

                  {/* Interpretación cualitativa profesional - SIEMPRE mostrar algo */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">Interpretación del Rendimiento:</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {interpretacionNivel?.rendimiento || `Rendimiento en nivel ${nivelNombre} para ${codigoAptitud}. Interpretación específica en desarrollo.`}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">Implicaciones Académicas:</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {interpretacionNivel?.academico || `Implicaciones académicas para nivel ${nivelNombre} en ${codigoAptitud}. Consulte con el profesional para detalles específicos.`}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">Implicaciones Vocacionales:</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {interpretacionNivel?.vocacional || `Implicaciones vocacionales para nivel ${nivelNombre} en ${codigoAptitud}. Consulte con el profesional para orientación específica.`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <strong>PD:</strong> {resultado.puntaje_directo || 'N/A'}
                    </div>
                    <div>
                      <strong>Errores:</strong> {resultado.errores || 0}
                    </div>
                    <div>
                      <strong>Tiempo:</strong> {resultado.tiempo_segundos ? `${Math.round(resultado.tiempo_segundos / 60)}min` : 'N/A'}
                    </div>
                    <div>
                      <strong>Concentración:</strong> {resultado.concentracion || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interpretación Textual Detallada */}
        {interpretacionPersonalizada.interpretaciones && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-file-alt mr-3 text-blue-600"></i>
              Interpretación Detallada
            </h3>
            
            <div className="space-y-4">
              {interpretacionPersonalizada.interpretaciones.map((interpretacion, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <i className={`fas ${APTITUDES_CONFIG[interpretacion.aptitud]?.icon || 'fa-circle'} mr-2 text-blue-600`}></i>
                    {interpretacion.nombre}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {interpretacion.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AnalisisCualitativo;