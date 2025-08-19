import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleError } from '../../services/improvedErrorHandler';

/**
 * User Slice - Manages user-related state
 * 
 * Features:
 * - User profile management
 * - Preferences and settings
 * - Activity tracking
 * - Role and permission management
 * - User statistics
 */

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  PROFESSIONAL: 'professional',
  STUDENT: 'student',
  GUEST: 'guest'
};

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  TEST_STARTED: 'test_started',
  TEST_COMPLETED: 'test_completed',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed'
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchUserProfile',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'updateUserProfile',
        userId,
        profileData
      });
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async ({ userId, preferences }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user preferences');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'updateUserPreferences',
        userId,
        preferences
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'user/fetchUserActivity',
  async ({ userId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/activity?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchUserActivity',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

export const logUserActivity = createAsyncThunk(
  'user/logUserActivity',
  async ({ userId, activityType, metadata = {} }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: activityType,
          metadata,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to log user activity');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'logUserActivity',
        userId,
        activityType
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'user/fetchUserStatistics',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/statistics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        context: 'fetchUserStatistics',
        userId
      });
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Current user profile
  profile: {
    id: null,
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
    avatar: null,
    role: USER_ROLES.GUEST,
    status: USER_STATUS.ACTIVE,
    permissions: [],
    department: '',
    institution: '',
    title: '',
    bio: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    },
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
    emailVerified: false,
    phoneVerified: false
  },
  
  // User preferences
  preferences: {
    // UI preferences
    theme: 'system', // 'light', 'dark', 'system'
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h', // '12h' or '24h'
    
    // Notification preferences
    notifications: {
      email: {
        testReminders: true,
        resultUpdates: true,
        systemUpdates: false,
        marketing: false
      },
      push: {
        testReminders: true,
        resultUpdates: true,
        systemUpdates: false
      },
      inApp: {
        testReminders: true,
        resultUpdates: true,
        systemUpdates: true
      }
    },
    
    // Test preferences
    test: {
      autoSave: true,
      showProgress: true,
      showTimeRemaining: true,
      confirmBeforeSubmit: true,
      allowPause: true,
      fontSize: 'medium', // 'small', 'medium', 'large'
      highContrast: false
    },
    
    // Privacy preferences
    privacy: {
      profileVisibility: 'private', // 'public', 'private', 'contacts'
      shareStatistics: false,
      allowAnalytics: true
    },
    
    // Accessibility preferences
    accessibility: {
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      highContrast: false,
      fontSize: 'medium'
    }
  },
  
  // User activity
  activity: {
    recent: [],
    totalCount: 0,
    currentPage: 1,
    hasMore: false,
    lastActivity: null
  },
  
  // User statistics
  statistics: {
    testsCompleted: 0,
    totalTestTime: 0,
    averageScore: 0,
    bestScore: 0,
    testsByType: {},
    monthlyActivity: [],
    streakDays: 0,
    achievements: [],
    rank: null,
    percentile: null
  },
  
  // Session information
  session: {
    isOnline: true,
    lastSeen: null,
    sessionDuration: 0,
    sessionStartTime: null,
    idleTime: 0,
    activeTab: true
  },
  
  // Loading states
  loading: {
    profile: false,
    preferences: false,
    activity: false,
    statistics: false,
    updating: false
  },
  
  // Error states
  errors: {
    profile: null,
    preferences: null,
    activity: null,
    statistics: null,
    update: null
  },
  
  // UI state
  ui: {
    profileEditMode: false,
    preferencesTab: 'general',
    showActivityDetails: false,
    showStatisticsDetails: false
  }
};

// User slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Profile management
    setProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
        updatedAt: Date.now()
      };
    },
    
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (field.includes('.')) {
        // Handle nested fields like 'address.city'
        const [parent, child] = field.split('.');
        if (state.profile[parent]) {
          state.profile[parent][child] = value;
        }
      } else {
        state.profile[field] = value;
      }
      state.profile.updatedAt = Date.now();
    },
    
    setAvatar: (state, action) => {
      state.profile.avatar = action.payload;
      state.profile.updatedAt = Date.now();
    },
    
    updateLastLogin: (state) => {
      state.profile.lastLoginAt = Date.now();
    },
    
    // Preferences management
    setPreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    updatePreference: (state, action) => {
      const { category, key, value } = action.payload;
      if (state.preferences[category]) {
        state.preferences[category][key] = value;
      }
    },
    
    updateNotificationPreference: (state, action) => {
      const { type, key, value } = action.payload;
      if (state.preferences.notifications[type]) {
        state.preferences.notifications[type][key] = value;
      }
    },
    
    // Activity management
    addActivity: (state, action) => {
      const activity = {
        ...action.payload,
        timestamp: Date.now()
      };
      state.activity.recent.unshift(activity);
      state.activity.lastActivity = activity;
      
      // Keep only the last 50 activities in memory
      if (state.activity.recent.length > 50) {
        state.activity.recent = state.activity.recent.slice(0, 50);
      }
    },
    
    setActivity: (state, action) => {
      const { activities, totalCount, page, hasMore } = action.payload;
      
      if (page === 1) {
        state.activity.recent = activities;
      } else {
        state.activity.recent.push(...activities);
      }
      
      state.activity.totalCount = totalCount;
      state.activity.currentPage = page;
      state.activity.hasMore = hasMore;
      
      if (activities.length > 0) {
        state.activity.lastActivity = activities[0];
      }
    },
    
    clearActivity: (state) => {
      state.activity = initialState.activity;
    },
    
    // Statistics management
    setStatistics: (state, action) => {
      state.statistics = {
        ...state.statistics,
        ...action.payload
      };
    },
    
    updateStatistic: (state, action) => {
      const { key, value } = action.payload;
      state.statistics[key] = value;
    },
    
    incrementTestsCompleted: (state) => {
      state.statistics.testsCompleted += 1;
    },
    
    updateTestTime: (state, action) => {
      state.statistics.totalTestTime += action.payload;
    },
    
    updateBestScore: (state, action) => {
      const newScore = action.payload;
      if (newScore > state.statistics.bestScore) {
        state.statistics.bestScore = newScore;
      }
    },
    
    addAchievement: (state, action) => {
      const achievement = {
        ...action.payload,
        earnedAt: Date.now()
      };
      
      // Check if achievement already exists
      const exists = state.statistics.achievements.some(
        a => a.id === achievement.id
      );
      
      if (!exists) {
        state.statistics.achievements.push(achievement);
      }
    },
    
    // Session management
    setOnlineStatus: (state, action) => {
      state.session.isOnline = action.payload;
      if (!action.payload) {
        state.session.lastSeen = Date.now();
      }
    },
    
    startSession: (state) => {
      state.session.sessionStartTime = Date.now();
      state.session.sessionDuration = 0;
      state.session.idleTime = 0;
    },
    
    updateSessionDuration: (state) => {
      if (state.session.sessionStartTime) {
        state.session.sessionDuration = Date.now() - state.session.sessionStartTime;
      }
    },
    
    updateIdleTime: (state, action) => {
      state.session.idleTime = action.payload;
    },
    
    setActiveTab: (state, action) => {
      state.session.activeTab = action.payload;
    },
    
    // UI management
    setProfileEditMode: (state, action) => {
      state.ui.profileEditMode = action.payload;
    },
    
    setPreferencesTab: (state, action) => {
      state.ui.preferencesTab = action.payload;
    },
    
    toggleActivityDetails: (state) => {
      state.ui.showActivityDetails = !state.ui.showActivityDetails;
    },
    
    toggleStatisticsDetails: (state) => {
      state.ui.showStatisticsDetails = !state.ui.showStatisticsDetails;
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
    resetProfile: (state) => {
      state.profile = initialState.profile;
    },
    
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
    
    resetUser: () => initialState
  },
  
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = {
          ...state.profile,
          ...action.payload
        };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading.updating = true;
        state.errors.update = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.profile = {
          ...state.profile,
          ...action.payload,
          updatedAt: Date.now()
        };
        state.ui.profileEditMode = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading.updating = false;
        state.errors.update = action.payload;
      })
      
      // Update user preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.errors.preferences = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = {
          ...state.preferences,
          ...action.payload
        };
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.errors.preferences = action.payload;
      })
      
      // Fetch user activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading.activity = true;
        state.errors.activity = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading.activity = false;
        const { activities, totalCount, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.activity.recent = activities;
        } else {
          state.activity.recent.push(...activities);
        }
        
        state.activity.totalCount = totalCount;
        state.activity.currentPage = page;
        state.activity.hasMore = hasMore;
        
        if (activities.length > 0) {
          state.activity.lastActivity = activities[0];
        }
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading.activity = false;
        state.errors.activity = action.payload;
      })
      
      // Log user activity
      .addCase(logUserActivity.fulfilled, (state, action) => {
        // Add the logged activity to recent activities
        state.activity.recent.unshift(action.payload);
        state.activity.lastActivity = action.payload;
        
        // Keep only the last 50 activities
        if (state.activity.recent.length > 50) {
          state.activity.recent = state.activity.recent.slice(0, 50);
        }
      })
      
      // Fetch user statistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = {
          ...state.statistics,
          ...action.payload
        };
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.payload;
      });
  }
});

