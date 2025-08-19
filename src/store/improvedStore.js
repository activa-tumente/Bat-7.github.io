import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import testReducer from './slices/testSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';

// Import API slices
import { authApi } from './api/authApi';
import { testApi } from './api/testApi';
import { userApi } from './api/userApi';

/**
 * Improved Redux Store Configuration
 * 
 * Features:
 * - Better organization with feature-based slices
 * - RTK Query for efficient data fetching
 * - Redux Persist for state persistence
 * - Performance optimizations
 * - Development tools integration
 * - Proper middleware configuration
 */

// Persist configuration
const persistConfig = {
  key: 'bat7-root',
  version: 1,
  storage,
  // Only persist specific slices
  whitelist: ['auth', 'ui'],
  // Don't persist sensitive data
  blacklist: ['api']
};

// Auth persist configuration (more specific)
const authPersistConfig = {
  key: 'auth',
  storage,
  // Only persist non-sensitive auth data
  whitelist: ['user', 'isAuthenticated', 'userRole'],
  blacklist: ['loading', 'error', 'session']
};

// UI persist configuration
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'language', 'sidebarCollapsed', 'preferences']
};

// Root reducer combining all feature slices
const rootReducer = combineReducers({
  // Feature slices
  auth: persistReducer(authPersistConfig, authReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  test: testReducer,
  user: userReducer,
  notification: notificationReducer,
  
  // API slices
  [authApi.reducerPath]: authApi.reducer,
  [testApi.reducerPath]: testApi.reducer,
  [userApi.reducerPath]: userApi.reducer
});

// Persisted root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Custom middleware for development
const customMiddleware = (store) => (next) => (action) => {
  // Log actions in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔄 Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Previous State:', store.getState());
  }
  
  const result = next(action);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('New State:', store.getState());
    console.groupEnd();
  }
  
  return result;
};

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Redux Persist configuration
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates']
      },
      
      // Immutability check configuration
      immutableCheck: {
        // Ignore these paths in immutability check
        ignoredPaths: ['auth.session']
      },
      
      // Thunk configuration
      thunk: {
        extraArgument: {
          // Add extra services that thunks might need
          // api: apiService,
          // logger: loggerService
        }
      }
    })
    // Add RTK Query middleware
    .concat(authApi.middleware)
    .concat(testApi.middleware)
    .concat(userApi.middleware)
    // Add custom middleware in development
    .concat(process.env.NODE_ENV === 'development' ? [customMiddleware] : []),
  
  // DevTools configuration
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'BAT-7 Psychology System',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      // Sanitize sensitive data in dev tools
      payload: action.type.includes('password') 
        ? { ...action.payload, password: '[REDACTED]' }
        : action.payload
    }),
    stateSanitizer: (state) => ({
      ...state,
      // Sanitize sensitive state in dev tools
      auth: {
        ...state.auth,
        session: state.auth.session ? '[SESSION_DATA]' : null
      }
    })
  },
  
  // Preloaded state for SSR or initial state
  preloadedState: undefined,
  
  // Enhancers for additional store capabilities
  enhancers: (getDefaultEnhancers) => 
    getDefaultEnhancers({
      // Autobatch configuration
      autoBatch: { type: 'tick' }
    })
});

// Setup RTK Query listeners
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store, null, () => {
  console.log('🔄 Redux state rehydrated');
});

// Export types for TypeScript (if using TypeScript)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Utility functions for store management
export const getStoreState = () => store.getState();

export const subscribeToStore = (listener) => store.subscribe(listener);

export const dispatchAction = (action) => store.dispatch(action);

// Store debugging utilities for development
if (process.env.NODE_ENV === 'development') {
  // Make store available globally for debugging
  window.__REDUX_STORE__ = store;
  
  // Store state logger
  window.logStoreState = () => {
    console.log('📊 Current Store State:', store.getState());
  };
  
  // Store action dispatcher
  window.dispatchAction = (action) => {
    console.log('🚀 Dispatching action:', action);
    store.dispatch(action);
  };
  
  // Store state subscriber
  window.subscribeToStoreChanges = () => {
    return store.subscribe(() => {
      console.log('🔄 Store state changed:', store.getState());
    });
  };
}

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  let actionCount = 0;
  let lastActionTime = Date.now();
  
  store.subscribe(() => {
    actionCount++;
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;
    
    if (timeSinceLastAction > 100) {
      console.warn(`⚠️ Slow action detected: ${timeSinceLastAction}ms since last action`);
    }
    
    lastActionTime = now;
    
    // Log performance stats every 50 actions
    if (actionCount % 50 === 0) {
      console.log(`📈 Performance: ${actionCount} actions dispatched`);
    }
  });
}

// Store cleanup utility
export const cleanupStore = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning up store...');
    
    // Clear persisted state if needed
    persistor.purge();
    
    // Reset store to initial state
    store.dispatch({ type: 'RESET_STORE' });
  }
};

// Export store as default
export default store;