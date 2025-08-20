import { useState, useCallback } from 'react';
import { handleError } from '../services/improvedErrorHandler';

/**
 * Custom hook for managing CRUD operations on entities
 * Provides standardized state management and error handling
 * 
 * @param {string} entityType - Type of entity (for error messages)
 * @param {Object} apiService - Service object with CRUD methods
 * @returns {Object} Entity state and CRUD operations
 */
export const useEntityCRUD = (entityType, apiService) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState({
    create: false,
    update: false,
    delete: false
  });

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch all entities with optional filters
  const fetchEntities = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getAll(filters);
      setEntities(data || []);
      return data;
    } catch (err) {
      const handledError = improvedErrorHandler.handle(err, {
        context: `Fetching ${entityType}`,
        showToast: true
      });
      setError(handledError.message);
      throw handledError;
    } finally {
      setLoading(false);
    }
  }, [apiService, entityType]);

  // Create new entity
  const createEntity = useCallback(async (entityData) => {
    setOperationLoading(prev => ({ ...prev, create: true }));
    setError(null);
    
    try {
      const newEntity = await apiService.create(entityData);
      setEntities(prev => [newEntity, ...prev]);
      return newEntity;
    } catch (err) {
      const handledError = handleError(err, {
        context: `Creating ${entityType}`,
        showToast: true
      });
      setError(handledError.message);
      throw handledError;
    } finally {
      setOperationLoading(prev => ({ ...prev, create: false }));
    }
  }, [apiService, entityType]);

  // Update existing entity
  const updateEntity = useCallback(async (id, updates) => {
    setOperationLoading(prev => ({ ...prev, update: true }));
    setError(null);
    
    try {
      const updatedEntity = await apiService.update(id, updates);
      setEntities(prev => 
        prev.map(entity => 
          entity.id === id ? { ...entity, ...updatedEntity } : entity
        )
      );
      return updatedEntity;
    } catch (err) {
      const handledError = handleError(err, {
        context: `Updating ${entityType}`,
        showToast: true
      });
      setError(handledError.message);
      throw handledError;
    } finally {
      setOperationLoading(prev => ({ ...prev, update: false }));
    }
  }, [apiService, entityType]);

  // Delete entity
  const deleteEntity = useCallback(async (id) => {
    setOperationLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    
    try {
      await apiService.delete(id);
      setEntities(prev => prev.filter(entity => entity.id !== id));
      return true;
    } catch (err) {
      const handledError = handleError(err, {
        context: `Deleting ${entityType}`,
        showToast: true
      });
      setError(handledError.message);
      throw handledError;
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  }, [apiService, entityType]);

  // Bulk delete entities
  const bulkDeleteEntities = useCallback(async (ids) => {
    setOperationLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    
    try {
      if (apiService.bulkDelete) {
        await apiService.bulkDelete(ids);
      } else {
        // Fallback to individual deletes
        await Promise.all(ids.map(id => apiService.delete(id)));
      }
      
      setEntities(prev => prev.filter(entity => !ids.includes(entity.id)));
      return true;
    } catch (err) {
      const handledError = handleError(err, {
        context: `Bulk deleting ${entityType}`,
        showToast: true
      });
      setError(handledError.message);
      throw handledError;
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  }, [apiService, entityType]);

  // Refresh entities (re-fetch)
  const refreshEntities = useCallback(async () => {
    return fetchEntities();
  }, [fetchEntities]);

  // Get entity by ID
  const getEntityById = useCallback((id) => {
    return entities.find(entity => entity.id === id);
  }, [entities]);

  return {
    // State
    entities,
    loading,
    error,
    operationLoading,
    
    // Actions
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    bulkDeleteEntities,
    refreshEntities,
    clearError,
    
    // Utilities
    getEntityById,
    
    // Computed values
    hasEntities: entities.length > 0,
    isAnyOperationLoading: Object.values(operationLoading).some(Boolean)
  };
};

export default useEntityCRUD;