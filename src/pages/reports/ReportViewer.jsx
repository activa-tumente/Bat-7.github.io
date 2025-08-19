import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaDownload,
  FaShare,
  FaPrint,
  FaArrowLeft,
  FaFileAlt,
  FaUser,
  FaCalendarAlt,
  FaChartBar,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt
} from 'react-icons/fa';
import { withPsychologistProtection } from '../../hoc/withRoleProtection';

/**
 * Visor de informes en pantalla completa
 * Permite ver, imprimir y descargar informes de evaluaciones
 */
const ReportViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Datos de ejemplo del informe
  const mockReport = {
    id: 'report-001',
    title: 'Evaluación BAT-7 - María González',
    type: 'individual',
    candidateName: 'María González',
    candidateId: 'candidate-001',
    psychologistName: 'Dr. Juan Pérez',
    psychologistId: 'psych-001',
    questionnaireName: 'BAT-7 Evaluación Verbal',
    questionnaireId: 'bat7-verbal',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    status: 'completed',
    score: 78,
    grade: 'B+',
    fileSize: '2.4 MB',
    format: 'PDF',
    content: {
      summary: {
        totalQuestions: 60,
        correctAnswers: 47,
        timeSpent: '42 minutos',
        percentile: 85,
        strengths: [
          'Excelente comprensión de vocabulario técnico',
          'Buena capacidad de análisis textual',
          'Razonamiento lógico sólido'
        ],
        improvements: [
          'Mejorar velocidad de lectura',
          'Practicar analogías complejas',
          'Ampliar vocabulario académico'
        ]
      },
      categoryScores: {
        'Aptitud Verbal': { score: 82, maxScore: 100, questions: 20 },
        'Comprensión Lectora': { score: 75, maxScore: 100, questions: 25 },
        'Vocabulario': { score: 80, maxScore: 100, questions: 15 }
      },
      detailedAnalysis: `
        <h2>Análisis Detallado de Resultados</h2>
        <p>La evaluación BAT-7 de aptitudes verbales ha sido completada exitosamente por la candidata María González, 
        obteniendo una puntuación general de 78 puntos sobre 100, lo que equivale a una calificación B+.</p>
        
        <h3>Rendimiento por Categorías</h3>
        <p>El análisis por categorías muestra un rendimiento consistente en todas las áreas evaluadas:</p>
        <ul>
          <li><strong>Aptitud Verbal (82%):</strong> Excelente desempeño en tareas de razonamiento verbal</li>
          <li><strong>Comprensión Lectora (75%):</strong> Buen nivel de comprensión de textos complejos</li>
          <li><strong>Vocabulario (80%):</strong> Amplio conocimiento de términos técnicos y académicos</li>
        </ul>
        
        <h3>Fortalezas Identificadas</h3>
        <p>La candidata demuestra particular fortaleza en:</p>
        <ul>
          <li>Comprensión de vocabulario técnico especializado</li>
          <li>Análisis crítico de textos argumentativos</li>
          <li>Aplicación de razonamiento lógico en problemas verbales</li>
        </ul>
        
        <h3>Áreas de Mejora</h3>
        <p>Se recomienda trabajar en:</p>
        <ul>
          <li>Incrementar la velocidad de lectura manteniendo la comprensión</li>
          <li>Practicar con analogías de mayor complejidad</li>
          <li>Expandir el vocabulario académico en áreas específicas</li>
        </ul>
        
        <h3>Recomendaciones</h3>
        <p>Basándose en los resultados obtenidos, se recomienda:</p>
        <ol>
          <li>Continuar con el desarrollo de habilidades verbales avanzadas</li>
          <li>Implementar técnicas de lectura rápida</li>
          <li>Realizar ejercicios específicos de analogías complejas</li>
          <li>Participar en actividades que requieran análisis textual profundo</li>
        </ol>
        
        <h3>Conclusión</h3>
        <p>María González presenta un perfil sólido en aptitudes verbales, con un desempeño que la ubica 
        en el percentil 85 de la población evaluada. Sus fortalezas en comprensión y razonamiento verbal 
        la posicionan favorablemente para roles que requieran estas competencias.</p>
      `
    }
  };

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        // Aquí harías la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReport(mockReport);
        setTotalPages(3); // Simular múltiples páginas
      } catch (error) {
        console.error('Error cargando informe:', error);
        navigate('/reports');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id, navigate]);

  const handleDownload = () => {
    // Implementar descarga del informe
    console.log('Descargando informe:', id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Implementar compartir informe
    console.log('Compartiendo informe:', id);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando informe...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Informe no encontrado
          </h2>
          <button
            onClick={() => navigate('/reports')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Volver a informes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de herramientas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/reports')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {report.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(report.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Navegación de páginas */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    ‹
                  </button>
                  <span>
                    {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Acciones */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <FaCompressArrowsAlt className="h-5 w-5" /> : <FaExpandArrowsAlt className="h-5 w-5" />}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                title="Imprimir"
              >
                <FaPrint className="h-4 w-4 mr-2" />
                Imprimir
              </button>

              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700"
                title="Compartir"
              >
                <FaShare className="h-4 w-4 mr-2" />
                Compartir
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                <FaDownload className="h-4 w-4 mr-2" />
                Descargar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del informe */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header del informe */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center">
                    <FaUser className="h-4 w-4 mr-2" />
                    <span>{report.candidateName}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 mr-2" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaChartBar className="h-4 w-4 mr-2" />
                    <span>{report.questionnaireName}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold mb-1">{report.grade}</div>
                <div className="text-lg">{report.score}% de puntuación</div>
                <div className="text-sm text-blue-200">
                  Percentil {report.content.summary.percentile}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-8">
            {/* Resumen ejecutivo */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen Ejecutivo</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.content.summary.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Preguntas totales</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.content.summary.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Respuestas correctas</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.content.summary.timeSpent}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo utilizado</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {report.content.summary.percentile}%
                  </div>
                  <div className="text-sm text-gray-600">Percentil</div>
                </div>
              </div>
            </div>

            {/* Puntuaciones por categoría */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Puntuaciones por Categoría</h2>
              <div className="space-y-4">
                {Object.entries(report.content.categoryScores).map(([category, data]) => {
                  const percentage = (data.score / data.maxScore) * 100;
                  return (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{category}</h3>
                        <span className="text-lg font-bold text-gray-900">
                          {data.score}/{data.maxScore} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {data.questions} preguntas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fortalezas y mejoras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Fortalezas</h2>
                <ul className="space-y-3">
                  {report.content.summary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Áreas de Mejora</h2>
                <ul className="space-y-3">
                  {report.content.summary.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Análisis detallado */}
            <div className="mb-8">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: report.content.detailedAnalysis }}
              />
            </div>

            {/* Footer del informe */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p>Informe generado por: {report.psychologistName}</p>
                  <p>Fecha de generación: {formatDate(report.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p>ID del informe: {report.id}</p>
                  <p>Formato: {report.format} • Tamaño: {report.fileSize}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withPsychologistProtection(ReportViewer);
