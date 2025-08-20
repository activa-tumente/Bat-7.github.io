import React from 'react';

/**
 * Componente de carga para páginas que se cargan de forma diferida
 */
const PageLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px]">
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Cargando</h2>
      <p className="text-gray-500 mt-2">Por favor espere un momento...</p>
    </div>
  );
};

export default PageLoader;
