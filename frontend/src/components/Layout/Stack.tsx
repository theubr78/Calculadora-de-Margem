import React, { ReactNode } from 'react';

interface StackProps {
  children: ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  direction?: 'vertical' | 'horizontal';
  divider?: ReactNode;
}

const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  align = 'stretch',
  className = '',
  direction = 'vertical',
  divider,
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  };

  const spacingClasses = {
    none: '',
    xs: direction === 'horizontal' ? 'mr-xs' : 'mb-xs',
    sm: direction === 'horizontal' ? 'mr-sm' : 'mb-sm',
    md: direction === 'horizontal' ? 'mr-md' : 'mb-md',
    lg: direction === 'horizontal' ? 'mr-lg' : 'mb-lg',
    xl: direction === 'horizontal' ? 'mr-xl' : 'mb-xl',
    xxl: direction === 'horizontal' ? 'mr-xxl' : 'mb-xxl',
  };

  const baseClasses = [
    'flex',
    directionClasses[direction],
    alignClasses[align],
    className,
  ].filter(Boolean).join(' ');

  // If divider is provided, we need to manually insert it between children
  if (divider && React.Children.count(children) > 1) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div className={baseClasses}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            <div className={index < childrenArray.length - 1 ? spacingClasses[spacing] : ''}>
              {child}
            </div>
            {index < childrenArray.length - 1 && (
              <div className={direction === 'horizontal' ? 'flex items-center' : 'flex justify-center'}>
                {divider}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // For regular spacing without dividers, we apply margin to all but the last child
  if (spacing !== 'none' && React.Children.count(children) > 1) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div className={baseClasses}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={index < childrenArray.length - 1 ? spacingClasses[spacing] : ''}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default Stack;