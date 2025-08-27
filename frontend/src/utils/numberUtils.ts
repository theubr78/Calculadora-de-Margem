/**
 * Advanced number formatting utilities
 */

/**
 * Format number with custom precision
 */
export const formatNumberWithPrecision = (value: number, precision: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatLargeNumber = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(1)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(1)}K`;
  }
  
  return formatNumberWithPrecision(value, 0);
};

/**
 * Format percentage with custom precision and sign
 */
export const formatPercentageAdvanced = (
  value: number, 
  precision: number = 2, 
  showSign: boolean = false
): string => {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatNumberWithPrecision(value, precision)}%`;
};

/**
 * Format currency with different currencies
 */
export const formatCurrencyAdvanced = (
  value: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number as ordinal (1st, 2nd, 3rd, etc.)
 */
export const formatOrdinal = (value: number): string => {
  const suffixes = ['º', 'º', 'º', 'º']; // Portuguese ordinal suffix
  const lastDigit = value % 10;
  const lastTwoDigits = value % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${value}º`;
  }
  
  return `${value}${suffixes[lastDigit] || 'º'}`;
};

/**
 * Parse number from formatted string
 */
export const parseFormattedNumber = (value: string): number => {
  // Remove currency symbols, spaces, and convert comma to dot
  const cleanValue = value
    .replace(/[R$\s€£¥]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Round to specific decimal places
 */
export const roundToPrecision = (value: number, precision: number = 2): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

/**
 * Clamp number between min and max values
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Check if number is within tolerance of target
 */
export const isWithinTolerance = (
  value: number, 
  target: number, 
  tolerance: number = 0.01
): boolean => {
  return Math.abs(value - target) <= tolerance;
};

/**
 * Generate number range
 */
export const generateRange = (
  start: number, 
  end: number, 
  step: number = 1
): number[] => {
  const range: number[] = [];
  for (let i = start; i <= end; i += step) {
    range.push(roundToPrecision(i, 2));
  }
  return range;
};

/**
 * Calculate compound annual growth rate (CAGR)
 */
export const calculateCAGR = (
  beginningValue: number,
  endingValue: number,
  periods: number
): number => {
  if (beginningValue <= 0 || endingValue <= 0 || periods <= 0) {
    throw new Error('All values must be positive');
  }
  
  return (Math.pow(endingValue / beginningValue, 1 / periods) - 1) * 100;
};

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (
  values: number[],
  weights: number[]
): number => {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }
  
  if (values.length === 0) {
    return 0;
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  
  const weightedSum = values.reduce((sum, value, index) => {
    return sum + (value * weights[index]);
  }, 0);
  
  return weightedSum / totalWeight;
};

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
  
  return Math.sqrt(variance);
};

/**
 * Find outliers using IQR method
 */
export const findOutliers = (values: number[]): {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
  q1: number;
  q3: number;
} => {
  if (values.length === 0) {
    return { outliers: [], lowerBound: 0, upperBound: 0, q1: 0, q3: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values.filter(value => value < lowerBound || value > upperBound);
  
  return { outliers, lowerBound, upperBound, q1, q3 };
};