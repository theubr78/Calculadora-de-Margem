// Product data from OMIE API
export interface ProductData {
  nIdProduto: number;
  cCodigo: string;
  cDescricao: string;
  nCMC: number;
  fIsico: number;
}

// Profit calculation result
export interface ProfitResult {
  salePrice: number;
  profitMargin: number;
  profitAmount: number;
  isProfit: boolean;
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// Error codes from backend
export enum ErrorCodes {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_PRODUCT_CODE = 'INVALID_PRODUCT_CODE',
  OMIE_API_ERROR = 'OMIE_API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  // Client-side classification codes
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

// Form data interfaces
export interface ProductSearchForm {
  productCode: string;
  date?: string;
}

export interface ProfitCalculationForm {
  salePrice: string;
}

// Application state
export interface AppState {
  productData: ProductData | null;
  profitResult: ProfitResult | null;
  loading: boolean;
  error: Error | string | null;
}