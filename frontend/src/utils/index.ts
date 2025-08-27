/**
 * Utility functions index
 * Exports all utility functions for easy importing
 */

// Calculation utilities
export {
  calculateProfit,
  calculateBreakEvenPrice,
  calculatePriceForMargin,
  calculatePriceForMarkup,
  calculateMarkupFromMargin,
  calculateMarginFromMarkup,
  calculateVolumeForTargetProfit,
  calculateDiscountImpact,
  calculateCompetitivePricing,
  calculatePriceElasticityImpact,
  validateSalePrice,
  validateProductCode,
} from './calculations';

// Formatting utilities
export {
  formatCurrency,
  formatPercentage,
  parseCurrency,
  formatNumber,
  formatDate,
  getCurrentDate,
  formatProductCode,
  truncateText,
} from './formatters';

// Advanced number utilities
export {
  formatNumberWithPrecision,
  formatLargeNumber,
  formatPercentageAdvanced,
  formatCurrencyAdvanced,
  formatOrdinal,
  parseFormattedNumber,
  roundToPrecision,
  calculatePercentageChange,
  clamp,
  isWithinTolerance,
  generateRange,
  calculateCAGR,
  calculateWeightedAverage,
  calculateStandardDeviation,
  findOutliers,
} from './numberUtils';

// Validation utilities
export {
  validatePriceRange,
  validateBusinessRules,
  validatePricingStrategy,
  validateNumericInput,
  type ValidationResult,
} from './validationUtils';

// Pricing analysis utilities
export {
  generatePricingScenarios,
  analyzeOptimalPricing,
  analyzeMarketPosition,
  calculateBreakEvenAnalysis,
  analyzePriceSensitivity,
  generatePricingRecommendations,
  type PricingScenario,
  type PricingRecommendation,
  type MarketAnalysis,
} from './pricingAnalysis';

// Utility functions for performance and async operations
export {
  debounce,
  throttle,
  once,
  delay,
  memoize,
  retry,
} from './debounce';

// Storage utilities
export {
  Storage,
  storage,
  profitStorage,
  type StorageOptions,
  type StorageItem,
} from './storage';