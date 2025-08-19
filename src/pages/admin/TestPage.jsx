import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import manualTests from '../../tests/manualTests';

/**
 * Página de pruebas para el servicio enhancedSupabaseService
 * Esta página permite ejecutar pruebas manuales para verificar el funcionamiento
 * de las operaciones CRUD para instituciones, psicólogos y pacientes.
 */
const TestPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTest, setSelectedTest] = useState('all');

  // Función para ejecutar una prueba
  const runTest = async (testName) => {
    setLoading(true);
    try {
      let result;
      
      switch (testName) {
        case 'all':
          result = await manualTests.runAllTests();
          break;
        case 'instituciones':
          result = await manualTests.testInstituciones();
          break;
        case 'psicologos':
          result = await manualTests.testPsicologos();
          break;
        case 'pacientes':
          result = await manualTests.testPacientes();
          break;
        case 'sincronizacion':
          result = await manualTests.testSincronizacion();
          break;
        default:
          result = 'Prueba no válida';
      }
      
      // Agregar resultado a la lista
      setResults(prev => [
        {
          id: Date.now(),
          test: testName,
          result,
          timestamp: new Date().toLocaleString()
        },
        ...prev
      ]);
    } catch (error) {
      console.error(`Error al ejecutar prueba ${testName}:`, error);
      setResults(prev => [
        {
          id: Date.now(),
          test: testName,
          result: `Error: ${error.message}`,
          timestamp: new Date().toLocaleString(),
          error: true
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Opciones de pruebas
  const testOptions = [
    { value: 'all', label: 'Todas las pruebas' },
    { value: 'instituciones', label: 'Pruebas de Instituciones' },
    { value: 'psicologos', label: 'Pruebas de Psicólogos' },
    { value: 'pacientes', label: 'Pruebas de Pacientes' },
    { value: 'sincronizacion', label: 'Pruebas de Sincronización' }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Página de Pruebas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel de control */}
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium">Panel de Control</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar prueba
                </label>
                <select
                  className="form-select w-full"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  disabled={loading}
                >
                  {testOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                onClick={() => runTest(selectedTest)}
                disabled={loading}
              >
                {loading ? 'Ejecutando...' : 'Ejecutar Prueba'}
              </Button>
              
              <div className="text-sm text-gray-500">
                <p>Esta página permite ejecutar pruebas manuales para verificar el funcionamiento de las operaciones CRUD.</p>
                <p className="mt-2">Las pruebas se ejecutan contra la base de datos real, así que úsala con precaución.</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Resultados */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-medium">Resultados</h2>
          </CardHeader>
          <CardBody>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay resultados. Ejecuta una prueba para ver los resultados aquí.
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-lg border ${item.error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {testOptions.find(opt => opt.value === item.test)?.label || item.test}
                        </h3>
                        <p className="text-sm text-gray-500">{item.timestamp}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.error ? 'Error' : 'Éxito'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded border">
                        {item.result}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Nota: Los resultados detallados de las pruebas se muestran en la consola del navegador.</p>
      </div>
    </div>
  );
};

export default TestPage;
