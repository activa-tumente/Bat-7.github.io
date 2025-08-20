import React, { useState } from 'react';
import InformeViewerWrapper from './InformeViewerWrapper';
import { FaFileAlt, FaEye } from 'react-icons/fa';

/**
 * Ejemplo de cómo usar el nuevo InformeViewer espectacular
 * Muestra las diferentes formas de invocar el componente
 */
const EjemploUsoInforme = () => {
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [tipoEjemplo, setTipoEjemplo] = useState('datos-directos');

  // Datos de ejemplo para mostrar el informe
  const datosEjemplo = {
    paciente: {
      id: 'pac-001',
      nombre: 'María José',
      apellido: 'González Pérez',
      documento: '12345678',
      genero: 'Femenino',
      fecha_nacimiento: '1995-03-15',
      email: 'maria.gonzalez@email.com',
      telefono: '+57 300 123 4567'
    },
    evaluacion: {
      id: 'eval-001',
      fecha_evaluacion: '2024-01-15T10:30:00Z',
      tipo_evaluacion: 'BAT-7',
      estado: 'completada',
      tiempo_total: 2520, // 42 minutos
      observaciones: 'Evaluación completada satisfactoriamente. El candidato mostró buena disposición y concentración durante toda la prueba.'
    },
    resultados: [
      {
        id: 'res-001',
        aptitud: { codigo: 'V', nombre: 'Aptitud Verbal' },
        puntaje_directo: 85,
        percentil: 88,
        tiempo_segundos: 1200,
        errores: 3,
        concentracion: 96.5
      },
      {
        id: 'res-002',
        aptitud: { codigo: 'E', nombre: 'Aptitud Espacial' },
        puntaje_directo: 72,
        percentil: 65,
        tiempo_segundos: 900,
        errores: 8,
        concentracion: 90.0
      },
      {
        id: 'res-003',
        aptitud: { codigo: 'A', nombre: 'Atención y Concentración' },
        puntaje_directo: 95,
        percentil: 92,
        tiempo_segundos: 600,
        errores: 2,
        concentracion: 97.9
      },
      {
        id: 'res-004',
        aptitud: { codigo: 'R', nombre: 'Razonamiento Lógico' },
        puntaje_directo: 78,
        percentil: 75,
        tiempo_segundos: 1080,
        errores: 5,
        concentracion: 93.6
      },
      {
        id: 'res-005',
        aptitud: { codigo: 'N', nombre: 'Aptitud Numérica' },
        puntaje_directo: 68,
        percentil: 58,
        tiempo_segundos: 840,
        errores: 12,
        concentracion: 85.0
      },
      {
        id: 'res-006',
        aptitud: { codigo: 'M', nombre: 'Aptitud Mecánica' },
        puntaje_directo: 82,
        percentil: 80,
        tiempo_segundos: 720,
        errores: 6,
        concentracion: 92.3
      },
      {
        id: 'res-007',
        aptitud: { codigo: 'O', nombre: 'Ortografía y Lenguaje' },
        puntaje_directo: 90,
        percentil: 85,
        tiempo_segundos: 480,
        errores: 4,
        concentracion: 95.2
      }
    ]
  };

  const abrirInforme = (tipo) => {
    setTipoEjemplo(tipo);
    setMostrarInforme(true);
  };

  const cerrarInforme = () => {
    setMostrarInforme(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <FaFileAlt className="text-6xl text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎉 Nuevo Informe Espectacular BAT-7
          </h1>
          <p className="text-gray-600 text-lg">
            Informe psicológico completamente rediseñado con gráficos interactivos, 
            interpretaciones detalladas y generación de PDF profesional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Características principales */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              ✨ Características Principales
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Información completa del paciente/alumno
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Gráficos interactivos (Barras, Radar, Pie)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Interpretaciones psicológicas detalladas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Recomendaciones vocacionales personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Generación de PDF profesional
              </li>
            </ul>
          </div>

          {/* Tecnologías utilizadas */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
              🛠️ Tecnologías Utilizadas
            </h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                React + Framer Motion (animaciones)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Recharts (gráficos interactivos)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                jsPDF + html2canvas (PDF)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Tailwind CSS (diseño responsivo)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                React Icons (iconografía)
              </li>
            </ul>
          </div>
        </div>

        {/* Botones de ejemplo */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Prueba el Nuevo Informe
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => abrirInforme('datos-directos')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaEye className="text-xl" />
              Ver Informe con Datos de Ejemplo
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            * Los datos mostrados son de ejemplo para demostración
          </p>
        </div>
      </div>

      {/* Mostrar el informe */}
      {mostrarInforme && (
        <InformeViewerWrapper
          paciente={datosEjemplo.paciente}
          resultados={datosEjemplo.resultados}
          evaluacion={datosEjemplo.evaluacion}
          onClose={cerrarInforme}
        />
      )}
    </div>
  );
};

export default EjemploUsoInforme;
