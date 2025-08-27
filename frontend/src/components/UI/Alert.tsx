import React, { ReactNode, useEffect, useState } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  title?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'soft';
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  children,
  title,
  onClose, 
  autoClose = false,
  autoCloseDelay = 5000,
  size = 'md',
  variant = 'soft',
  icon,
  actions,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const sizeClasses = {
    sm: 'p-sm text-body-small',
    md: 'p-md text-body',
    lg: 'p-lg text-body-large',
  };

  const getVariantClasses = () => {
    const variants = {
      filled: {
        success: 'bg-success border-success text-white',
        error: 'bg-error border-error text-white',
        warning: 'bg-warning border-warning text-white',
        info: 'bg-primary border-primary text-white',
      },
      outlined: {
        success: 'bg-white border-success text-success',
        error: 'bg-white border-error text-error',
        warning: 'bg-white border-warning text-warning',
        info: 'bg-white border-primary text-primary',
      },
      soft: {
        success: 'bg-success bg-opacity-10 border-success border-opacity-20 text-success',
        error: 'bg-error bg-opacity-10 border-error border-opacity-20 text-error',
        warning: 'bg-warning bg-opacity-10 border-warning border-opacity-20 text-warning',
        info: 'bg-primary bg-opacity-10 border-primary border-opacity-20 text-primary',
      },
    };

    return variants[variant][type];
  };

  const getDefaultIcon = () => {
    const iconSize = "1.5rem"; // 24px, matches design system scale
    const iconStyle = { display: "block", width: iconSize, height: iconSize };

    const icons = {
      success: (
        <svg style={iconStyle} className="text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="10" fill="var(--color-success)" opacity="0.1"/>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" fill="var(--color-success)" />
        </svg>
      ),
      error: (
        <svg
          style={iconStyle}
          className="text-error"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="12" fill="var(--color-error)" opacity="0.08"/>
          <path
            d="M12 7v5m0 4h.01"
            stroke="var(--color-error)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="10" stroke="var(--color-error)" strokeWidth="2" fill="none"/>
        </svg>
      ),
      warning: (
        <svg style={iconStyle} className="text-warning" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" fill="var(--color-warning)" />
        </svg>
      ),
      info: (
        <svg style={iconStyle} className="text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" fill="var(--color-primary)" />
        </svg>
      ),
    };

    return icons[type];
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible && !onClose) return null;

  const classes = [
    'rounded-lg border flex items-start transition-all duration-300 transform',
    sizeClasses[size],
    getVariantClasses(),
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div
        className={`flex-shrink-0 ${
          type === "error" ? "mr-sm" : "mr-3"
        }`}
        style={type === "error" ? { marginTop: "2px" } : undefined}
      >
        {icon || getDefaultIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">
            {title}
          </h4>
        )}
        <div className={title ? 'text-sm opacity-90' : ''}>
          {children}
        </div>
        {actions && (
          <div className="mt-3 flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ml-sm p-xs rounded-full transition-colors duration-200 ${
            type === "error"
              ? "hover:bg-error hover:bg-opacity-10"
              : "hover:bg-black hover:bg-opacity-10"
          }`}
          aria-label="Fechar alerta"
          style={
            type === "error"
              ? {
                  color: "var(--color-error)",
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  lineHeight: 0,
                }
              : undefined
          }
        >
          <svg
            style={{
              width: "1.25rem",
              height: "1.25rem",
              display: "block",
              color: type === "error" ? "var(--color-error)" : "currentColor",
            }}
            fill="none"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="M6 6l8 8M6 14L14 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;