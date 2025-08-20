import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice - Manages application UI state
 * 
 * Features:
 * - Theme management (dark/light mode)
 * - Language/internationalization
 * - Layout preferences
 * - Loading states
 * - Modal and dialog management
 * - Notification preferences
 */

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Language options
export const LANGUAGES = {
  ES: 'es',
  EN: 'en'
};

// Layout options
export const LAYOUT_MODES = {
  COMPACT: 'compact',
  COMFORTABLE: 'comfortable',
  SPACIOUS: 'spacious'
};

// Initial state
const initialState = {
  // Theme settings
  theme: THEMES.SYSTEM,
  isDarkMode: false,
  systemTheme: THEMES.LIGHT,
  
  // Language settings
  language: LANGUAGES.ES,
  
  // Layout preferences
  sidebarCollapsed: false,
  sidebarWidth: 280,
  layoutMode: LAYOUT_MODES.COMFORTABLE,
  showBreadcrumbs: true,
  
  // Loading states
  globalLoading: false,
  pageLoading: false,
  componentLoading: {},
  
  // Modal and dialog management
  modals: {
    confirmDialog: {
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'info' // info, warning, error, success
    },
    userProfile: {
      isOpen: false
    },
    settings: {
      isOpen: false
    },
    testResults: {
      isOpen: false,
      testId: null
    }
  },
  
  // Notification preferences
  notifications: {
    enabled: true,
    position: 'top-right',
    autoClose: 5000,
    showProgress: true,
    pauseOnHover: true,
    sound: false
  },
  
  // Page-specific UI state
  pages: {
    dashboard: {
      activeTab: 'overview',
      chartType: 'bar',
      dateRange: '30d'
    },
    tests: {
      view: 'grid', // grid, list
      sortBy: 'date',
      sortOrder: 'desc',
      filters: {
        status: 'all',
        type: 'all',
        dateRange: 'all'
      }
    },
    users: {
      view: 'table',
      sortBy: 'name',
      sortOrder: 'asc',
      filters: {
        role: 'all',
        status: 'all'
      }
    }
  },
  
  // Form states
  forms: {
    isDirty: false,
    hasUnsavedChanges: false,
    validationErrors: {}
  },
  
  // Search and filters
  search: {
    query: '',
    filters: {},
    results: [],
    isSearching: false
  },
  
  // Accessibility preferences
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium', // small, medium, large
    screenReader: false
  },
  
  // Performance monitoring
  performance: {
    renderTime: 0,
    lastUpdate: null,
    slowComponents: []
  }
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (action.payload !== THEMES.SYSTEM) {
        state.isDarkMode = action.payload === THEMES.DARK;
      }
    },
    
    setSystemTheme: (state, action) => {
      state.systemTheme = action.payload;
      if (state.theme === THEMES.SYSTEM) {
        state.isDarkMode = action.payload === THEMES.DARK;
      }
    },
    
    toggleTheme: (state) => {
      if (state.theme === THEMES.SYSTEM) {
        state.theme = state.isDarkMode ? THEMES.LIGHT : THEMES.DARK;
      } else {
        state.theme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      }
      state.isDarkMode = state.theme === THEMES.DARK;
    },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Layout actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    setSidebarWidth: (state, action) => {
      state.sidebarWidth = Math.max(200, Math.min(400, action.payload));
    },
    
    setLayoutMode: (state, action) => {
      state.layoutMode = action.payload;
    },
    
    toggleBreadcrumbs: (state) => {
      state.showBreadcrumbs = !state.showBreadcrumbs;
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      if (loading) {
        state.componentLoading[component] = true;
      } else {
        delete state.componentLoading[component];
      }
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modalName, props = {} } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = {
          ...state.modals[modalName],
          isOpen: true,
          ...props
        };
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName].isOpen = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName].isOpen = false;
      });
    },
    
    // Confirm dialog specific actions
    showConfirmDialog: (state, action) => {
      const {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'info'
      } = action.payload;
      
      state.modals.confirmDialog = {
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        type
      };
    },
    
    // Notification actions
    updateNotificationSettings: (state, action) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload
      };
    },
    
    // Page-specific actions
    updatePageState: (state, action) => {
      const { page, updates } = action.payload;
      if (state.pages[page]) {
        state.pages[page] = {
          ...state.pages[page],
          ...updates
        };
      }
    },
    
    setDashboardTab: (state, action) => {
      state.pages.dashboard.activeTab = action.payload;
    },
    
    setTestsView: (state, action) => {
      state.pages.tests.view = action.payload;
    },
    
    setTestsSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.pages.tests.sortBy = sortBy;
      state.pages.tests.sortOrder = sortOrder;
    },
    
    updateTestsFilters: (state, action) => {
      state.pages.tests.filters = {
        ...state.pages.tests.filters,
        ...action.payload
      };
    },
    
    // Form actions
    setFormDirty: (state, action) => {
      state.forms.isDirty = action.payload;
    },
    
    setUnsavedChanges: (state, action) => {
      state.forms.hasUnsavedChanges = action.payload;
    },
    
    setValidationErrors: (state, action) => {
      state.forms.validationErrors = action.payload;
    },
    
    clearValidationErrors: (state) => {
      state.forms.validationErrors = {};
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    setSearchFilters: (state, action) => {
      state.search.filters = {
        ...state.search.filters,
        ...action.payload
      };
    },
    
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    
    setSearching: (state, action) => {
      state.search.isSearching = action.payload;
    },
    
    clearSearch: (state) => {
      state.search.query = '';
      state.search.filters = {};
      state.search.results = [];
      state.search.isSearching = false;
    },
    
    // Accessibility actions
    updateAccessibilitySettings: (state, action) => {
      state.accessibility = {
        ...state.accessibility,
        ...action.payload
      };
    },
    
    toggleReducedMotion: (state) => {
      state.accessibility.reducedMotion = !state.accessibility.reducedMotion;
    },
    
    toggleHighContrast: (state) => {
      state.accessibility.highContrast = !state.accessibility.highContrast;
    },
    
    setFontSize: (state, action) => {
      state.accessibility.fontSize = action.payload;
    },
    
    // Performance actions
    updatePerformanceMetrics: (state, action) => {
      const { renderTime, componentName } = action.payload;
      state.performance.renderTime = renderTime;
      state.performance.lastUpdate = Date.now();
      
      if (renderTime > 100 && componentName) {
        const existingIndex = state.performance.slowComponents.findIndex(
          comp => comp.name === componentName
        );
        
        if (existingIndex >= 0) {
          state.performance.slowComponents[existingIndex].renderTime = renderTime;
          state.performance.slowComponents[existingIndex].lastSeen = Date.now();
        } else {
          state.performance.slowComponents.push({
            name: componentName,
            renderTime,
            lastSeen: Date.now()
          });
        }
        
        // Keep only last 10 slow components
        if (state.performance.slowComponents.length > 10) {
          state.performance.slowComponents = state.performance.slowComponents
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .slice(0, 10);
        }
      }
    },
    
    // Reset actions
    resetUIState: () => initialState,
    
    resetPageState: (state, action) => {
      const page = action.payload;
      if (state.pages[page] && initialState.pages[page]) {
        state.pages[page] = { ...initialState.pages[page] };
      }
    }
  }
});

