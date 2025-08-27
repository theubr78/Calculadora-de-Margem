import { ProfitResult } from '../types';
import { calculateProfit, calculatePriceForMargin, calculatePriceForMarkup } from './calculations';
import { roundToPrecision, calculateWeightedAverage } from './numberUtils';

/**
 * Pricing strategy analysis utilities
 */

export interface PricingScenario {
  name: string;
  price: number;
  profit: ProfitResult;
  volume?: number;
  totalProfit?: number;
}

export interface PricingRecommendation {
  strategy: string;
  recommendedPrice: number;
  expectedMargin: number;
  reasoning: string;
  confidence: number; // 0-100
}

export interface MarketAnalysis {
  competitorPrices: number[];
  marketPosition: 'premium' | 'competitive' | 'budget';
  priceGap: number;
  recommendation: PricingRecommendation;
}

/**
 * Generate pricing scenarios based on different strategies
 */
export const generatePricingScenarios = (
  costPrice: number,
  targetMargins: number[] = [10, 20, 30, 40, 50],
  estimatedVolumes?: number[]
): PricingScenario[] => {
  return targetMargins.map((margin, index) => {
    const price = calculatePriceForMargin(costPrice, margin);
    const profit = calculateProfit(costPrice, price);
    const volume = estimatedVolumes?.[index];
    
    return {
      name: `Margem ${margin}%`,
      price: roundToPrecision(price, 2),
      profit,
      volume,
      totalProfit: volume ? profit.profitAmount * volume : undefined,
    };
  });
};

/**
 * Analyze optimal pricing based on price elasticity
 */
export const analyzeOptimalPricing = (
  costPrice: number,
  currentPrice: number,
  currentVolume: number,
  priceElasticity: number,
  priceRange: { min: number; max: number; step: number }
): {
  scenarios: Array<{
    price: number;
    volume: number;
    revenue: number;
    profit: number;
    margin: number;
  }>;
  optimalPrice: number;
  maxProfit: number;
} => {
  const scenarios = [];
  let maxProfit = 0;
  let optimalPrice = currentPrice;
  
  for (let price = priceRange.min; price <= priceRange.max; price += priceRange.step) {
    const priceChangePercent = ((price - currentPrice) / currentPrice) * 100;
    const volumeChangePercent = -priceElasticity * priceChangePercent;
    const volume = Math.max(0, currentVolume * (1 + volumeChangePercent / 100));
    
    const revenue = price * volume;
    const profit = (price - costPrice) * volume;
    const margin = calculateProfit(costPrice, price).profitMargin;
    
    scenarios.push({
      price: roundToPrecision(price, 2),
      volume: Math.round(volume),
      revenue: roundToPrecision(revenue, 2),
      profit: roundToPrecision(profit, 2),
      margin: roundToPrecision(margin, 2),
    });
    
    if (profit > maxProfit) {
      maxProfit = profit;
      optimalPrice = price;
    }
  }
  
  return {
    scenarios,
    optimalPrice: roundToPrecision(optimalPrice, 2),
    maxProfit: roundToPrecision(maxProfit, 2),
  };
};

/**
 * Analyze market positioning based on competitor prices
 */
