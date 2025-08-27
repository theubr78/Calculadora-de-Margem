import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  verticalPadding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = 'md',
  verticalPadding = 'none'
}) => {
  const sizeClasses = {
    xs: 'max-w-3xl',
    sm: 'max-w-4xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const verticalPaddingClasses = {
    none: '',
    xs: 'py-xs',
    sm: 'py-sm',
    md: 'py-md',
    lg: 'py-lg',
    xl: 'py-xl',
  };

  // Responsive horizontal padding
  const getHorizontalPaddingClasses = () => {
    switch (padding) {
      case 'none': return 'px-0';
      case 'xs': return 'px-xs sm:px-sm';
      case 'sm': return 'px-sm sm:px-md';
      case 'md': return 'px-md sm:px-lg';
      case 'lg': return 'px-lg sm:px-xl';
      case 'xl': return 'px-xl sm:px-xxl';
      default: return 'px-md sm:px-lg';
    }
  };

  return (
    <div className={`container mx-auto ${sizeClasses[size]} ${getHorizontalPaddingClasses()} ${verticalPaddingClasses[verticalPadding]} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
