import { handleError } from '../services/improvedErrorHandler';

/**
 * Base Repository class implementing common CRUD operations
 * Provides consistent error handling and data transformation
 */
export class BaseRepository {
  constructor(apiClient, endpoint, options = {}) {
    this.apiClient = apiClient;
    this.endpoint = endpoint;
    this.options = {
      transformResponse: true,
      cacheEnabled: false,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };
    
    // Simple in-memory cache
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cache key for request
   */
  getCacheKey(method, params = {}) {
    return `${method}:${JSON.stringify(params)}`;
  }

  /**
   * Check if cache entry is valid
   */
  isCacheValid(key) {
    if (!this.options.cacheEnabled) return false;
    
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    
    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Set cache entry
   */
  setCache(key, data) {
    if (!this.options.cacheEnabled) return;
    
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Get cache entry
   */
  getCache(key) {
    if (!this.isCacheValid(key)) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Execute request with retry logic
   */
  async executeWithRetry(requestFn, retryCount = 0) {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount < this.options.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.options.retryDelay * Math.pow(2, retryCount));
        return this.executeWithRetry(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Determine if error should trigger retry
   */
  shouldRetry(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status) || error.code === 'NETWORK_ERROR';
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform response data
   */
  transformResponse(data) {
    if (!this.options.transformResponse) return data;
    
    // Override in subclasses for specific transformations
    return data;
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, operation) {
    const enhancedError = {
      ...error,
      operation,
      repository: this.constructor.name,
      endpoint: this.endpoint,
      timestamp: new Date().toISOString()
    };
    
    return handleError(enhancedError);
  }

  /**
   * Get all entities
   */
  async findAll(params = {}) {
    const cacheKey = this.getCacheKey('findAll', params);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(this.endpoint, { params })
      );
      
      const transformedData = this.transformResponse(response.data);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    } catch (error) {
      throw this.handleError(error, 'findAll');
    }
  }

  /**
   * Get entity by ID
   */
  async findById(id) {
    const cacheKey = this.getCacheKey('findById', { id });
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/${id}`)
      );
      
      const transformedData = this.transformResponse(response.data);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Create new entity
   */
  async create(data) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.post(this.endpoint, data)
      );
      
      // Clear cache after successful creation
      this.clearCache();
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'create');
    }
  }

  /**
   * Update entity
   */
  async update(id, data) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.put(`${this.endpoint}/${id}`, data)
      );
      
      // Clear cache after successful update
      this.clearCache();
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'update');
    }
  }

  /**
   * Partially update entity
   */
  async patch(id, data) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.patch(`${this.endpoint}/${id}`, data)
      );
      
      // Clear cache after successful patch
      this.clearCache();
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'patch');
    }
  }

  /**
   * Delete entity
   */
  async delete(id) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.delete(`${this.endpoint}/${id}`)
      );
      
      // Clear cache after successful deletion
      this.clearCache();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'delete');
    }
  }

  /**
   * Bulk delete entities
   */
  async bulkDelete(ids) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.delete(this.endpoint, { data: { ids } })
      );
      
      // Clear cache after successful bulk deletion
      this.clearCache();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'bulkDelete');
    }
  }

  /**
   * Search entities
   */
  async search(query, params = {}) {
    const searchParams = { q: query, ...params };
    const cacheKey = this.getCacheKey('search', searchParams);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/search`, { params: searchParams })
      );
      
      const transformedData = this.transformResponse(response.data);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    } catch (error) {
      throw this.handleError(error, 'search');
    }
  }

  /**
   * Get paginated results
   */
  async paginate(page = 1, limit = 10, params = {}) {
    const paginationParams = { page, limit, ...params };
    const cacheKey = this.getCacheKey('paginate', paginationParams);
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(this.endpoint, { params: paginationParams })
      );
      
      const transformedData = this.transformResponse(response.data);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    } catch (error) {
      throw this.handleError(error, 'paginate');
    }
  }

  /**
   * Count entities
   */
  async count(params = {}) {
    const cacheKey = this.getCacheKey('count', params);
    const cached = this.getCache(cacheKey);
    
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/count`, { params })
      );
      
      const count = response.data.count || response.data;
      this.setCache(cacheKey, count);
      
      return count;
    } catch (error) {
      throw this.handleError(error, 'count');
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id) {
    try {
      await this.findById(id);
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

export default BaseRepository;