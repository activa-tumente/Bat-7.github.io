import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout simplificado para debugging
 */
const SimpleLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">BAT-7 Sistema de Evaluación</h1>
          <p className="text-blue-100 text-sm">Modo de desarrollo - Sin autenticación</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Outlet />
      </main>

      {/* Footer simple */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">BAT-7 - Sistema de Evaluación de Aptitudes</p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;
