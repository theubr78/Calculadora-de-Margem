import { useState, useCallback, useEffect } from 'react';
import { ValidationRule, validateField, validateFields, ValidationResult } from '../utils/validation';

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormValidationState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormValidationActions {
  setValue: (field: string, value: any) => void;
  setValues: (values: Record<string, any>) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  setTouched: (field: string, touched?: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  validateField: (field: string) => ValidationResult;
  validateForm: () => boolean;
  reset: (initialValues?: Record<string, any>) => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

export const useFormValidation = (
  initialValues: Record<string, any> = {},
  validationConfig: FormValidationConfig = {},
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    sanitizeOnChange?: boolean;
  } = {}
): [FormValidationState, FormValidationActions] => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    sanitizeOnChange = true,
  } = options;

  const [state, setState] = useState<FormValidationState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  });

  // Validate a single field
  const validateSingleField = useCallback((field: string, value?: any): ValidationResult => {
    const fieldValue = value !== undefined ? value : state.values[field];
    const rules = validationConfig[field];

    if (!rules) {
      return { isValid: true, sanitizedValue: fieldValue };
    }

    return validateField(fieldValue, rules);
  }, [state.values, validationConfig]);

  // Validate entire form
  const validateEntireForm = useCallback((): boolean => {
    const result = validateFields(state.values, validationConfig);
    
    setState(prev => ({
      ...prev,
      errors: result.errors,
      values: sanitizeOnChange ? result.sanitizedData : prev.values,
      isValid: result.isValid,
    }));

    return result.isValid;
  }, [state.values, validationConfig, sanitizeOnChange]);

  // Set a single field value
  const setValue = useCallback((field: string, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      let newErrors = { ...prev.errors };
      let sanitizedValue = value;

      // Validate on change if enabled
      if (validateOnChange && validationConfig[field]) {
        const result = validateField(value, validationConfig[field]);
        
        if (result.isValid) {
          delete newErrors[field];
          if (sanitizeOnChange && result.sanitizedValue !== undefined) {
            sanitizedValue = result.sanitizedValue;
            newValues[field] = sanitizedValue;
          }
        } else if (result.error) {
          newErrors[field] = result.error;
        }
      }

      // Check overall form validity
      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateOnChange, sanitizeOnChange, validationConfig]);

  // Set multiple field values
  const setValues = useCallback((values: Record<string, any>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      let newErrors = { ...prev.errors };

      // Validate changed fields if enabled
      if (validateOnChange) {
        for (const [field, value] of Object.entries(values)) {
          if (validationConfig[field]) {
            const result = validateField(value, validationConfig[field]);
            
            if (result.isValid) {
              delete newErrors[field];
              if (sanitizeOnChange && result.sanitizedValue !== undefined) {
                newValues[field] = result.sanitizedValue;
              }
            } else if (result.error) {
              newErrors[field] = result.error;
            }
          }
        }
      }

      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateOnChange, sanitizeOnChange, validationConfig]);

  // Set field error
  const setError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  // Set field as touched
  const setTouched = useCallback((field: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));

    // Validate on blur if enabled and field is now touched
    if (touched && validateOnBlur && validationConfig[field]) {
      const result = validateSingleField(field);
      if (!result.isValid && result.error) {
        setError(field, result.error);
      } else {
        clearError(field);
      }
    }
  }, [validateOnBlur, validationConfig, validateSingleField, setError, clearError]);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting: submitting,
    }));
  }, []);

  // Reset form
  const reset = useCallback((newInitialValues?: Record<string, any>) => {
    setState({
      values: newInitialValues || initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    });
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback((
    onSubmit: (values: Record<string, any>) => void | Promise<void>
  ) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitting(true);

      try {
        // Validate entire form before submission
        const isFormValid = validateEntireForm();
        
        if (!isFormValid) {
          console.warn('[FormValidation] Form validation failed');
          return;
        }

        // Mark all fields as touched
        const allTouched = Object.keys(validationConfig).reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {}
        );
        
        setState(prev => ({
          ...prev,
          touched: { ...prev.touched, ...allTouched },
        }));

        // Call submit handler
        await onSubmit(state.values);
      } catch (error) {
        console.error('[FormValidation] Submit error:', error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    };
  }, [state.values, validationConfig, validateEntireForm, setSubmitting]);

  // Update form validity when errors change
  useEffect(() => {
    const isValid = Object.keys(state.errors).length === 0;
    if (state.isValid !== isValid) {
      setState(prev => ({ ...prev, isValid }));
    }
  }, [state.errors, state.isValid]);

  const actions: FormValidationActions = {
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setTouched,
    setSubmitting,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    reset,
    handleSubmit,
  };

  return [state, actions];
};