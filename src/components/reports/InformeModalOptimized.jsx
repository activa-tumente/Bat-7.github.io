/**
 * @file InformeModalOptimized.jsx
 * @description Componente optimizado para mostrar informes con lazy loading y memoización
 * Implementa mejores prácticas de rendimiento para React
 */

import React, { memo, useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaDownload, FaPrint, FaSpinner } from 'react-icons/fa';
import { Button } from '../ui/Button';
import { useInformes } from '../../contexts/InformesContext';
import { useInterpretacionesMemoized } from '../../hooks/useInterpretacionesMemoized';
import { formatDate } from '../../utils/dateUtils';
import { toast } from 'react-toastify';

// Lazy loading de componentes pesados
const GraficoRendimiento = lazy(() => import('../charts/GraficoRendimiento'));
const TablaResultados = lazy(() => import('../tables/TablaResultados'));
const SeccionInterpretaciones = lazy(() => import('./SeccionInterpretaciones'));
const SeccionRecomendaciones = lazy(() => import('./SeccionRecomendaciones'));

// Componente de loading optimizado
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <FaSpinner className="animate-spin text-blue-500 text-2xl mr-2" />
    <span className="text-gray-600">Cargando...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Componente de error optimizado
const ErrorBoundary = memo(({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
    <h3 className="text-red-800 font-semibold mb-2">Error al cargar el componente</h3>
    <p className="text-red-600 text-sm mb-3">{error?.message || 'Error desconocido'}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm">
        Reintentar
      </Button>
    )}
  </div>
));

ErrorBoundary.displayName = 'ErrorBoundary';
ErrorBoundary.propTypes = {
  error: PropTypes.object,
  onRetry: PropTypes.func
};

