import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleError } from '../../services/improvedErrorHandler';

/**
 * Notification Slice - Manages application notifications and alerts
 * 
 * Features:
 * - Toast notifications
 * - System alerts
 * - User notifications
 * - Push notifications
 * - Email notifications
 * - Notification preferences
 * - Notification history
 */

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  TEST: 'test',
  USER: 'user',
  SECURITY: 'security',
  UPDATE: 'update',
  REMINDER: 'reminder',
  ACHIEVEMENT: 'achievement'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
  TOAST: 'toast',
  PUSH: 'push',
  EMAIL: 'email',
  IN_APP: 'in_app',
  SMS: 'sms'
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ userId, limit = 20, offset = 0, unreadOnly = false }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unread_only: unreadOnly.toString()
      });
      
      const response = await fetch(`/api/users/${userId}/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchNotifications',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return { notificationId };
    } catch (error) {
      handleError(error, {
        context: 'markNotificationAsRead',
        notificationId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/notifications/read-all`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return { userId };
    } catch (error) {
      handleError(error, {
        context: 'markAllNotificationsAsRead',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      return { notificationId };
    } catch (error) {
      handleError(error, {
        context: 'deleteNotification',
        notificationId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notification/sendNotification',
  async ({ notification }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'sendNotification',
        notification
      });
      return rejectWithValue(error.message);
    }
  }
);

export const subscribeToNotifications = createAsyncThunk(
  'notification/subscribe',
  async ({ userId, subscription }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe to notifications');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'subscribeToNotifications',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to generate unique notification ID
const generateNotificationId = () => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initial state
const initialState = {
  // Toast notifications (temporary, in-app notifications)
  toasts: [],
  
  // Persistent notifications
  notifications: [],
  
  // Notification counts
  counts: {
    total: 0,
    unread: 0,
    byCategory: {
      [NOTIFICATION_CATEGORIES.SYSTEM]: 0,
      [NOTIFICATION_CATEGORIES.TEST]: 0,
      [NOTIFICATION_CATEGORIES.USER]: 0,
      [NOTIFICATION_CATEGORIES.SECURITY]: 0,
      [NOTIFICATION_CATEGORIES.UPDATE]: 0,
      [NOTIFICATION_CATEGORIES.REMINDER]: 0,
      [NOTIFICATION_CATEGORIES.ACHIEVEMENT]: 0
    },
    byPriority: {
      [NOTIFICATION_PRIORITIES.LOW]: 0,
      [NOTIFICATION_PRIORITIES.MEDIUM]: 0,
      [NOTIFICATION_PRIORITIES.HIGH]: 0,
      [NOTIFICATION_PRIORITIES.URGENT]: 0
    }
  },
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    limit: 20
  },
  
  // Filters
  filters: {
    category: 'all',
    priority: 'all',
    read: 'all', // 'all', 'read', 'unread'
    dateRange: 'all' // 'all', 'today', 'week', 'month'
  },
  
  // Push notification settings
  pushSettings: {
    supported: false,
    permission: 'default', // 'default', 'granted', 'denied'
    subscription: null,
    endpoint: null
  },
  
  // Notification preferences
  preferences: {
    enabled: true,
    sound: true,
    vibration: true,
    showOnLockScreen: true,
    groupSimilar: true,
    maxToasts: 5,
    toastDuration: 5000, // milliseconds
    categories: {
      [NOTIFICATION_CATEGORIES.SYSTEM]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP]
      },
      [NOTIFICATION_CATEGORIES.TEST]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.PUSH, NOTIFICATION_CHANNELS.EMAIL]
      },
      [NOTIFICATION_CATEGORIES.USER]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP]
      },
      [NOTIFICATION_CATEGORIES.SECURITY]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.PUSH, NOTIFICATION_CHANNELS.EMAIL]
      },
      [NOTIFICATION_CATEGORIES.UPDATE]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST]
      },
      [NOTIFICATION_CATEGORIES.REMINDER]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.PUSH]
      },
      [NOTIFICATION_CATEGORIES.ACHIEVEMENT]: {
        enabled: true,
        channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP]
      }
    }
  },
  
  // Loading states
  loading: {
    fetching: false,
    marking: false,
    deleting: false,
    sending: false,
    subscribing: false
  },
  
  // Error states
  errors: {
    fetch: null,
    mark: null,
    delete: null,
    send: null,
    subscribe: null
  },
  
  // UI state
  ui: {
    showNotificationPanel: false,
    showToasts: true,
    selectedNotification: null,
    notificationPanelTab: 'all', // 'all', 'unread', 'read'
    sortBy: 'timestamp', // 'timestamp', 'priority', 'category'
    sortOrder: 'desc' // 'asc', 'desc'
  }
};

