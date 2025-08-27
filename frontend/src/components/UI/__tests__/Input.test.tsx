import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '../Input';

describe('Input Component', () => {
  it('should render input with label', () => {
    render(<Input label="Test Label" />);
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Label');
    
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('should render input without label', () => {
    render(<Input placeholder="No label input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'No label input');
  });

  it('should generate unique IDs for inputs', () => {
    render(
      <div>
        <Input label="First Input" />
        <Input label="Second Input" />
      </div>
    );
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(inputs[0].id).toMatch(/^input-/);
    expect(inputs[1].id).toMatch(/^input-/);
  });

  it('should use provided ID', () => {
    render(<Input id="custom-id" label="Custom ID Input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('should handle value changes', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'test value'
        })
      })
    );
  });

  it('should display error message', () => {
    render(<Input label="Error Input" error="This field is required" />);
    
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
    expect(errorMessage).toHaveClass('text-error');
  });

  it('should display helper text when no error', () => {
    render(<Input label="Helper Input" helperText="This is helper text" />);
    
    const helperText = screen.getByText('This is helper text');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-neutral');
  });

  it('should prioritize error over helper text', () => {
    render(
      <Input 
        label="Priority Input" 
        error="Error message"
        helperText="Helper text"
      />
    );
    
    const errorMessage = screen.getByText('Error message');
    expect(errorMessage).toBeInTheDocument();
    
    const helperText = screen.queryByText('Helper text');
    expect(helperText).not.toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(<Input label="Required Input" required />);
    
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');
    
    const srOnlyText = screen.getByText('obrigatório');
    expect(srOnlyText).toBeInTheDocument();
    expect(srOnlyText).toHaveClass('sr-only');
  });

  it('should apply different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Input size={size} />);
      const input = screen.getByRole('textbox');
      
      switch (size) {
        case 'sm':
          expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm');
          break;
        case 'md':
          expect(input).toHaveClass('px-3', 'py-2', 'text-base');
          break;
        case 'lg':
          expect(input).toHaveClass('px-4', 'py-3', 'text-lg');
          break;
      }
      
      unmount();
    });
  });

  it('should apply different variants', () => {
    const variants = ['default', 'filled', 'outlined'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Input variant={variant} />);
      const input = screen.getByRole('textbox');
      
      switch (variant) {
        case 'default':
          expect(input).toHaveClass('border', 'border-gray-300', 'bg-white');
          break;
        case 'filled':
          expect(input).toHaveClass('border-0', 'bg-gray-100');
          break;
        case 'outlined':
          expect(input).toHaveClass('border-2', 'border-gray-300', 'bg-transparent');
          break;
      }
      
      unmount();
    });
  });

  it('should render left icon', () => {
    const icon = <span data-testid="left-icon">🔍</span>;
    render(<Input leftIcon={icon} />);
    
    const iconElement = screen.getByTestId('left-icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10');
  });

  it('should render right icon', () => {
    const icon = <span data-testid="right-icon">✓</span>;
    render(<Input rightIcon={icon} />);
    
    const iconElement = screen.getByTestId('right-icon');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should apply fullWidth by default', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full');
  });

  it('should not apply fullWidth when set to false', () => {
    render(<Input fullWidth={false} />);
    
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveClass('w-full');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Input 
        label="Accessible Input"
        ariaLabel="Custom aria label"
        ariaDescribedBy="custom-description"
        error="Error message"
        required
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Custom aria label');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain('custom-description');
    expect(describedBy).toContain('error');
  });

  it('should have proper aria-invalid states', () => {
    const { rerender } = render(<Input />);
    
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    
    rerender(<Input error="Error message" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should apply error styles when error is present', () => {
    render(<Input error="Error message" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-error', 'focus:ring-error');
  });

  it('should apply focus styles', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary',
      'focus:border-transparent'
    );
  });

  it('should handle different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;
    
    types.forEach(type => {
      const { unmount } = render(<Input type={type} />);
      const input = screen.getByRole(type === 'text' ? 'textbox' : type === 'email' ? 'textbox' : type);
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('should handle placeholder text', () => {
    render(<Input placeholder="Enter your text here" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter your text here');
    expect(input).toHaveClass('placeholder-gray-400');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input-class');
  });

  it('should handle controlled input', () => {
    const handleChange = jest.fn();
    const { rerender } = render(<Input value="initial" onChange={handleChange} />);
    
    let input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
    
    fireEvent.change(input, { target: { value: 'updated' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    
    rerender(<Input value="updated" onChange={handleChange} />);
    input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('updated');
  });

  it('should handle uncontrolled input', () => {
    render(<Input defaultValue="default" />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('default');
    
    fireEvent.change(input, { target: { value: 'changed' } });
    expect(input.value).toBe('changed');
  });
});