export const analyzeMarketPosition = (
  costPrice: number,
  competitorPrices: number[]
): MarketAnalysis => {
  if (competitorPrices.length === 0) {
    throw new Error('At least one competitor price is required');
  }
  
  const sortedPrices = [...competitorPrices].sort((a, b) => a - b);
  const minPrice = sortedPrices[0];
  const maxPrice = sortedPrices[sortedPrices.length - 1];
  const avgPrice = sortedPrices.reduce((sum, price) => sum + price, 0) / sortedPrices.length;
  
  // Determine market position strategy
  let strategy: string;
  let recommendedPrice: number;
  let reasoning: string;
  let confidence: number;
  let marketPosition: 'premium' | 'competitive' | 'budget';
  
  const minMargin = calculateProfit(costPrice, minPrice).profitMargin;
  const avgMargin = calculateProfit(costPrice, avgPrice).profitMargin;
  
  if (minMargin < 10) {
    // Market is very competitive, recommend premium positioning
    strategy = 'Premium Positioning';
    recommendedPrice = avgPrice * 1.1;
    marketPosition = 'premium';
    reasoning = 'Mercado muito competitivo. Recomenda-se posicionamento premium com diferenciação.';
    confidence = 70;
  } else if (avgMargin > 40) {
    // High margin opportunity, recommend competitive pricing
    strategy = 'Competitive Pricing';
    recommendedPrice = avgPrice * 0.95;
    marketPosition = 'competitive';
    reasoning = 'Oportunidade de margem alta. Preço competitivo pode aumentar participação de mercado.';
    confidence = 85;
  } else {
    // Balanced market, recommend market average
    strategy = 'Market Following';
    recommendedPrice = avgPrice;
    marketPosition = 'competitive';
    reasoning = 'Mercado equilibrado. Seguir preço médio do mercado.';
    confidence = 80;
  }
  
  const expectedMargin = calculateProfit(costPrice, recommendedPrice).profitMargin;
  const priceGap = maxPrice - minPrice;
  
  return {
    competitorPrices: sortedPrices,
    marketPosition,
    priceGap: roundToPrecision(priceGap, 2),
    recommendation: {
      strategy,
      recommendedPrice: roundToPrecision(recommendedPrice, 2),
      expectedMargin: roundToPrecision(expectedMargin, 2),
      reasoning,
      confidence,
    },
  };
};

/**
 * Calculate break-even analysis
 */
export const calculateBreakEvenAnalysis = (
  costPrice: number,
  salePrice: number,
  fixedCosts: number,
  timeHorizon: number = 12 // months
): {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  monthlyBreakEven: number;
  contributionMargin: number;
  contributionMarginRatio: number;
} => {
  const contributionMargin = salePrice - costPrice;
  const contributionMarginRatio = (contributionMargin / salePrice) * 100;
  
  if (contributionMargin <= 0) {
    throw new Error('Sale price must be higher than cost price');
  }
  
  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * salePrice;
  const monthlyBreakEven = Math.ceil(breakEvenUnits / timeHorizon);
  
  return {
    breakEvenUnits,
    breakEvenRevenue: roundToPrecision(breakEvenRevenue, 2),
    monthlyBreakEven,
    contributionMargin: roundToPrecision(contributionMargin, 2),
    contributionMarginRatio: roundToPrecision(contributionMarginRatio, 2),
  };
};

/**
 * Analyze price sensitivity
 */
export const analyzePriceSensitivity = (
  costPrice: number,
  basePrice: number,
  priceChanges: number[], // percentage changes
  volumeChanges: number[] // corresponding volume changes
): {
  elasticity: number;
  sensitivity: 'low' | 'medium' | 'high';
  optimalPriceChange: number;
  recommendations: string[];
} => {
  if (priceChanges.length !== volumeChanges.length || priceChanges.length < 2) {
    throw new Error('Need at least 2 data points with matching price and volume changes');
  }
  
  // Calculate price elasticity using weighted average
  const elasticities = priceChanges.map((priceChange, index) => {
    const volumeChange = volumeChanges[index];
    return priceChange !== 0 ? volumeChange / priceChange : 0;
  });
  
  const elasticity = Math.abs(calculateWeightedAverage(elasticities, priceChanges.map(Math.abs)));
  
  let sensitivity: 'low' | 'medium' | 'high';
  let recommendations: string[] = [];
  
  if (elasticity < 0.5) {
    sensitivity = 'low';
    recommendations = [
      'Produto tem baixa sensibilidade ao preço',
      'Considere aumentos de preço para maximizar margem',
      'Foque em diferenciação e valor agregado'
    ];
  } else if (elasticity < 1.5) {
    sensitivity = 'medium';
    recommendations = [
      'Produto tem sensibilidade moderada ao preço',
      'Balance entre volume e margem',
      'Monitore concorrência de perto'
    ];
  } else {
    sensitivity = 'high';
    recommendations = [
      'Produto muito sensível ao preço',
      'Foque em eficiência de custos',
      'Considere estratégia de volume'
    ];
  }
  
  // Find optimal price change based on profit maximization
  let maxProfit = 0;
  let optimalPriceChange = 0;
  
  for (let priceChange = -20; priceChange <= 20; priceChange += 1) {
    const newPrice = basePrice * (1 + priceChange / 100);
    const volumeChange = -elasticity * priceChange;
    const newVolume = Math.max(0, 100 * (1 + volumeChange / 100)); // assume base volume of 100
    const profit = (newPrice - costPrice) * newVolume;
    
    if (profit > maxProfit) {
      maxProfit = profit;
      optimalPriceChange = priceChange;
    }
  }
  
  return {
    elasticity: roundToPrecision(elasticity, 3),
    sensitivity,
    optimalPriceChange: roundToPrecision(optimalPriceChange, 1),
    recommendations,
  };
};

