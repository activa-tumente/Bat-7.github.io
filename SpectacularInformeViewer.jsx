import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaCalendarAlt, FaChartLine, FaDownload, FaPrint, 
  FaBrain, FaEye, FaClock, FaAward, FaFileAlt, FaSpinner,
  FaChartBar, FaChartPie, FaRadar, FaTable, FaLightbulb
} from 'react-icons/fa';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { 
  ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SpectacularInformeViewer = ({ 
  paciente, 
  resultados = [], 
  evaluacion = {},
  onClose 
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const reportRef = useRef(null);

  // Colores para las aptitudes
  const APTITUDE_COLORS = {
    'V': '#3B82F6', // Azul
    'E': '#10B981', // Verde
    'A': '#F59E0B', // Amarillo
    'R': '#EF4444', // Rojo
    'N': '#8B5CF6', // Púrpura
    'M': '#F97316', // Naranja
    'O': '#06B6D4'  // Cian
  };

  // Procesar datos para gráficos
  const chartData = resultados.map(resultado => ({
    aptitud: resultado.aptitud?.codigo || 'N/A',
    nombre: resultado.aptitud?.nombre || 'Desconocida',
    puntajeDirecto: resultado.puntaje_directo || 0,
    percentil: resultado.percentil || 0,
    nivel: getNivelPorPercentil(resultado.percentil || 0),
    color: APTITUDE_COLORS[resultado.aptitud?.codigo] || '#6B7280'
  }));

  // Datos para gráfico radar
  const radarData = chartData.map(item => ({
    aptitud: item.aptitud,
    percentil: item.percentil,
    fullMark: 100
  }));

  // Estadísticas generales
  const estadisticas = {
    totalTests: resultados.length,
    percentilPromedio: Math.round(resultados.reduce((sum, r) => sum + (r.percentil || 0), 0) / resultados.length),
    tiempoTotal: Math.round(resultados.reduce((sum, r) => sum + (r.tiempo_segundos || 0), 0) / 60),
    aptitudesAltas: resultados.filter(r => (r.percentil || 0) >= 75).length,
    aptitudesMedias: resultados.filter(r => (r.percentil || 0) >= 25 && (r.percentil || 0) < 75).length,
    aptitudesBajas: resultados.filter(r => (r.percentil || 0) < 25).length
  };

  function getNivelPorPercentil(percentil) {
    if (percentil >= 90) return 'Muy Alto';
    if (percentil >= 75) return 'Alto';
    if (percentil >= 50) return 'Medio-Alto';
    if (percentil >= 25) return 'Medio';
    if (percentil >= 10) return 'Bajo';
    return 'Muy Bajo';
  }

  function getColorByLevel(nivel) {
    const colors = {
      'Muy Alto': 'text-green-600 bg-green-100',
      'Alto': 'text-blue-600 bg-blue-100',
      'Medio-Alto': 'text-indigo-600 bg-indigo-100',
      'Medio': 'text-yellow-600 bg-yellow-100',
      'Bajo': 'text-orange-600 bg-orange-100',
      'Muy Bajo': 'text-red-600 bg-red-100'
    };
    return colors[nivel] || 'text-gray-600 bg-gray-100';
  }

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Informe_BAT7_${paciente?.nombre}_${paciente?.apellido}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen Ejecutivo', icon: FaChartPie },
    { id: 'graficos', label: 'Análisis Gráfico', icon: FaChartBar },
    { id: 'interpretacion', label: 'Interpretación', icon: FaBrain },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: FaLightbulb }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Informe Psicológico BAT-7
              </h1>
              <p className="text-blue-100">
                Evaluación Integral de Aptitudes Cognitivas
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Descargar PDF
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                ✕
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div ref={reportRef} className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'resumen' && (
                <ResumenEjecutivo 
                  paciente={paciente}
                  estadisticas={estadisticas}
                  chartData={chartData}
                  evaluacion={evaluacion}
                />
              )}
              {activeTab === 'graficos' && (
                <AnalisisGrafico 
                  chartData={chartData}
                  radarData={radarData}
                  resultados={resultados}
                />
              )}
              {activeTab === 'interpretacion' && (
                <InterpretacionDetallada 
                  resultados={resultados}
                  paciente={paciente}
                />
              )}
              {activeTab === 'recomendaciones' && (
                <RecomendacionesPersonalizadas 
                  resultados={resultados}
                  paciente={paciente}
                  estadisticas={estadisticas}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Componente: Resumen Ejecutivo
const ResumenEjecutivo = ({ paciente, estadisticas, chartData, evaluacion }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Información del Paciente */}
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
          <FaUser className="text-blue-600" />
          Información del Evaluado
        </h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <FaUser className="text-3xl text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Nombre Completo</h3>
            <p className="text-lg font-bold text-blue-600">
              {paciente?.nombre} {paciente?.apellido}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <FaCalendarAlt className="text-3xl text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Fecha de Evaluación</h3>
            <p className="text-lg font-bold text-green-600">
              {evaluacion?.fecha_evaluacion ?
                new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-ES') :
                'No especificada'
              }
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <FaFileAlt className="text-3xl text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Documento</h3>
            <p className="text-lg font-bold text-purple-600">
              {paciente?.documento || 'No especificado'}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <FaClock className="text-3xl text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Tiempo Total</h3>
            <p className="text-lg font-bold text-orange-600">
              {estadisticas.tiempoTotal} min
            </p>
          </div>
        </div>
      </CardBody>
    </Card>

    {/* Estadísticas Generales */}
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
          <FaChartLine className="text-green-600" />
          Resumen de Resultados
        </h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {estadisticas.totalTests}
            </div>
            <div className="text-sm font-medium text-blue-700">
              Tests Completados
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {estadisticas.percentilPromedio}
            </div>
            <div className="text-sm font-medium text-green-700">
              Percentil Promedio
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {estadisticas.aptitudesAltas}
            </div>
            <div className="text-sm font-medium text-yellow-700">
              Aptitudes Altas
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {estadisticas.tiempoTotal}
            </div>
            <div className="text-sm font-medium text-purple-700">
              Minutos Totales
            </div>
          </div>
        </div>

        {/* Gráfico de barras compacto */}
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Perfil de Aptitudes (Percentiles)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="aptitud"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'percentil' ? 'Percentil' : name
                ]}
                labelFormatter={(label) => `Aptitud: ${label}`}
              />
              <Bar
                dataKey="percentil"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

// Componente: Análisis Gráfico
const AnalisisGrafico = ({ chartData, radarData, resultados }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Gráfico Radar */}
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
        <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
          <FaRadar className="text-purple-600" />
          Perfil Radar de Aptitudes
        </h2>
        <p className="text-purple-600 mt-2">
          Visualización integral del rendimiento en todas las aptitudes evaluadas
        </p>
      </CardHeader>
      <CardBody>
        <div className="bg-white p-6 rounded-xl border">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                tick={{ fontSize: 12, fill: '#374151' }}
                className="font-semibold"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
              />
              <Radar
                name="Percentil"
                dataKey="percentil"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}%`, 'Percentil']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>

    {/* Gráfico de Líneas - Progresión */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Distribución por Niveles
          </h3>
        </CardHeader>
        <CardBody>
          <div className="bg-white p-4 rounded-xl border">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Alto (≥75)', value: chartData.filter(d => d.percentil >= 75).length, fill: '#10B981' },
                    { name: 'Medio (25-74)', value: chartData.filter(d => d.percentil >= 25 && d.percentil < 75).length, fill: '#F59E0B' },
                    { name: 'Bajo (<25)', value: chartData.filter(d => d.percentil < 25).length, fill: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
            <FaTable className="text-green-600" />
            Tabla Detallada de Resultados
          </h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Aptitud</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">PD</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">PC</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="px-3 py-2 font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        {item.nombre}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      {item.puntajeDirecto}
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-blue-600">
                      {item.percentil}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColorByLevel(item.nivel)}`}>
                        {item.nivel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  </motion.div>
);

