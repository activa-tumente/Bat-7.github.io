/**
 * @file Tooltip.jsx
 * @description Accessible tooltip component with positioning and animation
 */

import React, { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ 
  children,
  content,
  position = 'top',
  delay = 300,
  disabled = false,
  className = '',
  contentClassName = '',
  arrow = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top, left;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
      default:
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
    }

    // Ensure tooltip stays within viewport
    const padding = 8;
    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    const maxTop = window.innerHeight - tooltipRect.height - padding;

    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    setTooltipPosition({ top, left });
  };

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      // Recalculate on window resize/scroll
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }
  }, [isVisible, position]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Arrow positioning classes
  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseArrow} -bottom-1 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseArrow} -top-1 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseArrow} -right-1 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseArrow} -left-1 top-1/2 -translate-y-1/2`;
      default:
        return `${baseArrow} -bottom-1 left-1/2 -translate-x-1/2`;
    }
  };

  // Clone the trigger element to add event handlers
  const trigger = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e) => {
      showTooltip();
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e) => {
      hideTooltip();
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e) => {
      showTooltip();
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e) => {
      hideTooltip();
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
    className: `${children.props.className || ''} ${className}`.trim(),
    ...props
  });

  // Tooltip content
  const tooltipContent = isVisible && content && (
    <div
      ref={tooltipRef}
      className={`
        fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg
        pointer-events-none transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${contentClassName}
      `}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      {content}
      {arrow && <div className={getArrowClasses()} />}
    </div>
  );

  return (
    <>
      {trigger}
      {typeof document !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
};

export { Tooltip };
export default Tooltip;