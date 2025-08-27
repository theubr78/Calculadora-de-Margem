import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Grid from '../Grid';

describe('Grid', () => {
  it('should render children correctly', () => {
    render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should apply default grid classes', () => {
    const { container } = render(
      <Grid>
        <div>Item</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid');
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('md:grid-cols-2');
    expect(gridElement).toHaveClass('lg:grid-cols-3');
  });

  it('should apply custom column configuration', () => {
    const { container } = render(
      <Grid cols={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
        <div>Item</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-2');
    expect(gridElement).toHaveClass('sm:grid-cols-3');
    expect(gridElement).toHaveClass('md:grid-cols-4');
    expect(gridElement).toHaveClass('lg:grid-cols-5');
    expect(gridElement).toHaveClass('xl:grid-cols-6');
  });

  it('should apply gap classes correctly', () => {
    const { container } = render(
      <Grid gap="lg">
        <div>Item</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('gap-6');
    expect(gridElement).toHaveClass('sm:gap-8');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Grid className="custom-class">
        <div>Item</div>
      </Grid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-class');
  });

  it('should handle different gap sizes', () => {
    const gaps = ['none', 'sm', 'md', 'lg', 'xl'] as const;
    
    gaps.forEach(gap => {
      const { container } = render(
        <Grid gap={gap} key={gap}>
          <div>Item</div>
        </Grid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
    });
  });
});