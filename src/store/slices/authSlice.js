import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleError } from '../../services/improvedErrorHandler';

/**
 * Auth Slice - Improved Redux state management for authentication
 * 
 * Features:
 * - Async thunks for auth operations
 * - Better error handling
 * - Optimistic updates
 * - Normalized state structure
 * - Performance optimizations
 */

// Initial state
const initialState = {
  // User data
  user: null,
  session: null,
  
  // Authentication status
  isAuthenticated: false,
  isInitialized: false,
  
  // User role and permissions
  userRole: null,
  permissions: [],
  
  // Loading states
  loading: {
    login: false,
    logout: false,
    register: false,
    passwordReset: false,
    profileUpdate: false
  },
  
  // Error states
  errors: {
    login: null,
    register: null,
    passwordReset: null,
    general: null
  },
  
  // UI state
  loginAttempts: 0,
  lastLoginTime: null,
  sessionExpiry: null,
  
  // Settings
  rememberMe: false,
  autoLogout: true,
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ identifier, password, userType, rememberMe = false }, { rejectWithValue, dispatch }) => {
    try {
      // This would integrate with your auth service
      const authService = await import('../../services/authService');
      
      const result = await authService.default.login({
        identifier,
        password,
        userType
      });
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      // Set session expiry
      const sessionExpiry = rememberMe 
        ? Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        : Date.now() + (30 * 60 * 1000); // 30 minutes
      
      return {
        user: result.user,
        session: result.session,
        sessionExpiry,
        rememberMe
      };
    } catch (error) {
      const appError = handleError(error, { action: 'login', identifier });
      return rejectWithValue(appError.userMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const authService = await import('../../services/authService');
      const result = await authService.default.logout();
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      return true;
    } catch (error) {
      const appError = handleError(error, { action: 'logout' });
      return rejectWithValue(appError.userMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const authService = await import('../../services/authService');
      const result = await authService.default.register(userData);
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      return result.user;
    } catch (error) {
      const appError = handleError(error, { action: 'register', email: userData.email });
      return rejectWithValue(appError.userMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const authService = await import('../../services/authService');
      const result = await authService.default.resetPassword(email);
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      return { email, message: result.message };
    } catch (error) {
      const appError = handleError(error, { action: 'resetPassword', email });
      return rejectWithValue(appError.userMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.user?.id) {
        return rejectWithValue('Usuario no autenticado');
      }
      
      const authService = await import('../../services/authService');
      const result = await authService.default.updateProfile(auth.user.id, profileData);
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      return result.user;
    } catch (error) {
      const appError = handleError(error, { action: 'updateProfile' });
      return rejectWithValue(appError.userMessage);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const authService = await import('../../services/authService');
      const result = await authService.default.getCurrentUser();
      
      return {
        user: result.user,
        session: result.session,
        isAuthenticated: !!result.user
      };
    } catch (error) {
      const appError = handleError(error, { action: 'initializeAuth' });
      return rejectWithValue(appError.userMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    clearErrors: (state) => {
      state.errors = {
        login: null,
        register: null,
        passwordReset: null,
        general: null
      };
    },
    
    clearLoginError: (state) => {
      state.errors.login = null;
    },
    
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
    
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    
    updateUserRole: (state, action) => {
      state.userRole = action.payload;
      if (state.user) {
        state.user.tipo_usuario = action.payload;
      }
    },
    
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    },
    
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
    
    extendSession: (state) => {
      if (state.isAuthenticated) {
        state.sessionExpiry = Date.now() + state.sessionTimeout;
      }
    },
    
    // Development helpers
    setDevelopmentUser: (state, action) => {
      if (process.env.NODE_ENV === 'development') {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.userRole = action.payload.tipo_usuario;
        state.isInitialized = true;
      }
    },
    
    // Reset state
    resetAuthState: () => initialState
  },
  
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true;
        state.errors.login = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.userRole = action.payload.user.tipo_usuario;
        state.lastLoginTime = Date.now();
        state.sessionExpiry = action.payload.sessionExpiry;
        state.rememberMe = action.payload.rememberMe;
        state.loginAttempts = 0;
        state.errors.login = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false;
        state.errors.login = action.payload;
        state.loginAttempts += 1;
      })
      
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.loading.logout = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...initialState,
          isInitialized: true
        };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logout = false;
        state.errors.general = action.payload;
      })
      
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading.register = true;
        state.errors.register = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading.register = false;
        // Don't auto-login after registration
        state.errors.register = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading.register = false;
        state.errors.register = action.payload;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading.passwordReset = true;
        state.errors.passwordReset = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading.passwordReset = false;
        state.errors.passwordReset = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading.passwordReset = false;
        state.errors.passwordReset = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.profileUpdate = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.profileUpdate = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.profileUpdate = false;
        state.errors.general = action.payload;
      })
      
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.userRole = action.payload.user?.tipo_usuario || null;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
        state.errors.general = action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  clearLoginError,
  incrementLoginAttempts,
  resetLoginAttempts,
  setRememberMe,
  updateUserRole,
  updatePermissions,
  setSessionExpiry,
  extendSession,
  setDevelopmentUser,
  resetAuthState
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectUserRole = (state) => state.auth.userRole;
export const selectPermissions = (state) => state.auth.permissions;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthErrors = (state) => state.auth.errors;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;

// Computed selectors
export const selectIsAdmin = (state) => state.auth.userRole === 'administrador';
export const selectIsPsicologo = (state) => state.auth.userRole === 'psicologo';
export const selectIsCandidato = (state) => state.auth.userRole === 'candidato';
export const selectIsSessionExpired = (state) => {
  const { sessionExpiry, isAuthenticated } = state.auth;
  return isAuthenticated && sessionExpiry && Date.now() > sessionExpiry;
};
export const selectShouldShowLoginLock = (state) => state.auth.loginAttempts >= 3;

// Export reducer
export default authSlice.reducer;