// Componente principal optimizado
const InformeModalOptimized = memo(({
  isOpen,
  onClose,
  patient,
  results = [],
  configuracion = {}
}) => {
  // Estados locales
  const [activeTab, setActiveTab] = useState('resumen');
  const [isGenerating, setIsGenerating] = useState(false);
  const [componentErrors, setComponentErrors] = useState({});

  // Context de informes
  const { 
    generarInforme, 
    informeActual, 
    loading: informeLoading,
    TIPOS_INFORME 
  } = useInformes();

  // Hook memoizado para interpretaciones
  const {
    resultadosProcesados,
    interpretacionesCualitativas,
    estadisticasGenerales,
    recomendaciones,
    isLoading: interpretacionesLoading
  } = useInterpretacionesMemoized(results, {
    incluirRendimiento: configuracion.incluirRendimiento ?? true,
    incluirAcademico: configuracion.incluirAcademico ?? true,
    incluirVocacional: configuracion.incluirVocacional ?? true
  });

  // Memoizar datos del paciente procesados
  const datosPatiente = useMemo(() => {
    if (!patient) return null;
    
    return {
      nombreCompleto: `${patient.nombre} ${patient.apellido}`,
      edad: patient.edad || 'No especificada',
      documento: patient.documento || 'No especificado',
      fechaNacimiento: patient.fecha_nacimiento 
        ? formatDate(patient.fecha_nacimiento) 
        : 'No especificada',
      genero: patient.genero || 'No especificado'
    };
  }, [patient]);

  // Memoizar configuración de tabs
  const tabs = useMemo(() => [
    { id: 'resumen', label: 'Resumen', icon: 'chart' },
    { id: 'resultados', label: 'Resultados', icon: 'table' },
    { id: 'interpretaciones', label: 'Interpretaciones', icon: 'brain' },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: 'clipboard' }
  ], []);

  // Callback para cambiar tab
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Callback para generar informe
  const handleGenerarInforme = useCallback(async () => {
    if (!patient?.id) {
      toast.error('No se puede generar el informe: datos del paciente incompletos');
      return;
    }

    try {
      setIsGenerating(true);
      await generarInforme(TIPOS_INFORME.COMPLETO, {
        pacienteId: patient.id,
        titulo: `Informe BAT-7 - ${datosPatiente?.nombreCompleto}`,
        descripcion: 'Informe psicológico completo'
      }, configuracion);
      toast.success('Informe generado exitosamente');
    } catch (error) {
      console.error('Error al generar informe:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [patient, datosPatiente, generarInforme, TIPOS_INFORME, configuracion]);

  // Callback para manejar errores de componentes
  const handleComponentError = useCallback((componentName, error) => {
    setComponentErrors(prev => ({
      ...prev,
      [componentName]: error
    }));
  }, []);

  // Callback para reintentar carga de componente
  const handleRetryComponent = useCallback((componentName) => {
    setComponentErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[componentName];
      return newErrors;
    });
  }, []);

  // Efecto para limpiar errores al cambiar de tab
  useEffect(() => {
    setComponentErrors({});
  }, [activeTab]);

  // Renderizar contenido del tab activo
  const renderTabContent = useCallback(() => {
    const commonProps = {
      patient: datosPatiente,
      results: resultadosProcesados,
      estadisticas: estadisticasGenerales
    };

    switch (activeTab) {
      case 'resumen':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Información del Paciente</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nombre:</span> {datosPatiente?.nombreCompleto}</p>
                  <p><span className="font-medium">Edad:</span> {datosPatiente?.edad}</p>
                  <p><span className="font-medium">Documento:</span> {datosPatiente?.documento}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Estadísticas Generales</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Total Aptitudes:</span> {estadisticasGenerales.totalAptitudes}</p>
                  <p><span className="font-medium">Promedio Percentil:</span> {estadisticasGenerales.promedioPercentil}</p>
                  <p><span className="font-medium">Fortalezas:</span> {estadisticasGenerales.aptitudesAltas.length}</p>
                </div>
              </div>
            </div>
            
            {!componentErrors.grafico && (
              <Suspense fallback={<LoadingSpinner />}>
                <GraficoRendimiento 
                  {...commonProps}
                  onError={(error) => handleComponentError('grafico', error)}
                />
              </Suspense>
            )}
            
            {componentErrors.grafico && (
              <ErrorBoundary 
                error={componentErrors.grafico}
                onRetry={() => handleRetryComponent('grafico')}
              />
            )}
          </div>
        );

      case 'resultados':
        return (
          <div>
            {!componentErrors.tabla && (
              <Suspense fallback={<LoadingSpinner />}>
                <TablaResultados 
                  {...commonProps}
                  onError={(error) => handleComponentError('tabla', error)}
                />
              </Suspense>
            )}
            
            {componentErrors.tabla && (
              <ErrorBoundary 
                error={componentErrors.tabla}
                onRetry={() => handleRetryComponent('tabla')}
              />
            )}
          </div>
        );

      case 'interpretaciones':
        return (
          <div>
            {!componentErrors.interpretaciones && (
              <Suspense fallback={<LoadingSpinner />}>
                <SeccionInterpretaciones 
                  interpretaciones={interpretacionesCualitativas}
                  resultados={resultadosProcesados}
                  onError={(error) => handleComponentError('interpretaciones', error)}
                />
              </Suspense>
            )}
            
            {componentErrors.interpretaciones && (
              <ErrorBoundary 
                error={componentErrors.interpretaciones}
                onRetry={() => handleRetryComponent('interpretaciones')}
              />
            )}
          </div>
        );

      case 'recomendaciones':
        return (
          <div>
            {!componentErrors.recomendaciones && (
              <Suspense fallback={<LoadingSpinner />}>
                <SeccionRecomendaciones 
                  recomendaciones={recomendaciones}
                  estadisticas={estadisticasGenerales}
                  onError={(error) => handleComponentError('recomendaciones', error)}
                />
              </Suspense>
            )}
            
            {componentErrors.recomendaciones && (
              <ErrorBoundary 
                error={componentErrors.recomendaciones}
                onRetry={() => handleRetryComponent('recomendaciones')}
              />
            )}
          </div>
        );

      default:
        return <div className="text-center text-gray-500 py-8">Contenido no disponible</div>;
    }
  }, [activeTab, datosPatiente, resultadosProcesados, estadisticasGenerales, interpretacionesCualitativas, recomendaciones, componentErrors, handleComponentError, handleRetryComponent]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Informe BAT-7 - {datosPatiente?.nombreCompleto}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Generado el {formatDate(new Date())}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerarInforme}
              disabled={isGenerating || informeLoading}
              className="flex items-center space-x-2"
            >
              {(isGenerating || informeLoading) ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaDownload />
              )}
              <span>{isGenerating ? 'Generando...' : 'Generar PDF'}</span>
            </Button>
            
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FaPrint />
              <span>Imprimir</span>
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {interpretacionesLoading ? (
            <LoadingSpinner />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
});

InformeModalOptimized.displayName = 'InformeModalOptimized';

// PropTypes
InformeModalOptimized.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    documento: PropTypes.string,
    fecha_nacimiento: PropTypes.string,
    edad: PropTypes.number,
    genero: PropTypes.string
  }),
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      aptitud: PropTypes.string.isRequired,
      percentil: PropTypes.number,
      puntuacion_directa: PropTypes.number,
      tiempo: PropTypes.number,
      errores: PropTypes.number
    })
  ),
  configuracion: PropTypes.shape({
    incluirRendimiento: PropTypes.bool,
    incluirAcademico: PropTypes.bool,
    incluirVocacional: PropTypes.bool,
    incluirGraficos: PropTypes.bool,
    incluirRecomendaciones: PropTypes.bool
  })
};

export default InformeModalOptimized;