/**
 * Component Factory Service
 * Implements Factory pattern for dynamic component loading
 * Provides better extensibility and maintainability
 */

// Lazy imports for better performance
const AdminDashboard = React.lazy(() => import('../components/admin/AdminDashboard'));
const SimpleUserManagementPanel = React.lazy(() => import('../components/admin/SimpleUserManagementPanel'));
const PageAccessPanel = React.lazy(() => import('../components/admin/PageAccessPanel'));
const PatientAssignmentPanel = React.lazy(() => import('../components/admin/PatientAssignmentPanel'));
const UsageControlPanel = React.lazy(() => import('../components/admin/UsageControlPanel'));
// TestPinSystem component removed - using real data only
const SimpleUserSettings = React.lazy(() => import('../components/settings/SimpleUserSettings'));

/**
 * Component registry with metadata
 * Easier to maintain and extend
 */
const COMPONENT_REGISTRY = {
  dashboard: {
    component: AdminDashboard,
    requiresAdmin: true,
    preload: true, // Preload critical components
  },
  users: {
    component: SimpleUserManagementPanel,
    requiresAdmin: true,
    preload: false,
  },
  access: {
    component: PageAccessPanel,
    requiresAdmin: true,
    preload: false,
  },
  assignments: {
    component: PatientAssignmentPanel,
    requiresAdmin: true,
    preload: false,
  },
  usage: {
    component: UsageControlPanel,
    requiresAdmin: true,
    preload: false,
  },
  // 'test-pins' component removed - using real data only
  settings: {
    component: SimpleUserSettings,
    requiresAdmin: false,
    preload: true,
  }
};

/**
 * Component Factory class
 */
export class ComponentFactory {
  static getComponent(componentId) {
    const config = COMPONENT_REGISTRY[componentId];
    if (!config) {
      throw new Error(`Component not found: ${componentId}`);
    }
    return config.component;
  }

  static getComponentConfig(componentId) {
    return COMPONENT_REGISTRY[componentId];
  }

  static getAllComponents() {
    return Object.keys(COMPONENT_REGISTRY);
  }

  static preloadComponents() {
    // Preload critical components for better UX
    Object.entries(COMPONENT_REGISTRY)
      .filter(([, config]) => config.preload)
      .forEach(([, config]) => {
        // Trigger lazy loading
        config.component;
      });
  }

  static isValidComponent(componentId) {
    return componentId in COMPONENT_REGISTRY;
  }
}

export default ComponentFactory;