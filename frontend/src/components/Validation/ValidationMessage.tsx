import React from 'react';

interface ValidationMessageProps {
  error?: string;
  warning?: string;
  success?: string;
  className?: string;
  show?: boolean;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  error,
  warning,
  success,
  className = '',
  show = true,
}) => {
  if (!show || (!error && !warning && !success)) {
    return null;
  }

  const getMessageType = () => {
    if (error) return 'error';
    if (warning) return 'warning';
    if (success) return 'success';
    return 'info';
  };

  const getMessage = () => {
    return error || warning || success || '';
  };

  const getIcon = () => {
    switch (getMessageType()) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getClasses = () => {
    const baseClasses = 'flex items-center text-sm mt-1 transition-all duration-200';
    
    switch (getMessageType()) {
      case 'error':
        return `${baseClasses} text-error`;
      case 'warning':
        return `${baseClasses} text-warning`;
      case 'success':
        return `${baseClasses} text-success`;
      default:
        return `${baseClasses} text-neutral`;
    }
  };

  return (
    <div 
      className={`${getClasses()} ${className}`}
      role={getMessageType() === 'error' ? 'alert' : 'status'}
      aria-live={getMessageType() === 'error' ? 'assertive' : 'polite'}
    >
      <span className="mr-1" aria-hidden="true">
        {getIcon()}
      </span>
      <span>{getMessage()}</span>
    </div>
  );
};

export default ValidationMessage;