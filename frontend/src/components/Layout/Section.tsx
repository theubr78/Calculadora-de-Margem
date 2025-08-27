import React, { ReactNode } from 'react';
import Container from './Container';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'primary' | 'secondary' | 'transparent';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullWidth?: boolean;
  dividerTop?: boolean;
  dividerBottom?: boolean;
  verticalPadding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  background = 'transparent',
  padding = 'md',
  containerSize = 'lg',
  fullWidth = false,
  dividerTop = false,
  dividerBottom = false,
  verticalPadding,
}) => {
  const backgroundClasses = {
    white: 'bg-surface',
    gray: 'bg-background',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    transparent: 'bg-transparent',
  };

  const paddingClasses = {
    none: 'py-0',
    xs: 'py-xs',
    sm: 'py-sm',
    md: 'py-md',
    lg: 'py-lg',
    xl: 'py-xl',
    xxl: 'py-xxl',
  };

  const responsivePaddingClasses = {
    none: 'sm:py-xs',
    xs: 'sm:py-sm',
    sm: 'sm:py-md',
    md: 'sm:py-lg',
    lg: 'sm:py-xl',
    xl: 'sm:py-xxl',
    xxl: 'sm:py-xxxl',
  };

  const getPaddingClass = () => {
    const verticalPaddingValue = verticalPadding || padding;
    return `${paddingClasses[verticalPaddingValue]} ${responsivePaddingClasses[verticalPaddingValue]}`;
  };

  const sectionClasses = [
    backgroundClasses[background],
    getPaddingClass(),
    dividerTop ? 'border-t border-gray-200' : '',
    dividerBottom ? 'border-b border-gray-200' : '',
    className,
  ].filter(Boolean).join(' ');

  if (fullWidth) {
    return (
      <section className={sectionClasses}>
        {dividerTop && <div className="border-t border-gray-200"></div>}
        {children}
        {dividerBottom && <div className="border-b border-gray-200"></div>}
      </section>
    );
  }

  return (
    <section className={sectionClasses}>
      <Container size={containerSize} verticalPadding="none">
        {children}
      </Container>
    </section>
  );
};

export default Section;