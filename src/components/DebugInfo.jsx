import React, { useState, useEffect } from 'react';
import supabase from '../api/supabaseClient';

const DebugInfo = () => {
  const [debugData, setDebugData] = useState({
    resultados: 0,
    pacientes: 0,
    aptitudes: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Contar resultados
        const { count: resultadosCount, error: resultadosError } = await supabase
          .from('resultados')
          .select('*', { count: 'exact', head: true });

        if (resultadosError) throw resultadosError;

        // Contar pacientes
        const { count: pacientesCount, error: pacientesError } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true });

        if (pacientesError) throw pacientesError;

        // Contar aptitudes
        const { count: aptitudesCount, error: aptitudesError } = await supabase
          .from('aptitudes')
          .select('*', { count: 'exact', head: true });

        if (aptitudesError) throw aptitudesError;

        setDebugData({
          resultados: resultadosCount || 0,
          pacientes: pacientesCount || 0,
          aptitudes: aptitudesCount || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error en debug:', error);
        setDebugData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchDebugData();
  }, []);

  if (debugData.loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-blue-800 font-semibold mb-2">🔍 Información de Debug</h3>
        <p className="text-blue-600">Cargando información de la base de datos...</p>
      </div>
    );
  }

  if (debugData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="text-red-800 font-semibold mb-2">❌ Error de Debug</h3>
        <p className="text-red-600">{debugData.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="text-green-800 font-semibold mb-2">🔍 Información de Debug</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{debugData.resultados}</div>
          <div className="text-green-700">Resultados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{debugData.pacientes}</div>
          <div className="text-blue-700">Pacientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{debugData.aptitudes}</div>
          <div className="text-purple-700">Aptitudes</div>
        </div>
      </div>
      {debugData.resultados === 0 && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
          ⚠️ No hay resultados de tests en la base de datos. Esto explica por qué no se muestran las tarjetas de pacientes.
        </div>
      )}
    </div>
  );
};

export default DebugInfo;