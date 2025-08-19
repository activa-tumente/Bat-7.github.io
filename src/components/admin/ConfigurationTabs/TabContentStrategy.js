import React, { lazy } from 'react';

// Lazy load tab components for better performance
const DashboardTab = lazy(() => import('./tabs/DashboardTab'));
const PinesTab = lazy(() => import('./tabs/PinesTab'));
const UsersTab = lazy(() => import('./tabs/UsersTab'));
const AssignmentsTab = lazy(() => import('./tabs/AssignmentsTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));

/**
 * Strategy pattern for tab content rendering
 * Eliminates large switch statements and enables lazy loading
 */
class TabContentStrategy {
  constructor() {
    this.strategies = new Map([
      ['dashboard', { component: DashboardTab, requiresAdmin: true }],
      ['pines', { component: PinesTab, requiresAdmin: true }],
      ['users', { component: UsersTab, requiresAdmin: true }],
      ['assignments', { component: AssignmentsTab, requiresAdmin: true }],
      ['settings', { component: SettingsTab, requiresAdmin: false }]
    ]);
  }

  /**
   * Get component for a specific tab
   * @param {string} tabId - Tab identifier
   * @returns {React.Component|null} Tab component
   */
  getComponent(tabId) {
    const strategy = this.strategies.get(tabId);
    return strategy ? strategy.component : null;
  }

  /**
   * Check if tab requires admin permissions
   * @param {string} tabId - Tab identifier
   * @returns {boolean} Whether admin permissions are required
   */
  requiresAdmin(tabId) {
    const strategy = this.strategies.get(tabId);
    return strategy ? strategy.requiresAdmin : false;
  }

  /**
   * Get all available tab IDs
   * @returns {string[]} Array of tab IDs
   */
  getAvailableTabs() {
    return Array.from(this.strategies.keys());
  }

  /**
   * Register a new tab strategy
   * @param {string} tabId - Tab identifier
   * @param {React.Component} component - Tab component
   * @param {boolean} requiresAdmin - Whether admin permissions are required
   */
  registerTab(tabId, component, requiresAdmin = false) {
    this.strategies.set(tabId, { component, requiresAdmin });
  }
}

// Export singleton instance
export default new TabContentStrategy();