import {
  formatCurrency,
  formatPercentage,
  parseCurrency,
  formatNumber,
  formatDate,
  getCurrentDate,
  formatProductCode,
  truncateText,
} from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as Brazilian currency', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(999.99)).toBe('R$ 999,99');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
    });
  });

  describe('formatPercentage', () => {
    it('should format numbers as percentages', () => {
      expect(formatPercentage(25)).toBe('25,00%');
      expect(formatPercentage(0)).toBe('0,00%');
      expect(formatPercentage(-10)).toBe('-10,00%');
      expect(formatPercentage(100)).toBe('100,00%');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency strings to numbers', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
      expect(parseCurrency('1.234,56')).toBe(1234.56);
      expect(parseCurrency('1234,56')).toBe(1234.56);
      expect(parseCurrency('1234')).toBe(1234);
    });

    it('should handle invalid input', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('abc')).toBe(0);
      expect(parseCurrency('R$')).toBe(0);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separator', () => {
      expect(formatNumber(1234)).toBe('1.234');
      expect(formatNumber(1234567)).toBe('1.234.567');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDate', () => {
    it('should format dates as DD/MM/YYYY', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      expect(formatDate(date)).toBe('15/01/2025');
    });
  });

  describe('getCurrentDate', () => {
    it('should return current date in DD/MM/YYYY format', () => {
      const result = getCurrentDate();
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('formatProductCode', () => {
    it('should format product codes correctly', () => {
      expect(formatProductCode('  prd001  ')).toBe('PRD001');
      expect(formatProductCode('test-code')).toBe('TEST-CODE');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });
});