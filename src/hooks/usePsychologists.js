import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import pinControlService from '../services/pin/ImprovedPinControlService';

/**
 * Custom hook for managing psychologists data
 * Follows the established service layer pattern
 */
export const usePsychologists = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPsychologists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use existing service instead of direct Supabase calls
      const data = await pinControlService.getAllPsychologists();
      
      // Transform to expected format for the modal
      const transformedData = data.map(psychologist => ({
        id: psychologist.psychologist_id,
        nombre: psychologist.psychologist_name?.split(' ')[0] || '',
        apellido: psychologist.psychologist_name?.split(' ').slice(1).join(' ') || '',
        email: psychologist.psychologist_email,
        currentPins: psychologist.remaining_pins,
        hasControl: psychologist.has_control
      }));
      
      setPsychologists(transformedData);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      setError('Error al cargar la lista de psicólogos');
      toast.error('Error al cargar la lista de psicólogos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPsychologists();
  }, [fetchPsychologists]);

  return {
    psychologists,
    loading,
    error,
    refetch: fetchPsychologists
  };
};

export default usePsychologists;