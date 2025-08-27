import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Input } from '../UI';
import ValidationMessage from './ValidationMessage';
import { ValidationRule, validateField, createDebouncedValidator } from '../../utils/validation';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  validationRules?: ValidationRule;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitizeOnChange?: boolean;
  debounceMs?: number;
  onValidationChange?: (isValid: boolean, error?: string, sanitizedValue?: any) => void;
  showValidationIcon?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
  label,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  validationRules,
  validateOnChange = true,
  validateOnBlur = true,
  sanitizeOnChange = true,
  debounceMs = 300,
  onValidationChange,
  showValidationIcon = true,
  value,
  onChange,
  onBlur,
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {
  const [validationError, setValidationError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string>(value?.toString() || '');

  // Create debounced validator
  const debouncedValidator = createDebouncedValidator((val: any) => {
    if (!validationRules) {
      return { isValid: true };
    }
    return validateField(val, validationRules);
  }, debounceMs);

  // Validate value
  const validateValue = useCallback((val: any, immediate: boolean = false) => {
    if (!validationRules) {
      setIsValid(true);
      setValidationError('');
      onValidationChange?.(true, undefined, val);
      return;
    }

    const performValidation = (value: any) => {
      const result = validateField(value, validationRules);
      
      setIsValid(result.isValid);
      setValidationError(result.error || '');
      
      onValidationChange?.(
        result.isValid,
        result.error,
        result.sanitizedValue !== undefined ? result.sanitizedValue : value
      );

      // Update internal value with sanitized value if needed
      if (sanitizeOnChange && result.sanitizedValue !== undefined && result.sanitizedValue !== value) {
        setInternalValue(result.sanitizedValue.toString());
      }
    };

    if (immediate) {
      performValidation(val);
    } else {
      debouncedValidator(val, performValidation);
    }
  }, [validationRules, onValidationChange, sanitizeOnChange, debouncedValidator]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Call original onChange
    onChange?.(e);

    // Validate on change if enabled
    if (validateOnChange && isTouched) {
      validateValue(newValue);
    }
  }, [onChange, validateOnChange, isTouched, validateValue]);

  // Handle input blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsTouched(true);

    // Call original onBlur
    onBlur?.(e);

    // Validate on blur if enabled
    if (validateOnBlur) {
      validateValue(e.target.value, true); // Immediate validation on blur
    }
  }, [onBlur, validateOnBlur, validateValue]);

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined && value.toString() !== internalValue) {
      setInternalValue(value.toString());
    }
  }, [value, internalValue]);

  // Validate initial value
  useEffect(() => {
    if (validationRules && value !== undefined && value !== '') {
      validateValue(value, true);
    }
  }, [validationRules, value, validateValue]);

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcon || !isTouched || !validationRules) {
      return rightIcon;
    }

    if (validationError) {
      return (
        <span className="text-error" aria-hidden="true">
          ❌
        </span>
      );
    }

    if (isValid && internalValue) {
      return (
        <span className="text-success" aria-hidden="true">
          ✅
        </span>
      );
    }

    return rightIcon;
  };

  // Determine if we should show error
  const shouldShowError = isTouched && validationError;

  return (
    <div className="w-full">
      <Input
        ref={ref}
        label={label}
        helperText={helperText}
        size={size}
        variant={variant}
        leftIcon={leftIcon}
        rightIcon={getValidationIcon()}
        fullWidth={fullWidth}
        className={className}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        error={shouldShowError ? validationError : undefined}
        aria-invalid={shouldShowError ? 'true' : 'false'}
        ariaLabel={ariaLabel}
        ariaDescribedBy={ariaDescribedBy}
        {...props}
      />
      
      {/* Additional validation message if needed */}
      {shouldShowError && (
        <ValidationMessage
          error={validationError}
          className="mt-1"
        />
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