// Notification slice
export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Toast management
    addToast: (state, action) => {
      const toast = {
        id: generateNotificationId(),
        type: NOTIFICATION_TYPES.INFO,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        duration: state.preferences.toastDuration,
        dismissible: true,
        timestamp: Date.now(),
        ...action.payload
      };
      
      state.toasts.unshift(toast);
      
      // Limit number of toasts
      if (state.toasts.length > state.preferences.maxToasts) {
        state.toasts = state.toasts.slice(0, state.preferences.maxToasts);
      }
    },
    
    removeToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter(toast => toast.id !== toastId);
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    
    updateToast: (state, action) => {
      const { id, updates } = action.payload;
      const toastIndex = state.toasts.findIndex(toast => toast.id === id);
      
      if (toastIndex !== -1) {
        state.toasts[toastIndex] = {
          ...state.toasts[toastIndex],
          ...updates
        };
      }
    },
    
    // Notification management
    addNotification: (state, action) => {
      const notification = {
        id: generateNotificationId(),
        type: NOTIFICATION_TYPES.INFO,
        category: NOTIFICATION_CATEGORIES.SYSTEM,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        read: false,
        timestamp: Date.now(),
        ...action.payload
      };
      
      state.notifications.unshift(notification);
      
      // Update counts
      state.counts.total += 1;
      state.counts.unread += 1;
      state.counts.byCategory[notification.category] += 1;
      state.counts.byPriority[notification.priority] += 1;
    },
    
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n.id === id);
      
      if (notificationIndex !== -1) {
        const oldNotification = state.notifications[notificationIndex];
        const newNotification = {
          ...oldNotification,
          ...updates
        };
        
        state.notifications[notificationIndex] = newNotification;
        
        // Update counts if read status changed
        if (oldNotification.read !== newNotification.read) {
          if (newNotification.read) {
            state.counts.unread -= 1;
          } else {
            state.counts.unread += 1;
          }
        }
      }
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        
        state.notifications.splice(notificationIndex, 1);
        
        // Update counts
        state.counts.total -= 1;
        if (!notification.read) {
          state.counts.unread -= 1;
        }
        state.counts.byCategory[notification.category] -= 1;
        state.counts.byPriority[notification.priority] -= 1;
      }
    },
    
    setNotifications: (state, action) => {
      const { notifications, totalCount, page, hasMore } = action.payload;
      
      if (page === 1) {
        state.notifications = notifications;
      } else {
        state.notifications.push(...notifications);
      }
      
      state.pagination.currentPage = page;
      state.pagination.hasMore = hasMore;
      
      // Recalculate counts
      state.counts.total = totalCount;
      state.counts.unread = notifications.filter(n => !n.read).length;
      
      // Reset category and priority counts
      Object.keys(state.counts.byCategory).forEach(category => {
        state.counts.byCategory[category] = 0;
      });
      Object.keys(state.counts.byPriority).forEach(priority => {
        state.counts.byPriority[priority] = 0;
      });
      
      // Recalculate category and priority counts
      notifications.forEach(notification => {
        state.counts.byCategory[notification.category] += 1;
        state.counts.byPriority[notification.priority] += 1;
      });
    },
    
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.read) {
        notification.read = true;
        notification.readAt = Date.now();
        state.counts.unread -= 1;
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          notification.readAt = Date.now();
        }
      });
      state.counts.unread = 0;
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.counts = initialState.counts;
    },
    
    // Filter management
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      if (state.filters[key] !== undefined) {
        state.filters[key] = value;
      }
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Push notification settings
    setPushPermission: (state, action) => {
      state.pushSettings.permission = action.payload;
    },
    
    setPushSupported: (state, action) => {
      state.pushSettings.supported = action.payload;
    },
    
    setPushSubscription: (state, action) => {
      state.pushSettings.subscription = action.payload;
      if (action.payload && action.payload.endpoint) {
        state.pushSettings.endpoint = action.payload.endpoint;
      }
    },
    
    // Preferences management
    setPreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      if (state.preferences[key] !== undefined) {
        state.preferences[key] = value;
      }
    },
    
    updateCategoryPreference: (state, action) => {
      const { category, key, value } = action.payload;
      if (state.preferences.categories[category]) {
        state.preferences.categories[category][key] = value;
      }
    },
    
    toggleCategoryChannel: (state, action) => {
      const { category, channel } = action.payload;
      if (state.preferences.categories[category]) {
        const channels = state.preferences.categories[category].channels;
        const channelIndex = channels.indexOf(channel);
        
        if (channelIndex !== -1) {
          channels.splice(channelIndex, 1);
        } else {
          channels.push(channel);
        }
      }
    },
    
    // UI management
    toggleNotificationPanel: (state) => {
      state.ui.showNotificationPanel = !state.ui.showNotificationPanel;
    },
    
    setNotificationPanel: (state, action) => {
      state.ui.showNotificationPanel = action.payload;
    },
    
    setSelectedNotification: (state, action) => {
      state.ui.selectedNotification = action.payload;
    },
    
    setNotificationPanelTab: (state, action) => {
      state.ui.notificationPanelTab = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.ui.sortBy = action.payload;
    },
    
    setSortOrder: (state, action) => {
      state.ui.sortOrder = action.payload;
    },
    
    toggleSortOrder: (state) => {
      state.ui.sortOrder = state.ui.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    
    setShowToasts: (state, action) => {
      state.ui.showToasts = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      const { type, error } = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = error;
      }
    },
    
    clearError: (state, action) => {
      const type = action.payload;
      if (state.errors[type] !== undefined) {
        state.errors[type] = null;
      }
    },
    
    clearAllErrors: (state) => {
      state.errors = initialState.errors;
    },
    
    // Reset actions
    resetNotifications: () => initialState
  },
  
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.fetching = true;
        state.errors.fetch = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.fetching = false;
        const { notifications, totalCount, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.notifications = notifications;
        } else {
          state.notifications.push(...notifications);
        }
        
        state.pagination.currentPage = page;
        state.pagination.hasMore = hasMore;
        
        // Update counts
        state.counts.total = totalCount;
        state.counts.unread = notifications.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.fetching = false;
        state.errors.fetch = action.payload;
      })
      
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading.marking = true;
        state.errors.mark = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading.marking = false;
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = Date.now();
          state.counts.unread -= 1;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading.marking = false;
        state.errors.mark = action.payload;
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading.marking = true;
        state.errors.mark = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading.marking = false;
        state.notifications.forEach(notification => {
          if (!notification.read) {
            notification.read = true;
            notification.readAt = Date.now();
          }
        });
        state.counts.unread = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading.marking = false;
        state.errors.mark = action.payload;
      })
      
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading.deleting = true;
        state.errors.delete = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading.deleting = false;
        const { notificationId } = action.payload;
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          state.notifications.splice(notificationIndex, 1);
          
          // Update counts
          state.counts.total -= 1;
          if (!notification.read) {
            state.counts.unread -= 1;
          }
          state.counts.byCategory[notification.category] -= 1;
          state.counts.byPriority[notification.priority] -= 1;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading.deleting = false;
        state.errors.delete = action.payload;
      })
      
      // Send notification
      .addCase(sendNotification.pending, (state) => {
        state.loading.sending = true;
        state.errors.send = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Optionally add the sent notification to the list
        const notification = action.payload;
        if (notification) {
          state.notifications.unshift(notification);
          state.counts.total += 1;
          if (!notification.read) {
            state.counts.unread += 1;
          }
          state.counts.byCategory[notification.category] += 1;
          state.counts.byPriority[notification.priority] += 1;
        }
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.loading.sending = false;
        state.errors.send = action.payload;
      })
      
      // Subscribe to notifications
      .addCase(subscribeToNotifications.pending, (state) => {
        state.loading.subscribing = true;
        state.errors.subscribe = null;
      })
      .addCase(subscribeToNotifications.fulfilled, (state, action) => {
        state.loading.subscribing = false;
        state.pushSettings.subscription = action.payload;
        if (action.payload && action.payload.endpoint) {
          state.pushSettings.endpoint = action.payload.endpoint;
        }
      })
      .addCase(subscribeToNotifications.rejected, (state, action) => {
        state.loading.subscribing = false;
        state.errors.subscribe = action.payload;
      });
  }
});

