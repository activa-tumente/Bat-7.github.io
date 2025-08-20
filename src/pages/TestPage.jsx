import React from 'react';

const TestPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Página de Prueba - Layout Funcionando
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          ✅ El Layout está funcionando correctamente
        </h2>
        <p className="text-gray-700 mb-4">
          Si puedes ver esta página con el menú lateral "Activatumente", 
          significa que el layout principal está funcionando.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Menú Lateral</h3>
            <p className="text-blue-700 text-sm">
              El sidebar debe mostrar "Activatumente" y los elementos del menú
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Header</h3>
            <p className="text-green-700 text-sm">
              El header debe mostrar "BAT-7" y el menú de usuario
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🔧 Próximo paso: Cards de Evaluaciones
        </h3>
        <p className="text-yellow-700 text-sm">
          Una vez confirmado que el layout funciona, procederemos a mostrar 
          las cards de evaluaciones en la página de inicio.
        </p>
      </div>
    </div>
  );
};

export default TestPage;
