import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importar los componentes de test
import Instructions from './Instructions';
import Verbal from './Verbal';
import Ortografia from './Ortografia';
import Razonamiento from './Razonamiento';
import Atencion from './Atencion';
import Espacial from './Espacial';
import Mecanico from './Mecanico';
import Numerico from './Numerico';
import Results from './Results';
import Resultados from './Resultados';

/**
 * Componente que define las rutas para los tests
 * Centraliza la configuración de rutas de todos los tests en un solo lugar
 */
const TestRoutes = () => {
  return (
    <Routes>
      {/* Ruta para las instrucciones de cada test */}
      <Route path="/instructions/:testId" element={<Instructions />} />
      
      {/* Rutas para cada test individual */}
      <Route path="/verbal" element={<Verbal />} />
      <Route path="/ortografia" element={<Ortografia />} />
      <Route path="/razonamiento" element={<Razonamiento />} />
      <Route path="/atencion" element={<Atencion />} />
      <Route path="/espacial" element={<Espacial />} />
      <Route path="/mecanico" element={<Mecanico />} />
      <Route path="/numerico" element={<Numerico />} />
      
      {/* Rutas para resultados */}
      <Route path="/results/:resultId" element={<Results />} />
      <Route path="/resultados/:resultId" element={<Resultados />} />
      
      {/* Ruta por defecto - redirige a la página de tests */}
      <Route path="/" element={<Navigate to="/student/tests" replace />} />
    </Routes>
  );
};

export default TestRoutes;