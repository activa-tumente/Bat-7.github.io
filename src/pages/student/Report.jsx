import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('resultados')
          .select(`
            id,
            puntaje_directo,
            percentil,
            errores,
            tiempo_segundos,
            concentracion,
            created_at,
            pacientes:paciente_id (
              id,
              nombre,
              apellido,
              documento,
              genero,
              fecha_nacimiento,
              email
            ),
            aptitudes:aptitud_id (
              codigo,
              nombre,
              descripcion
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error al cargar resultado:', error);
          showToast('Error al cargar el resultado', 'error');
          navigate('/student/results');
          return;
        }

        setResult(data);
      } catch (error) {
        console.error('Error al cargar resultado:', error);
        showToast('Error al cargar el resultado', 'error');
        navigate('/student/results');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id, navigate, showToast]);

  const saveReport = async () => {
    try {
      setSaving(true);

      const interpretacion = result.percentil
        ? BaremosService.obtenerInterpretacionPC(result.percentil)
        : { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' };

      const reportData = {
        resultado_id: result.id,
        paciente_id: result.pacientes.id,
        titulo: `Informe de Evaluación - ${result.aptitudes?.nombre} - ${result.pacientes?.nombre} ${result.pacientes?.apellido}`,
        contenido: {
          paciente: {
            id: result.pacientes.id,
            nombre: result.pacientes.nombre,
            apellido: result.pacientes.apellido,
            documento: result.pacientes.documento,
            genero: result.pacientes.genero,
            fecha_nacimiento: result.pacientes.fecha_nacimiento,
            email: result.pacientes.email
          },
          test: {
            codigo: result.aptitudes?.codigo,
            nombre: result.aptitudes?.nombre,
            descripcion: result.aptitudes?.descripcion
          },
          resultados: {
            puntaje_directo: result.puntaje_directo,
            percentil: result.percentil,
            errores: result.errores,
            tiempo_segundos: result.tiempo_segundos,
            concentracion: result.concentracion,
            edad_evaluacion: result.edad_evaluacion,
            baremo_utilizado: result.baremo_utilizado
          },
          interpretacion: {
            nivel: interpretacion.nivel,
            descripcion: result.percentil ?
              `El evaluado obtuvo un percentil de ${result.percentil}, lo que indica un rendimiento ${interpretacion.nivel.toLowerCase()} en la aptitud ${result.aptitudes?.nombre}.` :
              'El percentil no ha sido calculado aún.'
          },
          fecha_evaluacion: result.created_at,
          fecha_generacion: new Date().toISOString()
        },
        generado_por: 'Sistema',
        tipo_informe: 'evaluacion_individual',
        estado: 'generado'
      };

      const { data, error } = await supabase
        .from('informes')
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error('Error al guardar informe:', error);
        showToast('Error al guardar el informe en la base de datos', 'error');
        return;
      }

      showToast('Informe guardado exitosamente en Supabase', 'success');
      console.log('Informe guardado:', data);
    } catch (error) {
      console.error('Error al guardar informe:', error);
      showToast('Error al guardar el informe', 'error');
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
          <p className="text-gray-500">Cargando informe...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <p className="text-gray-500">No se pudo cargar el resultado.</p>
              <Button onClick={() => navigate('/student/results')} className="mt-4">
                Volver a Resultados
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const interpretacion = result.percentil 
    ? BaremosService.obtenerInterpretacionPC(result.percentil)
    : { nivel: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' };

  const testColor = getTestColor(result.aptitudes?.codigo);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header del informe */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 bg-${testColor}-100 rounded-full flex items-center justify-center mr-4`}>
            <i className={`${getTestIcon(result.aptitudes?.codigo)} text-${testColor}-600 text-2xl`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Informe de Evaluación</h1>
            <p className="text-gray-600">{result.aptitudes?.nombre}</p>
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
            onClick={saveReport}
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
        <CardHeader className={`bg-${testColor}-50 border-b`}>
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-user mr-2"></i>
            Información del Paciente
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${result.pacientes?.genero === 'masculino' ? 'blue' : 'pink'}-100 rounded-full flex items-center justify-center mr-4`}>
                  <i className={`fas ${result.pacientes?.genero === 'masculino' ? 'fa-mars text-blue-600' : 'fa-venus text-pink-600'}`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.pacientes?.nombre} {result.pacientes?.apellido}
                  </p>
                </div>
              </div>
              
              {result.pacientes?.documento && (
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="text-gray-900">{result.pacientes.documento}</p>
                </div>
              )}
              
              {result.pacientes?.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{result.pacientes.email}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {result.pacientes?.fecha_nacimiento && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                  <p className="text-gray-900">
                    {new Date(result.pacientes.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Edad</p>
                <p className="text-gray-900">
                  {calculateAge(result.pacientes?.fecha_nacimiento)} años
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Fecha de Evaluación</p>
                <p className="text-gray-900">
                  {new Date(result.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Resultados del test */}
      <Card className="mb-6">
        <CardHeader className={`bg-${testColor}-50 border-b`}>
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-chart-bar mr-2"></i>
            Resultados de la Evaluación
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información del test */}
            <div className="space-y-6">
              <div className={`p-6 bg-${testColor}-50 rounded-lg border border-${testColor}-200`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-${testColor}-100 rounded-full flex items-center justify-center mr-4`}>
                    <i className={`${getTestIcon(result.aptitudes?.codigo)} text-${testColor}-600 text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{result.aptitudes?.nombre}</h3>
                    <p className="text-sm text-gray-600">{result.aptitudes?.descripcion}</p>
                  </div>
                </div>
              </div>

              {/* Puntajes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {result.puntaje_directo}
                  </div>
                  <div className="text-sm font-medium text-orange-700">
                    Puntaje Directo (PD)
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Respuestas correctas
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {result.percentil || 'N/A'}
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    Percentil (PC)
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Posición relativa
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              {result.percentil && (
                <div className={`p-4 rounded-lg border ${interpretacion.bg} ${interpretacion.color}`}>
                  <h4 className="font-semibold mb-2">Interpretación</h4>
                  <p className="text-sm">
                    <strong>Nivel:</strong> {interpretacion.nivel}
                  </p>
                  <p className="text-xs mt-2 opacity-80">
                    Este percentil indica que el evaluado obtuvo un puntaje igual o superior al {result.percentil}% de la población de referencia.
                  </p>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Errores:</span>
                  <span className="ml-2 font-medium">{result.errores || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tiempo:</span>
                  <span className="ml-2 font-medium">
                    {result.tiempo_segundos ? `${Math.round(result.tiempo_segundos / 60)}:${String(result.tiempo_segundos % 60).padStart(2, '0')}` : 'N/A'}
                  </span>
                </div>
                {result.edad_evaluacion && (
                  <div>
                    <span className="text-gray-500">Edad evaluación:</span>
                    <span className="ml-2 font-medium">{result.edad_evaluacion} años</span>
                  </div>
                )}
                {result.baremo_utilizado && (
                  <div>
                    <span className="text-gray-500">Baremo:</span>
                    <span className="ml-2 font-medium">{result.baremo_utilizado}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de barras vertical */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 text-center">
                Visualización de Resultados
              </h4>

              {/* Gráfico de barras */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-end justify-center space-x-8 h-64">
                  {/* Barra PD */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex flex-col justify-end h-48 w-16">
                      <div
                        className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-1000 ease-out flex items-end justify-center text-white font-bold text-sm"
                        style={{
                          height: `${Math.min((result.puntaje_directo / 100) * 100, 100)}%`,
                          minHeight: '20px'
                        }}
                      >
                        {result.puntaje_directo}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-gray-700">PD</div>
                      <div className="text-xs text-gray-500">Puntaje Directo</div>
                    </div>
                  </div>

                  {/* Barra PC */}
                  {result.percentil && (
                    <div className="flex flex-col items-center">
                      <div className="relative flex flex-col justify-end h-48 w-16">
                        <div
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out flex items-end justify-center text-white font-bold text-sm"
                          style={{
                            height: `${result.percentil}%`,
                            minHeight: '20px'
                          }}
                        >
                          {result.percentil}
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-gray-700">PC</div>
                        <div className="text-xs text-gray-500">Percentil</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Escala de referencia */}
                <div className="mt-4 border-t pt-4">
                  <div className="text-xs text-gray-500 text-center mb-2">Escala de Percentiles</div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                  <div className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-blue-200 rounded-full mt-1"></div>
                </div>
              </div>

              {/* Leyenda del gráfico */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Interpretación de Niveles</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span><strong>PC 85-99:</strong> Muy Alto / Alto</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span><strong>PC 70-84:</strong> Medio-Alto</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span><strong>PC 31-69:</strong> Medio</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                    <span><strong>PC 16-30:</strong> Medio-Bajo</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span><strong>PC 1-15:</strong> Bajo / Muy Bajo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Observaciones y recomendaciones */}
      <Card className="mb-6">
        <CardHeader className="bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            <i className="fas fa-lightbulb mr-2"></i>
            Observaciones y Recomendaciones
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Análisis del Rendimiento</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.percentil ? (
                  `El evaluado obtuvo un percentil de ${result.percentil}, lo que indica un rendimiento ${interpretacion.nivel.toLowerCase()}
                  en la aptitud ${result.aptitudes?.nombre}. Este resultado sugiere que el evaluado se encuentra
                  ${result.percentil >= 70 ? 'por encima del promedio' : result.percentil >= 30 ? 'en el rango promedio' : 'por debajo del promedio'}
                  en comparación con su grupo de referencia.`
                ) : (
                  'El percentil no ha sido calculado aún. Se recomienda procesar la conversión PD→PC para obtener una interpretación completa.'
                )}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recomendaciones</h4>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                {result.percentil >= 85 && (
                  <>
                    <li>Considerar actividades de enriquecimiento en esta área</li>
                    <li>Explorar oportunidades de desarrollo avanzado</li>
                  </>
                )}
                {result.percentil >= 30 && result.percentil < 85 && (
                  <>
                    <li>Mantener el nivel actual con práctica regular</li>
                    <li>Identificar áreas específicas de mejora</li>
                  </>
                )}
                {result.percentil < 30 && (
                  <>
                    <li>Considerar apoyo adicional en esta área</li>
                    <li>Implementar estrategias de refuerzo específicas</li>
                  </>
                )}
                <li>Realizar seguimiento periódico del progreso</li>
                <li>Complementar con evaluaciones en otras aptitudes</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer del informe */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Informe generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
        <p className="mt-1">Sistema de Evaluación Psicológica - BAT-7</p>
      </div>
    </div>
  );
};

export default Report;
