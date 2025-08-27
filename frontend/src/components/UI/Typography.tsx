import React, { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral' | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  component?: keyof React.JSX.IntrinsicElements;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = 'inherit',
  align = 'left',
  weight,
  className = '',
  component,
}) => {
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight',
    h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
    h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight',
    h4: 'text-lg sm:text-xl lg:text-2xl font-semibold leading-tight',
    h5: 'text-base sm:text-lg lg:text-xl font-medium leading-tight',
    h6: 'text-sm sm:text-base lg:text-lg font-medium leading-tight',
    body1: 'text-base leading-relaxed',
    body2: 'text-sm leading-relaxed',
    caption: 'text-xs leading-normal',
    overline: 'text-xs uppercase tracking-wide leading-normal',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-gray-600',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-yellow-600',
    neutral: 'text-neutral',
    inherit: 'text-inherit',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const getDefaultComponent = (): keyof React.JSX.IntrinsicElements => {
    if (component) return component;
    
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return variant;
      case 'body1':
      case 'body2':
        return 'p';
      case 'caption':
      case 'overline':
        return 'span';
      default:
        return 'p';
    }
  };

  const Component = getDefaultComponent() as React.ElementType;

  const classes = [
    variantClasses[variant],
    colorClasses[color],
    alignClasses[align],
    weight && weightClasses[weight],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

export default Typography;