import React, { ButtonHTMLAttributes } from 'react';
import VisuallyHidden from './VisuallyHidden';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  children,
  className = '',
  loadingText = 'Carregando',
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-success text-white hover:bg-success focus:ring-success shadow-sm hover:shadow-md',
    error: 'bg-error text-white hover:bg-error focus:ring-error shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-blue-50 focus:ring-primary',
  };

  const sizeClasses = {
    xs: 'px-xs py-xs text-caption',
    sm: 'px-sm py-sm text-body-small',
    md: 'px-md py-md text-body',
    lg: 'px-lg py-lg text-body-large',
    xl: 'px-xl py-xl text-h4',
  };

  const fullWidthClasses = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidthClasses,
    className,
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div 
            className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
            aria-hidden="true"
          ></div>
          <span className="hidden sm:inline">{loadingText}...</span>
          <span className="sm:hidden">...</span>
          <VisuallyHidden>Carregando, aguarde</VisuallyHidden>
        </>
      );
    }

    const iconElement = icon && (
      <span 
        className={`${iconPosition === 'right' ? 'ml-2' : 'mr-2'} ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base'}`}
        aria-hidden="true"
      >
        {icon}
      </span>
    );

    return (
      <>
        {icon && iconPosition === 'left' && iconElement}
        <span className="truncate">{children}</span>
        {icon && iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;