import axios, { AxiosResponse } from 'axios';
import { APIResponse, ProductData, ErrorCodes } from '../types';
import { setupAllInterceptors } from './interceptors';
import { errorMonitoringService } from './errorMonitoring';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://calculadora-de-margem.onrender.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Setup all interceptors
setupAllInterceptors(apiClient);

// API Error class
export class APIError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;
  public timestamp: string;
  public requestId?: string;

  constructor(
    message: string, 
    statusCode: number = 500, 
    code: string = ErrorCodes.INTERNAL_ERROR, 
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;

    // Log error to monitoring service
    errorMonitoringService.captureError(this, {
      statusCode,
      code,
      details,
      requestId,
    });
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      stack: this.stack,
    };
  }
}

// Product search interface
export interface ProductSearchRequest {
  productCode: string;
  date?: string;
}

// Connection status interface
export interface ConnectionStatus {
  connected: boolean;
  message: string;
  timestamp: string;
}

// Health status interface
export interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  version: string;
}

// Search statistics interface
export interface SearchStats {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  averageResponseTime: number;
  lastSearch: string | null;
  popularProducts: string[];
}

// API service class
export class ApiService {
  /**
   * Search for a product in OMIE
   */
  static async searchProduct(request: ProductSearchRequest): Promise<ProductData> {
    const startTime = performance.now();
    let requestId: string | undefined;

    try {
      console.log('[ApiService] Searching product:', request);
      
      // Add breadcrumb for debugging
      errorMonitoringService.addBreadcrumb(
        'Product search started',
        'api',
        { productCode: request.productCode, hasDate: !!request.date }
      );

      const response: AxiosResponse<APIResponse<ProductData>> = await apiClient.post(
        '/product/search',
        request
      );

      requestId = response.headers['x-request-id'];
      const duration = performance.now() - startTime;

      console.log('[ApiService] Search response:', response.status, response.data);

      // Log performance
      errorMonitoringService.capturePerformance('product_search', duration, {
        statusCode: response.status,
        productCode: request.productCode,
        requestId,
      });

      if (!response.data.success) {
        throw new APIError(
          response.data.error || 'Product search failed',
          response.status,
          response.data.code || ErrorCodes.INTERNAL_ERROR,
          response.data,
          requestId
        );
      }

      if (!response.data.data) {
        throw new APIError(
          'No product data received',
          response.status,
          ErrorCodes.INTERNAL_ERROR,
          response.data,
          requestId
        );
      }

      // Add success breadcrumb
      errorMonitoringService.addBreadcrumb(
        'Product search completed successfully',
        'api',
        { productCode: request.productCode, duration }
      );

      return response.data.data;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      console.error('[ApiService] Search error:', error);

      // Add error breadcrumb
      errorMonitoringService.addBreadcrumb(
        'Product search failed',
        'api',
        { productCode: request.productCode, duration, error: error.message }
      );

      // Re-throw APIError instances
      if (error instanceof APIError) {
        throw error;
      }

      // Handle axios errors
      if (error.response) {
        const errorData = error.response.data;
        requestId = error.response.headers['x-request-id'];
        
        let errorCode = ErrorCodes.INTERNAL_ERROR;
        let errorMessage = 'Server error';

        // Map HTTP status codes to error codes
        switch (error.response.status) {
          case 400:
            errorCode = ErrorCodes.VALIDATION_ERROR;
            errorMessage = errorData?.error || 'Invalid request data';
            break;
          case 404:
            errorCode = ErrorCodes.PRODUCT_NOT_FOUND;
            errorMessage = errorData?.error || 'Product not found';
            break;
          case 408:
            errorCode = ErrorCodes.TIMEOUT_ERROR;
            errorMessage = 'Request timeout';
            break;
          case 429:
            errorCode = ErrorCodes.RATE_LIMIT_ERROR;
            errorMessage = 'Too many requests';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorCode = ErrorCodes.SERVER_ERROR;
            errorMessage = 'Server error';
            break;
          default:
            errorMessage = errorData?.error || 'Server error';
        }

        throw new APIError(
          errorMessage,
          error.response.status,
          errorCode,
          errorData,
          requestId
        );
      }

      if (error.request) {
        // Network error
        throw new APIError(
          'Unable to connect to server. Please check your internet connection.',
          0,
          ErrorCodes.NETWORK_ERROR,
          { request: error.request },
          requestId
        );
      }

      if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new APIError(
          'Request timeout. Please try again.',
          408,
          ErrorCodes.TIMEOUT_ERROR,
          { timeout: true },
          requestId
        );
      }

      // Unknown error
      throw new APIError(
        error.message || 'Unexpected error occurred',
        500,
        ErrorCodes.INTERNAL_ERROR,
        { originalError: error },
        requestId
      );
    }
  }

  /**
   * Test API connection to OMIE
   */
  static async testConnection(): Promise<ConnectionStatus> {
    try {
      const response = await apiClient.get('/product/test-connection');
      return {
        connected: response.data.connected === true,
        message: response.data.message || 'Connection test completed',
        timestamp: response.data.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[ApiService] Connection test failed:', error);
      return {
        connected: false,
        message: 'Failed to test connection',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get API health status
   */
  static async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error: any) {
      console.error('[ApiService] Health check failed:', error);
      throw new APIError(
        'Health check failed',
        error.response?.status || 503,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  /**
   * Get search statistics
   */
  static async getSearchStats(): Promise<SearchStats> {
    try {
      const response = await apiClient.get('/product/stats');
      return response.data.data;
    } catch (error: any) {
      console.error('[ApiService] Get stats failed:', error);
      throw new APIError(
        'Failed to get search statistics',
        error.response?.status || 503,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  /**
   * Get API information
   */
  static async getApiInfo(): Promise<any> {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error: any) {
      console.error('[ApiService] Get API info failed:', error);
      throw new APIError(
        'Failed to get API information',
        error.response?.status || 503,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  /**
   * Check if API is available
   */
  static async isApiAvailable(): Promise<boolean> {
    try {
      await ApiService.getHealthStatus();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get formatted error message for user display
   */
  static getErrorMessage(error: any): string {
    if (error instanceof APIError) {
      switch (error.code) {
        case ErrorCodes.PRODUCT_NOT_FOUND:
          return 'Produto não encontrado no OMIE';
        case ErrorCodes.VALIDATION_ERROR:
          return `Erro de validação: ${error.message}`;
        case ErrorCodes.OMIE_API_ERROR:
          return 'Erro na API do OMIE. Tente novamente em alguns instantes.';
        default:
          return error.message || 'Erro desconhecido';
      }
    }

    return 'Erro inesperado. Verifique sua conexão e tente novamente.';
  }

  /**
   * Retry a request with exponential backoff
   */
  static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on validation errors or not found errors
        if (error instanceof APIError &&
          (error.code === ErrorCodes.VALIDATION_ERROR ||
            error.code === ErrorCodes.PRODUCT_NOT_FOUND)) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[ApiService] Retry attempt ${attempt} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export default ApiService;