// Componente: Interpretación Detallada
const InterpretacionDetallada = ({ resultados, paciente }) => {
  const interpretaciones = {
    'V': {
      nombre: 'Aptitud Verbal',
      descripcion: 'Capacidad para comprender y utilizar el lenguaje de manera efectiva',
      fortalezas: ['Comprensión lectora', 'Vocabulario', 'Expresión verbal'],
      aplicaciones: ['Comunicación', 'Redacción', 'Análisis de textos']
    },
    'E': {
      nombre: 'Aptitud Espacial',
      descripcion: 'Habilidad para visualizar y manipular objetos en el espacio',
      fortalezas: ['Visualización 3D', 'Orientación espacial', 'Geometría'],
      aplicaciones: ['Arquitectura', 'Ingeniería', 'Diseño']
    },
    'A': {
      nombre: 'Atención y Concentración',
      descripcion: 'Capacidad para mantener el foco y procesar información detallada',
      fortalezas: ['Concentración sostenida', 'Precisión', 'Control atencional'],
      aplicaciones: ['Tareas de precisión', 'Control de calidad', 'Análisis detallado']
    },
    'R': {
      nombre: 'Razonamiento Lógico',
      descripcion: 'Habilidad para resolver problemas mediante el pensamiento lógico',
      fortalezas: ['Análisis lógico', 'Resolución de problemas', 'Pensamiento crítico'],
      aplicaciones: ['Programación', 'Investigación', 'Análisis de datos']
    },
    'N': {
      nombre: 'Aptitud Numérica',
      descripcion: 'Capacidad para trabajar con números y conceptos matemáticos',
      fortalezas: ['Cálculo mental', 'Análisis cuantitativo', 'Matemáticas'],
      aplicaciones: ['Finanzas', 'Estadística', 'Contabilidad']
    },
    'M': {
      nombre: 'Aptitud Mecánica',
      descripcion: 'Comprensión de principios mecánicos y físicos',
      fortalezas: ['Física aplicada', 'Mecánica', 'Resolución técnica'],
      aplicaciones: ['Ingeniería mecánica', 'Mantenimiento', 'Tecnología']
    },
    'O': {
      nombre: 'Ortografía y Lenguaje',
      descripcion: 'Dominio de las reglas ortográficas y uso correcto del idioma',
      fortalezas: ['Corrección ortográfica', 'Gramática', 'Precisión lingüística'],
      aplicaciones: ['Edición', 'Comunicación escrita', 'Enseñanza']
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
            <FaBrain className="text-indigo-600" />
            Interpretación Psicológica Detallada
          </h2>
          <p className="text-indigo-600 mt-2">
            Análisis cualitativo de las aptitudes evaluadas para {paciente?.nombre} {paciente?.apellido}
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {resultados.map((resultado, index) => {
              const codigo = resultado.aptitud?.codigo;
              const interpretacion = interpretaciones[codigo];
              const percentil = resultado.percentil || 0;
              const nivel = getNivelPorPercentil(percentil);

              if (!interpretacion) return null;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: APTITUDE_COLORS[codigo] || '#6B7280' }}
                    >
                      {codigo}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {interpretacion.nombre}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {percentil}%
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorByLevel(nivel)}`}>
                            {nivel}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {interpretacion.descripcion}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FaAward className="text-yellow-500" />
                            Fortalezas Identificadas
                          </h4>
                          <ul className="space-y-1">
                            {interpretacion.fortalezas.map((fortaleza, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                {fortaleza}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FaLightbulb className="text-blue-500" />
                            Áreas de Aplicación
                          </h4>
                          <ul className="space-y-1">
                            {interpretacion.aplicaciones.map((aplicacion, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                {aplicacion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interpretación específica por nivel */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Interpretación Específica (Nivel {nivel})
                        </h4>
                        <p className="text-sm text-gray-700">
                          {getInterpretacionPorNivel(codigo, nivel, percentil)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Componente: Recomendaciones Personalizadas
const RecomendacionesPersonalizadas = ({ resultados, paciente, estadisticas }) => {
  const aptitudesAltas = resultados.filter(r => (r.percentil || 0) >= 75);
  const aptitudesBajas = resultados.filter(r => (r.percentil || 0) < 25);

  const recomendacionesVocacionales = generarRecomendacionesVocacionales(aptitudesAltas);
  const estrategiasDesarrollo = generarEstrategiasDesarrollo(aptitudesBajas);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Recomendaciones Vocacionales */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
            <FaLightbulb className="text-green-600" />
            Orientación Vocacional
          </h2>
          <p className="text-green-600 mt-2">
            Carreras y áreas profesionales recomendadas basadas en las fortalezas identificadas
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recomendacionesVocacionales.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
              >
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{area.icono}</span>
                  {area.area}
                </h3>
                <p className="text-blue-700 mb-4 text-sm">
                  {area.descripcion}
                </p>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Carreras Sugeridas:</h4>
                  <ul className="space-y-1">
                    {area.carreras.map((carrera, idx) => (
                      <li key={idx} className="text-sm text-blue-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {carrera}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Estrategias de Desarrollo */}
      {aptitudesBajas.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <h2 className="text-2xl font-bold text-orange-800 flex items-center gap-3">
              <FaChartLine className="text-orange-600" />
              Estrategias de Desarrollo
            </h2>
            <p className="text-orange-600 mt-2">
              Recomendaciones para fortalecer áreas con potencial de mejora
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {estrategiasDesarrollo.map((estrategia, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-orange-200 rounded-lg p-4"
                >
                  <h3 className="font-bold text-orange-800 mb-2">
                    {estrategia.aptitud}
                  </h3>
                  <p className="text-gray-700 mb-3 text-sm">
                    {estrategia.descripcion}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Actividades Recomendadas:</h4>
                      <ul className="space-y-1">
                        {estrategia.actividades.map((actividad, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            {actividad}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Recursos Sugeridos:</h4>
                      <ul className="space-y-1">
                        {estrategia.recursos.map((recurso, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            {recurso}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Resumen Final */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
          <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
            <FaFileAlt className="text-purple-600" />
            Resumen y Conclusiones
          </h2>
        </CardHeader>
        <CardBody>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-purple-800 mb-4">
              Perfil Cognitivo de {paciente?.nombre} {paciente?.apellido}
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Fortalezas Principales:</strong> Las aptitudes más desarrolladas son{' '}
                {aptitudesAltas.map(r => r.aptitud?.nombre).join(', ')},
                lo que indica un perfil cognitivo con excelentes capacidades en estas áreas.
              </p>
              <p>
                <strong>Percentil Promedio:</strong> {estadisticas.percentilPromedio}%,
                ubicándose en un nivel {getNivelPorPercentil(estadisticas.percentilPromedio)}
                en comparación con la población de referencia.
              </p>
              <p>
                <strong>Recomendación General:</strong> Se sugiere enfocar el desarrollo académico
                y profesional aprovechando las fortalezas identificadas, mientras se implementan
                estrategias específicas para potenciar las áreas con mayor margen de mejora.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Funciones auxiliares
function getNivelPorPercentil(percentil) {
  if (percentil >= 90) return 'Muy Alto';
  if (percentil >= 75) return 'Alto';
  if (percentil >= 50) return 'Medio-Alto';
  if (percentil >= 25) return 'Medio';
  if (percentil >= 10) return 'Bajo';
  return 'Muy Bajo';
}

function getColorByLevel(nivel) {
  const colors = {
    'Muy Alto': 'text-green-600 bg-green-100',
    'Alto': 'text-blue-600 bg-blue-100',
    'Medio-Alto': 'text-indigo-600 bg-indigo-100',
    'Medio': 'text-yellow-600 bg-yellow-100',
    'Bajo': 'text-orange-600 bg-orange-100',
    'Muy Bajo': 'text-red-600 bg-red-100'
  };
  return colors[nivel] || 'text-gray-600 bg-gray-100';
}

function getInterpretacionPorNivel(codigo, nivel, percentil) {
  const interpretaciones = {
    'V': {
      'Muy Alto': `Excelente capacidad verbal (percentil ${percentil}). Demuestra un dominio superior del lenguaje, comprensión lectora avanzada y habilidades comunicativas excepcionales.`,
      'Alto': `Buena capacidad verbal (percentil ${percentil}). Muestra competencias sólidas en comprensión y expresión verbal, con potencial para actividades que requieran habilidades lingüísticas.`,
      'Medio': `Capacidad verbal promedio (percentil ${percentil}). Presenta habilidades verbales dentro del rango esperado para su grupo de referencia.`,
      'Bajo': `Capacidad verbal por debajo del promedio (percentil ${percentil}). Se recomienda reforzar habilidades de comprensión lectora y expresión verbal.`
    },
    'E': {
      'Muy Alto': `Excelente aptitud espacial (percentil ${percentil}). Demuestra habilidades superiores para visualizar y manipular objetos en el espacio tridimensional.`,
      'Alto': `Buena aptitud espacial (percentil ${percentil}). Muestra competencias sólidas en visualización espacial y orientación geométrica.`,
      'Medio': `Aptitud espacial promedio (percentil ${percentil}). Presenta habilidades espaciales dentro del rango esperado.`,
      'Bajo': `Aptitud espacial por debajo del promedio (percentil ${percentil}). Se sugiere práctica con actividades de visualización espacial.`
    },
    'A': {
      'Muy Alto': `Excelente capacidad atencional (percentil ${percentil}). Demuestra una concentración superior y control atencional excepcional.`,
      'Alto': `Buena capacidad atencional (percentil ${percentil}). Muestra habilidades sólidas de concentración y atención sostenida.`,
      'Medio': `Capacidad atencional promedio (percentil ${percentil}). Presenta niveles de atención dentro del rango esperado.`,
      'Bajo': `Capacidad atencional por debajo del promedio (percentil ${percentil}). Se recomienda trabajar técnicas de concentración y atención.`
    },
    'R': {
      'Muy Alto': `Excelente razonamiento lógico (percentil ${percentil}). Demuestra habilidades superiores para el análisis lógico y resolución de problemas complejos.`,
      'Alto': `Buen razonamiento lógico (percentil ${percentil}). Muestra competencias sólidas en pensamiento analítico y resolución de problemas.`,
      'Medio': `Razonamiento lógico promedio (percentil ${percentil}). Presenta habilidades de razonamiento dentro del rango esperado.`,
      'Bajo': `Razonamiento lógico por debajo del promedio (percentil ${percentil}). Se sugiere práctica con ejercicios de lógica y resolución de problemas.`
    },
    'N': {
      'Muy Alto': `Excelente aptitud numérica (percentil ${percentil}). Demuestra habilidades superiores en cálculo mental y razonamiento matemático.`,
      'Alto': `Buena aptitud numérica (percentil ${percentil}). Muestra competencias sólidas en operaciones numéricas y conceptos matemáticos.`,
      'Medio': `Aptitud numérica promedio (percentil ${percentil}). Presenta habilidades matemáticas dentro del rango esperado.`,
      'Bajo': `Aptitud numérica por debajo del promedio (percentil ${percentil}). Se recomienda reforzar habilidades de cálculo y razonamiento matemático.`
    },
    'M': {
      'Muy Alto': `Excelente aptitud mecánica (percentil ${percentil}). Demuestra comprensión superior de principios físicos y mecánicos.`,
      'Alto': `Buena aptitud mecánica (percentil ${percentil}). Muestra competencias sólidas en comprensión de sistemas mecánicos.`,
      'Medio': `Aptitud mecánica promedio (percentil ${percentil}). Presenta comprensión mecánica dentro del rango esperado.`,
      'Bajo': `Aptitud mecánica por debajo del promedio (percentil ${percentil}). Se sugiere exposición a conceptos de física aplicada y mecánica.`
    },
    'O': {
      'Muy Alto': `Excelente dominio ortográfico (percentil ${percentil}). Demuestra un manejo superior de las reglas ortográficas y uso correcto del idioma.`,
      'Alto': `Buen dominio ortográfico (percentil ${percentil}). Muestra competencias sólidas en ortografía y uso del lenguaje.`,
      'Medio': `Dominio ortográfico promedio (percentil ${percentil}). Presenta habilidades ortográficas dentro del rango esperado.`,
      'Bajo': `Dominio ortográfico por debajo del promedio (percentil ${percentil}). Se recomienda reforzar el estudio de reglas ortográficas.`
    }
  };

  return interpretaciones[codigo]?.[nivel] || `Interpretación no disponible para ${codigo} - ${nivel}`;
}

function generarRecomendacionesVocacionales(aptitudesAltas) {
  const recomendaciones = [];
  const codigosAltos = aptitudesAltas.map(a => a.aptitud?.codigo);

  if (codigosAltos.includes('V') || codigosAltos.includes('O')) {
    recomendaciones.push({
      area: 'Comunicación y Lenguaje',
      icono: '📝',
      descripcion: 'Áreas profesionales que requieren excelentes habilidades comunicativas y dominio del lenguaje.',
      carreras: ['Periodismo', 'Literatura', 'Traducción', 'Comunicación Social', 'Lingüística', 'Edición']
    });
  }

  if (codigosAltos.includes('N') || codigosAltos.includes('R')) {
    recomendaciones.push({
      area: 'Ciencias Exactas',
      icono: '🔢',
      descripcion: 'Disciplinas que requieren razonamiento lógico-matemático y análisis cuantitativo.',
      carreras: ['Matemáticas', 'Física', 'Estadística', 'Actuaría', 'Economía', 'Ingeniería']
    });
  }

  if (codigosAltos.includes('E')) {
    recomendaciones.push({
      area: 'Diseño y Arquitectura',
      icono: '🏗️',
      descripcion: 'Campos que requieren visualización espacial y habilidades de diseño tridimensional.',
      carreras: ['Arquitectura', 'Diseño Industrial', 'Ingeniería Civil', 'Diseño Gráfico', 'Urbanismo']
    });
  }

  if (codigosAltos.includes('M')) {
    recomendaciones.push({
      area: 'Ingeniería y Tecnología',
      icono: '⚙️',
      descripcion: 'Áreas técnicas que requieren comprensión de sistemas mecánicos y principios físicos.',
      carreras: ['Ingeniería Mecánica', 'Ingeniería Industrial', 'Tecnología', 'Mantenimiento', 'Automatización']
    });
  }

  if (codigosAltos.includes('A')) {
    recomendaciones.push({
      area: 'Análisis y Control',
      icono: '🔍',
      descripcion: 'Profesiones que requieren alta concentración y atención al detalle.',
      carreras: ['Control de Calidad', 'Auditoría', 'Investigación', 'Análisis de Datos', 'Laboratorio']
    });
  }

  return recomendaciones.length > 0 ? recomendaciones : [{
    area: 'Desarrollo General',
    icono: '🎯',
    descripcion: 'Recomendaciones generales basadas en el perfil cognitivo identificado.',
    carreras: ['Administración', 'Gestión', 'Servicios', 'Comercio', 'Atención al Cliente']
  }];
}

function generarEstrategiasDesarrollo(aptitudesBajas) {
  return aptitudesBajas.map(resultado => {
    const codigo = resultado.aptitud?.codigo;
    const estrategias = {
      'V': {
        aptitud: 'Aptitud Verbal',
        descripcion: 'Estrategias para mejorar la comprensión y expresión verbal.',
        actividades: ['Lectura diaria variada', 'Escritura creativa', 'Debates y discusiones', 'Análisis de textos'],
        recursos: ['Libros de diferentes géneros', 'Diccionarios y tesauros', 'Cursos de redacción', 'Clubes de lectura']
      },
      'E': {
        aptitud: 'Aptitud Espacial',
        descripcion: 'Actividades para desarrollar la visualización espacial.',
        actividades: ['Rompecabezas 3D', 'Dibujo técnico', 'Origami', 'Videojuegos espaciales'],
        recursos: ['Software de diseño 3D', 'Juegos de construcción', 'Cursos de geometría', 'Apps de visualización']
      },
      'A': {
        aptitud: 'Atención y Concentración',
        descripción: 'Técnicas para mejorar la capacidad atencional.',
        actividades: ['Meditación mindfulness', 'Ejercicios de concentración', 'Tareas de precisión', 'Juegos de atención'],
        recursos: ['Apps de meditación', 'Ejercicios cognitivos', 'Técnicas de estudio', 'Ambientes sin distracciones']
      },
      'R': {
        aptitud: 'Razonamiento Lógico',
        descripcion: 'Ejercicios para fortalecer el pensamiento lógico.',
        actividades: ['Sudokus y acertijos', 'Programación básica', 'Juegos de estrategia', 'Análisis de casos'],
        recursos: ['Libros de lógica', 'Plataformas de programación', 'Juegos de mesa estratégicos', 'Cursos de pensamiento crítico']
      },
      'N': {
        aptitud: 'Aptitud Numérica',
        descripcion: 'Práctica para mejorar las habilidades matemáticas.',
        actividades: ['Cálculo mental diario', 'Problemas matemáticos', 'Análisis de datos', 'Juegos numéricos'],
        recursos: ['Apps de matemáticas', 'Libros de ejercicios', 'Cursos online', 'Calculadoras científicas']
      },
      'M': {
        aptitud: 'Aptitud Mecánica',
        descripcion: 'Actividades para comprender principios mecánicos.',
        actividades: ['Experimentos de física', 'Construcción de modelos', 'Reparaciones básicas', 'Observación de máquinas'],
        recursos: ['Kits de experimentos', 'Videos educativos', 'Manuales técnicos', 'Talleres prácticos']
      },
      'O': {
        aptitud: 'Ortografía y Lenguaje',
        descripcion: 'Práctica para mejorar la corrección ortográfica.',
        actividades: ['Dictados regulares', 'Lectura en voz alta', 'Escritura diaria', 'Corrección de textos'],
        recursos: ['Correctores ortográficos', 'Libros de gramática', 'Apps de ortografía', 'Cursos de redacción']
      }
    };

    return estrategias[codigo] || {
      aptitud: resultado.aptitud?.nombre || 'Aptitud Desconocida',
      descripcion: 'Estrategias generales de desarrollo cognitivo.',
      actividades: ['Práctica regular', 'Ejercicios específicos', 'Refuerzo académico'],
      recursos: ['Material educativo', 'Apoyo profesional', 'Cursos especializados']
    };
  });
}

export default SpectacularInformeViewer;
