import React from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { getLevelConfigByPercentile, getLevelNameByPercentile } from '../constants/reportConstants';

const ResultadosDetallados = ({ resultados }) => {
  if (!resultados || resultados.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
              <i className="fas fa-chart-bar text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold">Resultados Gráficos por Aptitud</h3>
              <p className="text-blue-100 text-sm">Visualización detallada de puntuaciones y niveles</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
            <p>No hay resultados disponibles para mostrar</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
            <i className="fas fa-chart-bar text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold">Resultados Gráficos por Aptitud</h3>
            <p className="text-blue-100 text-sm">Visualización detallada de puntuaciones y niveles</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">APTITUDES EVALUADAS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">PD</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">PC</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">PERFIL DE LAS APTITUDES</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((resultado, index) => {
                const percentil = resultado.percentil || 0;
                const puntajeDirecto = resultado.puntaje_directo || 0;
                const nivelConfig = getLevelConfigByPercentile(percentil);
                const nivelNombre = getLevelNameByPercentile(percentil);
                const anchoBarra = Math.max(percentil, 5); // Mínimo 5% para visibilidad

                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-gray-700">
                            {resultado.aptitud?.codigo || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {resultado.aptitud?.nombre || 'Aptitud no especificada'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {resultado.aptitud?.codigo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-b">
                      <span className="font-semibold text-gray-900">{puntajeDirecto}</span>
                    </td>
                    <td className="px-4 py-3 text-center border-b">
                      <span className="font-semibold text-gray-900">{percentil}</span>
                    </td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mr-3 relative overflow-hidden">
                          <div 
                            className={`h-full ${nivelConfig.color} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                            style={{ width: `${anchoBarra}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {percentil}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 min-w-[80px]">
                          {nivelNombre}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda de colores */}
        <div className="p-4 bg-gray-50 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Niveles:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Muy bajo (≤5)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span>Bajo (6-20)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span>Medio-bajo (21-40)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
              <span>Medio (41-60)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Medio-alto (61-80)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Alto (81-95)</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
              <span>Muy alto (&gt;95)</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResultadosDetallados;