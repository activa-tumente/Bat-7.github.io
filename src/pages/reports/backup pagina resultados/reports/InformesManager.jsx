/**
 * @file InformesManager.jsx
 * @description Componente para gestionar la generación y visualización de informes manuales
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import InformesService from '../../services/InformesService';
import InformeViewer from './InformeViewer';
import { toast } from 'react-toastify';

const InformesManager = ({ paciente, resultados, onInformeGenerado }) => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoInforme, setTipoInforme] = useState('completo');
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [informeViendose, setInformeViendose] = useState(null);

  useEffect(() => {
    if (paciente?.id) {
      console.log('📁 [InformesManager] Cargando informes para paciente:', paciente.id, paciente.nombre, paciente.apellido);
      cargarInformes();
    }
  }, [paciente?.id]);

  /**
   * Cargar informes existentes del paciente
   */
  const cargarInformes = async () => {
    try {
      setLoading(true);
      console.log('📋 [InformesManager] Obteniendo informes para paciente:', paciente.id);
      const informesData = await InformesService.obtenerInformesPaciente(paciente.id);
      console.log('📋 [InformesManager] Informes obtenidos:', informesData?.length || 0);
      setInformes(informesData);
    } catch (error) {
      console.error('❌ [InformesManager] Error cargando informes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generar nuevo informe
   */
  const generarInforme = async () => {
    try {
      setGenerandoInforme(true);

      let informeId;
      
      if (tipoInforme === 'completo') {
        informeId = await InformesService.generarInformeCompleto(
          paciente.id,
          titulo || null,
          descripcion || null
        );
      } else if (tipoInforme === 'individual' && resultadoSeleccionado) {
        informeId = await InformesService.generarInformeIndividual(
          resultadoSeleccionado,
          titulo || null,
          descripcion || null
        );
      }

      if (informeId) {
        // Recargar informes
        await cargarInformes();
        
        // Limpiar formulario
        setTitulo('');
        setDescripcion('');
        setResultadoSeleccionado('');
        setMostrarFormulario(false);
        
        // Notificar al componente padre
        if (onInformeGenerado) {
          onInformeGenerado(informeId);
        }
      }
    } catch (error) {
      console.error('Error generando informe:', error);
    } finally {
      setGenerandoInforme(false);
    }
  };

  /**
   * Archivar informe
   */
  const archivarInforme = async (informeId) => {
    try {
      await InformesService.archivarInforme(informeId);
      await cargarInformes();
    } catch (error) {
      console.error('Error archivando informe:', error);
    }
  };

  /**
   * Eliminar informe
   */
  const eliminarInforme = async (informeId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este informe?')) {
      try {
        await InformesService.eliminarInforme(informeId);
        await cargarInformes();
      } catch (error) {
        console.error('Error eliminando informe:', error);
      }
    }
  };

  /**
   * Ver informe
   */
  const verInforme = (informeId) => {
    setInformeViendose(informeId);
  };

  /**
   * Obtener color según el tipo de informe
   */
  const getColorTipo = (tipo) => {
    switch (tipo) {
      case 'completo': return 'blue';
      case 'individual': return 'green';
      case 'comparativo': return 'purple';
      default: return 'gray';
    }
  };

  /**
   * Obtener icono según el tipo de informe
   */
  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'completo': return 'fas fa-file-alt';
      case 'individual': return 'fas fa-file';
      case 'comparativo': return 'fas fa-chart-bar';
      default: return 'fas fa-file';
    }
  };

  return (
    <>
    <Card className="mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-folder-open mr-2 text-blue-600"></i>
            Informes Generados
          </h3>
          <Button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            <i className="fas fa-plus mr-2"></i>
            Generar Informe
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {/* Formulario para generar nuevo informe */}
        {mostrarFormulario && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-4">
              <i className="fas fa-magic mr-2"></i>
              Generar Nuevo Informe
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Tipo de informe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Informe
                </label>
                <select
                  value={tipoInforme}
                  onChange={(e) => setTipoInforme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="completo">Informe Completo</option>
                  <option value="individual">Informe Individual</option>
                </select>
              </div>

              {/* Resultado específico (solo para informe individual) */}
              {tipoInforme === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Específico
                  </label>
                  <select
                    value={resultadoSeleccionado}
                    onChange={(e) => setResultadoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar test...</option>
                    {resultados.map((resultado) => (
                      <option key={resultado.id} value={resultado.id}>
                        {resultado.aptitudes?.nombre || resultado.aptitudes?.codigo} - 
                        PC: {resultado.percentil || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Título personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título personalizado para el informe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción o notas adicionales"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generarInforme}
                disabled={generandoInforme || (tipoInforme === 'individual' && !resultadoSeleccionado)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {generandoInforme ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generar Informe
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de informes existentes */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">
            <i className="fas fa-archive mr-2"></i>
            Informes Archivados ({informes.length})
          </h4>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">Cargando informes...</p>
            </div>
          ) : informes.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No hay informes generados para este estudiante.</p>
              <p className="text-sm text-gray-400 mt-2">
                Utiliza el botón "Generar Informe" para crear el primer informe.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {informes.map((informe) => {
                const color = getColorTipo(informe.tipo_informe);
                const icono = getIconoTipo(informe.tipo_informe);
                
                return (
                  <div
                    key={informe.id}
                    className={`p-4 border border-${color}-200 bg-${color}-50 rounded-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <i className={`${icono} text-${color}-600 mr-2`}></i>
                          <h5 className="font-semibold text-gray-800">{informe.titulo}</h5>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800`}>
                            {informe.tipo_informe}
                          </span>
                        </div>
                        
                        {informe.descripcion && (
                          <p className="text-sm text-gray-600 mb-2">{informe.descripcion}</p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {new Date(informe.fecha_generacion).toLocaleDateString('es-ES')}
                          </span>
                          <span>
                            <i className="fas fa-user mr-1"></i>
                            {informe.generado_por_email}
                          </span>
                          {informe.total_resultados > 0 && (
                            <span>
                              <i className="fas fa-chart-line mr-1"></i>
                              {informe.total_resultados} resultado{informe.total_resultados !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => verInforme(informe.id)}
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        
                        {informe.estado === 'generado' && (
                          <Button
                            onClick={() => archivarInforme(informe.id)}
                            size="sm"
                            className="bg-yellow-500 text-white hover:bg-yellow-600"
                          >
                            <i className="fas fa-archive"></i>
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => eliminarInforme(informe.id)}
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardBody>
    </Card>

    {/* Visor de informes */}
    {informeViendose && (
      <InformeViewer
        informeId={informeViendose}
        onClose={() => setInformeViendose(null)}
      />
    )}
    </>
  );
};

export default InformesManager;
