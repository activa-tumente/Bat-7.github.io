/**
 * Accessibility utilities for the BAT-7 application
 * Provides ARIA helpers, keyboard navigation, and screen reader support
 */

/**
 * Generate unique IDs for accessibility attributes
 */
let idCounter = 0;
export const generateId = (prefix = 'element') => {
  return `${prefix}-${++idCounter}-${Date.now()}`;
};

/**
 * ARIA live region announcer for screen readers
 */
class LiveRegionAnnouncer {
  constructor() {
    this.politeRegion = null;
    this.assertiveRegion = null;
    this.init();
  }

  init() {
    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.id = 'live-region-polite';
    
    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.id = 'live-region-assertive';
    
    // Add to DOM
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message, priority = 'polite') {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    if (region) {
      // Clear previous message
      region.textContent = '';
      
      // Set new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      
      // Clear message after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  announceError(message) {
    this.announce(`Error: ${message}`, 'assertive');
  }

  announceSuccess(message) {
    this.announce(`Success: ${message}`, 'polite');
  }

  announceLoading(message = 'Loading') {
    this.announce(message, 'polite');
  }

  announcePageChange(pageName) {
    this.announce(`Navigated to ${pageName}`, 'polite');
  }
}

// Create singleton instance
export const liveAnnouncer = new LiveRegionAnnouncer();

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  // Common key codes
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab'
  },

  /**
   * Handle arrow key navigation in lists
   */
  handleListNavigation(event, items, currentIndex, onIndexChange) {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case this.KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case this.KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case this.KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case this.KEYS.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return false;
    }

    onIndexChange(newIndex);
    return true;
  },

  /**
   * Handle grid navigation (2D)
   */
  handleGridNavigation(event, gridSize, currentPosition, onPositionChange) {
    const { key } = event;
    const { row, col } = currentPosition;
    const { rows, cols } = gridSize;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case this.KEYS.ARROW_UP:
        event.preventDefault();
        newRow = row > 0 ? row - 1 : rows - 1;
        break;
      case this.KEYS.ARROW_DOWN:
        event.preventDefault();
        newRow = row < rows - 1 ? row + 1 : 0;
        break;
      case this.KEYS.ARROW_LEFT:
        event.preventDefault();
        newCol = col > 0 ? col - 1 : cols - 1;
        break;
      case this.KEYS.ARROW_RIGHT:
        event.preventDefault();
        newCol = col < cols - 1 ? col + 1 : 0;
        break;
      case this.KEYS.HOME:
        event.preventDefault();
        newCol = 0;
        break;
      case this.KEYS.END:
        event.preventDefault();
        newCol = cols - 1;
        break;
      default:
        return false;
    }

    onPositionChange({ row: newRow, col: newCol });
    return true;
  },

  /**
   * Trap focus within a container
   */
  trapFocus(container, event) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === this.KEYS.TAB) {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
};

/**
 * Focus management utilities
 */
export const FocusManager = {
  /**
   * Store the currently focused element
   */
  storeFocus() {
    this.previouslyFocused = document.activeElement;
  },

  /**
   * Restore focus to previously focused element
   */
  restoreFocus() {
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus();
    }
  },

  /**
   * Focus the first focusable element in container
   */
  focusFirst(container) {
    const focusableElement = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElement) {
      focusableElement.focus();
    }
  },

  /**
   * Move focus to element with announcement
   */
  moveFocusTo(element, announcement) {
    if (element && element.focus) {
      element.focus();
      if (announcement) {
        liveAnnouncer.announce(announcement);
      }
    }
  }
};

/**
 * ARIA attribute helpers
 */
export const AriaHelpers = {
  /**
   * Generate ARIA attributes for expandable content
   */
  getExpandableAttributes(isExpanded, controlsId) {
    return {
      'aria-expanded': isExpanded.toString(),
      'aria-controls': controlsId
    };
  },

  /**
   * Generate ARIA attributes for modal dialogs
   */
  getModalAttributes(titleId, descriptionId) {
    return {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId
    };
  },

  /**
   * Generate ARIA attributes for form fields
   */
  getFieldAttributes(fieldId, labelId, errorId, isRequired = false, isInvalid = false) {
    const attributes = {
      id: fieldId,
      'aria-labelledby': labelId
    };

    if (isRequired) {
      attributes['aria-required'] = 'true';
    }

    if (isInvalid) {
      attributes['aria-invalid'] = 'true';
      attributes['aria-describedby'] = errorId;
    }

    return attributes;
  },

  /**
   * Generate ARIA attributes for lists
   */
  getListAttributes(itemCount, currentIndex = -1) {
    const attributes = {
      role: 'listbox',
      'aria-label': `List with ${itemCount} items`
    };

    if (currentIndex >= 0) {
      attributes['aria-activedescendant'] = `option-${currentIndex}`;
    }

    return attributes;
  },

  /**
   * Generate ARIA attributes for list items
   */
  getListItemAttributes(index, isSelected = false) {
    return {
      role: 'option',
      id: `option-${index}`,
      'aria-selected': isSelected.toString()
    };
  },

  /**
   * Generate ARIA attributes for buttons
   */
  getButtonAttributes(label, isPressed = null, describedBy = null) {
    const attributes = {
      'aria-label': label
    };

    if (isPressed !== null) {
      attributes['aria-pressed'] = isPressed.toString();
    }

    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }

    return attributes;
  }
};

/**
 * Screen reader utilities
 */
export const ScreenReaderUtils = {
  /**
   * Hide element from screen readers
   */
  hide(element) {
    element.setAttribute('aria-hidden', 'true');
  },

  /**
   * Show element to screen readers
   */
  show(element) {
    element.removeAttribute('aria-hidden');
  },

  /**
   * Make element visible only to screen readers
   */
  makeScreenReaderOnly(element) {
    element.className += ' sr-only';
  },

  /**
   * Announce dynamic content changes
   */
  announceChange(message, priority = 'polite') {
    liveAnnouncer.announce(message, priority);
  },

  /**
   * Announce loading states
   */
  announceLoading(isLoading, loadingMessage = 'Loading', completeMessage = 'Loading complete') {
    if (isLoading) {
      liveAnnouncer.announceLoading(loadingMessage);
    } else {
      liveAnnouncer.announce(completeMessage);
    }
  }
};

/**
 * Color contrast utilities
 */
export const ColorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAG(contrastRatio, level = 'AA', size = 'normal') {
    const requirements = {
      'AA': { normal: 4.5, large: 3 },
      'AAA': { normal: 7, large: 4.5 }
    };
    
    return contrastRatio >= requirements[level][size];
  }
};

/**
 * Accessibility testing utilities
 */
export const A11yTesting = {
  /**
   * Check for missing alt text on images
   */
  checkImageAltText(container = document) {
    const images = container.querySelectorAll('img');
    const issues = [];
    
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });
    
    return issues;
  },

  /**
   * Check for missing form labels
   */
  checkFormLabels(container = document) {
    const inputs = container.querySelectorAll('input, select, textarea');
    const issues = [];
    
    inputs.forEach((input, index) => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Form field ${index + 1} (${input.type || input.tagName}) is missing a label`);
      }
    });
    
    return issues;
  },

  /**
   * Check for keyboard accessibility
   */
  checkKeyboardAccess(container = document) {
    const interactive = container.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    const issues = [];
    
    interactive.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '-1' && !element.disabled) {
        issues.push(`Interactive element ${index + 1} (${element.tagName}) is not keyboard accessible`);
      }
    });
    
    return issues;
  },

  /**
   * Run all accessibility checks
   */
  runAllChecks(container = document) {
    return {
      imageAltText: this.checkImageAltText(container),
      formLabels: this.checkFormLabels(container),
      keyboardAccess: this.checkKeyboardAccess(container)
    };
  }
};

/**
 * Custom hook for managing focus
 */
export const useFocusManagement = () => {
  const focusRef = React.useRef(null);
  
  const setFocus = React.useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);
  
  const storeFocus = React.useCallback(() => {
    FocusManager.storeFocus();
  }, []);
  
  const restoreFocus = React.useCallback(() => {
    FocusManager.restoreFocus();
  }, []);
  
  return {
    focusRef,
    setFocus,
    storeFocus,
    restoreFocus
  };
};

/**
 * Custom hook for announcements
 */
export const useAnnouncements = () => {
  const announce = React.useCallback((message, priority = 'polite') => {
    liveAnnouncer.announce(message, priority);
  }, []);
  
  const announceError = React.useCallback((message) => {
    liveAnnouncer.announceError(message);
  }, []);
  
  const announceSuccess = React.useCallback((message) => {
    liveAnnouncer.announceSuccess(message);
  }, []);
  
  return {
    announce,
    announceError,
    announceSuccess
  };
};

export default {
  generateId,
  liveAnnouncer,
  KeyboardNavigation,
  FocusManager,
  AriaHelpers,
  ScreenReaderUtils,
  ColorContrast,
  A11yTesting,
  useFocusManagement,
  useAnnouncements
};