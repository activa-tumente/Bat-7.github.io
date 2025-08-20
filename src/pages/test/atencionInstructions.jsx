import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-toastify';
import atencionInstructions from './instructionsContent/atencionInstructions';

const AtencionInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  // Obtener patientId del state de navegación
  const patientId = location.state?.patientId;

  useEffect(() => {
    // Carga las instrucciones específicas para el test de atención
    const fetchData = async () => {
      try {
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 800));

        // Cargar directamente las instrucciones de atención
        setTest(atencionInstructions);
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

    // Navegar directamente al test de atención pasando el patientId
    navigate('/test/atencion', { state: { patientId } });
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="fas fa-eye text-red-600 mr-2"></i>
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
              {test.components && (
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

              {/* Imágenes de ejemplo */}
              <div className="mt-8">
                <h3 className="text-md font-medium mb-3 text-center">Descripción del Test</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-700 mb-3">Esta prueba trata de evaluar tu rapidez y tu precisión trabajando con símbolos. En cada ejercicio aparece una fila con diferentes símbolos y tu tarea consistirá en localizar cuántas veces aparece uno determinado. El símbolo que tienes que localizar es siempre el mismo y se presenta en la parte superior de la página; en cada ejercicio puede aparecer 0, 1, 2 o 3 veces, pero nunca más de 3.</p>
                    <p className="text-gray-700 mb-3">Deberás marcar cuántas veces aparece el símbolo en cada fila (0, 1, 2 o 3) asegurándote de que tu respuesta se corresponda con el número del ejercicio que estás contestando.</p>
                    <p className="text-gray-700 mb-3">Fíjate en los siguientes ejemplos. ¿Cuántas veces aparece el símbolo de la parte superior en cada fila?</p>
                    <div className="flex justify-center mb-4">
                      <img
                        src="/assets/images/atencion/Atencion.png"
                        alt="Ejemplo de atención"
                        className="max-w-md h-auto border rounded shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x150?text=Imagen+no+disponible";
                        }}
                      />
                    </div>
                    <p className="text-gray-700 mb-4">Fíjate en las características del símbolo que se presenta dentro del óvalo. A continuación, trata de localizar un símbolo igual en la fila de símbolos A1. En este ejercicio el símbolo del óvalo aparece una única vez, y es el tercer símbolo de la fila. Por eso la respuesta correcta en el ejemplo A1 es 1.</p>
                    <p className="text-gray-700 mb-4">Fíjate ahora en el ejemplo A2. En esta ocasión no hay ningún símbolo que coincida exactamente con el modelo; por tanto la respuesta correcta es 0.</p>
                    <p className="text-gray-700 mb-4">Por último, en el ejemplo A3 el símbolo del óvalo aparece en dos ocasiones, en primera y quinta posición. Por eso, la respuesta que habría que marcar en esta ocasión es 2.</p>
                  </div>
                </div>
              </div>
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

              <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-500 p-4">
                <h3 className="text-md font-medium text-indigo-800 mb-2">Detalles del Test</h3>
                <ul className="space-y-2 text-indigo-700">
                  <li>• El test consta de {test.numberOfQuestions} preguntas de atención.</li>
                  <li>• El tiempo máximo para la realización de esta prueba es de {test.duration} minutos.</li>
                  <li>• Deberás trabajar rápidamente, esforzándote al máximo en encontrar la respuesta correcta.</li>
                  <li>• Si en algún ejercicio no estás completamente seguro de cuál puede ser, elige la opción que creas que es más correcta; no se penalizará el error.</li>
                  <li>• Si terminas antes del tiempo concedido, repasa tus respuestas.</li>
                </ul>
              </div>
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

export default AtencionInstructions;
