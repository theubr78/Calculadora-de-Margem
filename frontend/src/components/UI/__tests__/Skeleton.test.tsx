import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skeleton, { SkeletonText, SkeletonCard, SkeletonTable, SkeletonButton, SkeletonAvatar } from '../Skeleton';

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('rounded');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply custom width and height', () => {
    const { container } = render(<Skeleton width="200px" height="50px" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('should apply different variants', () => {
    const variants = ['text', 'rectangular', 'circular', 'rounded'] as const;
    
    variants.forEach(variant => {
      const { container } = render(<Skeleton variant={variant} key={variant} />);
      const skeleton = container.firstChild as HTMLElement;
      
      switch (variant) {
        case 'text':
          expect(skeleton).toHaveClass('rounded');
          break;
        case 'rectangular':
          expect(skeleton).toHaveClass('rounded-none');
          break;
        case 'circular':
          expect(skeleton).toHaveClass('rounded-full');
          break;
        case 'rounded':
          expect(skeleton).toHaveClass('rounded-lg');
          break;
      }
    });
  });

  it('should apply different animations', () => {
    const animations = ['pulse', 'wave', 'none'] as const;
    
    animations.forEach(animation => {
      const { container } = render(<Skeleton animation={animation} key={animation} />);
      const skeleton = container.firstChild as HTMLElement;
      
      if (animation === 'none') {
        expect(skeleton).not.toHaveClass('animate-pulse');
      } else {
        expect(skeleton).toHaveClass('animate-pulse');
      }
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('custom-class');
  });
});

describe('SkeletonText', () => {
  it('should render single line by default', () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    
    expect(skeletons).toHaveLength(1);
  });

  it('should render multiple lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    
    expect(skeletons).toHaveLength(3);
  });

  it('should make last line shorter', () => {
    const { container } = render(<SkeletonText lines={2} />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    
    // Last skeleton should have 75% width
    const lastSkeleton = skeletons[skeletons.length - 1] as HTMLElement;
    expect(lastSkeleton).toHaveStyle({ width: '75%' });
  });
});

describe('SkeletonCard', () => {
  it('should render card structure', () => {
    const { container } = render(<SkeletonCard />);
    
    expect(container.querySelector('.p-4.border.rounded-lg')).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 40px"]')).toBeInTheDocument(); // Avatar
    expect(container.querySelectorAll('.bg-gray-200')).toHaveLength(6); // Avatar + 2 header lines + 3 content lines
  });
});

describe('SkeletonTable', () => {
  it('should render table with default rows and columns', () => {
    const { container } = render(<SkeletonTable />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    
    // 4 columns header + 5 rows * 4 columns = 24 skeletons
    expect(skeletons).toHaveLength(24);
  });

  it('should render table with custom rows and columns', () => {
    const { container } = render(<SkeletonTable rows={3} columns={2} />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    
    // 2 columns header + 3 rows * 2 columns = 8 skeletons
    expect(skeletons).toHaveLength(8);
  });
});

describe('SkeletonButton', () => {
  it('should render with default size', () => {
    const { container } = render(<SkeletonButton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-24');
  });

  it('should render with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { container } = render(<SkeletonButton size={size} key={size} />);
      const skeleton = container.firstChild as HTMLElement;
      
      switch (size) {
        case 'sm':
          expect(skeleton).toHaveClass('h-8', 'w-20');
          break;
        case 'md':
          expect(skeleton).toHaveClass('h-10', 'w-24');
          break;
        case 'lg':
          expect(skeleton).toHaveClass('h-12', 'w-32');
          break;
      }
    });
  });
});

describe('SkeletonAvatar', () => {
  it('should render with default size', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('rounded-full');
    expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should render with custom size', () => {
    const { container } = render(<SkeletonAvatar size={60} />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveStyle({ width: '60px', height: '60px' });
  });
});