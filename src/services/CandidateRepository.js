import { BaseRepository } from './BaseRepository';
import apiClient from '../utils/apiClient';

/**
 * Repository for managing candidate data
 * Extends BaseRepository with candidate-specific operations
 */
export class CandidateRepository extends BaseRepository {
  constructor() {
    super(apiClient, '/api/candidates', {
      transformResponse: true,
      cacheEnabled: true,
      retryAttempts: 3
    });
  }

  /**
   * Transform candidate response data
   */
  transformResponse(data) {
    if (Array.isArray(data)) {
      return data.map(candidate => this.transformCandidate(candidate));
    }
    
    if (data.candidates) {
      return {
        ...data,
        candidates: data.candidates.map(candidate => this.transformCandidate(candidate))
      };
    }
    
    return this.transformCandidate(data);
  }

  /**
   * Transform individual candidate data
   */
  transformCandidate(candidate) {
    if (!candidate) return candidate;
    
    return {
      ...candidate,
      fullName: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      age: candidate.dateOfBirth ? this.calculateAge(candidate.dateOfBirth) : null,
      status: candidate.status || 'pending',
      createdAt: candidate.createdAt ? new Date(candidate.createdAt) : null,
      updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt) : null,
      completedTests: candidate.testResults ? candidate.testResults.length : 0,
      averageScore: candidate.testResults ? this.calculateAverageScore(candidate.testResults) : null
    };
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Calculate average test score
   */
  calculateAverageScore(testResults) {
    if (!testResults || testResults.length === 0) return null;
    
    const totalScore = testResults.reduce((sum, result) => {
      return sum + (result.score || 0);
    }, 0);
    
    return Math.round((totalScore / testResults.length) * 100) / 100;
  }

  /**
   * Get candidates with filters
   */
  async getFiltered(filters = {}) {
    const params = this.buildFilterParams(filters);
    return this.findAll(params);
  }

  /**
   * Build filter parameters
   */
  buildFilterParams(filters) {
    const params = {};
    
    if (filters.search) {
      params.search = filters.search;
    }
    
    if (filters.status && filters.status.length > 0) {
      params.status = filters.status.join(',');
    }
    
    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        params.minAge = filters.ageRange.min;
      }
      if (filters.ageRange.max !== undefined) {
        params.maxAge = filters.ageRange.max;
      }
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        params.startDate = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        params.endDate = filters.dateRange.end;
      }
    }
    
    if (filters.testCompleted !== undefined) {
      params.testCompleted = filters.testCompleted;
    }
    
    return params;
  }

  /**
   * Get candidates by status
   */
  async getByStatus(status) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/status/${status}`)
      );
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'getByStatus');
    }
  }

  /**
   * Get candidate test results
   */
  async getTestResults(candidateId) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/${candidateId}/test-results`)
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getTestResults');
    }
  }

  /**
   * Add test result to candidate
   */
  async addTestResult(candidateId, testResult) {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.post(`${this.endpoint}/${candidateId}/test-results`, testResult)
      );
      
      // Clear cache after adding test result
      this.clearCache();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'addTestResult');
    }
  }

  /**
   * Update candidate status
   */
  async updateStatus(candidateId, status, notes = '') {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.patch(`${this.endpoint}/${candidateId}/status`, {
          status,
          notes,
          updatedAt: new Date().toISOString()
        })
      );
      
      // Clear cache after status update
      this.clearCache();
      
      return this.transformResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'updateStatus');
    }
  }

  /**
   * Bulk update candidate statuses
   */
  async bulkUpdateStatus(candidateIds, status, notes = '') {
    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.patch(`${this.endpoint}/bulk-status`, {
          candidateIds,
          status,
          notes,
          updatedAt: new Date().toISOString()
        })
      );
      
      // Clear cache after bulk update
      this.clearCache();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'bulkUpdateStatus');
    }
  }

  /**
   * Get candidate statistics
   */
  async getStatistics() {
    const cacheKey = this.getCacheKey('getStatistics');
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/statistics`)
      );
      
      const stats = response.data;
      this.setCache(cacheKey, stats);
      
      return stats;
    } catch (error) {
      throw this.handleError(error, 'getStatistics');
    }
  }

  /**
   * Export candidates data
   */
  async exportData(filters = {}, format = 'csv') {
    try {
      const params = {
        ...this.buildFilterParams(filters),
        format
      };
      
      const response = await this.executeWithRetry(() => 
        this.apiClient.get(`${this.endpoint}/export`, {
          params,
          responseType: 'blob'
        })
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'exportData');
    }
  }

  /**
   * Import candidates data
   */
  async importData(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      const response = await this.executeWithRetry(() => 
        this.apiClient.post(`${this.endpoint}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      
      // Clear cache after import
      this.clearCache();
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'importData');
    }
  }

  /**
   * Validate candidate data
   */
  validateCandidateData(candidateData) {
    const errors = [];
    
    if (!candidateData.firstName || candidateData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!candidateData.lastName || candidateData.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!candidateData.email || !this.isValidEmail(candidateData.email)) {
      errors.push('Valid email is required');
    }
    
    if (candidateData.dateOfBirth && !this.isValidDate(candidateData.dateOfBirth)) {
      errors.push('Valid date of birth is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate date format
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
}

// Create and export singleton instance
const candidateRepository = new CandidateRepository();
export default candidateRepository;

// Export class for testing
export { CandidateRepository };