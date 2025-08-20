import { useState, useEffect } from 'react';
import supabase from '../api/supabaseClient';

/**
 * Hook personalizado para cargar datos relacionados
 * Maneja el estado de carga y errores de forma consistente
 */
const useRelatedData = (dataType, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, dependencies);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      switch (dataType) {
        case 'getInstitutions':
          result = await supabase
            .from('instituciones')
            .select('*')
            .eq('activo', true)
            .order('nombre');
          break;
          
        case 'getPsychologists':
          result = await supabase
            .from('psicologos')
            .select('*')
            .eq('activo', true)
            .order('nombre');
          break;
          
        case 'getCandidates':
          result = await supabase
            .from('candidatos')
            .select(`
              *,
              instituciones(nombre),
              psicologos(nombre, apellidos)
            `)
            .eq('activo', true)
            .order('nombre');
          break;
          
        case 'getUsers':
          result = await supabase
            .from('usuarios')
            .select('*')
            .eq('activo', true)
            .order('nombre');
          break;
          
        default:
          throw new Error(`Tipo de datos no soportado: ${dataType}`);
      }
      
      if (result.error) throw result.error;
      
      setData(result.data || []);
      
    } catch (err) {
      console.error(`Error cargando ${dataType}:`, err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    refresh
  };
};

export default useRelatedData;
