import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-sm py-sm text-body-small',
    md: 'px-md py-md text-body',
    lg: 'px-lg py-lg text-body-large',
  };

  const variantClasses = {
    default: 'border border-gray-600 bg-gray-800',
    filled: 'border-0 bg-gray-700 focus:bg-gray-800',
    outlined: 'border-2 border-gray-600 bg-transparent',
  };

  const baseClasses = 'w-full rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-white';
  const errorClasses = error ? 'border-error focus:ring-error' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    errorClasses,
    widthClasses,
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = `block text-body-small font-medium text-gray-300 mb-xs ${size === 'lg' ? 'text-body' : ''}`;
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ');

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {props.required && (
            <>
              <span className="text-error ml-1" aria-hidden="true">*</span>
              <span className="sr-only">obrigatório</span>
            </>
          )}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
            <span className="text-gray-400 text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-label={ariaLabel}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" aria-hidden="true">
            <span className="text-gray-400 text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-xs text-body-small text-error flex items-center" role="alert">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-neutral">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;