/**
 * Observer pattern for pin status changes
 * Allows components to subscribe to pin status updates
 */
class PinStatusObserver {
  constructor() {
    this.observers = new Map();
  }

  /**
   * Subscribe to pin status changes for a psychologist
   */
  subscribe(psychologistId, callback) {
    if (!this.observers.has(psychologistId)) {
      this.observers.set(psychologistId, new Set());
    }
    
    this.observers.get(psychologistId).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(psychologistId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.observers.delete(psychologistId);
        }
      }
    };
  }

  /**
   * Notify all observers of pin status change
   */
  notify(psychologistId, newStatus) {
    const callbacks = this.observers.get(psychologistId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newStatus);
        } catch (error) {
          console.error('Error in pin status observer callback:', error);
        }
      });
    }
  }

  /**
   * Get number of observers for a psychologist
   */
  getObserverCount(psychologistId) {
    return this.observers.get(psychologistId)?.size || 0;
  }

  /**
   * Clear all observers
   */
  clear() {
    this.observers.clear();
  }
}

// Singleton instance
export const pinStatusObserver = new PinStatusObserver();
export default pinStatusObserver;