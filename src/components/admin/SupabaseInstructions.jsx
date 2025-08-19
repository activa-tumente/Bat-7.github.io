import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from 'react-toastify';

/**
 * Componente que muestra instrucciones para configurar Supabase
 * y permite copiar las funciones SQL necesarias
 */
const SupabaseInstructions = () => {
  const [copied, setCopied] = useState(false);
  const [sqlFunctions, setSqlFunctions] = useState('');

  // Cargar el archivo SQL
  useEffect(() => {
    fetch('/sql/supabase_functions.sql')
      .then(response => response.text())
      .then(data => {
        setSqlFunctions(data);
      })
      .catch(error => {
        console.error('Error al cargar el archivo SQL:', error);
        // Establecer un SQL básico en caso de error
        setSqlFunctions(`-- Error al cargar el archivo SQL
-- Por favor, consulte el archivo public/sql/supabase_functions.sql manualmente`);
      });
  }, []);

  // Función para copiar el SQL al portapapeles
  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(sqlFunctions);
      setCopied(true);
      toast.success('SQL copiado al portapapeles');

      // Restablecer el estado después de 3 segundos
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      toast.error('Error al copiar al portapapeles');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-lg font-medium text-red-600">Configuración de Supabase Requerida</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <p className="text-gray-700">
            Para que la aplicación funcione correctamente, es necesario configurar funciones SQL en Supabase
            que permitan saltarse las restricciones de RLS (Row Level Security).
          </p>

          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-medium mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Inicie sesión en su panel de administración de Supabase</li>
              <li>Vaya a la sección "SQL Editor"</li>
              <li>Cree un nuevo script</li>
              <li>Copie y pegue el código SQL que se proporciona a continuación</li>
              <li>Ejecute el script</li>
            </ol>
          </div>

          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-auto max-h-60">
            <pre className="text-xs">
              {sqlFunctions || 'Cargando SQL...'}
            </pre>
          </div>

          <div className="flex justify-end">
            <Button
              variant={copied ? "success" : "primary"}
              onClick={copyToClipboard}
              className="flex items-center"
              disabled={!sqlFunctions}
            >
              <span className="mr-2">{copied ? '✓' : '📋'}</span>
              {copied ? 'Copiado' : 'Copiar SQL'}
            </Button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>Nota:</strong> Estas funciones deben ejecutarse con permisos de administrador en Supabase.
              Una vez configuradas, la aplicación podrá realizar operaciones CRUD en las tablas de instituciones,
              psicólogos y pacientes sin problemas de permisos.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SupabaseInstructions;
