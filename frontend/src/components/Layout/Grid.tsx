import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  autoFit?: boolean;
  minChildWidth?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 2, lg: 3 },
  gap = 'md',
  rowGap,
  columnGap,
  className = '',
  autoFit = false,
  minChildWidth = '250px',
}) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-xs',
    sm: 'gap-sm',
    md: 'gap-md',
    lg: 'gap-lg',
    xl: 'gap-xl',
    xxl: 'gap-xxl',
  };

  const getGapClasses = () => {
    if (rowGap || columnGap) {
      const classes = [];
      if (rowGap) classes.push(`gap-y-${rowGap}`);
      if (columnGap) classes.push(`gap-x-${columnGap}`);
      return classes.join(' ');
    }
    return gapClasses[gap];
  };

  const getColClasses = () => {
    const classes = [];
    
    if (autoFit) {
      classes.push('grid', `grid-cols-[repeat(auto-fit,minmax(${minChildWidth},1fr))]`);
    } else {
      classes.push('grid');
      
      if (cols.default) {
        classes.push(`grid-cols-${cols.default}`);
      }
      if (cols.xs) {
        classes.push(`xs:grid-cols-${cols.xs}`);
      }
      if (cols.sm) {
        classes.push(`sm:grid-cols-${cols.sm}`);
      }
      if (cols.md) {
        classes.push(`md:grid-cols-${cols.md}`);
      }
      if (cols.lg) {
        classes.push(`lg:grid-cols-${cols.lg}`);
      }
      if (cols.xl) {
        classes.push(`xl:grid-cols-${cols.xl}`);
      }
      if (cols['2xl']) {
        classes.push(`2xl:grid-cols-${cols['2xl']}`);
      }
    }

    return classes.join(' ');
  };

  return (
    <div className={`${getColClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;