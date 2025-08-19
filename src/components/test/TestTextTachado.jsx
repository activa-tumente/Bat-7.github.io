import React from 'react';
import TextoTachado from './TextoTachado';

/**
 * Componente de prueba para verificar el funcionamiento del TextoTachado
 * Solo para desarrollo y testing
 */
const TestTextTachado = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test del Componente TextoTachado</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Texto normal:</p>
          <span>dato normal</span>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Texto tachado (componente):</p>
          <TextoTachado />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Texto tachado personalizado:</p>
          <TextoTachado>información eliminada</TextoTachado>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">En una tabla simulada (centrada como en el test):</p>
          <table className="border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Meses</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Producto A</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Producto B</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">Enero</td>
                <td className="border border-gray-300 px-3 py-2 text-center">25</td>
                <td className="border border-gray-300 px-3 py-2 text-center"><TextoTachado /></td>
                <td className="border border-gray-300 px-3 py-2 text-center">50</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">Febrero</td>
                <td className="border border-gray-300 px-3 py-2 text-center">?</td>
                <td className="border border-gray-300 px-3 py-2 text-center">30</td>
                <td className="border border-gray-300 px-3 py-2 text-center"><TextoTachado /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestTextTachado;
