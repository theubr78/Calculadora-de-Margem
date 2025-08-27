import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  resize = 'vertical',
  fullWidth = true,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-sm py-sm text-body-small',
    md: 'px-md py-md text-body',
    lg: 'px-lg py-lg text-body-large',
  };

  const variantClasses = {
    default: 'border border-gray-300 bg-surface',
    filled: 'border-0 bg-gray-100 focus:bg-surface',
    outlined: 'border-2 border-gray-300 bg-transparent',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const baseClasses = 'w-full rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400';
  const errorClasses = error ? 'border-error focus:ring-error' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const textareaClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    resizeClasses[resize],
    errorClasses,
    widthClasses,
    className
  ].filter(Boolean).join(' ');

  const labelClasses = `block text-body-small font-medium text-gray-700 mb-xs ${size === 'lg' ? 'text-body' : ''}`;

  return (
    <div className="mb-4">
      {label && (
        <label className={labelClasses}>
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-xs text-body-small text-error flex items-center">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;