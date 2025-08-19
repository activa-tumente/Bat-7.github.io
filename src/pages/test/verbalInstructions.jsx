import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import verbalInstructions from './instructionsContent/verbalInstructions';

const VerbalInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  useEffect(() => {
    // Carga las instrucciones específicas para el test verbal
    const fetchData = async () => {
      try {
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 800));

        // Cargar directamente las instrucciones verbales
        setTest(verbalInstructions);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del test:', error);
        toast.error('Error al cargar la información del test');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartTest = () => {
    if (!accepted) {
      toast.warning('Debes aceptar las condiciones para continuar');
      return;
    }

    toast.info('Iniciando test...');

    // Navegar directamente al test verbal pasando el patientId
    navigate('/test/verbal', { state: { patientId } });
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="fas fa-comments text-blue-600 mr-2"></i>
          Instrucciones del Test
        </h1>
        {!loading && test && (
          <p className="text-gray-600">{test.name}</p>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Cargando instrucciones del test...</p>
          </div>
        </div>
      ) : test ? (
        <>
          <Card className="mb-6">
            <CardHeader className="text-center">
              <h2 className="text-lg font-medium">Información General</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-md font-medium mb-2 text-center">Descripción</h3>
                  <p className="text-gray-700">{test.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium mb-2 text-center">Duración</h3>
                    <p className="text-gray-700 text-center">{test.duration} minutos</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium mb-2 text-center">Preguntas</h3>
                    <p className="text-gray-700 text-center">{test.numberOfQuestions} preguntas</p>
                  </div>
                </div>
              </div>

              {test.additionalInfo && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-blue-700">{test.additionalInfo}</p>
                </div>
              )}

              {/* Componentes específicos del test */}
              {test.type !== 'battery' && test.components && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-3 text-center">Componentes Evaluados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {test.components.map((component, index) => (
                      <div key={index} className="border rounded p-3">
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtests para la batería completa */}
              {test.type === 'battery' && test.subtests && test.subtests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-3 text-center">Subtests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {test.subtests.map((subtest, index) => (
                      <div key={subtest.id} className="border rounded p-3">
                        <p className="font-medium">{index + 1}. {subtest.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{subtest.description}</p>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                          <span>{subtest.duration} min</span>
                          <span>{subtest.questions} preguntas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <h2 className="text-lg font-medium">Instrucciones</h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {test.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </li>
                ))}
              </ul>

              {/* Recomendaciones Adicionales */}
              {test.recommendations && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h3 className="text-md font-medium text-yellow-800 mb-2">Recomendaciones Adicionales</h3>
                  <ul className="space-y-2 text-yellow-700">
                    {test.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="accept-conditions"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                />
                <label htmlFor="accept-conditions" className="ml-3 text-gray-700">
                  He leído y acepto las instrucciones. Entiendo que una vez iniciado el test no podré pausarlo y deberé completarlo en su totalidad.
                </label>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end">
              <Button
                variant={accepted ? 'primary' : 'outline'}
                onClick={handleStartTest}
                disabled={!accepted}
              >
                Iniciar Test
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <p className="text-gray-500">No se encontró información para el test solicitado.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default VerbalInstructions;