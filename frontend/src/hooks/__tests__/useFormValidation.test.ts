import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { ValidationRule } from '../../utils/validation';

describe('useFormValidation Hook', () => {
  const mockValidationRules: Record<string, ValidationRule> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    age: {
      required: false,
      min: 0,
      max: 120,
    },
  };

  it('should initialize with default values', () => {
    const initialValues = { name: 'John', email: '', age: 25 };
    const { result } = renderHook(() =>
      useFormValidation(initialValues, mockValidationRules)
    );

    const [state] = result.current;

    expect(state.values).toEqual(initialValues);
    expect(state.errors).toEqual({});
    expect(state.touched).toEqual({});
    expect(state.isValid).toBe(true);
    expect(state.isSubmitting).toBe(false);
  });

  it('should update field value', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    act(() => {
      actions.setValue('name', 'John Doe');
    });

    const [state] = result.current;
    expect(state.values.name).toBe('John Doe');
  });

  it('should update multiple field values', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '', email: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    act(() => {
      actions.setValues({ name: 'John', email: 'john@example.com' });
    });

    const [state] = result.current;
    expect(state.values.name).toBe('John');
    expect(state.values.email).toBe('john@example.com');
  });

  it('should validate on change when enabled', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: '' },
        mockValidationRules,
        { validateOnChange: true }
      )
    );

    const [, actions] = result.current;

    // Set invalid value
    act(() => {
      actions.setValue('name', 'A'); // Too short
    });

    const [state] = result.current;
    expect(state.errors.name).toBeDefined();
    expect(state.isValid).toBe(false);
  });

  it('should not validate on change when disabled', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: '' },
        mockValidationRules,
        { validateOnChange: false }
      )
    );

    const [, actions] = result.current;

    act(() => {
      actions.setValue('name', 'A'); // Too short
    });

    const [state] = result.current;
    expect(state.errors.name).toBeUndefined();
    expect(state.isValid).toBe(true);
  });

  it('should validate field individually', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: 'A' }, mockValidationRules)
    );

    const [, actions] = result.current;

    let validationResult;
    act(() => {
      validationResult = actions.validateField('name');
    });

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.error).toBe('Deve ter pelo menos 2 caracteres');
  });

  it('should validate entire form', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'A', email: 'invalid-email' },
        mockValidationRules
      )
    );

    const [, actions] = result.current;

    let isValid;
    act(() => {
      isValid = actions.validateForm();
    });

    expect(isValid).toBe(false);

    const [state] = result.current;
    expect(state.errors.name).toBeDefined();
    expect(state.errors.email).toBeDefined();
    expect(state.isValid).toBe(false);
  });

  it('should set and clear errors', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    // Set error
    act(() => {
      actions.setError('name', 'Custom error message');
    });

    let [state] = result.current;
    expect(state.errors.name).toBe('Custom error message');
    expect(state.isValid).toBe(false);

    // Clear error
    act(() => {
      actions.clearError('name');
    });

    [state] = result.current;
    expect(state.errors.name).toBeUndefined();
    expect(state.isValid).toBe(true);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '', email: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    // Set multiple errors
    act(() => {
      actions.setError('name', 'Name error');
      actions.setError('email', 'Email error');
    });

    let [state] = result.current;
    expect(Object.keys(state.errors)).toHaveLength(2);

    // Clear all errors
    act(() => {
      actions.clearErrors();
    });

    [state] = result.current;
    expect(state.errors).toEqual({});
    expect(state.isValid).toBe(true);
  });

  it('should set touched state', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    act(() => {
      actions.setTouched('name', true);
    });

    const [state] = result.current;
    expect(state.touched.name).toBe(true);
  });

  it('should validate on blur when enabled', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'A' },
        mockValidationRules,
        { validateOnBlur: true }
      )
    );

    const [, actions] = result.current;

    act(() => {
      actions.setTouched('name', true);
    });

    const [state] = result.current;
    expect(state.errors.name).toBeDefined();
  });

  it('should set submitting state', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    act(() => {
      actions.setSubmitting(true);
    });

    let [state] = result.current;
    expect(state.isSubmitting).toBe(true);

    act(() => {
      actions.setSubmitting(false);
    });

    [state] = result.current;
    expect(state.isSubmitting).toBe(false);
  });

  it('should reset form', () => {
    const initialValues = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() =>
      useFormValidation(initialValues, mockValidationRules)
    );

    const [, actions] = result.current;

    // Modify form state
    act(() => {
      actions.setValue('name', 'Jane');
      actions.setError('email', 'Error');
      actions.setTouched('name', true);
      actions.setSubmitting(true);
    });

    // Reset form
    act(() => {
      actions.reset();
    });

    const [state] = result.current;
    expect(state.values).toEqual(initialValues);
    expect(state.errors).toEqual({});
    expect(state.touched).toEqual({});
    expect(state.isValid).toBe(true);
    expect(state.isSubmitting).toBe(false);
  });

  it('should reset form with new values', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: 'John' }, mockValidationRules)
    );

    const [, actions] = result.current;

    const newValues = { name: 'Jane', email: 'jane@example.com' };

    act(() => {
      actions.reset(newValues);
    });

    const [state] = result.current;
    expect(state.values).toEqual(newValues);
  });

  it('should handle form submission', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'John', email: 'john@example.com' },
        mockValidationRules
      )
    );

    const [, actions] = result.current;

    const handleSubmit = actions.handleSubmit(mockSubmit);

    await act(async () => {
      await handleSubmit();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
    });
  });

  it('should not submit invalid form', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { name: '', email: 'invalid-email' },
        mockValidationRules
      )
    );

    const [, actions] = result.current;

    const handleSubmit = actions.handleSubmit(mockSubmit);

    await act(async () => {
      await handleSubmit();
    });

    expect(mockSubmit).not.toHaveBeenCalled();

    const [state] = result.current;
    expect(state.errors.name).toBeDefined();
    expect(state.errors.email).toBeDefined();
  });

  it('should handle async submission errors', async () => {
    const mockSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'John', email: 'john@example.com' },
        mockValidationRules
      )
    );

    const [, actions] = result.current;

    const handleSubmit = actions.handleSubmit(mockSubmit);

    await expect(
      act(async () => {
        await handleSubmit();
      })
    ).rejects.toThrow('Submission failed');

    const [state] = result.current;
    expect(state.isSubmitting).toBe(false);
  });

  it('should sanitize values when enabled', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { name: '' },
        {
          name: {
            required: true,
            custom: (value) => ({
              isValid: true,
              sanitizedValue: value.trim().toUpperCase(),
            }),
          },
        },
        { sanitizeOnChange: true }
      )
    );

    const [, actions] = result.current;

    act(() => {
      actions.setValue('name', '  john  ');
    });

    const [state] = result.current;
    expect(state.values.name).toBe('JOHN');
  });

  it('should handle custom validation rules', () => {
    const customRule: ValidationRule = {
      custom: (value) => ({
        isValid: value !== 'forbidden',
        error: value === 'forbidden' ? 'This value is forbidden' : undefined,
      }),
    };

    const { result } = renderHook(() =>
      useFormValidation({ test: '' }, { test: customRule })
    );

    const [, actions] = result.current;

    act(() => {
      actions.setValue('test', 'forbidden');
    });

    const [state] = result.current;
    expect(state.errors.test).toBe('This value is forbidden');
    expect(state.isValid).toBe(false);
  });

  it('should update validity when errors change', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: '' }, mockValidationRules)
    );

    const [, actions] = result.current;

    // Add error
    act(() => {
      actions.setError('name', 'Error message');
    });

    let [state] = result.current;
    expect(state.isValid).toBe(false);

    // Remove error
    act(() => {
      actions.clearError('name');
    });

    [state] = result.current;
    expect(state.isValid).toBe(true);
  });

  it('should mark all fields as touched on submit', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { name: 'John', email: 'john@example.com' },
        mockValidationRules
      )
    );

    const [, actions] = result.current;

    const handleSubmit = actions.handleSubmit(mockSubmit);

    await act(async () => {
      await handleSubmit();
    });

    const [state] = result.current;
    expect(state.touched.name).toBe(true);
    expect(state.touched.email).toBe(true);
  });
});