// Export actions
export const {
  addToast,
  removeToast,
  clearAllToasts,
  updateToast,
  addNotification,
  updateNotification,
  removeNotification,
  setNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  setFilter,
  resetFilters,
  setPushPermission,
  setPushSupported,
  setPushSubscription,
  setPreferences,
  updatePreference,
  updateCategoryPreference,
  toggleCategoryChannel,
  toggleNotificationPanel,
  setNotificationPanel,
  setSelectedNotification,
  setNotificationPanelTab,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setShowToasts,
  setError,
  clearError,
  clearAllErrors,
  resetNotifications
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notification;
export const selectToasts = (state) => state.notification.toasts;
export const selectAllNotifications = (state) => state.notification.notifications;
export const selectNotificationCounts = (state) => state.notification.counts;
export const selectNotificationPagination = (state) => state.notification.pagination;
export const selectNotificationFilters = (state) => state.notification.filters;
export const selectPushSettings = (state) => state.notification.pushSettings;
export const selectNotificationPreferences = (state) => state.notification.preferences;
export const selectNotificationLoading = (state) => state.notification.loading;
export const selectNotificationErrors = (state) => state.notification.errors;
export const selectNotificationUI = (state) => state.notification.ui;

// Computed selectors
export const selectUnreadNotifications = (state) => {
  return state.notification.notifications.filter(n => !n.read);
};

export const selectUnreadCount = (state) => {
  return state.notification.counts.unread;
};

export const selectNotificationsByCategory = (category) => (state) => {
  return state.notification.notifications.filter(n => n.category === category);
};

export const selectNotificationsByPriority = (priority) => (state) => {
  return state.notification.notifications.filter(n => n.priority === priority);
};

export const selectFilteredNotifications = (state) => {
  const { notifications, filters, ui } = state.notification;
  let filtered = [...notifications];
  
  // Apply category filter
  if (filters.category !== 'all') {
    filtered = filtered.filter(n => n.category === filters.category);
  }
  
  // Apply priority filter
  if (filters.priority !== 'all') {
    filtered = filtered.filter(n => n.priority === filters.priority);
  }
  
  // Apply read status filter
  if (filters.read === 'read') {
    filtered = filtered.filter(n => n.read);
  } else if (filters.read === 'unread') {
    filtered = filtered.filter(n => !n.read);
  }
  
  // Apply date range filter
  if (filters.dateRange !== 'all') {
    const now = Date.now();
    const ranges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    if (ranges[filters.dateRange]) {
      const cutoff = now - ranges[filters.dateRange];
      filtered = filtered.filter(n => n.timestamp >= cutoff);
    }
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (ui.sortBy) {
      case 'timestamp':
        comparison = a.timestamp - b.timestamp;
        break;
      case 'priority':
        const priorityOrder = {
          [NOTIFICATION_PRIORITIES.URGENT]: 4,
          [NOTIFICATION_PRIORITIES.HIGH]: 3,
          [NOTIFICATION_PRIORITIES.MEDIUM]: 2,
          [NOTIFICATION_PRIORITIES.LOW]: 1
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      default:
        comparison = a.timestamp - b.timestamp;
    }
    
    return ui.sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return filtered;
};

export const selectRecentNotifications = (limit = 5) => (state) => {
  return state.notification.notifications
    .slice(0, limit)
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const selectHighPriorityNotifications = (state) => {
  return state.notification.notifications.filter(
    n => n.priority === NOTIFICATION_PRIORITIES.HIGH || n.priority === NOTIFICATION_PRIORITIES.URGENT
  );
};

export const selectNotificationById = (notificationId) => (state) => {
  return state.notification.notifications.find(n => n.id === notificationId);
};

export const selectToastById = (toastId) => (state) => {
  return state.notification.toasts.find(t => t.id === toastId);
};

export const selectCanShowToasts = (state) => {
  return state.notification.preferences.enabled && state.notification.ui.showToasts;
};

export const selectPushNotificationSupported = (state) => {
  return state.notification.pushSettings.supported;
};

export const selectPushNotificationPermission = (state) => {
  return state.notification.pushSettings.permission;
};

export const selectIsSubscribedToPush = (state) => {
  return !!state.notification.pushSettings.subscription;
};

// Export reducer
export default notificationSlice.reducer;