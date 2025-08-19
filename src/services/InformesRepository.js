/**
 * @file InformesRepository.js
 * @description Repository pattern implementation for informes data operations
 * Provides a centralized interface for all informe-related database operations
 */

import { supabase } from '../config/supabaseClient';

/**
 * Repository class for managing informes data operations
 * Implements the Repository pattern to abstract database operations
 */
class InformesRepository {
  /**
   * Cache for storing frequently accessed data
   * @private
   */
  #cache = new Map();
  
  /**
   * Cache TTL in milliseconds (5 minutes)
   * @private
   */
  #cacheTTL = 5 * 60 * 1000;

  /**
   * Get cache key for a query
   * @private
   * @param {string} operation - Operation name
   * @param {Object} params - Query parameters
   * @returns {string} Cache key
   */
  #getCacheKey(operation, params = {}) {
    return `${operation}_${JSON.stringify(params)}`;
  }

  /**
   * Check if cached data is still valid
   * @private
   * @param {Object} cacheEntry - Cache entry with timestamp
   * @returns {boolean} True if cache is valid
   */
  #isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.#cacheTTL;
  }

  /**
   * Get data from cache or execute query
   * @private
   * @param {string} cacheKey - Cache key
   * @param {Function} queryFn - Function that executes the query
   * @returns {Promise<Object>} Query result
   */
  async #getCachedOrFetch(cacheKey, queryFn) {
    const cached = this.#cache.get(cacheKey);
    
    if (this.#isCacheValid(cached)) {
      return cached.data;
    }

    try {
      const result = await queryFn();
      
      // Cache successful results
      if (result.error === null) {
        this.#cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Repository query error:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Clear cache for specific operation or all cache
   * @param {string} [operation] - Specific operation to clear, or all if not provided
   */
  clearCache(operation = null) {
    if (operation) {
      // Clear cache entries that start with the operation name
      for (const key of this.#cache.keys()) {
        if (key.startsWith(operation)) {
          this.#cache.delete(key);
        }
      }
    } else {
      this.#cache.clear();
    }
  }

  /**
   * Get paginated informes generados with optional filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (0-based)
   * @param {number} options.pageSize - Items per page
   * @param {string} [options.searchTerm] - Search term for filtering
   * @param {string} [options.sortBy] - Sort field
   * @param {string} [options.sortOrder] - Sort order ('asc' or 'desc')
   * @param {Date} [options.dateFrom] - Filter from date
   * @param {Date} [options.dateTo] - Filter to date
   * @returns {Promise<Object>} Paginated results with data and metadata
   */
  async getInformesGenerados(options = {}) {
    const {
      page = 0,
      pageSize = 10,
      searchTerm = '',
      sortBy = 'fecha_generacion',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = options;

    const cacheKey = this.#getCacheKey('informes_generados', options);
    
    return this.#getCachedOrFetch(cacheKey, async () => {
      let query = supabase
        .from('informes_generados')
        .select(`
          *,
          resultados (
            id,
            nombre_paciente,
            fecha_evaluacion
          )
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`
          titulo.ilike.%${searchTerm}%,
          resultados.nombre_paciente.ilike.%${searchTerm}%
        `);
      }

      // Apply date filters
      if (dateFrom) {
        query = query.gte('fecha_generacion', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('fecha_generacion', dateTo.toISOString());
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const result = await query;
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        data: result.data || [],
        count: result.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((result.count || 0) / pageSize),
        hasNextPage: (page + 1) * pageSize < (result.count || 0),
        hasPreviousPage: page > 0,
        error: null
      };
    });
  }

  /**
   * Get a single informe by ID with related data
   * @param {string} id - Informe ID
   * @returns {Promise<Object>} Informe data with related information
   */
  async getInformeById(id) {
    if (!id) {
      throw new Error('Informe ID is required');
    }

    const cacheKey = this.#getCacheKey('informe_by_id', { id });
    
    return this.#getCachedOrFetch(cacheKey, async () => {
      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          *,
          resultados (
            id,
            nombre_paciente,
            fecha_evaluacion,
            edad,
            genero,
            nivel_educativo,
            puntuaciones
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { data, error: null };
    });
  }

  /**
   * Get recent informes (last 7 days)
   * @param {number} [limit=5] - Maximum number of results
   * @returns {Promise<Object>} Recent informes
   */
  async getRecentInformes(limit = 5) {
    const cacheKey = this.#getCacheKey('recent_informes', { limit });
    
    return this.#getCachedOrFetch(cacheKey, async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('informes_generados')
        .select(`
          id,
          titulo,
          fecha_generacion,
          resultados (
            nombre_paciente
          )
        `)
        .gte('fecha_generacion', sevenDaysAgo.toISOString())
        .order('fecha_generacion', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return { data: data || [], error: null };
    });
  }

  /**
   * Delete a single informe
   * @param {string} id - Informe ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteInforme(id) {
    if (!id) {
      throw new Error('Informe ID is required');
    }

    try {
      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Clear related cache entries
      this.clearCache('informes_generados');
      this.clearCache('informe_by_id');
      this.clearCache('recent_informes');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting informe:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete multiple informes
   * @param {string[]} ids - Array of informe IDs to delete
   * @returns {Promise<Object>} Bulk deletion result
   */
  async deleteInformes(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Array of informe IDs is required');
    }

    try {
      const { error } = await supabase
        .from('informes_generados')
        .delete()
        .in('id', ids);

      if (error) {
        throw new Error(error.message);
      }

      // Clear related cache entries
      this.clearCache('informes_generados');
      this.clearCache('informe_by_id');
      this.clearCache('recent_informes');

      return { 
        success: true, 
        deletedCount: ids.length,
        error: null 
      };
    } catch (error) {
      console.error('Error deleting informes:', error);
      return { 
        success: false, 
        deletedCount: 0,
        error: error.message 
      };
    }
  }

  /**
   * Create a new informe
   * @param {Object} informeData - Informe data to create
   * @returns {Promise<Object>} Creation result
   */
  async createInforme(informeData) {
    if (!informeData || typeof informeData !== 'object') {
      throw new Error('Valid informe data is required');
    }

    try {
      const { data, error } = await supabase
        .from('informes_generados')
        .insert([informeData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Clear related cache entries
      this.clearCache('informes_generados');
      this.clearCache('recent_informes');

      return { data, error: null };
    } catch (error) {
      console.error('Error creating informe:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update an existing informe
   * @param {string} id - Informe ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateInforme(id, updateData) {
    if (!id) {
      throw new Error('Informe ID is required');
    }
    
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Valid update data is required');
    }

    try {
      const { data, error } = await supabase
        .from('informes_generados')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Clear related cache entries
      this.clearCache('informes_generados');
      this.clearCache('informe_by_id');
      this.clearCache('recent_informes');

      return { data, error: null };
    } catch (error) {
      console.error('Error updating informe:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get informes statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getInformesStats() {
    const cacheKey = this.#getCacheKey('informes_stats');
    
    return this.#getCachedOrFetch(cacheKey, async () => {
      try {
        // Get total count
        const { count: totalCount, error: countError } = await supabase
          .from('informes_generados')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw new Error(countError.message);
        }

        // Get count for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentCount, error: recentError } = await supabase
          .from('informes_generados')
          .select('*', { count: 'exact', head: true })
          .gte('fecha_generacion', thirtyDaysAgo.toISOString());

        if (recentError) {
          throw new Error(recentError.message);
        }

        return {
          data: {
            total: totalCount || 0,
            lastMonth: recentCount || 0,
            averagePerDay: Math.round((recentCount || 0) / 30 * 10) / 10
          },
          error: null
        };
      } catch (error) {
        console.error('Error getting informes stats:', error);
        return {
          data: { total: 0, lastMonth: 0, averagePerDay: 0 },
          error: error.message
        };
      }
    });
  }
}

// Export singleton instance
export const informesRepository = new InformesRepository();
export default informesRepository;