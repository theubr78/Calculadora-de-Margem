import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Typography from '../Typography';

describe('Typography', () => {
  it('should render children correctly', () => {
    render(<Typography>Test content</Typography>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render with default variant (body1)', () => {
    const { container } = render(<Typography>Test</Typography>);
    const element = container.firstChild as HTMLElement;
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('text-base');
    expect(element).toHaveClass('leading-relaxed');
  });

  it('should render different heading variants correctly', () => {
    const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
    
    variants.forEach(variant => {
      const { container } = render(
        <Typography variant={variant} key={variant}>
          Heading {variant}
        </Typography>
      );
      
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe(variant.toUpperCase());
    });
  });

  it('should apply color classes correctly', () => {
    const { container } = render(
      <Typography color="primary">Primary text</Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('text-primary');
  });

  it('should apply alignment classes correctly', () => {
    const { container } = render(
      <Typography align="center">Centered text</Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('text-center');
  });

  it('should apply weight classes correctly', () => {
    const { container } = render(
      <Typography weight="bold">Bold text</Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('font-bold');
  });

  it('should use custom component when specified', () => {
    const { container } = render(
      <Typography variant="body1" component="span">
        Span content
      </Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.tagName).toBe('SPAN');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Typography className="custom-class">Test</Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('custom-class');
  });

  it('should handle different color variants', () => {
    const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'neutral'] as const;
    
    colors.forEach(color => {
      const { container } = render(
        <Typography color={color} key={color}>
          {color} text
        </Typography>
      );
      
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(`text-${color === 'secondary' ? 'gray-600' : color === 'warning' ? 'yellow-600' : color}`);
    });
  });

  it('should render caption and overline as span by default', () => {
    const { container: captionContainer } = render(
      <Typography variant="caption">Caption text</Typography>
    );
    
    const { container: overlineContainer } = render(
      <Typography variant="overline">Overline text</Typography>
    );
    
    expect((captionContainer.firstChild as HTMLElement).tagName).toBe('SPAN');
    expect((overlineContainer.firstChild as HTMLElement).tagName).toBe('SPAN');
  });

  it('should apply responsive classes for headings', () => {
    const { container } = render(
      <Typography variant="h1">Large heading</Typography>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('text-3xl');
    expect(element).toHaveClass('sm:text-4xl');
    expect(element).toHaveClass('lg:text-5xl');
  });
});