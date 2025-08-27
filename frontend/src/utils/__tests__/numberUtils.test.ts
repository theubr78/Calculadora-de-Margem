import {
  formatNumberWithPrecision,
  formatLargeNumber,
  formatPercentageAdvanced,
  parseFormattedNumber,
  roundToPrecision,
  calculatePercentageChange,
  clamp,
  isWithinTolerance,
  generateRange,
  calculateWeightedAverage,
  calculateStandardDeviation,
} from '../numberUtils';

describe('NumberUtils', () => {
  describe('formatNumberWithPrecision', () => {
    it('should format numbers with specified precision', () => {
      expect(formatNumberWithPrecision(123.456, 2)).toBe('123,46');
      expect(formatNumberWithPrecision(123.456, 0)).toBe('123');
      expect(formatNumberWithPrecision(123.456, 4)).toBe('123,4560');
    });
  });

  describe('formatLargeNumber', () => {
    it('should format large numbers with abbreviations', () => {
      expect(formatLargeNumber(1500)).toBe('1.5K');
      expect(formatLargeNumber(1500000)).toBe('1.5M');
      expect(formatLargeNumber(1500000000)).toBe('1.5B');
      expect(formatLargeNumber(500)).toBe('500');
    });

    it('should handle negative numbers', () => {
      expect(formatLargeNumber(-1500)).toBe('-1.5K');
      expect(formatLargeNumber(-1500000)).toBe('-1.5M');
    });
  });

  describe('formatPercentageAdvanced', () => {
    it('should format percentages with custom precision', () => {
      expect(formatPercentageAdvanced(25.456, 2)).toBe('25,46%');
      expect(formatPercentageAdvanced(25.456, 0)).toBe('25%');
    });

    it('should show sign when requested', () => {
      expect(formatPercentageAdvanced(25.456, 2, true)).toBe('+25,46%');
      expect(formatPercentageAdvanced(-25.456, 2, true)).toBe('-25,46%');
    });
  });

  describe('parseFormattedNumber', () => {
    it('should parse various formatted numbers', () => {
      expect(parseFormattedNumber('R$ 1.234,56')).toBe(1234.56);
      expect(parseFormattedNumber('€ 1,234.56')).toBe(1234.56);
      expect(parseFormattedNumber('1.234,56')).toBe(1234.56);
      expect(parseFormattedNumber('1234')).toBe(1234);
    });

    it('should handle invalid input', () => {
      expect(parseFormattedNumber('')).toBe(0);
      expect(parseFormattedNumber('abc')).toBe(0);
    });
  });

  describe('roundToPrecision', () => {
    it('should round to specified decimal places', () => {
      expect(roundToPrecision(123.456, 2)).toBe(123.46);
      expect(roundToPrecision(123.456, 0)).toBe(123);
      expect(roundToPrecision(123.456, 1)).toBe(123.5);
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
      expect(calculatePercentageChange(100, 50)).toBe(-50);
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it('should handle zero old value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('isWithinTolerance', () => {
    it('should check if values are within tolerance', () => {
      expect(isWithinTolerance(10, 10.005, 0.01)).toBe(true);
      expect(isWithinTolerance(10, 10.02, 0.01)).toBe(false);
      expect(isWithinTolerance(10, 9.995, 0.01)).toBe(true);
    });
  });

  describe('generateRange', () => {
    it('should generate number ranges', () => {
      expect(generateRange(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
      expect(generateRange(0, 1, 0.5)).toEqual([0, 0.5, 1]);
      expect(generateRange(10, 12, 0.5)).toEqual([10, 10.5, 11, 11.5, 12]);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const values = [10, 20, 30];
      const weights = [1, 2, 3];
      const result = calculateWeightedAverage(values, weights);
      expect(result).toBeCloseTo(23.33, 2);
    });

    it('should handle empty arrays', () => {
      expect(calculateWeightedAverage([], [])).toBe(0);
    });

    it('should handle zero total weight', () => {
      expect(calculateWeightedAverage([10, 20], [0, 0])).toBe(0);
    });

    it('should throw error for mismatched arrays', () => {
      expect(() => calculateWeightedAverage([1, 2], [1])).toThrow();
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const result = calculateStandardDeviation(values);
      expect(result).toBeCloseTo(2, 0);
    });

    it('should handle empty array', () => {
      expect(calculateStandardDeviation([])).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateStandardDeviation([5])).toBe(0);
    });
  });
});