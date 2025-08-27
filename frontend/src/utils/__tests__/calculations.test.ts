import {
  calculateProfitMargin,
  calculateProfitAmount,
  calculateSellingPrice,
  calculateMarkup,
  formatCurrency,
  formatPercentage,
  validateProductCode,
  validatePrice,
  isValidPrice,
  roundToDecimals,
  calculateBreakEvenPrice,
  calculateROI,
  ProfitCalculationResult,
} from '../calculations';

describe('Calculation Utils', () => {
  describe('calculateProfitMargin', () => {
    it('should calculate profit margin correctly', () => {
      expect(calculateProfitMargin(100, 80)).toBe(20);
      expect(calculateProfitMargin(150, 100)).toBe(33.33);
      expect(calculateProfitMargin(200, 150)).toBe(25);
    });

    it('should handle zero selling price', () => {
      expect(calculateProfitMargin(0, 80)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(calculateProfitMargin(80, 100)).toBe(-25);
    });

    it('should handle equal cost and selling price', () => {
      expect(calculateProfitMargin(100, 100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateProfitMargin(100, 33.333)).toBe(66.67);
    });
  });

  describe('calculateProfitAmount', () => {
    it('should calculate profit amount correctly', () => {
      expect(calculateProfitAmount(100, 80)).toBe(20);
      expect(calculateProfitAmount(150, 100)).toBe(50);
      expect(calculateProfitAmount(200, 150)).toBe(50);
    });

    it('should handle zero selling price', () => {
      expect(calculateProfitAmount(0, 80)).toBe(-80);
    });

    it('should handle negative profit', () => {
      expect(calculateProfitAmount(80, 100)).toBe(-20);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateProfitAmount(100.555, 50.444)).toBe(50.11);
    });
  });

  describe('calculateSellingPrice', () => {
    it('should calculate selling price from cost and margin', () => {
      expect(calculateSellingPrice(80, 25)).toBe(106.67);
      expect(calculateSellingPrice(100, 20)).toBe(125);
      expect(calculateSellingPrice(50, 50)).toBe(100);
    });

    it('should handle zero margin', () => {
      expect(calculateSellingPrice(100, 0)).toBe(100);
    });

    it('should handle negative margin', () => {
      expect(calculateSellingPrice(100, -10)).toBe(88.89);
    });

    it('should handle 100% margin', () => {
      expect(calculateSellingPrice(100, 100)).toBe(Infinity);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateSellingPrice(33.333, 33.333)).toBe(49.99);
    });
  });

  describe('calculateMarkup', () => {
    it('should calculate markup correctly', () => {
      expect(calculateMarkup(100, 80)).toBe(25);
      expect(calculateMarkup(150, 100)).toBe(50);
      expect(calculateMarkup(200, 100)).toBe(100);
    });

    it('should handle zero cost', () => {
      expect(calculateMarkup(100, 0)).toBe(Infinity);
    });

    it('should handle equal cost and selling price', () => {
      expect(calculateMarkup(100, 100)).toBe(0);
    });

    it('should handle negative markup', () => {
      expect(calculateMarkup(80, 100)).toBe(-20);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateMarkup(100, 33.333)).toBe(200.01);
    });
  });

  describe('calculateBreakEvenPrice', () => {
    it('should calculate break-even price correctly', () => {
      expect(calculateBreakEvenPrice(80, 10, 5)).toBe(95);
      expect(calculateBreakEvenPrice(100, 20, 10)).toBe(130);
    });

    it('should handle zero additional costs', () => {
      expect(calculateBreakEvenPrice(100, 0, 0)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateBreakEvenPrice(33.333, 11.111, 5.555)).toBe(49.999);
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      expect(calculateROI(120, 100)).toBe(20);
      expect(calculateROI(150, 100)).toBe(50);
      expect(calculateROI(80, 100)).toBe(-20);
    });

    it('should handle zero investment', () => {
      expect(calculateROI(100, 0)).toBe(Infinity);
    });

    it('should handle equal gain and investment', () => {
      expect(calculateROI(100, 100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateROI(133.333, 100)).toBe(33.33);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00');
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-100)).toBe('-R$ 100,00');
      expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
    });

    it('should handle very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('R$ 0,01');
      expect(formatCurrency(0.001)).toBe('R$ 0,00');
    });

    it('should handle undefined and null', () => {
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
      expect(formatCurrency(null as any)).toBe('R$ 0,00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(25)).toBe('25,00%');
      expect(formatPercentage(33.333)).toBe('33,33%');
      expect(formatPercentage(0)).toBe('0,00%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercentage(-10)).toBe('-10,00%');
      expect(formatPercentage(-25.5)).toBe('-25,50%');
    });

    it('should handle very large percentages', () => {
      expect(formatPercentage(1000)).toBe('1.000,00%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.01)).toBe('0,01%');
      expect(formatPercentage(0.001)).toBe('0,00%');
    });

    it('should handle undefined and null', () => {
      expect(formatPercentage(undefined)).toBe('0,00%');
      expect(formatPercentage(null as any)).toBe('0,00%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage(33.333, 1)).toBe('33,3%');
      expect(formatPercentage(33.333, 3)).toBe('33,333%');
    });
  });

  describe('validateProductCode', () => {
    it('should validate correct product codes', () => {
      const validCodes = ['PRD001', 'PRODUCT_123', 'ABC-DEF', 'TEST123'];
      
      validCodes.forEach(code => {
        const result = validateProductCode(code);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject empty product codes', () => {
      const result = validateProductCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto é obrigatório');
    });

    it('should reject product codes that are too short', () => {
      const result = validateProductCode('A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto deve ter pelo menos 2 caracteres');
    });

    it('should reject product codes that are too long', () => {
      const longCode = 'A'.repeat(51);
      const result = validateProductCode(longCode);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Código do produto deve ter no máximo 50 caracteres');
    });

    it('should reject product codes with invalid characters', () => {
      const invalidCodes = ['PRD@001', 'TEST!123', 'CODE#456', 'PROD$789'];
      
      invalidCodes.forEach(code => {
        const result = validateProductCode(code);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Código do produto deve conter apenas letras, números, hífens e underscores');
      });
    });

    it('should handle whitespace', () => {
      const result = validateProductCode('  PRD001  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      const validPrices = [0, 0.01, 1, 100, 1000.50, 999999];
      
      validPrices.forEach(price => {
        const result = validatePrice(price);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject negative prices', () => {
      const result = validatePrice(-1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço não pode ser negativo');
    });

    it('should reject non-numeric prices', () => {
      const result = validatePrice('abc' as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço deve ser um número válido');
    });

    it('should reject NaN prices', () => {
      const result = validatePrice(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço deve ser um número válido');
    });

    it('should reject Infinity prices', () => {
      const result = validatePrice(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Preço deve ser um número válido');
    });
  });

  describe('isValidPrice', () => {
    it('should return true for valid prices', () => {
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(1000.50)).toBe(true);
    });

    it('should return false for invalid prices', () => {
      expect(isValidPrice(-1)).toBe(false);
      expect(isValidPrice(NaN)).toBe(false);
      expect(isValidPrice(Infinity)).toBe(false);
      expect(isValidPrice('abc' as any)).toBe(false);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimals(3.14159, 2)).toBe(3.14);
      expect(roundToDecimals(3.14159, 3)).toBe(3.142);
      expect(roundToDecimals(3.14159, 0)).toBe(3);
    });

    it('should handle negative numbers', () => {
      expect(roundToDecimals(-3.14159, 2)).toBe(-3.14);
    });

    it('should handle zero', () => {
      expect(roundToDecimals(0, 2)).toBe(0);
    });

    it('should handle integers', () => {
      expect(roundToDecimals(100, 2)).toBe(100);
    });
  });

  describe('integration tests', () => {
    it('should calculate complete profit analysis', () => {
      const costPrice = 80;
      const sellingPrice = 100;
      
      const profitMargin = calculateProfitMargin(sellingPrice, costPrice);
      const profitAmount = calculateProfitAmount(sellingPrice, costPrice);
      const markup = calculateMarkup(sellingPrice, costPrice);
      
      expect(profitMargin).toBe(20);
      expect(profitAmount).toBe(20);
      expect(markup).toBe(25);
      
      expect(formatCurrency(profitAmount)).toBe('R$ 20,00');
      expect(formatPercentage(profitMargin)).toBe('20,00%');
    });

    it('should handle edge case calculations', () => {
      // Zero profit scenario
      const costPrice = 100;
      const sellingPrice = 100;
      
      expect(calculateProfitMargin(sellingPrice, costPrice)).toBe(0);
      expect(calculateProfitAmount(sellingPrice, costPrice)).toBe(0);
      expect(calculateMarkup(sellingPrice, costPrice)).toBe(0);
    });

    it('should handle loss scenario', () => {
      const costPrice = 120;
      const sellingPrice = 100;
      
      const profitMargin = calculateProfitMargin(sellingPrice, costPrice);
      const profitAmount = calculateProfitAmount(sellingPrice, costPrice);
      
      expect(profitMargin).toBe(-20);
      expect(profitAmount).toBe(-20);
      
      expect(formatCurrency(profitAmount)).toBe('-R$ 20,00');
      expect(formatPercentage(profitMargin)).toBe('-20,00%');
    });
  });

  describe('error handling', () => {
    it('should handle undefined values gracefully', () => {
      expect(calculateProfitMargin(undefined as any, 100)).toBe(0);
      expect(calculateProfitAmount(undefined as any, 100)).toBe(-100);
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
      expect(formatPercentage(undefined)).toBe('0,00%');
    });

    it('should handle null values gracefully', () => {
      expect(calculateProfitMargin(null as any, 100)).toBe(0);
      expect(calculateProfitAmount(null as any, 100)).toBe(-100);
      expect(formatCurrency(null as any)).toBe('R$ 0,00');
      expect(formatPercentage(null as any)).toBe('0,00%');
    });

    it('should handle string numbers', () => {
      expect(calculateProfitMargin('100' as any, '80' as any)).toBe(20);
      expect(formatCurrency('100' as any)).toBe('R$ 100,00');
    });
  });
});