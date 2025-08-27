import React, { ReactNode, useState } from 'react';
import Typography from '../UI/Typography';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  // Accept both legacy and new padding values
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Accept both legacy elevation and new shadow prop
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  headerDivider?: boolean;
  footerDivider?: boolean;
  footer?: ReactNode;
  variant?: 'default' | 'primary';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  padding = 'md',
  elevation = 1,
  shadow,
  border = false,
  hover = false,
  expandable = false,
  defaultExpanded = true,
  headerDivider = false,
  footerDivider = false,
  footer,
  variant = 'default'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const paddingClasses = {
    none: 'p-0',
    xs: 'p-xs',
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg',
    xl: 'p-xl',
  };

  const elevationClasses = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow-md',
    3: 'shadow-lg',
    4: 'shadow-xl',
    5: 'shadow-2xl',
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const variantClasses = {
    default: 'bg-surface',
    primary: 'bg-surface border border-primary',
  };

  const baseClasses = `rounded-lg transition-all duration-200 ${variantClasses[variant]}`;
  const borderClasses = border ? 'border border-gray-700' : '';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-0.5 hover:border-gray-600' : '';

  const toggleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  // Prefer shadow prop if provided, otherwise use elevation
  const shadowOrElevationClass = typeof shadow !== 'undefined' ? shadowClasses[shadow] : elevationClasses[elevation];

  return (
    <div className={`${baseClasses} ${shadowOrElevationClass} ${borderClasses} ${hoverClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`${paddingClasses[padding]} ${headerDivider ? 'border-b border-gray-700' : ''}`}>
          <div className={footer || expandable ? 'flex justify-between items-center' : ''}>
            <div>
              {title && (
                <Typography variant="h3" className="text-white" weight="semibold">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="neutral" className="mt-xs">
                  {subtitle}
                </Typography>
              )}
            </div>
            {expandable && (
              <button
                onClick={toggleExpand}
                className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-xs"
                aria-label={isExpanded ? "Collapse card" : "Expand card"}
                aria-expanded={isExpanded}
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      {(!title && !subtitle && headerDivider) && (
        <div className="border-b border-gray-700"></div>
      )}
      {(!expandable || isExpanded) && (
        <div className={title || subtitle ? '' : paddingClasses[padding]}>
          <div className={paddingClasses[padding]}>
            {children}
          </div>
          {footer && (
            <div className={`${footerDivider ? 'border-t border-gray-700' : ''} ${paddingClasses[padding]}`}>
              {footer}
            </div>
          )}
        </div>
      )}
      {(!title && !subtitle && !children && footerDivider) && (
        <div className="border-t border-gray-700"></div>
      )}
    </div>
  );
};

export default Card;