/**
 * Generate pricing recommendations based on multiple factors
 */
export const generatePricingRecommendations = (
  costPrice: number,
  currentPrice: number,
  competitorPrices: number[] = [],
  targetMargin?: number,
  marketConditions?: 'growing' | 'stable' | 'declining'
): PricingRecommendation[] => {
  const recommendations: PricingRecommendation[] = [];
  
  // Cost-plus pricing
  const costPlusPrice = calculatePriceForMarkup(costPrice, 50); // 50% markup
  recommendations.push({
    strategy: 'Cost-Plus Pricing',
    recommendedPrice: roundToPrecision(costPlusPrice, 2),
    expectedMargin: calculateProfit(costPrice, costPlusPrice).profitMargin,
    reasoning: 'Baseado em markup de 50% sobre o custo',
    confidence: 70,
  });
  
  // Target margin pricing
  if (targetMargin) {
    const targetPrice = calculatePriceForMargin(costPrice, targetMargin);
    recommendations.push({
      strategy: 'Target Margin Pricing',
      recommendedPrice: roundToPrecision(targetPrice, 2),
      expectedMargin: targetMargin,
      reasoning: `Preço calculado para atingir margem de ${targetMargin}%`,
      confidence: 85,
    });
  }
  
  // Competitive pricing
  if (competitorPrices.length > 0) {
    const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
    const competitivePrice = avgCompetitorPrice * 0.98; // Slightly below average
    
    recommendations.push({
      strategy: 'Competitive Pricing',
      recommendedPrice: roundToPrecision(competitivePrice, 2),
      expectedMargin: calculateProfit(costPrice, competitivePrice).profitMargin,
      reasoning: 'Preço ligeiramente abaixo da média dos concorrentes',
      confidence: 75,
    });
  }
  
  // Market condition adjustments
  if (marketConditions) {
    let adjustmentFactor = 1;
    let reasoning = '';
    
    switch (marketConditions) {
      case 'growing':
        adjustmentFactor = 1.05;
        reasoning = 'Mercado em crescimento permite preços premium';
        break;
      case 'declining':
        adjustmentFactor = 0.95;
        reasoning = 'Mercado em declínio requer preços competitivos';
        break;
      default:
        adjustmentFactor = 1;
        reasoning = 'Mercado estável, manter preços atuais';
    }
    
    const adjustedPrice = currentPrice * adjustmentFactor;
    recommendations.push({
      strategy: 'Market Condition Pricing',
      recommendedPrice: roundToPrecision(adjustedPrice, 2),
      expectedMargin: calculateProfit(costPrice, adjustedPrice).profitMargin,
      reasoning,
      confidence: 65,
    });
  }
  
  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};