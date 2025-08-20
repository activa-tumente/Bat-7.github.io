import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import supabase from '../../api/supabaseClient';

const SavedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, individual, complete

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Obtener todos los informes con información de pacientes
        const { data: informes, error } = await supabase
          .from('informes')
          .select(`
            id,
            titulo,
            tipo_informe,
            estado,
            fecha_generacion,
            generado_por,
            observaciones,
            pacientes:paciente_id (
              id,
              nombre,
              apellido,
              documento,
              genero,
              email
            ),
            resultados:resultado_id (
              id,
              aptitudes:aptitud_id (
                codigo,
                nombre
              )
            )
          `)
          .order('fecha_generacion', { ascending: false });

        if (error) {
          console.error('Error al cargar informes:', error);
          toast.error('Error al cargar los informes guardados');
          return;
        }

        setReports(informes || []);
      } catch (error) {
        console.error('Error al cargar informes:', error);
        toast.error('Error al cargar los informes guardados');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const deleteReport = async (reportId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este informe?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('informes')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.filter(report => report.id !== reportId));
      toast.success('Informe eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar informe:', error);
      toast.error('Error al eliminar el informe');
    }
  };

  const getReportIcon = (tipo) => {
    return tipo === 'evaluacion_completa' ? 'fas fa-file-medical' : 'fas fa-file-alt';
  };

  const getReportColor = (tipo) => {
    return tipo === 'evaluacion_completa' ? 'blue' : 'green';
  };

  const getStatusColor = (estado) => {
    const colors = {
      'generado': 'bg-blue-100 text-blue-800',
      'revisado': 'bg-yellow-100 text-yellow-800',
      'finalizado': 'bg-green-100 text-green-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'individual') return report.tipo_informe === 'evaluacion_individual';
    if (filter === 'complete') return report.tipo_informe === 'evaluacion_completa';
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">
            <i className="fas fa-archive mr-3 text-blue-600"></i>
            Informes Guardados - Administración
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredReports.length} informe{filteredReports.length !== 1 ? 's' : ''} guardado{filteredReports.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Filtros */}
        <div className="flex space-x-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
          >
            Todos
          </Button>
          <Button
            onClick={() => setFilter('individual')}
            variant={filter === 'individual' ? 'primary' : 'outline'}
            size="sm"
          >
            Individuales
          </Button>
          <Button
            onClick={() => setFilter('complete')}
            variant={filter === 'complete' ? 'primary' : 'outline'}
            size="sm"
          >
            Completos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando informes guardados...</p>
        </div>
      ) : (
        <>
          {filteredReports.length === 0 ? (
            <Card>
              <CardBody>
                <div className="py-8 text-center">
                  <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No hay informes guardados disponibles.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Los informes aparecerán aquí una vez que se generen y guarden.
                  </p>
                  <Button as={Link} to="/admin/reports" className="mt-4">
                    <i className="fas fa-plus mr-2"></i>
                    Ver Resultados
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const reportColor = getReportColor(report.tipo_informe);
                return (
                  <Card key={report.id} className={`overflow-hidden shadow-lg border border-${reportColor}-200 hover:shadow-xl transition-shadow duration-300`}>
                    <CardHeader className={`bg-gradient-to-r from-${reportColor}-500 to-${reportColor}-600 border-b border-${reportColor}-300`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 border-2 border-white border-opacity-30`}>
                            <i className={`${getReportIcon(report.tipo_informe)} text-white text-lg`}></i>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm">
                              {report.tipo_informe === 'evaluacion_completa' ? 'Informe Completo' : 'Informe Individual'}
                            </h3>
                            <p className="text-white text-opacity-80 text-xs">
                              {new Date(report.fecha_generacion).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.estado)}`}>
                          {report.estado}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardBody className="p-4">
                      <div className="space-y-3">
                        {/* Información del paciente */}
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm mr-3 ${
                            report.pacientes?.genero === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}>
                            <i className={`fas ${report.pacientes?.genero === 'masculino' ? 'fa-mars' : 'fa-venus'}`}></i>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {report.pacientes?.nombre} {report.pacientes?.apellido}
                            </p>
                            {report.pacientes?.documento && (
                              <p className="text-gray-500 text-xs">
                                Doc: {report.pacientes.documento}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Información del test (solo para informes individuales) */}
                        {report.tipo_informe === 'evaluacion_individual' && report.resultados?.aptitudes && (
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-xs text-gray-500">Test Evaluado:</p>
                            <p className="text-sm font-medium text-gray-700">
                              {report.resultados.aptitudes.codigo} - {report.resultados.aptitudes.nombre}
                            </p>
                          </div>
                        )}

                        {/* Título del informe */}
                        <div>
                          <p className="text-xs text-gray-500">Título:</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {report.titulo}
                          </p>
                        </div>

                        {/* Observaciones */}
                        {report.observaciones && (
                          <div>
                            <p className="text-xs text-gray-500">Observaciones:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {report.observaciones}
                            </p>
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Generado por: {report.generado_por || 'Sistema'}</p>
                          <p>Fecha: {new Date(report.fecha_generacion).toLocaleString('es-ES')}</p>
                        </div>
                      </div>
                    </CardBody>

                    {/* Acciones */}
                    <div className="bg-gray-50 px-4 py-3 border-t">
                      <div className="flex justify-between items-center">
                        <Button
                          as={Link}
                          to={`/admin/informe-guardado/${report.id}`}
                          variant="primary"
                          size="sm"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          Ver Informe
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.open(`/admin/informe-guardado/${report.id}`, '_blank')}
                            variant="outline"
                            size="sm"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </Button>
                          <Button
                            onClick={() => deleteReport(report.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedReports;
