export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => ValidationResult;
}

/**
 * Sanitize string input by removing dangerous characters and trimming
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (input: string | number): number | null => {
  if (typeof input === 'number') {
    return isFinite(input) ? input : null;
  }

  if (typeof input !== 'string') {
    return null;
  }

  // Remove non-numeric characters except decimal point and minus
  const cleaned = input.replace(/[^\d.,-]/g, '');
  
  // Handle Brazilian decimal format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  return isFinite(parsed) ? parsed : null;
};

/**
 * Validate product code format
 */
export const validateProductCode = (code: string): ValidationResult => {
  const sanitized = sanitizeString(code);

  if (!sanitized) {
    return {
      isValid: false,
      error: 'Código do produto é obrigatório',
    };
  }

  if (sanitized.length < 2) {
    return {
      isValid: false,
      error: 'Código do produto deve ter pelo menos 2 caracteres',
    };
  }

  if (sanitized.length > 50) {
    return {
      isValid: false,
      error: 'Código do produto deve ter no máximo 50 caracteres',
    };
  }

  // Allow alphanumeric characters, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(sanitized)) {
    return {
      isValid: false,
      error: 'Código do produto deve conter apenas letras, números, hífens e underscores',
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized.toUpperCase(),
  };
};

/**
 * Validate date format (DD/MM/YYYY)
 */
export const validateDate = (dateString: string): ValidationResult => {
  const sanitized = sanitizeString(dateString);

  if (!sanitized) {
    return {
      isValid: true, // Date is optional
      sanitizedValue: '',
    };
  }

  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = sanitized.match(datePattern);

  if (!match) {
    return {
      isValid: false,
      error: 'Data deve estar no formato DD/MM/AAAA',
    };
  }

  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Basic date validation
  if (dayNum < 1 || dayNum > 31) {
    return {
      isValid: false,
      error: 'Dia deve estar entre 1 e 31',
    };
  }

  if (monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'Mês deve estar entre 1 e 12',
    };
  }

  if (yearNum < 1900 || yearNum > 2100) {
    return {
      isValid: false,
      error: 'Ano deve estar entre 1900 e 2100',
    };
  }

  // Create date object to validate actual date
  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return {
      isValid: false,
      error: 'Data inválida',
    };
  }

  // Check if date is not too far in the future
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(today.getFullYear() + 1);

  if (date > maxFutureDate) {
    return {
      isValid: false,
      error: 'Data não pode ser mais de 1 ano no futuro',
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized,
  };
};

/**
 * Validate price input
 */
export const validatePrice = (price: string | number): ValidationResult => {
  const sanitized = sanitizeNumber(price);

  if (sanitized === null) {
    return {
      isValid: false,
      error: 'Preço deve ser um número válido',
    };
  }

  if (sanitized < 0) {
    return {
      isValid: false,
      error: 'Preço não pode ser negativo',
    };
  }

  if (sanitized > 999999999) {
    return {
      isValid: false,
      error: 'Preço muito alto (máximo: R$ 999.999.999,00)',
    };
  }

  // Check for reasonable decimal places (max 2)
  const decimalPlaces = sanitized.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > 2) {
    return {
      isValid: true,
      sanitizedValue: Math.round(sanitized * 100) / 100, // Round to 2 decimal places
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitized,
  };
};

/**
 * Validate percentage input
 */
export const validatePercentage = (percentage: string | number): ValidationResult => {
  const sanitized = sanitizeNumber(percentage);

  if (sanitized === null) {
    return {
      isValid: false,
      error: 'Porcentagem deve ser um número válido',
    };
  }

  if (sanitized < -100) {
    return {
      isValid: false,
      error: 'Porcentagem não pode ser menor que -100%',
    };
  }

  if (sanitized > 1000) {
    return {
      isValid: false,
      error: 'Porcentagem muito alta (máximo: 1000%)',
    };
  }

  return {
    isValid: true,
    sanitizedValue: Math.round(sanitized * 100) / 100, // Round to 2 decimal places
  };
};

/**
 * Generic field validator
 */
export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  // Handle required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return {
      isValid: false,
      error: 'Este campo é obrigatório',
    };
  }

  // If value is empty and not required, it's valid
  if (!value || (typeof value === 'string' && !value.trim())) {
    return {
      isValid: true,
      sanitizedValue: '',
    };
  }

  let sanitizedValue = value;

  // Sanitize string values
  if (typeof value === 'string') {
    sanitizedValue = sanitizeString(value);
  }

  // Length validation for strings
  if (typeof sanitizedValue === 'string') {
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      return {
        isValid: false,
        error: `Deve ter pelo menos ${rules.minLength} caracteres`,
      };
    }

    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      return {
        isValid: false,
        error: `Deve ter no máximo ${rules.maxLength} caracteres`,
      };
    }
  }

  // Pattern validation
  if (rules.pattern && typeof sanitizedValue === 'string') {
    if (!rules.pattern.test(sanitizedValue)) {
      return {
        isValid: false,
        error: 'Formato inválido',
      };
    }
  }

  // Numeric range validation
  if (typeof sanitizedValue === 'number') {
    if (rules.min !== undefined && sanitizedValue < rules.min) {
      return {
        isValid: false,
        error: `Valor deve ser pelo menos ${rules.min}`,
      };
    }

    if (rules.max !== undefined && sanitizedValue > rules.max) {
      return {
        isValid: false,
        error: `Valor deve ser no máximo ${rules.max}`,
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customResult = rules.custom(sanitizedValue);
    if (!customResult.isValid) {
      return customResult;
    }
    sanitizedValue = customResult.sanitizedValue ?? sanitizedValue;
  }

  return {
    isValid: true,
    sanitizedValue,
  };
};

/**
 * Validate multiple fields at once
 */
export const validateFields = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} => {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[field], fieldRules);
    
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    } else {
      sanitizedData[field] = result.sanitizedValue ?? data[field];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
};

/**
 * Debounced validation for real-time feedback
 */
export const createDebouncedValidator = (
  validator: (value: any) => ValidationResult,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: any, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
};

/**
 * XSS prevention utilities
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * SQL injection prevention (for display purposes)
 */
export const sanitizeSqlString = (input: string): string => {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};