// Export actions
export const {
  // Theme
  setTheme,
  setSystemTheme,
  toggleTheme,
  
  // Language
  setLanguage,
  
  // Layout
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarWidth,
  setLayoutMode,
  toggleBreadcrumbs,
  
  // Loading
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  showConfirmDialog,
  
  // Notifications
  updateNotificationSettings,
  
  // Pages
  updatePageState,
  setDashboardTab,
  setTestsView,
  setTestsSort,
  updateTestsFilters,
  
  // Forms
  setFormDirty,
  setUnsavedChanges,
  setValidationErrors,
  clearValidationErrors,
  
  // Search
  setSearchQuery,
  setSearchFilters,
  setSearchResults,
  setSearching,
  clearSearch,
  
  // Accessibility
  updateAccessibilitySettings,
  toggleReducedMotion,
  toggleHighContrast,
  setFontSize,
  
  // Performance
  updatePerformanceMetrics,
  
  // Reset
  resetUIState,
  resetPageState
} = uiSlice.actions;

// Selectors
export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectIsDarkMode = (state) => state.ui.isDarkMode;
export const selectLanguage = (state) => state.ui.language;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectSidebarWidth = (state) => state.ui.sidebarWidth;
export const selectLayoutMode = (state) => state.ui.layoutMode;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectPageLoading = (state) => state.ui.pageLoading;
export const selectComponentLoading = (state) => state.ui.componentLoading;
export const selectModals = (state) => state.ui.modals;
export const selectConfirmDialog = (state) => state.ui.modals.confirmDialog;
export const selectNotificationSettings = (state) => state.ui.notifications;
export const selectPageState = (page) => (state) => state.ui.pages[page];
export const selectDashboardState = (state) => state.ui.pages.dashboard;
export const selectTestsState = (state) => state.ui.pages.tests;
export const selectUsersState = (state) => state.ui.pages.users;
export const selectFormState = (state) => state.ui.forms;
export const selectSearchState = (state) => state.ui.search;
export const selectAccessibilitySettings = (state) => state.ui.accessibility;
export const selectPerformanceMetrics = (state) => state.ui.performance;

// Computed selectors
export const selectIsAnyModalOpen = (state) => 
  Object.values(state.ui.modals).some(modal => modal.isOpen);

export const selectIsComponentLoading = (componentName) => (state) => 
  !!state.ui.componentLoading[componentName];

export const selectHasUnsavedChanges = (state) => 
  state.ui.forms.hasUnsavedChanges || state.ui.forms.isDirty;

export const selectThemeClasses = (state) => {
  const { isDarkMode, accessibility } = state.ui;
  return {
    'dark': isDarkMode,
    'light': !isDarkMode,
    'reduced-motion': accessibility.reducedMotion,
    'high-contrast': accessibility.highContrast,
    [`font-${accessibility.fontSize}`]: true
  };
};

// Export reducer
export default uiSlice.reducer;