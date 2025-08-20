import React from 'react';
import { Link } from 'react-router-dom';
import TestCard from './components/TestCard';

const Tests = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 shadow-lg">
            <i className="fas fa-clipboard-list text-white text-lg"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Tests de Aptitud
          </h1>
        </div>
        <p className="text-lg text-gray-600 whitespace-nowrap">
          Evaluaciones psicométricas para medir diferentes habilidades y competencias cognitivas
        </p>
        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>

      {/* Grid de tarjetas de tests - Reorganizadas según el orden solicitado */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
        {/* Batería Completa BAT-7 */}
        <TestCard
          test={{
            id: 'bat7',
            title: 'Batería Completa BAT-7',
            description: 'Evaluación completa de aptitudes y habilidades cognitivas',
            time: 120,
            questions: 184,
            path: '/test/bat7'
          }}
          iconClass="fas fa-clipboard-list"
          bgClass="bg-purple-100"
          textClass="text-purple-600"
          buttonColor="purple"
          abbreviation="BAT"
          showButton={true}
        />

        {/* Aptitud Verbal */}
        <TestCard
          test={{
            id: 'verbal',
            title: 'Aptitud Verbal',
            description: 'Evaluación de analogías verbales y comprensión de relaciones entre conceptos',
            time: 12,
            questions: 32,
            path: '/test/verbal'
          }}
          iconClass="fas fa-comments"
          bgClass="bg-blue-100"
          textClass="text-blue-600"
          buttonColor="blue"
          abbreviation="V"
          showButton={true}
        />

        {/* Aptitud Espacial */}
        <TestCard
          test={{
            id: 'espacial',
            title: 'Aptitud Espacial',
            description: 'Razonamiento espacial con cubos y redes',
            time: 15,
            questions: 28,
            path: '/test/espacial'
          }}
          iconClass="fas fa-cube"
          bgClass="bg-indigo-100"
          textClass="text-indigo-600"
          buttonColor="indigo"
          abbreviation="E"
          showButton={true}
        />

        {/* Test de Atención */}
        <TestCard
          test={{
            id: 'atencion',
            title: 'Atención',
            description: 'Rapidez y precisión en la localización de símbolos',
            time: 8,
            questions: 80,
            path: '/test/atencion'
          }}
          iconClass="fas fa-eye"
          bgClass="bg-red-100"
          textClass="text-red-600"
          buttonColor="red"
          abbreviation="A"
          showButton={true}
        />



        {/* Razonamiento */}
        <TestCard
          test={{
            id: 'razonamiento',
            title: 'Razonamiento',
            description: 'Continuar series lógicas de figuras',
            time: 20,
            questions: 32,
            path: '/test/razonamiento'
          }}
          iconClass="fas fa-puzzle-piece"
          bgClass="bg-amber-100"
          textClass="text-amber-600"
          buttonColor="amber"
          abbreviation="R"
          showButton={true}
        />

        {/* Aptitud Numérica */}
        <TestCard
          test={{
            id: 'numerico',
            title: 'Aptitud Numérica',
            description: 'Resolución de igualdades, series numéricas y análisis de tablas de datos',
            time: 20,
            questions: 32,
            path: '/test/numerico'
          }}
          iconClass="fas fa-calculator"
          bgClass="bg-teal-100"
          textClass="text-teal-600"
          buttonColor="teal"
          abbreviation="N"
          showButton={true}
        />

        {/* Aptitud Mecánica */}
        <TestCard
          test={{
            id: 'mecanico',
            title: 'Aptitud Mecánica',
            description: 'Comprensión de principios físicos y mecánicos básicos',
            time: 12,
            questions: 28,
            path: '/test/mecanico'
          }}
          iconClass="fas fa-cogs"
          bgClass="bg-slate-100"
          textClass="text-slate-600"
          buttonColor="slate"
          abbreviation="M"
          showButton={true}
        />

        {/* Ortografía */}
        <TestCard
          test={{
            id: 'ortografia',
            title: 'Ortografía',
            description: 'Identificación de palabras con errores ortográficos',
            time: 10,
            questions: 32,
            path: '/test/ortografia'
          }}
          iconClass="fas fa-spell-check"
          bgClass="bg-green-100"
          textClass="text-green-600"
          buttonColor="green"
          abbreviation="O"
          showButton={true}
        />
      </div>

      {/* Resto del componente - sección de Tests Completados */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-3 shadow-md">
            <i className="fas fa-clipboard-check text-white text-lg"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tests Completados</h2>
          <p className="text-gray-600">Revisa tus resultados y progreso</p>
          <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto"></div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
          {pastTests.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {pastTests.map((test, index) => (
                <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-2 ${test.iconBg}`}>
                        <i className={`fas fa-${test.icon} text-white`}></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{test.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">Completado: {test.completedDate}</span>
                          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                          <span className="text-xs text-gray-500">Puntuación: {test.score}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/test/results/${test.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <i className="fas fa-chart-bar mr-1.5"></i>
                        Ver resultado
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
                <i className="fas fa-clipboard-check text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">No has completado ningún test todavía.</p>
              <p className="text-sm text-gray-400 mt-1">Los resultados aparecerán aquí cuando completes tus tests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Datos de ejemplo para tests completados
const pastTests = [
  {
    id: '1',
    name: 'Aptitud Espacial (E)',
    completedDate: '25/04/2025',
    score: '85/100',
    icon: 'cube',
    iconBg: 'bg-indigo-600'
  },
  {
    id: '2',
    name: 'Razonamiento (R)',
    completedDate: '20/04/2025',
    score: '78/100',
    icon: 'puzzle-piece',
    iconBg: 'bg-amber-600'
  },
  {
    id: '3',
    name: 'Ortografía (O)',
    completedDate: '15/04/2025',
    score: '92/100',
    icon: 'spell-check',
    iconBg: 'bg-green-600'
  }
];

export default Tests;