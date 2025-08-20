import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import supabase from '../../api/supabaseClient';
import { BaremosService } from '../../services/baremosService';
import { interpretacionesAptitudes, obtenerInterpretacionAptitud } from '../../utils/interpretacionesAptitudes';

const InformeCualitativo = () => {
  const { resultadoId } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener resultado específico
        const { data: resultadoData, error: resultadoError } = await supabase
          .from('resultados')
          .select(`
            *,
            aptitudes:aptitud_id (
              codigo,
              nombre,
              descripcion
            ),
            pacientes:paciente_id (
              *
            )
          `)
          .eq('id', resultadoId)
          .single();

        if (resultadoError) {
          setError('No se pudo cargar el resultado');
          return;
        }

        setResultado(resultadoData);
        setPaciente(resultadoData.pacientes);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del informe');
      } finally {
        setLoading(false);
      }
    };

    if (resultadoId) {
      fetchData();
    }
  }, [resultadoId]);

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'No especificada';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const obtenerNivelCualitativo = (pc) => {
    if (pc >= 98) return 'Muy Alto';
    if (pc >= 85) return 'Alto';
    if (pc >= 70) return 'Medio-Alto';
    if (pc >= 31) return 'Medio';
    if (pc >= 16) return 'Medio-Bajo';
    if (pc >= 3) return 'Bajo';
    return 'Muy Bajo';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const imprimirInforme = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Generando informe...</p>
        </div>
      </div>
    );
  }

  if (error || !resultado) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
              <p className="text-red-600">{error || 'No se encontró el resultado'}</p>
              <Button onClick={() => navigate('/student/resultados')} className="mt-4">
                Volver a Resultados
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const interpretacion = obtenerInterpretacionAptitud(
    resultado.aptitudes?.codigo,
    resultado.percentil
  );

  const nivelCualitativo = obtenerNivelCualitativo(resultado.percentil);
  const edad = calcularEdad(paciente?.fecha_nacimiento);

  return (
    <div className="container mx-auto py-6 print:py-0">
      {/* Botones de acción - ocultos en impresión */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button 
          onClick={() => navigate('/student/resultados')}
          variant="secondary"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Volver
        </Button>
        <Button onClick={imprimirInforme} variant="primary">
          <i className="fas fa-print mr-2"></i>
          Imprimir Informe
        </Button>
      </div>

      {/* Informe */}
      <div className="bg-white print:shadow-none">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                INFORME PSICOLÓGICO CUALITATIVO
              </h1>
              <h2 className="text-lg text-gray-600">
                Batería de Aptitudes de TEA (BAT-7) - Nivel E
              </h2>
            </div>
          </CardHeader>
          
          <CardBody className="space-y-8 print:space-y-6">
            {/* 1. DATOS DE IDENTIFICACIÓN */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                1. DATOS DE IDENTIFICACIÓN
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Nombre del evaluado:</strong> {paciente?.nombre} {paciente?.apellido}</div>
                <div><strong>Fecha de nacimiento:</strong> {paciente?.fecha_nacimiento ? formatearFecha(paciente.fecha_nacimiento) : 'No especificada'}</div>
                <div><strong>Edad en la evaluación:</strong> {edad} años</div>
                <div><strong>Documento:</strong> {paciente?.documento}</div>
                <div><strong>Género:</strong> {paciente?.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
                <div><strong>Fecha de evaluación:</strong> {formatearFecha(resultado.created_at)}</div>
                <div><strong>Prueba administrada:</strong> Batería de Aptitudes de TEA (BAT-7), Nivel E</div>
                <div><strong>Baremo utilizado:</strong> {resultado.baremo_utilizado || 'Estándar'}</div>
              </div>
            </section>

            {/* 2. MOTIVO DE LA EVALUACIÓN */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                2. MOTIVO DE LA EVALUACIÓN
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                La presente evaluación se realiza para conocer el perfil de aptitudes de <strong>{paciente?.nombre}</strong> 
                en el área de <strong>{resultado.aptitudes?.nombre}</strong>, con el objetivo de orientar las estrategias 
                pedagógicas y proporcionar información relevante para la orientación académica y profesional futura.
              </p>
            </section>

            {/* 3. PRUEBA ADMINISTRADA */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                3. PRUEBA ADMINISTRADA Y EXPLICACIÓN DE LOS RESULTADOS
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Se ha administrado la Batería de Aptitudes de TEA (BAT-7), una prueba diseñada para evaluar un conjunto 
                de capacidades cognitivas fundamentales. Los resultados se expresan en percentiles (Pc), que indican la 
                posición del evaluado en comparación con un grupo de referencia de su misma edad y nivel de estudios.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Por ejemplo, un percentil de 70 (Pc 70) significa que el rendimiento de <strong>{paciente?.nombre}</strong> 
                en esa aptitud es igual o superior al 70% de los alumnos de su grupo, mientras que un 30% obtuvo 
                puntuaciones superiores.
              </p>
              
              {/* Tabla de interpretación */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Tabla de Interpretación de Percentiles:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="font-medium">Percentil (Pc)</div>
                  <div className="font-medium">Nivel Aptitudinal</div>
                  <div>98-99</div><div>Muy Alto</div>
                  <div>85-97</div><div>Alto</div>
                  <div>70-84</div><div>Medio-Alto</div>
                  <div>31-69</div><div>Medio</div>
                  <div>16-30</div><div>Medio-Bajo</div>
                  <div>3-15</div><div>Bajo</div>
                  <div>1-2</div><div>Muy Bajo</div>
                </div>
              </div>
            </section>

            {/* 4. TABLA DE RESULTADOS */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                4. RESULTADOS OBTENIDOS
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">APTITUD</div>
                    <div className="font-bold text-lg">{resultado.aptitudes?.codigo}</div>
                    <div className="text-xs text-gray-600">{resultado.aptitudes?.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">PUNTAJE PD</div>
                    <div className="font-bold text-lg text-orange-600">{resultado.puntaje_directo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">PUNTAJE PC</div>
                    <div className="font-bold text-lg text-blue-600">{resultado.percentil}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">NIVEL</div>
                    <div className="font-bold text-lg text-green-600">{nivelCualitativo}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. INTERPRETACIÓN */}
            {interpretacion && (
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                  5. INTERPRETACIÓN DE LOS RESULTADOS
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Descripción de la Aptitud:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{interpretacion.descripcion}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Características Observadas (Nivel {interpretacion.nivel === 'alto' ? 'Alto' : 'Bajo'}):
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {interpretacion.caracteristicas.map((caracteristica, index) => (
                        <li key={index}>{caracteristica}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* 6. CONCLUSIONES */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                6. SÍNTESIS Y CONCLUSIONES
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Basándose en los resultados obtenidos, <strong>{paciente?.nombre}</strong> presenta un nivel 
                <strong> {nivelCualitativo.toLowerCase()}</strong> en <strong>{resultado.aptitudes?.nombre}</strong> 
                (Percentil {resultado.percentil}), lo que indica {interpretacion?.nivel === 'alto' ? 
                'fortalezas significativas' : 'áreas de oportunidad'} en esta área cognitiva específica.
              </p>
            </section>

            {/* 7. RECOMENDACIONES */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-200 pb-2">
                7. RECOMENDACIONES
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                {interpretacion?.nivel === 'alto' ? (
                  <>
                    <p>• Aprovechar esta fortaleza como base para el desarrollo de otras habilidades relacionadas.</p>
                    <p>• Considerar actividades de enriquecimiento que desafíen y mantengan el interés en esta área.</p>
                    <p>• Utilizar esta aptitud como apoyo en el aprendizaje de materias afines.</p>
                  </>
                ) : (
                  <>
                    <p>• Implementar estrategias de refuerzo específicas para esta área.</p>
                    <p>• Proporcionar apoyo adicional y tiempo extra cuando sea necesario.</p>
                    <p>• Considerar métodos de enseñanza alternativos que se adapten mejor al perfil del estudiante.</p>
                  </>
                )}
                <p>• Realizar seguimiento periódico para evaluar el progreso.</p>
                <p>• Mantener comunicación constante entre familia y centro educativo.</p>
              </div>
            </section>

            {/* Firma */}
            <section className="pt-8 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Informe generado el {formatearFecha(new Date())}</p>
                <p>Sistema de Evaluación Psicológica - BAT-7</p>
              </div>
            </section>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default InformeCualitativo;
