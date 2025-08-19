/**
 * @file GraficoResultados.jsx
 * @description Componente para mostrar gráficos de resultados de pacientes
 */

import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

const GraficoResultados = ({ paciente, resultados, estadisticas, onClose }) => {
  const getColorByAptitud = (codigo) => {
    const colores = {
      'E': { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
      'A': { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600' },
      'O': { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
      'V': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
      'N': { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600' },
      'R': { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
      'M': { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-600' }
    };
    return colores[codigo] || colores['M'];
  };

  const maxPC = Math.max(...resultados.map(r => r.percentil), 100);
  const maxPD = Math.max(...resultados.map(r => r.puntaje_directo), 50);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                📊 Gráfico de Resultados - {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Visualización de puntajes PD y PC por aptitud evaluada
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalTests}</div>
              <div className="text-sm text-blue-700">Tests Completados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.promedioPC}</div>
              <div className="text-sm text-green-700">PC Promedio</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.promedioPD}</div>
              <div className="text-sm text-purple-700">PD Promedio</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.aptitudesAltas}</div>
              <div className="text-sm text-yellow-700">Aptitudes Altas</div>
            </div>
          </div>

          {/* Gráfico de barras - Percentiles */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📈 Puntajes Percentiles (PC) por Aptitud
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-end justify-center space-x-4 h-64">
                {resultados.map((resultado, index) => {
                  const color = getColorByAptitud(resultado.aptitudes.codigo);
                  const altura = (resultado.percentil / maxPC) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2 font-semibold">
                        {resultado.percentil}
                      </div>
                      <div 
                        className={`w-12 ${color.bg} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group`}
                        style={{ height: `${altura}%`, minHeight: '20px' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {resultado.aptitudes.nombre}<br/>
                          PC: {resultado.percentil}<br/>
                          PD: {resultado.puntaje_directo}
                        </div>
                      </div>
                      <div className={`w-12 h-8 ${color.bg} flex items-center justify-center text-white font-bold text-sm`}>
                        {resultado.aptitudes.codigo}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {resultado.aptitudes.nombre.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Líneas de referencia */}
              <div className="relative mt-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span className="text-red-600">25 (Bajo)</span>
                  <span className="text-yellow-600">50 (Medio)</span>
                  <span className="text-green-600">75 (Alto)</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de barras - Puntajes Directos */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Puntajes Directos (PD) por Aptitud
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-end justify-center space-x-4 h-48">
                {resultados.map((resultado, index) => {
                  const color = getColorByAptitud(resultado.aptitudes.codigo);
                  const altura = (resultado.puntaje_directo / maxPD) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-2 font-semibold">
                        {resultado.puntaje_directo}
                      </div>
                      <div 
                        className={`w-12 bg-orange-500 rounded-t-lg transition-all duration-500 hover:opacity-80`}
                        style={{ height: `${altura}%`, minHeight: '15px' }}
                      ></div>
                      <div className="w-12 h-6 bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                        {resultado.aptitudes.codigo}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Resumen Detallado
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aptitud</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PD</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PC</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nivel</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Errores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resultados.map((resultado, index) => {
                    const color = getColorByAptitud(resultado.aptitudes.codigo);
                    const nivel = resultado.percentil >= 75 ? 'Alto' : 
                                 resultado.percentil >= 50 ? 'Medio-Alto' :
                                 resultado.percentil >= 25 ? 'Medio' : 'Bajo';
                    const nivelColor = resultado.percentil >= 75 ? 'text-green-600 bg-green-100' : 
                                      resultado.percentil >= 50 ? 'text-blue-600 bg-blue-100' :
                                      resultado.percentil >= 25 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${color.bg.replace('bg-', 'bg-').replace('-500', '-100')} ${color.text}`}>
                              <span className="font-bold text-sm">{resultado.aptitudes.codigo}</span>
                            </div>
                            <span className="text-sm font-medium">{resultado.aptitudes.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-bold text-orange-600">{resultado.puntaje_directo}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-bold text-blue-600">{resultado.percentil}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${nivelColor}`}>
                            {nivel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">{resultado.errores || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interpretación cualitativa */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              💡 Interpretación Cualitativa
            </h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Rendimiento General:</strong> PC Promedio de {estadisticas.promedioPC} 
                {estadisticas.promedioPC >= 75 ? ' (Rendimiento Alto)' : 
                 estadisticas.promedioPC >= 50 ? ' (Rendimiento Medio-Alto)' :
                 estadisticas.promedioPC >= 25 ? ' (Rendimiento Medio)' : ' (Rendimiento Bajo)'}
              </p>
              {estadisticas.aptitudesAltas > 0 && (
                <p><strong>Fortalezas:</strong> {estadisticas.aptitudesAltas} aptitud(es) con rendimiento alto (PC ≥ 75)</p>
              )}
              {estadisticas.aptitudesBajas > 0 && (
                <p><strong>Áreas de Mejora:</strong> {estadisticas.aptitudesBajas} aptitud(es) con rendimiento bajo (PC ≤ 25)</p>
              )}
              <p><strong>Total de Errores:</strong> {estadisticas.totalErrores} en {estadisticas.totalTests} tests</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default GraficoResultados;