// Export actions
export const {
  setProfile,
  updateProfileField,
  setAvatar,
  updateLastLogin,
  setPreferences,
  updatePreference,
  updateNotificationPreference,
  addActivity,
  setActivity,
  clearActivity,
  setStatistics,
  updateStatistic,
  incrementTestsCompleted,
  updateTestTime,
  updateBestScore,
  addAchievement,
  setOnlineStatus,
  startSession,
  updateSessionDuration,
  updateIdleTime,
  setActiveTab,
  setProfileEditMode,
  setPreferencesTab,
  toggleActivityDetails,
  toggleStatisticsDetails,
  setError,
  clearError,
  clearAllErrors,
  resetProfile,
  resetPreferences,
  resetUser
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserActivity = (state) => state.user.activity;
export const selectUserStatistics = (state) => state.user.statistics;
export const selectUserSession = (state) => state.user.session;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserErrors = (state) => state.user.errors;
export const selectUserUI = (state) => state.user.ui;

// Computed selectors
export const selectUserDisplayName = (state) => {
  const { displayName, firstName, lastName, email } = state.user.profile;
  return displayName || `${firstName} ${lastName}`.trim() || email || 'User';
};

export const selectUserInitials = (state) => {
  const { firstName, lastName, email } = state.user.profile;
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
};

export const selectUserRole = (state) => state.user.profile.role;

export const selectUserPermissions = (state) => state.user.profile.permissions;

export const selectHasPermission = (permission) => (state) => {
  return state.user.profile.permissions.includes(permission);
};

export const selectIsOnline = (state) => state.user.session.isOnline;

export const selectSessionDuration = (state) => {
  const { sessionStartTime, sessionDuration } = state.user.session;
  if (sessionStartTime) {
    return Date.now() - sessionStartTime;
  }
  return sessionDuration;
};

export const selectRecentActivity = (state) => {
  return state.user.activity.recent.slice(0, 10); // Last 10 activities
};

export const selectUnreadNotifications = (state) => {
  return state.user.activity.recent.filter(activity => !activity.read).length;
};

export const selectThemePreference = (state) => state.user.preferences.theme;

export const selectLanguagePreference = (state) => state.user.preferences.language;

export const selectNotificationPreferences = (state) => state.user.preferences.notifications;

export const selectTestPreferences = (state) => state.user.preferences.test;

export const selectAccessibilityPreferences = (state) => state.user.preferences.accessibility;

export const selectUserAchievements = (state) => state.user.statistics.achievements;

export const selectUserRank = (state) => state.user.statistics.rank;

export const selectUserTestStats = (state) => {
  const { testsCompleted, averageScore, bestScore, totalTestTime } = state.user.statistics;
  return {
    testsCompleted,
    averageScore,
    bestScore,
    totalTestTime,
    averageTestTime: testsCompleted > 0 ? totalTestTime / testsCompleted : 0
  };
};

// Export reducer
export default userSlice.reducer;