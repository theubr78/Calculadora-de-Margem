import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should apply primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should apply different variants correctly', () => {
    const variants = ['primary', 'secondary', 'success', 'error', 'outline', 'ghost'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      
      switch (variant) {
        case 'primary':
          expect(button).toHaveClass('bg-primary');
          break;
        case 'secondary':
          expect(button).toHaveClass('bg-gray-200');
          break;
        case 'success':
          expect(button).toHaveClass('bg-success');
          break;
        case 'error':
          expect(button).toHaveClass('bg-error');
          break;
        case 'outline':
          expect(button).toHaveClass('border-2', 'border-primary');
          break;
        case 'ghost':
          expect(button).toHaveClass('text-primary');
          break;
      }
      
      unmount();
    });
  });

  it('should apply different sizes correctly', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const button = screen.getByRole('button');
      
      switch (size) {
        case 'xs':
          expect(button).toHaveClass('px-2', 'py-1', 'text-xs');
          break;
        case 'sm':
          expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
          break;
        case 'md':
          expect(button).toHaveClass('px-4', 'py-2', 'text-base');
          break;
        case 'lg':
          expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
          break;
        case 'xl':
          expect(button).toHaveClass('px-8', 'py-4', 'text-xl');
          break;
      }
      
      unmount();
    });
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Check for loading text
    expect(button).toHaveTextContent('Carregando');
  });

  it('should use custom loading text', () => {
    render(<Button loading loadingText="Salvando">Save</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Salvando');
  });

  it('should render with icon on left by default', () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    render(<Button icon={icon}>Search</Button>);
    
    const button = screen.getByRole('button');
    const iconElement = screen.getByTestId('test-icon');
    
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
    
    // Icon should come before text
    const buttonText = button.textContent;
    expect(buttonText).toBe('🔍Search');
  });

  it('should render with icon on right', () => {
    const icon = <span data-testid="test-icon">→</span>;
    render(<Button icon={icon} iconPosition="right">Next</Button>);
    
    const button = screen.getByRole('button');
    const buttonText = button.textContent;
    expect(buttonText).toBe('Next→');
  });

  it('should apply fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Ref Button');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Button 
        ariaLabel="Custom aria label"
        ariaDescribedBy="description-id"
      >
        Accessible Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom aria label');
    expect(button).toHaveAttribute('aria-describedby', 'description-id');
  });

  it('should have focus styles', () => {
    render(<Button>Focus me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });

  it('should handle form submission', () => {
    const handleSubmit = jest.fn(e => e.preventDefault());
    
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('should not submit form when disabled', () => {
    const handleSubmit = jest.fn(e => e.preventDefault());
    
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit" disabled>Submit</Button>
      </form>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should show visually hidden loading text for screen readers', () => {
    render(<Button loading>Loading Button</Button>);
    
    const hiddenText = screen.getByText('Carregando, aguarde');
    expect(hiddenText).toBeInTheDocument();
    expect(hiddenText).toHaveClass('sr-only');
  });

  it('should truncate long text', () => {
    const longText = 'This is a very long button text that should be truncated';
    render(<Button>{longText}</Button>);
    
    const textSpan = screen.getByText(longText);
    expect(textSpan).toHaveClass('truncate');
  });

  it('should maintain button state during async operations', async () => {
    const asyncClick = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Button onClick={asyncClick}>Async Button</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(asyncClick).toHaveBeenCalledTimes(1);
    
    // Button should still be clickable during async operation
    fireEvent.click(button);
    expect(asyncClick).toHaveBeenCalledTimes(2);
    
    await waitFor(() => {
      expect(asyncClick).toHaveBeenCalledTimes(2);
    });
  });
});