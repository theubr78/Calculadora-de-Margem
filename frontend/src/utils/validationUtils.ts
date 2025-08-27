/**
 * Advanced validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
}

/**
 * Validate price range
 */
export const validatePriceRange = (
  price: number,
  costPrice: number,
  minMargin: number = 0,
  maxPrice?: number
): ValidationResult => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (price <= 0) {
    return {
      isValid: false,
      error: 'Preço deve ser maior que zero',
    };
  }
  
  if (price < costPrice) {
    return {
      isValid: false,
      error: 'Preço de venda não pode ser menor que o custo',
      suggestions: [`Preço mínimo sugerido: R$ ${costPrice.toFixed(2)}`],
    };
  }
  
  const margin = ((price - costPrice) / price) * 100;
  
  if (margin < minMargin) {
    warnings.push(`Margem de ${margin.toFixed(2)}% está abaixo do mínimo de ${minMargin}%`);
  }
  
  if (maxPrice && price > maxPrice) {
    warnings.push(`Preço de R$ ${price.toFixed(2)} pode estar acima do mercado`);
    suggestions.push(`Considere preço máximo de R$ ${maxPrice.toFixed(2)}`);
  }
  
  if (margin > 80) {
    warnings.push('Margem muito alta pode afetar competitividade');
    suggestions.push('Considere reduzir preço para aumentar volume');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};

/**
 * Validate business rules
 */
export const validateBusinessRules = (
  costPrice: number,
  salePrice: number,
  stockQuantity: number,
  businessRules: {
    minMargin?: number;
    maxDiscount?: number;
    requiresStock?: boolean;
    seasonalAdjustment?: number;
  } = {}
): ValidationResult => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const {
    minMargin = 10,
    maxDiscount = 30,
    requiresStock = true,
    seasonalAdjustment = 0,
  } = businessRules;
  
  const margin = ((salePrice - costPrice) / salePrice) * 100;
  
  // Check minimum margin
  if (margin < minMargin) {
    return {
      isValid: false,
      error: `Margem de ${margin.toFixed(2)}% está abaixo do mínimo permitido de ${minMargin}%`,
      suggestions: [`Preço mínimo para margem de ${minMargin}%: R$ ${(costPrice / (1 - minMargin / 100)).toFixed(2)}`],
    };
  }
  
  // Check stock requirement
  if (requiresStock && stockQuantity <= 0) {
    return {
      isValid: false,
      error: 'Produto sem estoque não pode ser vendido',
      suggestions: ['Aguarde reposição do estoque ou ajuste a política de vendas'],
    };
  }
  
  // Check seasonal adjustment
  if (seasonalAdjustment !== 0) {
    const adjustedPrice = salePrice * (1 + seasonalAdjustment / 100);
    const adjustedMargin = ((adjustedPrice - costPrice) / adjustedPrice) * 100;
    
    if (seasonalAdjustment > 0) {
      suggestions.push(`Considere ajuste sazonal: R$ ${adjustedPrice.toFixed(2)} (margem: ${adjustedMargin.toFixed(2)}%)`);
    } else {
      warnings.push(`Ajuste sazonal negativo pode reduzir margem para ${adjustedMargin.toFixed(2)}%`);
    }
  }
  
  // Stock level warnings
  if (stockQuantity < 10) {
    warnings.push('Estoque baixo - considere reposição');
  }
  
  if (stockQuantity > 1000) {
    suggestions.push('Alto estoque - considere promoções para acelerar giro');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};

/**
 * Validate pricing strategy consistency
 */
export const validatePricingStrategy = (
  scenarios: Array<{ price: number; margin: number; volume?: number }>,
  strategy: 'volume' | 'margin' | 'balanced'
): ValidationResult => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (scenarios.length === 0) {
    return {
      isValid: false,
      error: 'Pelo menos um cenário é necessário',
    };
  }
  
  const margins = scenarios.map(s => s.margin);
  const avgMargin = margins.reduce((sum, margin) => sum + margin, 0) / margins.length;
  const maxMargin = Math.max(...margins);
  const minMargin = Math.min(...margins);
  
  switch (strategy) {
    case 'volume':
      if (avgMargin > 30) {
        warnings.push('Margens altas podem prejudicar estratégia de volume');
        suggestions.push('Considere reduzir preços para aumentar volume');
      }
      break;
      
    case 'margin':
      if (avgMargin < 25) {
        warnings.push('Margens baixas não são ideais para estratégia de margem');
        suggestions.push('Considere aumentar preços ou reduzir custos');
      }
      break;
      
    case 'balanced':
      if (maxMargin - minMargin > 40) {
        warnings.push('Grande variação de margens pode confundir estratégia');
        suggestions.push('Mantenha margens mais consistentes entre cenários');
      }
      break;
  }
  
  // General recommendations
  if (scenarios.some(s => s.margin < 0)) {
    return {
      isValid: false,
      error: 'Cenários com prejuízo detectados',
      suggestions: ['Revise custos ou ajuste preços para evitar prejuízos'],
    };
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};

/**
 * Validate input format and range
 */
export const validateNumericInput = (
  value: string,
  options: {
    min?: number;
    max?: number;
    allowNegative?: boolean;
    allowZero?: boolean;
    maxDecimals?: number;
  } = {}
): ValidationResult => {
  const {
    min,
    max,
    allowNegative = false,
    allowZero = false,
    maxDecimals = 2,
  } = options;
  
  const trimmed = value.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Valor é obrigatório',
    };
  }
  
  // Parse number (handle Brazilian format)
  const numericValue = parseFloat(trimmed.replace(',', '.'));
  
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: 'Valor deve ser um número válido',
      suggestions: ['Use formato: 1234,56 ou 1234.56'],
    };
  }
  
  if (!allowNegative && numericValue < 0) {
    return {
      isValid: false,
      error: 'Valor não pode ser negativo',
    };
  }
  
  if (!allowZero && numericValue === 0) {
    return {
      isValid: false,
      error: 'Valor deve ser maior que zero',
    };
  }
  
  if (min !== undefined && numericValue < min) {
    return {
      isValid: false,
      error: `Valor deve ser maior ou igual a ${min}`,
    };
  }
  
  if (max !== undefined && numericValue > max) {
    return {
      isValid: false,
      error: `Valor deve ser menor ou igual a ${max}`,
    };
  }
  
  // Check decimal places
  const decimalPlaces = (trimmed.split(/[,.]/).pop() || '').length;
  if (decimalPlaces > maxDecimals) {
    return {
      isValid: false,
      error: `Máximo ${maxDecimals} casas decimais permitidas`,
    };
  }
  
  return { isValid: true };
};