/**
 * @file InformesExistentes.jsx
 * @description Componente para mostrar todos los informes existentes en el sistema
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import supabase from '../../api/supabaseClient';
import InformeViewer from './InformeViewer';

const InformesExistentes = () => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [informeViendose, setInformeViendose] = useState(null);

  const cargarTodosLosInformes = async () => {
    try {
      setLoading(true);
      console.log('📋 [InformesExistentes] Cargando todos los informes...');

      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          id,
          tipo_informe,
          titulo,
          descripcion,
          estado,
          fecha_generacion,
          fecha_archivado,
          metadatos,
          pacientes:paciente_id (
            id,
            nombre,
            apellido,
            documento
          )
        `)
        .neq('estado', 'eliminado')
        .order('fecha_generacion', { ascending: false });

      if (error) {
        console.error('❌ [InformesExistentes] Error:', error);
        return;
      }

      console.log('✅ [InformesExistentes] Informes cargados:', data?.length || 0);
      setInformes(data || []);
    } catch (error) {
      console.error('❌ [InformesExistentes] Error general:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodosLosInformes();
  }, []);

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case 'completo': return 'blue';
      case 'individual': return 'green';
      case 'comparativo': return 'purple';
      default: return 'gray';
    }
  };

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
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              <i className="fas fa-archive mr-2 text-indigo-600"></i>
              📋 Todos los Informes Generados
            </h3>
            <Button
              onClick={cargarTodosLosInformes}
              disabled={loading}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              size="sm"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Vista global de todos los informes generados en el sistema
          </p>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">Cargando informes...</p>
            </div>
          ) : informes.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No hay informes generados en el sistema.</p>
              <p className="text-sm text-gray-400 mt-2">
                Los informes aparecerán aquí una vez que se generen.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1"></i>
                Mostrando {informes.length} informe{informes.length !== 1 ? 's' : ''} generado{informes.length !== 1 ? 's' : ''}
              </div>

              <div className="space-y-4">
                {informes.map((informe) => {
                  const color = getColorTipo(informe.tipo_informe);
                  const icono = getIconoTipo(informe.tipo_informe);
                  const totalResultados = informe.metadatos?.total_resultados || 0;

                  return (
                    <div
                      key={informe.id}
                      className={`p-4 border-2 border-${color}-200 bg-${color}-50 rounded-lg hover:border-${color}-300 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center mr-3`}>
                              <i className={`${icono} text-${color}-600`}></i>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-${color}-800 mb-1`}>
                                {informe.titulo}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className={`px-2 py-1 rounded-full bg-${color}-100 text-${color}-800 text-xs font-medium`}>
                                  {informe.tipo_informe}
                                </span>
                                <span>
                                  <i className="fas fa-user mr-1"></i>
                                  {informe.pacientes?.nombre} {informe.pacientes?.apellido}
                                </span>
                                {totalResultados > 0 && (
                                  <span>
                                    <i className="fas fa-chart-line mr-1"></i>
                                    {totalResultados} resultado{totalResultados !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {informe.descripcion && (
                            <p className="text-sm text-gray-600 mb-3 ml-13">
                              {informe.descripcion}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500 ml-13">
                            <span>
                              <i className="fas fa-calendar mr-1"></i>
                              Generado: {new Date(informe.fecha_generacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              informe.estado === 'generado' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {informe.estado}
                            </span>
                            {informe.pacientes?.documento && (
                              <span>
                                <i className="fas fa-id-card mr-1"></i>
                                Doc: {informe.pacientes.documento}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => setInformeViendose(informe.id)}
                            size="sm"
                            className="bg-blue-500 text-white hover:bg-blue-600"
                            title="Ver informe completo"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(informe.id);
                              alert('ID del informe copiado al portapapeles');
                            }}
                            size="sm"
                            className="bg-gray-500 text-white hover:bg-gray-600"
                            title="Copiar ID del informe"
                          >
                            <i className="fas fa-copy"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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

export default InformesExistentes;
