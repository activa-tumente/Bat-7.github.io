import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';
import ModernBarChart from '../../components/charts/ModernBarChart';

const CompleteReport = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        // Obtener información del paciente
        const { data: patientData, error: patientError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;

        // Obtener todos los resultados del paciente
        const { data: resultsData, error: resultsError } = await supabase
          .from('resultados')
          .select(`
            id,
            puntaje_directo,
            percentil,
            errores,
            tiempo_segundos,
            concentracion,
            created_at,
            aptitudes:aptitud_id (
              codigo,
              nombre,
              descripcion
            )
          `)
          .eq('paciente_id', patientId)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;

        setPatient(patientData);
        setResults(resultsData || []);
      } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
        showToast('Error al cargar los datos del paciente', 'error');
        navigate('/student/results');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, navigate, showToast]);

  const saveCompleteReport = async () => {
    try {
      setSaving(true);
      
      const reportData = {
        resultado_id: results[0]?.id, // Usar el primer resultado como referencia
        paciente_id: patient.id,
        titulo: `Informe Completo - ${patient?.nombre} ${patient?.apellido}`,
        contenido: {
          paciente: patient,
          resultados: results.map(result => ({
            id: result.id,
            test: {
              codigo: result.aptitudes?.codigo,
              nombre: result.aptitudes?.nombre,
              descripcion: result.aptitudes?.descripcion
            },
            puntajes: {
              puntaje_directo: result.puntaje_directo,
              percentil: result.percentil,
              errores: result.errores,
              tiempo_segundos: result.tiempo_segundos,
              concentracion: result.concentracion
            },
            interpretacion: result.percentil ? 
              BaremosService.obtenerInterpretacionPC(result.percentil) : 
              { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' },
            fecha_evaluacion: result.created_at
          })),
          resumen: {
            total_tests: results.length,
            promedio_percentil: results.filter(r => r.percentil).length > 0 ? 
              Math.round(results.filter(r => r.percentil).reduce((sum, r) => sum + r.percentil, 0) / results.filter(r => r.percentil).length) : 
              null,
            fecha_primera_evaluacion: results.length > 0 ? results[results.length - 1].created_at : null,
            fecha_ultima_evaluacion: results.length > 0 ? results[0].created_at : null
          },
          fecha_generacion: new Date().toISOString()
        },
        generado_por: 'Sistema',
        tipo_informe: 'evaluacion_completa',
        estado: 'generado'
      };

      const { data, error } = await supabase
        .from('informes')
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error('Error al guardar informe completo:', error);
        showToast('Error al guardar el informe completo', 'error');
        return;
      }

      showToast('Informe completo guardado exitosamente', 'success');
      console.log('Informe completo guardado:', data);
    } catch (error) {
      console.error('Error al guardar informe completo:', error);
      showToast('Error al guardar el informe completo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTestIcon = (testCode) => {
    const icons = {
      'V': 'fas fa-comments',
      'E': 'fas fa-cube',
      'A': 'fas fa-eye',
      'R': 'fas fa-puzzle-piece',
      'N': 'fas fa-calculator',
      'M': 'fas fa-cogs',
      'O': 'fas fa-spell-check'
    };
    return icons[testCode] || 'fas fa-clipboard-list';
  };

  const getTestColor = (testCode) => {
    const colors = {
      'V': 'blue',
      'E': 'indigo',
      'A': 'red',
      'R': 'amber',
      'N': 'teal',
      'M': 'slate',
      'O': 'green'
    };
    return colors[testCode] || 'gray';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando informe completo...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <p className="text-gray-500">No se pudo cargar la información del paciente.</p>
              <Button onClick={() => navigate('/student/results')} className="mt-4">
                Volver a Resultados
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const averagePercentile = results.filter(r => r.percentil).length > 0 ? 
    Math.round(results.filter(r => r.percentil).reduce((sum, r) => sum + r.percentil, 0) / results.filter(r => r.percentil).length) : 
    null;

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header del informe */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 bg-${patient?.genero === 'masculino' ? 'blue' : 'pink'}-100 rounded-full flex items-center justify-center mr-4`}>
            <i className={`fas ${patient?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'} text-2xl`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Informe Completo de Evaluación</h1>
            <p className="text-gray-600">{patient?.nombre} {patient?.apellido}</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/student/results')}
            variant="outline"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver
          </Button>
          <Button 
            onClick={saveCompleteReport}
            disabled={saving}
            variant="primary"
          >
            <i className="fas fa-save mr-2"></i>
            {saving ? 'Guardando...' : 'Guardar Informe'}
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline"
          >
            <i className="fas fa-print mr-2"></i>
            Imprimir
          </Button>
        </div>
      </div>

      {/* Información del paciente */}
      <Card className="mb-6">
        <CardHeader className="bg-blue-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-user mr-2"></i>
            Información del Paciente
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patient?.nombre} {patient?.apellido}
                </p>
              </div>
              
              {patient?.documento && (
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="text-gray-900">{patient.documento}</p>
                </div>
              )}
              
              {patient?.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {patient?.fecha_nacimiento && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="text-gray-900">
                    {new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Edad</p>
                <p className="text-gray-900">
                  {calculateAge(patient?.fecha_nacimiento)} años
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Género</p>
                <p className="text-gray-900 capitalize">{patient?.genero}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resumen general */}
      <Card className="mb-6">
        <CardHeader className="bg-green-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-chart-pie mr-2"></i>
            Resumen General
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {results.length}
              </div>
              <div className="text-sm font-medium text-blue-700">
                Tests Completados
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {averagePercentile || 'N/A'}
              </div>
              <div className="text-sm font-medium text-green-700">
                Percentil Promedio
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {results.filter(r => r.percentil && r.percentil >= 70).length}
              </div>
              <div className="text-sm font-medium text-purple-700">
                Aptitudes Altas
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {results.filter(r => r.percentil && r.percentil < 30).length}
              </div>
              <div className="text-sm font-medium text-orange-700">
                Aptitudes a Reforzar
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Primera evaluación:</span>
                <span className="ml-2 font-medium">
                  {new Date(results[results.length - 1].created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Última evaluación:</span>
                <span className="ml-2 font-medium">
                  {new Date(results[0].created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Resultados detallados */}
      <Card className="mb-6">
        <CardHeader className="bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-list-alt mr-2"></i>
            Resultados Detallados por Aptitud
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No hay resultados de tests disponibles para este paciente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {results.map((result, index) => {
                const testColor = getTestColor(result.aptitudes?.codigo);
                const interpretacion = result.percentil ?
                  BaremosService.obtenerInterpretacionPC(result.percentil) :
                  { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' };

                return (
                  <div key={result.id} className={`p-6 border border-${testColor}-200 bg-${testColor}-50 rounded-lg`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-${testColor}-100 rounded-full flex items-center justify-center mr-4`}>
                        <i className={`${getTestIcon(result.aptitudes?.codigo)} text-${testColor}-600 text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{result.aptitudes?.nombre}</h3>
                        <p className="text-sm text-gray-600">{result.aptitudes?.descripcion}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {result.puntaje_directo}
                        </div>
                        <div className="text-xs font-medium text-orange-700">
                          Puntaje PD
                        </div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {result.percentil || 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-blue-700">
                          Percentil PC
                        </div>
                      </div>
                    </div>

                    {result.percentil && (
                      <div className={`p-3 rounded-lg ${interpretacion.bg} ${interpretacion.color} mb-4`}>
                        <div className="text-sm font-semibold">Interpretación: {interpretacion.nivel}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Errores:</span>
                        <span className="ml-1 font-medium">{result.errores || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tiempo:</span>
                        <span className="ml-1 font-medium">
                          {result.tiempo_segundos ? `${Math.round(result.tiempo_segundos / 60)}:${String(result.tiempo_segundos % 60).padStart(2, '0')}` : 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="ml-1 font-medium">
                          {new Date(result.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Gráfico de perfil de aptitudes */}
      {results.filter(r => r.percentil).length > 0 && (
        <Card className="mb-6">
          <CardHeader className="bg-indigo-50 border-b">
            <h2 className="text-xl font-semibold text-blue-800">
              <i className="fas fa-chart-bar mr-2"></i>
              Perfil de Aptitudes
            </h2>
          </CardHeader>
          <CardBody>
            <ModernBarChart
              data={results.filter(r => r.percentil).map(result => ({
                code: result.aptitudes?.codigo,
                name: result.aptitudes?.nombre,
                value: result.percentil
              }))}
              title="Distribución de Percentiles por Aptitud"
              height={400}
            />
          </CardBody>
        </Card>
      )}

      {/* Recomendaciones generales */}
      <Card className="mb-6">
        <CardHeader className="bg-yellow-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-lightbulb mr-2"></i>
            Recomendaciones Generales
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {averagePercentile && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Análisis General del Rendimiento</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  El evaluado presenta un percentil promedio de {averagePercentile}, lo que indica un rendimiento{' '}
                  {averagePercentile >= 70 ? 'por encima del promedio' : averagePercentile >= 30 ? 'en el rango promedio' : 'por debajo del promedio'}{' '}
                  en las aptitudes evaluadas.
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recomendaciones Específicas</h4>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                {results.filter(r => r.percentil && r.percentil >= 85).length > 0 && (
                  <li>Considerar actividades de enriquecimiento en las aptitudes con alto rendimiento</li>
                )}
                {results.filter(r => r.percentil && r.percentil < 30).length > 0 && (
                  <li>Implementar estrategias de apoyo en las aptitudes con rendimiento bajo</li>
                )}
                <li>Realizar seguimiento periódico del progreso en todas las aptitudes</li>
                <li>Considerar la aplicación de tests complementarios según las necesidades identificadas</li>
                <li>Mantener un registro detallado de las intervenciones y su efectividad</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer del informe */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Informe completo generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
        <p className="mt-1">Sistema de Evaluación Psicológica - BAT-7</p>
      </div>
    </div>
  );
};

export default CompleteReport;
