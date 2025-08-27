import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = true,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-success bg-opacity-10 text-success',
    error: 'bg-error bg-opacity-10 text-error',
    warning: 'bg-warning bg-opacity-10 text-warning',
    info: 'bg-primary bg-opacity-10 text-primary',
  };

  const sizeClasses = {
    sm: 'px-xs py-xs text-caption',
    md: 'px-sm py-xs text-body-small',
    lg: 'px-sm py-sm text-body',
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';

  const classes = [
    'inline-flex items-center font-medium',
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;