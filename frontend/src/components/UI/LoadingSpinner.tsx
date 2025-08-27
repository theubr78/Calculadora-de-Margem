import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  color = 'primary',
  text,
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    current: 'border-current',
  };

  const textSizeClasses = {
    xs: 'text-caption',
    sm: 'text-body-small',
    md: 'text-body',
    lg: 'text-body-large',
    xl: 'text-h4',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`animate-spin rounded-full border-2 border-transparent border-t-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`rounded-full bg-current animate-pulse ${size === 'xs' ? 'h-1 w-1' : size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'}`} style={{ animationDelay: '0ms' }}></div>
            <div className={`rounded-full bg-current animate-pulse ${size === 'xs' ? 'h-1 w-1' : size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'}`} style={{ animationDelay: '150ms' }}></div>
            <div className={`rounded-full bg-current animate-pulse ${size === 'xs' ? 'h-1 w-1' : size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'}`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`rounded-full bg-current animate-pulse ${sizeClasses[size]}`}></div>
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            <div className={`bg-current animate-pulse ${size === 'xs' ? 'h-2 w-0.5' : size === 'sm' ? 'h-3 w-1' : size === 'md' ? 'h-4 w-1' : size === 'lg' ? 'h-6 w-1.5' : 'h-8 w-2'}`} style={{ animationDelay: '0ms' }}></div>
            <div className={`bg-current animate-pulse ${size === 'xs' ? 'h-3 w-0.5' : size === 'sm' ? 'h-4 w-1' : size === 'md' ? 'h-6 w-1' : size === 'lg' ? 'h-8 w-1.5' : 'h-10 w-2'}`} style={{ animationDelay: '150ms' }}></div>
            <div className={`bg-current animate-pulse ${size === 'xs' ? 'h-2 w-0.5' : size === 'sm' ? 'h-3 w-1' : size === 'md' ? 'h-4 w-1' : size === 'lg' ? 'h-6 w-1.5' : 'h-8 w-2'}`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-transparent border-t-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${color === 'primary' ? 'text-primary' : color === 'secondary' ? 'text-gray-600' : color === 'white' ? 'text-white' : 'text-current'}`}>
      {renderSpinner()}
      {text && (
        <p className={`font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {content}
    </div>
  );
};

export default LoadingSpinner;