import { ProfitResult } from '../types';

/**
 * Calculate profit margin and amount
 */
export const calculateProfit = (costPrice: number, salePrice: number): ProfitResult => {
  // Validate inputs
  if (salePrice <= 0) {
    return {
      salePrice,
      profitMargin: 0,
      profitAmount: 0,
      isProfit: false,
    };
  }

  // Calculate profit amount
  const profitAmount = salePrice - costPrice;
  
  // Calculate profit margin percentage
  const profitMargin = (profitAmount / salePrice) * 100;
  
  // Determine if it's profit or loss
  const isProfit = profitAmount > 0;

  return {
    salePrice,
    profitMargin,
    profitAmount,
    isProfit,
  };
};

/**
 * Calculate break-even price (cost price)
 */
export const calculateBreakEvenPrice = (costPrice: number): number => {
  return costPrice;
};

/**
 * Calculate price for desired margin
 */
export const calculatePriceForMargin = (costPrice: number, desiredMargin: number): number => {
  if (desiredMargin >= 100) {
    throw new Error('Margin cannot be 100% or higher');
  }
  
  if (desiredMargin < 0) {
    throw new Error('Margin cannot be negative');
  }
  
  // Formula: Price = Cost / (1 - Margin/100)
  return costPrice / (1 - desiredMargin / 100);
};

/**
 * Calculate price for desired markup
 */
export const calculatePriceForMarkup = (costPrice: number, markup: number): number => {
  if (markup < 0) {
    throw new Error('Markup cannot be negative');
  }
  
  // Formula: Price = Cost * (1 + Markup/100)
  return costPrice * (1 + markup / 100);
};

/**
 * Calculate markup from margin
 */
export const calculateMarkupFromMargin = (margin: number): number => {
  if (margin >= 100) {
    throw new Error('Margin cannot be 100% or higher');
  }
  
  if (margin <= -100) {
    throw new Error('Margin cannot be -100% or lower');
  }
  
  // Formula: Markup = Margin / (100 - Margin) * 100
  return (margin / (100 - margin)) * 100;
};

/**
 * Calculate margin from markup
 */
export const calculateMarginFromMarkup = (markup: number): number => {
  if (markup < -100) {
    throw new Error('Markup cannot be less than -100%');
  }
  
  // Formula: Margin = Markup / (100 + Markup) * 100
  return (markup / (100 + markup)) * 100;
};

/**
 * Calculate volume needed for target profit
 */
export const calculateVolumeForTargetProfit = (
  costPrice: number,
  salePrice: number,
  targetProfit: number,
  fixedCosts: number = 0
): number => {
  const unitProfit = salePrice - costPrice;
  
  if (unitProfit <= 0) {
    throw new Error('Sale price must be higher than cost price');
  }
  
  // Formula: Volume = (Target Profit + Fixed Costs) / Unit Profit
  return Math.ceil((targetProfit + fixedCosts) / unitProfit);
};

/**
 * Calculate discount impact on profit
 */
export const calculateDiscountImpact = (
  costPrice: number,
  originalPrice: number,
  discountPercent: number
): {
  discountedPrice: number;
  originalProfit: ProfitResult;
  discountedProfit: ProfitResult;
  profitLoss: number;
} => {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0% and 100%');
  }
  
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const originalProfit = calculateProfit(costPrice, originalPrice);
  const discountedProfit = calculateProfit(costPrice, discountedPrice);
  const profitLoss = originalProfit.profitAmount - discountedProfit.profitAmount;
  
  return {
    discountedPrice,
    originalProfit,
    discountedProfit,
    profitLoss,
  };
};

/**
 * Calculate competitive pricing analysis
 */
export const calculateCompetitivePricing = (
  costPrice: number,
  competitorPrices: number[]
): {
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  avgCompetitorPrice: number;
  medianCompetitorPrice: number;
  recommendedPrice: number;
  marginAtRecommended: number;
} => {
  if (competitorPrices.length === 0) {
    throw new Error('At least one competitor price is required');
  }
  
  const sortedPrices = [...competitorPrices].sort((a, b) => a - b);
  const minPrice = sortedPrices[0];
  const maxPrice = sortedPrices[sortedPrices.length - 1];
  const avgPrice = sortedPrices.reduce((sum, price) => sum + price, 0) / sortedPrices.length;
  
  // Calculate median
  const mid = Math.floor(sortedPrices.length / 2);
  const medianPrice = sortedPrices.length % 2 === 0
    ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
    : sortedPrices[mid];
  
  // Recommend price slightly below average but above cost
  const recommendedPrice = Math.max(costPrice * 1.1, avgPrice * 0.95);
  const marginAtRecommended = calculateProfit(costPrice, recommendedPrice).profitMargin;
  
  return {
    minCompetitorPrice: minPrice,
    maxCompetitorPrice: maxPrice,
    avgCompetitorPrice: avgPrice,
    medianCompetitorPrice: medianPrice,
    recommendedPrice,
    marginAtRecommended,
  };
};

/**
 * Calculate price elasticity impact
 */
export const calculatePriceElasticityImpact = (
  costPrice: number,
  currentPrice: number,
  currentVolume: number,
  priceChange: number,
  elasticity: number
): {
  newPrice: number;
  newVolume: number;
  currentRevenue: number;
  newRevenue: number;
  currentProfit: number;
  newProfit: number;
  revenueChange: number;
  profitChange: number;
} => {
  const newPrice = currentPrice + priceChange;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  const volumeChangePercent = -elasticity * priceChangePercent;
  const newVolume = Math.max(0, currentVolume * (1 + volumeChangePercent / 100));
  
  const currentRevenue = currentPrice * currentVolume;
  const newRevenue = newPrice * newVolume;
  const currentProfit = (currentPrice - costPrice) * currentVolume;
  const newProfit = (newPrice - costPrice) * newVolume;
  
  return {
    newPrice,
    newVolume,
    currentRevenue,
    newRevenue,
    currentProfit,
    newProfit,
    revenueChange: newRevenue - currentRevenue,
    profitChange: newProfit - currentProfit,
  };
};

/**
 * Validate sale price input
 */
export const validateSalePrice = (price: string): { isValid: boolean; error?: string } => {
  const trimmed = price.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Preço de venda é obrigatório' };
  }

  const numericValue = parseFloat(trimmed.replace(',', '.'));
  
  if (isNaN(numericValue)) {
    return { isValid: false, error: 'Preço deve ser um número válido' };
  }

  if (numericValue < 0) {
    return { isValid: false, error: 'Preço não pode ser negativo' };
  }

  if (numericValue === 0) {
    return { isValid: false, error: 'Preço deve ser maior que zero' };
  }

  return { isValid: true };
};

/**
 * Validate product code input
 */
export const validateProductCode = (code: string): { isValid: boolean; error?: string } => {
  const trimmed = code.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Código do produto é obrigatório' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Código não pode ter mais de 50 caracteres' };
  }

  // Basic pattern validation (letters, numbers, underscore, hyphen)
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Código pode conter apenas letras, números, _ e -' };
  }

  return { isValid: true };
};