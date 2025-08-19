/**
 * Repository pattern implementation for Resultados data access
 * Abstracts data access logic and provides caching capabilities
 */

import supabase from '../api/supabaseClient';
import { ERROR_MESSAGES } from '../constants/resultados';

class ResultadosRepository {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear specific cache entry or all cache
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Fetch all resultados with caching
   */
  async getResultados(useCache = true) {
    const cacheKey = 'resultados';
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('resultados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`${ERROR_MESSAGES.LOAD_DATA}: ${error.message}`);
    }

    const resultados = data || [];
    this.setCachedData(cacheKey, resultados);
    return resultados;
  }

  /**
   * Fetch all pacientes with caching
   */
  async getPacientes(useCache = true) {
    const cacheKey = 'pacientes';
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('apellido', { ascending: true });

    if (error) {
      throw new Error(`${ERROR_MESSAGES.LOAD_DATA}: ${error.message}`);
    }

    const pacientes = data || [];
    this.setCachedData(cacheKey, pacientes);
    return pacientes;
  }

  /**
   * Fetch both resultados and pacientes in parallel
   */
  async getAllData(useCache = true) {
    try {
      const [resultados, pacientes] = await Promise.all([
        this.getResultados(useCache),
        this.getPacientes(useCache)
      ]);

      return { resultados, pacientes };
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.LOAD_DATA}: ${error.message}`);
    }
  }

  /**
   * Get resultado by ID
   */
  async getResultadoById(id) {
    const { data, error } = await supabase
      .from('resultados')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching resultado: ${error.message}`);
    }

    return data;
  }

  /**
   * Get resultados by paciente ID
   */
  async getResultadosByPaciente(pacienteId) {
    const { data, error } = await supabase
      .from('resultados')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching resultados for paciente: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(callback) {
    const subscription = supabase
      .channel('resultados_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'resultados' },
        (payload) => {
          this.clearCache('resultados'); // Invalidate cache
          callback(payload);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pacientes' },
        (payload) => {
          this.clearCache('pacientes'); // Invalidate cache
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

// Export singleton instance
export const resultadosRepository = new ResultadosRepository();
export default resultadosRepository;