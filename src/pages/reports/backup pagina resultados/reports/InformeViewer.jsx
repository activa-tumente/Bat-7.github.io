import React, { useState, useEffect, useRef } from 'react';
import InformesService from '../../services/InformesService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

// Componentes modulares
import InformeHeader from './sections/InformeHeader';
import InformacionPaciente from './sections/InformacionPaciente';
import ResumenGeneral from './sections/ResumenGeneral';
import ResultadosDetallados from './sections/ResultadosDetallados';
import AnalisisCualitativo from './sections/AnalisisCualitativo';

const InformeViewer = ({ informeId, onClose }) => {
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (informeId) {
      cargarInforme();
    }
  }, [informeId]);

  const cargarInforme = async () => {
    try {
      setLoading(true);
      console.log('🔍 [InformeViewer] Cargando informe:', informeId);
      
      const informeData = await InformesService.obtenerInforme(informeId);
      console.log('📄 [InformeViewer] Datos del informe:', informeData);
      
      // Procesar y estructurar los datos correctamente
      const informeProcesado = {
        id: informeData.id,
        titulo: informeData.titulo,
        tipo: informeData.tipo_informe,
        fechaGeneracion: informeData.fecha_generacion,
        paciente: informeData.contenido?.paciente || {},
        resultados: informeData.contenido?.resultados || [],
        estadisticas: informeData.contenido?.estadisticas || {},
        evaluacion: informeData.contenido?.evaluacion || {},
        metadatos: informeData.metadatos || {}
      };
      
      console.log('✅ [InformeViewer] Informe procesado:', informeProcesado);
      setInforme(informeProcesado);
      setError(null);
    } catch (error) {
      console.error('❌ [InformeViewer] Error cargando informe:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF
  const generarPDF = async () => {
    try {
      setGenerandoPDF(true);
      console.log('📄 [InformeViewer] Generando PDF...');

      const elemento = reportRef.current;
      if (!elemento) {
        throw new Error('No se pudo encontrar el elemento del informe');
      }

      // Configurar opciones para html2canvas
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: elemento.scrollWidth,
        height: elemento.scrollHeight
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar PDF
      const nombreArchivo = `Informe_BAT7_${informe?.paciente?.nombre || 'Paciente'}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`;
      pdf.save(nombreArchivo);

      console.log('✅ [InformeViewer] PDF generado exitosamente');
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('❌ [InformeViewer] Error generando PDF:', error);
      toast.error('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex items-center">
            <i className="fas fa-spinner fa-spin text-blue-600 text-2xl mr-4"></i>
            <span className="text-lg font-medium text-gray-700">Cargando informe...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el informe</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={cargarInforme}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!informe) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <i className="fas fa-file-times text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Informe no encontrado</h3>
          <p className="text-gray-600 mb-6">No se pudo cargar la información del informe solicitado.</p>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header del Modal */}
        <InformeHeader 
          informe={informe} 
          onClose={onClose} 
          onGeneratePDF={generarPDF} 
          isGeneratingPDF={generandoPDF} 
        />

        {/* Contenido del Informe */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div ref={reportRef} className="p-6 bg-white">
            
            {/* Información del Paciente */}
            <InformacionPaciente paciente={informe.paciente} />
            
            {/* Resumen General */}
            <ResumenGeneral estadisticas={informe.estadisticas} resultados={informe.resultados} />
            
            {/* Resultados Detallados */}
            <ResultadosDetallados resultados={informe.resultados} />
            
            {/* Análisis Cualitativo con Índices de Inteligencia */}
            <AnalisisCualitativo resultados={informe.resultados} paciente={informe.paciente} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeViewer;
