import {
  validatePriceRange,
  validateBusinessRules,
  validateNumericInput,
  ValidationResult,
} from '../validationUtils';

describe('ValidationUtils', () => {
  describe('validatePriceRange', () => {
    it('should validate price within acceptable range', () => {
      const result = validatePriceRange(150, 100, 10);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeUndefined();
    });

    it('should reject zero or negative prices', () => {
      const result1 = validatePriceRange(0, 100);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Preço deve ser maior que zero');

      const result2 = validatePriceRange(-50, 100);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Preço deve ser maior que zero');
    });

    it('should reject price below cost', () => {
      const result = validatePriceRange(80, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço de venda não pode ser menor que o custo');
      expect(result.suggestions).toContain('Preço mínimo sugerido: R$ 100.00');
    });

    it('should warn about low margins', () => {
      const result = validatePriceRange(105, 100, 10);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Margem de 4.76% está abaixo do mínimo de 10%');
    });

    it('should warn about very high margins', () => {
      const result = validatePriceRange(600, 100);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Margem muito alta pode afetar competitividade');
      expect(result.suggestions).toContain('Considere reduzir preço para aumentar volume');
    });
  });

  describe('validateBusinessRules', () => {
    it('should validate within business rules', () => {
      const result = validateBusinessRules(100, 150, 50, { minMargin: 20 });
      expect(result.isValid).toBe(true);
    });

    it('should reject below minimum margin', () => {
      const result = validateBusinessRules(100, 110, 50, { minMargin: 20 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Margem de 9.09% está abaixo do mínimo permitido de 20%');
    });

    it('should reject zero stock when required', () => {
      const result = validateBusinessRules(100, 150, 0, { requiresStock: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Produto sem estoque não pode ser vendido');
    });

    it('should warn about low stock', () => {
      const result = validateBusinessRules(100, 150, 5);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Estoque baixo - considere reposição');
    });

    it('should suggest promotions for high stock', () => {
      const result = validateBusinessRules(100, 150, 1500);
      expect(result.isValid).toBe(true);
      expect(result.suggestions).toContain('Alto estoque - considere promoções para acelerar giro');
    });
  });

  describe('validateNumericInput', () => {
    it('should validate correct numeric input', () => {
      const result = validateNumericInput('123.45');
      expect(result.isValid).toBe(true);
    });

    it('should validate Brazilian format', () => {
      const result = validateNumericInput('123,45');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty input', () => {
      const result = validateNumericInput('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor é obrigatório');
    });

    it('should reject non-numeric input', () => {
      const result = validateNumericInput('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor deve ser um número válido');
      expect(result.suggestions).toContain('Use formato: 1234,56 ou 1234.56');
    });

    it('should reject negative when not allowed', () => {
      const result = validateNumericInput('-100', { allowNegative: false });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor não pode ser negativo');
    });

    it('should reject zero when not allowed', () => {
      const result = validateNumericInput('0', { allowZero: false });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor deve ser maior que zero');
    });

    it('should validate min/max range', () => {
      const result1 = validateNumericInput('50', { min: 100 });
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Valor deve ser maior ou igual a 100');

      const result2 = validateNumericInput('150', { max: 100 });
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Valor deve ser menor ou igual a 100');
    });

    it('should validate decimal places', () => {
      const result = validateNumericInput('123.456', { maxDecimals: 2 });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Máximo 2 casas decimais permitidas');
    });
  });
});