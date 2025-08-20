import axios from 'axios';
import { BaseRepository } from './BaseRepository';
import { handleError } from './improvedErrorHandler';

/**
 * Enhanced API Service with interceptors and error handling
 */
class ApiService {
  constructor(baseURL = process.env.REACT_APP_API_URL || '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
    this.repositories = new Map();
  }

  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: Date.now() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = Date.now() - response.config.metadata.startTime;
        
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
        }

        // Transform response data if needed
        return this.transformResponse(response);
      },
      (error) => {
        // Calculate request duration if available
        const duration = error.config?.metadata?.startTime 
          ? Date.now() - error.config.metadata.startTime 
          : 0;

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error);
        }

        // Handle specific error cases
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Get authentication token from storage
   */
  getAuthToken() {
    try {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token, persistent = false) {
    try {
      if (persistent) {
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('authToken', token);
      }
    } catch (error) {
      console.warn('Failed to set auth token:', error);
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to clear auth token:', error);
    }
  }

  /**
   * Transform response data
   */
  transformResponse(response) {
    // Handle different response structures
    if (response.data) {
      // Check for API wrapper format
      if (response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
          meta: response.data.meta || {},
          pagination: response.data.pagination || null
        };
      }
    }

    return response;
  }

  /**
   * Handle response errors
   */
  async handleResponseError(error) {
    const { response, request, config } = error;

    // Network error
    if (!response && request) {
      const networkError = new Error('Network error - please check your connection');
      networkError.code = 'NETWORK_ERROR';
      networkError.isNetworkError = true;
      return Promise.reject(handleError(networkError, 'API Request'));
    }

    // Request timeout
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new Error('Request timeout - please try again');
      timeoutError.code = 'TIMEOUT_ERROR';
      timeoutError.isTimeoutError = true;
      return Promise.reject(handleError(timeoutError, 'API Request'));
    }

    // HTTP error responses
    if (response) {
      const { status, data } = response;

      // Handle authentication errors
      if (status === 401) {
        this.clearAuthToken();
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        const authError = new Error('Authentication required');
        authError.code = 'AUTH_ERROR';
        authError.status = 401;
        return Promise.reject(handleError(authError, 'Authentication'));
      }

      // Handle forbidden errors
      if (status === 403) {
        const forbiddenError = new Error('Access denied - insufficient permissions');
        forbiddenError.code = 'FORBIDDEN_ERROR';
        forbiddenError.status = 403;
        return Promise.reject(handleError(forbiddenError, 'Authorization'));
      }

      // Handle not found errors
      if (status === 404) {
        const notFoundError = new Error('Resource not found');
        notFoundError.code = 'NOT_FOUND_ERROR';
        notFoundError.status = 404;
        return Promise.reject(handleError(notFoundError, 'API Request'));
      }

      // Handle validation errors
      if (status === 422) {
        const validationError = new Error('Validation failed');
        validationError.code = 'VALIDATION_ERROR';
        validationError.status = 422;
        validationError.validationErrors = data?.errors || {};
        return Promise.reject(handleError(validationError, 'Validation'));
      }

      // Handle server errors
      if (status >= 500) {
        const serverError = new Error('Server error - please try again later');
        serverError.code = 'SERVER_ERROR';
        serverError.status = status;
        return Promise.reject(handleError(serverError, 'Server'));
      }

      // Handle other client errors
      if (status >= 400) {
        const clientError = new Error(data?.message || 'Request failed');
        clientError.code = 'CLIENT_ERROR';
        clientError.status = status;
        clientError.details = data;
        return Promise.reject(handleError(clientError, 'API Request'));
      }
    }

    // Generic error
    return Promise.reject(handleError(error, 'API Request'));
  }

  /**
   * Get or create repository for an endpoint
   */
  getRepository(endpoint, options = {}) {
    const key = `${endpoint}:${JSON.stringify(options)}`;
    
    if (!this.repositories.has(key)) {
      this.repositories.set(key, new BaseRepository(this.client, endpoint, options));
    }
    
    return this.repositories.get(key);
  }

  /**
   * Create specialized repositories
   */
  createCandidateRepository() {
    return this.getRepository('/candidates', {
      cacheEnabled: true,
      transformResponse: true
    });
  }

  createUserRepository() {
    return this.getRepository('/users', {
      cacheEnabled: true,
      transformResponse: true
    });
  }

  createTestRepository() {
    return this.getRepository('/tests', {
      cacheEnabled: true,
      transformResponse: true
    });
  }

  createResultRepository() {
    return this.getRepository('/results', {
      cacheEnabled: false, // Results should be fresh
      transformResponse: true
    });
  }

  createReportRepository() {
    return this.getRepository('/reports', {
      cacheEnabled: true,
      transformResponse: true
    });
  }

  /**
   * Direct HTTP methods for custom requests
   */
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(url, file, onProgress = null, config = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted, progressEvent);
        }
      }
    };

    try {
      const response = await this.client.post(url, formData, uploadConfig);
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  /**
   * Download file
   */
  async downloadFile(url, filename = null, config = {}) {
    const downloadConfig = {
      ...config,
      responseType: 'blob'
    };

    try {
      const response = await this.client.get(url, downloadConfig);
      
      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return response.data;
    } catch (error) {
      throw error; // Error already handled by interceptor
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get API statistics
   */
  getStats() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      repositoryCount: this.repositories.size,
      repositories: Array.from(this.repositories.keys())
    };
  }

  /**
   * Clear all repository caches
   */
  clearAllCaches() {
    this.repositories.forEach(repository => {
      if (typeof repository.clearCache === 'function') {
        repository.clearCache();
      }
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService };