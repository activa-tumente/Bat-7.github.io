import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing modal state and behavior
 * Provides standardized modal logic with accessibility features
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Modal state and operations
 */
export const useModal = (options = {}) => {
  const {
    initialOpen = false,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    preventBodyScroll = true,
    focusOnOpen = true,
    returnFocusOnClose = true,
    onOpen = null,
    onClose = null,
    onEscape = null
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // Open modal
  const openModal = useCallback((data = null) => {
    // Store current focus for restoration
    if (returnFocusOnClose && document.activeElement) {
      previousFocusRef.current = document.activeElement;
    }

    setIsOpen(true);
    setIsAnimating(true);

    // Prevent body scroll
    if (preventBodyScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Call onOpen callback
    if (onOpen) {
      onOpen(data);
    }

    // Focus management
    if (focusOnOpen) {
      // Use setTimeout to ensure modal is rendered
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElement = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElement) {
            focusableElement.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 100);
    }

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  }, [returnFocusOnClose, preventBodyScroll, onOpen, focusOnOpen]);

  // Close modal
  const closeModal = useCallback((data = null) => {
    setIsAnimating(true);

    // Restore body scroll
    if (preventBodyScroll) {
      document.body.style.overflow = '';
    }

    // Call onClose callback
    if (onClose) {
      onClose(data);
    }

    // Restore focus
    if (returnFocusOnClose && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }

    // Close after animation
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 300);
  }, [preventBodyScroll, onClose, returnFocusOnClose]);

  // Toggle modal
  const toggleModal = useCallback((data = null) => {
    if (isOpen) {
      closeModal(data);
    } else {
      openModal(data);
    }
  }, [isOpen, openModal, closeModal]);

  // Handle escape key
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      
      if (onEscape) {
        onEscape(event);
      } else if (closeOnEscape) {
        closeModal();
      }
    }
  }, [isOpen, closeOnEscape, onEscape, closeModal]);

  // Handle outside click
  const handleOutsideClick = useCallback((event) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  }, [closeOnOutsideClick, closeModal]);

  // Handle focus trap
  const handleFocusTrap = useCallback((event) => {
    if (!modalRef.current || !isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [isOpen]);

  // Set up event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
      
      if (closeOnOutsideClick) {
        document.addEventListener('mousedown', handleOutsideClick);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleFocusTrap);
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isOpen, handleEscape, handleFocusTrap, handleOutsideClick, closeOnOutsideClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [preventBodyScroll]);

  // Modal props for easy spreading
  const modalProps = {
    ref: modalRef,
    role: 'dialog',
    'aria-modal': 'true',
    tabIndex: -1
  };

  // Backdrop props
  const backdropProps = {
    onClick: closeOnOutsideClick ? handleOutsideClick : undefined,
    'aria-hidden': 'true'
  };

  return {
    // State
    isOpen,
    isAnimating,
    
    // Actions
    openModal,
    closeModal,
    toggleModal,
    
    // Refs
    modalRef,
    
    // Props for easy spreading
    modalProps,
    backdropProps,
    
    // Event handlers
    handleEscape,
    handleOutsideClick,
    handleFocusTrap,
    
    // Configuration
    closeOnEscape,
    closeOnOutsideClick,
    preventBodyScroll,
    focusOnOpen,
    returnFocusOnClose
  };
};

/**
 * Hook for managing multiple modals
 * Useful when you need to manage several modals in the same component
 */
export const useMultiModal = (modalConfigs = {}) => {
  const [activeModal, setActiveModal] = useState(null);
  const modals = {};

  // Create modal instances
  Object.keys(modalConfigs).forEach(key => {
    const config = modalConfigs[key] || {};
    modals[key] = useModal({
      ...config,
      onOpen: (data) => {
        setActiveModal(key);
        if (config.onOpen) config.onOpen(data);
      },
      onClose: (data) => {
        setActiveModal(null);
        if (config.onClose) config.onClose(data);
      }
    });
  });

  const openModal = useCallback((modalKey, data) => {
    if (modals[modalKey]) {
      modals[modalKey].openModal(data);
    }
  }, [modals]);

  const closeModal = useCallback((modalKey, data) => {
    if (modals[modalKey]) {
      modals[modalKey].closeModal(data);
    }
  }, [modals]);

  const closeAllModals = useCallback(() => {
    Object.values(modals).forEach(modal => {
      if (modal.isOpen) {
        modal.closeModal();
      }
    });
  }, [modals]);

  const isAnyModalOpen = Object.values(modals).some(modal => modal.isOpen);

  return {
    modals,
    activeModal,
    openModal,
    closeModal,
    closeAllModals,
    isAnyModalOpen
  };
};

export default useModal;