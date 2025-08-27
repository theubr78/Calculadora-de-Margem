import {
  sanitizeString,
  sanitizeNumber,
  validateProductCode,
  validateDate,
  validatePrice,
  validatePercentage,
  validateField,
  validateFields,
  escapeHtml,
  stripHtml,
} from '../validation';

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('hello<script>alert("xss")</script>world')).toBe('helloalert("xss")world');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
    });

    it('should limit length to 1000 characters', () => {
      const longString = 'a'.repeat(1500);
      expect(sanitizeString(longString)).toHaveLength(1000);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeString(123 as any)).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should return number as-is if valid', () => {
      expect(sanitizeNumber(123.45)).toBe(123.45);
    });

    it('should parse string numbers', () => {
      expect(sanitizeNumber('123.45')).toBe(123.45);
    });

    it('should handle Brazilian decimal format', () => {
      expect(sanitizeNumber('123,45')).toBe(123.45);
    });

    it('should remove non-numeric characters', () => {
      expect(sanitizeNumber('R$ 123,45')).toBe(123.45);
    });

    it('should return null for invalid input', () => {
      expect(sanitizeNumber('abc')).toBeNull();
      expect(sanitizeNumber('')).toBeNull();
      expect(sanitizeNumber(NaN)).toBeNull();
      expect(sanitizeNumber(Infinity)).toBeNull();
    });
  });

  describe('validateProductCode', () => {
    it('should validate correct product codes', () => {
      const result = validateProductCode('PRD001');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('PRD001');
    });

    it('should convert to uppercase', () => {
      const result = validateProductCode('prd001');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('PRD001');
    });

    it('should reject empty codes', () => {
      const result = validateProductCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto é obrigatório');
    });

    it('should reject codes that are too short', () => {
      const result = validateProductCode('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto deve ter pelo menos 2 caracteres');
    });

    it('should reject codes that are too long', () => {
      const result = validateProductCode('A'.repeat(51));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto deve ter no máximo 50 caracteres');
    });

    it('should reject codes with invalid characters', () => {
      const result = validateProductCode('PRD@001');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto deve conter apenas letras, números, hífens e underscores');
    });
  });

  describe('validateDate', () => {
    it('should validate correct dates', () => {
      const result = validateDate('25/12/2023');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('25/12/2023');
    });

    it('should allow empty dates', () => {
      const result = validateDate('');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('');
    });

    it('should reject invalid format', () => {
      const result = validateDate('2023-12-25');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Data deve estar no formato DD/MM/AAAA');
    });

    it('should reject invalid days', () => {
      const result = validateDate('32/12/2023');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Dia deve estar entre 1 e 31');
    });

    it('should reject invalid months', () => {
      const result = validateDate('25/13/2023');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Mês deve estar entre 1 e 12');
    });

    it('should reject invalid years', () => {
      const result = validateDate('25/12/1800');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ano deve estar entre 1900 e 2100');
    });

    it('should reject impossible dates', () => {
      const result = validateDate('31/02/2023');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Data inválida');
    });

    it('should reject dates too far in the future', () => {
      const futureYear = new Date().getFullYear() + 2;
      const result = validateDate(`25/12/${futureYear}`);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Data não pode ser mais de 1 ano no futuro');
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      const result = validatePrice(123.45);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(123.45);
    });

    it('should validate string prices', () => {
      const result = validatePrice('123.45');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(123.45);
    });

    it('should reject negative prices', () => {
      const result = validatePrice(-10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço não pode ser negativo');
    });

    it('should reject prices that are too high', () => {
      const result = validatePrice(1000000000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço muito alto (máximo: R$ 999.999.999,00)');
    });

    it('should round to 2 decimal places', () => {
      const result = validatePrice(123.456);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(123.46);
    });

    it('should reject invalid numbers', () => {
      const result = validatePrice('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço deve ser um número válido');
    });
  });

  describe('validatePercentage', () => {
    it('should validate correct percentages', () => {
      const result = validatePercentage(25.5);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(25.5);
    });

    it('should reject percentages that are too low', () => {
      const result = validatePercentage(-150);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Porcentagem não pode ser menor que -100%');
    });

    it('should reject percentages that are too high', () => {
      const result = validatePercentage(1500);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Porcentagem muito alta (máximo: 1000%)');
    });

    it('should round to 2 decimal places', () => {
      const result = validatePercentage(25.567);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(25.57);
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const result = validateField('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Este campo é obrigatório');
    });

    it('should validate string length', () => {
      const result = validateField('ab', { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Deve ter pelo menos 3 caracteres');
    });

    it('should validate pattern', () => {
      const result = validateField('abc123', { pattern: /^\d+$/ });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formato inválido');
    });

    it('should validate numeric range', () => {
      const result = validateField(5, { min: 10 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor deve ser pelo menos 10');
    });

    it('should use custom validation', () => {
      const customValidator = (value: any) => ({
        isValid: value !== 'invalid',
        error: value === 'invalid' ? 'Custom error' : undefined,
      });

      const result = validateField('invalid', { custom: customValidator });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Custom error');
    });
  });

  describe('validateFields', () => {
    it('should validate multiple fields', () => {
      const data = { name: 'John', age: 25 };
      const rules = {
        name: { required: true, minLength: 2 },
        age: { required: true, min: 18 },
      };

      const result = validateFields(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid fields', () => {
      const data = { name: '', age: 15 };
      const rules = {
        name: { required: true },
        age: { min: 18 },
      };

      const result = validateFields(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Este campo é obrigatório');
      expect(result.errors.age).toBe('Valor deve ser pelo menos 18');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should handle quotes and ampersands', () => {
      expect(escapeHtml('Tom & Jerry "cartoon"')).toBe('Tom &amp; Jerry "cartoon"');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>world</strong>!</p>')).toBe('Hello world!');
    });

    it('should handle complex HTML', () => {
      expect(stripHtml('<div><p>Test</p><script>alert("xss")</script></div>')).toBe('Testalert("xss")');
    });
  });
});