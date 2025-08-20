import React, { useState, useEffect } from 'react';
import SpectacularInformeViewer from './SpectacularInformeViewer';
import InformesService from '../../services/InformesService';
import { FaSpinner, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';

/**
 * Wrapper component que maneja la carga de datos y muestra el SpectacularInformeViewer
 * Puede recibir datos directamente o cargarlos por ID
 */
const InformeViewerWrapper = ({ 
  // Opción 1: Datos directos
  paciente, 
  resultados, 
  evaluacion,
  
  // Opción 2: Cargar por ID
  informeId,
  
  // Común
  onClose 
}) => {
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si se pasan datos directamente, usarlos
    if (paciente && resultados) {
      setInforme({
        paciente,
        resultados,
        evaluacion: evaluacion || {}
      });
      return;
    }

    // Si se pasa un ID, cargar los datos
    if (informeId) {
      cargarInforme();
    }
  }, [informeId, paciente, resultados, evaluacion]);

  const cargarInforme = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const informeData = await InformesService.obtenerInforme(informeId);
      setInforme(informeData);
      
    } catch (error) {
      console.error('Error cargando informe:', error);
      setError(error.message || 'Error al cargar el informe');
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Cargando informe...</h3>
              <p className="text-gray-600">Preparando datos del paciente</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md">
          <div className="text-center">
            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar informe</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={cargarInforme}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-redo"></i>
                Reintentar
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-times"></i>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sin datos
  if (!informe || !informe.paciente) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <div className="text-center">
            <FaFileAlt className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Informe no encontrado</h3>
            <p className="text-gray-600 mb-6">No se encontraron datos para mostrar el informe</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar el informe espectacular
  return (
    <SpectacularInformeViewer
      paciente={informe.paciente}
      resultados={informe.resultados || []}
      evaluacion={informe.evaluacion || {}}
      onClose={onClose}
    />
  );
};

export default InformeViewerWrapper;
