import React, { memo, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useModal } from '../../hooks/useModal';

/**
 * Optimized AccessibleModal component with proper focus management and ARIA attributes
 */
const AccessibleModal = memo(({ 
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  initialFocus,
  finalFocus,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ariaLabel,
  ariaDescribedBy,
  testId = 'modal',
  zIndex = 50,
  animationDuration = 200,
  footer,
  icon,
  actions = [],
  ...props
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Use custom modal hook for enhanced functionality
  const {
    isModalOpen,
    openModal,
    closeModal,
    modalId
  } = useModal({
    initialOpen: isOpen,
    onClose,
    preventBodyScroll,
    closeOnEscape
  });

  // Size configurations
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  };

  // Variant configurations
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-white border-green-200',
    warning: 'bg-white border-yellow-200',
    error: 'bg-white border-red-200',
    info: 'bg-white border-blue-200'
  };

  // Icon configurations
  const variantIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info
  };

  // Sync external isOpen with internal state
  useEffect(() => {
    if (isOpen && !isModalOpen) {
      openModal();
    } else if (!isOpen && isModalOpen) {
      closeModal();
    }
  }, [isOpen, isModalOpen, openModal, closeModal]);

  // Focus management
  useEffect(() => {
    if (isModalOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Set initial focus
      const focusElement = initialFocus?.current || 
                          modalRef.current?.querySelector('[data-autofocus]') ||
                          closeButtonRef.current ||
                          modalRef.current;
      
      if (focusElement) {
        // Small delay to ensure modal is rendered
        setTimeout(() => {
          focusElement.focus();
        }, animationDuration);
      }
    } else {
      // Restore focus to the previously focused element
      const restoreElement = finalFocus?.current || previousActiveElement.current;
      if (restoreElement && typeof restoreElement.focus === 'function') {
        restoreElement.focus();
      }
    }
  }, [isModalOpen, initialFocus, finalFocus, animationDuration]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      closeModal();
    }
  }, [closeOnOverlayClick, closeModal]);

  // Handle close button click
  const handleCloseClick = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Trap focus within modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  }, []);

  // Render icon
  const renderIcon = () => {
    const IconComponent = icon || variantIcons[variant];
    if (!IconComponent) return null;
    
    const iconColorClasses = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
      default: 'text-gray-600'
    };
    
    return (
      <div className={`flex-shrink-0 ${iconColorClasses[variant] || iconColorClasses.default}`}>
        <IconComponent className="h-6 w-6" aria-hidden="true" />
      </div>
    );
  };

  // Render header
  const renderHeader = () => {
    if (!title && !showCloseButton) return null;
    
    return (
      <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${headerClassName}`}>
        <div className="flex items-center space-x-3">
          {renderIcon()}
          {title && (
            <h2 
              className="text-lg font-semibold text-gray-900"
              id={`${modalId}-title`}
            >
              {title}
            </h2>
          )}
        </div>
        
        {showCloseButton && (
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCloseClick}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
            data-testid={`${testId}-close-button`}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!footer && actions.length === 0) return null;
    
    return (
      <div className={`flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
        {footer || (
          <>
            {actions.map((action, index) => (
              <Button
                key={action.key || index}
                type="button"
                variant={action.variant || 'default'}
                size={action.size || 'sm'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className}
                data-testid={`${testId}-action-${action.key || index}`}
              >
                {action.label}
              </Button>
            ))}
          </>
        )}
      </div>
    );
  };

  // Don't render if not open
  if (!isModalOpen) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 z-${zIndex} overflow-y-auto ${overlayClassName}`}
      aria-labelledby={title ? `${modalId}-title` : undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      role="dialog"
      aria-modal="true"
      data-testid={testId}
    >
      <div 
        ref={overlayRef}
        className="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        />
        
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`
            relative transform overflow-hidden rounded-lg shadow-xl transition-all
            w-full ${sizeClasses[size]} ${variantClasses[variant]}
            ${contentClassName} ${className}
          `}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {renderHeader()}
          
          {/* Body */}
          <div className={`p-6 ${bodyClassName}`} id={`${modalId}-content`}>
            {children}
          </div>
          
          {renderFooter()}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
});

/**
 * Confirmation Modal Component
 */
export const ConfirmationModal = memo(({ 
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  confirmVariant = 'default',
  cancelVariant = 'outline',
  isLoading = false,
  ...props
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const actions = [
    {
      key: 'cancel',
      label: cancelText,
      variant: cancelVariant,
      onClick: onClose
    },
    {
      key: 'confirm',
      label: confirmText,
      variant: confirmVariant,
      onClick: handleConfirm,
      disabled: isLoading
    }
  ];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      actions={actions}
      {...props}
    >
      <p className="text-gray-600">{message}</p>
    </AccessibleModal>
  );
});

/**
 * Alert Modal Component
 */
export const AlertModal = memo(({ 
  isOpen,
  onClose,
  title = 'Alert',
  message,
  variant = 'info',
  buttonText = 'OK',
  ...props
}) => {
  const actions = [
    {
      key: 'ok',
      label: buttonText,
      variant: 'default',
      onClick: onClose
    }
  ];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      actions={actions}
      {...props}
    >
      <p className="text-gray-600">{message}</p>
    </AccessibleModal>
  );
});

// Display names
AccessibleModal.displayName = 'AccessibleModal';
ConfirmationModal.displayName = 'ConfirmationModal';
AlertModal.displayName = 'AlertModal';

// PropTypes
AccessibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']),
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  preventBodyScroll: PropTypes.bool,
  initialFocus: PropTypes.object,
  finalFocus: PropTypes.object,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  testId: PropTypes.string,
  zIndex: PropTypes.number,
  animationDuration: PropTypes.number,
  footer: PropTypes.node,
  icon: PropTypes.elementType,
  actions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    size: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string
  }))
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  confirmVariant: PropTypes.string,
  cancelVariant: PropTypes.string,
  isLoading: PropTypes.bool
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  buttonText: PropTypes.string
};

export default AccessibleModal;