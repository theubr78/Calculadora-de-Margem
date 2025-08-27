import React, { ReactNode } from 'react';

interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  contentAlign?: 'start' | 'end' | 'center' | 'between' | 'around' | 'stretch';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  responsive?: {
    xs?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align' | 'wrap'>>;
    sm?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align' | 'wrap'>>;
    md?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align' | 'wrap'>>;
    lg?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align' | 'wrap'>>;
    xl?: Partial<Pick<FlexProps, 'direction' | 'justify' | 'align' | 'wrap'>>;
  };
  className?: string;
}

const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  contentAlign,
  gap = 'none',
  rowGap,
  columnGap,
  responsive,
  className = '',
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const contentAlignClasses = {
    start: 'content-start',
    end: 'content-end',
    center: 'content-center',
    between: 'content-between',
    around: 'content-around',
    stretch: 'content-stretch',
  };

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

  const getResponsiveClasses = () => {
    const classes: string[] = [];
    
    // Extra small breakpoint
    if (responsive?.xs) {
      if (responsive.xs.direction) {
        classes.push(`xs:${directionClasses[responsive.xs.direction]}`);
      }
      if (responsive.xs.justify) {
        classes.push(`xs:${justifyClasses[responsive.xs.justify]}`);
      }
      if (responsive.xs.align) {
        classes.push(`xs:${alignClasses[responsive.xs.align]}`);
      }
      if (responsive.xs.wrap) {
        classes.push(`xs:${wrapClasses[responsive.xs.wrap]}`);
      }
    }
    
    // Small breakpoint
    if (responsive?.sm) {
      if (responsive.sm.direction) {
        classes.push(`sm:${directionClasses[responsive.sm.direction]}`);
      }
      if (responsive.sm.justify) {
        classes.push(`sm:${justifyClasses[responsive.sm.justify]}`);
      }
      if (responsive.sm.align) {
        classes.push(`sm:${alignClasses[responsive.sm.align]}`);
      }
      if (responsive.sm.wrap) {
        classes.push(`sm:${wrapClasses[responsive.sm.wrap]}`);
      }
    }

    // Medium breakpoint
    if (responsive?.md) {
      if (responsive.md.direction) {
        classes.push(`md:${directionClasses[responsive.md.direction]}`);
      }
      if (responsive.md.justify) {
        classes.push(`md:${justifyClasses[responsive.md.justify]}`);
      }
      if (responsive.md.align) {
        classes.push(`md:${alignClasses[responsive.md.align]}`);
      }
      if (responsive.md.wrap) {
        classes.push(`md:${wrapClasses[responsive.md.wrap]}`);
      }
    }

    // Large breakpoint
    if (responsive?.lg) {
      if (responsive.lg.direction) {
        classes.push(`lg:${directionClasses[responsive.lg.direction]}`);
      }
      if (responsive.lg.justify) {
        classes.push(`lg:${justifyClasses[responsive.lg.justify]}`);
      }
      if (responsive.lg.align) {
        classes.push(`lg:${alignClasses[responsive.lg.align]}`);
      }
      if (responsive.lg.wrap) {
        classes.push(`lg:${wrapClasses[responsive.lg.wrap]}`);
      }
    }

    // Extra large breakpoint
    if (responsive?.xl) {
      if (responsive.xl.direction) {
        classes.push(`xl:${directionClasses[responsive.xl.direction]}`);
      }
      if (responsive.xl.justify) {
        classes.push(`xl:${justifyClasses[responsive.xl.justify]}`);
      }
      if (responsive.xl.align) {
        classes.push(`xl:${alignClasses[responsive.xl.align]}`);
      }
      if (responsive.xl.wrap) {
        classes.push(`xl:${wrapClasses[responsive.xl.wrap]}`);
      }
    }

    return classes.join(' ');
  };

  const baseClasses = [
    'flex',
    directionClasses[direction],
    wrapClasses[wrap],
    justifyClasses[justify],
    alignClasses[align],
    contentAlign && contentAlignClasses[contentAlign],
    getGapClasses(),
    getResponsiveClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default Flex;