import axios from 'axios';
import { ApiService, APIError } from '../api';
import { ProductData, ErrorCodes } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProductData: ProductData = {
    codigo_produto: 'PRD001',
    cDescricao: 'Produto Teste',
    nValorUnitario: 100.50,
    cCodigo: 'PRD001',
    nCodProd: 12345,
    cEAN: '1234567890123',
    cNCM: '12345678',
    cReducaoBaseICMS: '0',
    nPesoLiq: 1.5,
    nPesoBruto: 2.0,
    cUnidade: 'UN',
    cOrigem: '0',
    cCST: '00',
    nAliqICMS: 18,
    nAliqIPI: 0,
    nAliqPIS: 1.65,
    nAliqCOFINS: 7.6,
    cCFOP: '5102',
    cTipoItem: 'P',
    cInativo: 'N',
    dAlt: '01/01/2023',
    hAlt: '10:00:00',
    cCodCateg: 'CAT001',
    cDescricaoCategoria: 'Categoria Teste',
    cCodFamilia: 'FAM001',
    cDescricaoFamilia: 'Família Teste',
    cCodMarca: 'MAR001',
    cDescricaoMarca: 'Marca Teste',
    cObservacoes: 'Observações do produto',
    nEstoque: 100,
    nEstoqueMinimo: 10,
    nEstoqueMaximo: 1000,
    cLocalizacao: 'A1-B2-C3',
    nCustoMedio: 80.00,
    nCustoUltCompra: 85.00,
    dUltCompra: '15/12/2023',
    nPrecoVenda: 120.00,
    nMargemLucro: 20.00,
    cControlaEstoque: 'S',
    cAtivo: 'S'
  };

  describe('searchProduct', () => {
    it('should search product successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockProductData,
          timestamp: '2023-12-25T10:00:00.000Z'
        },
        status: 200,
        statusText: 'OK',
        headers: { 'x-request-id': 'test-request-id' },
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.searchProduct({
        productCode: 'PRD001'
      });

      expect(result).toEqual(mockProductData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/product/search',
        { productCode: 'PRD001' }
      );
    });

    it('should search product with date', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockProductData,
          timestamp: '2023-12-25T10:00:00.000Z'
        },
        status: 200,
        statusText: 'OK',
        headers: { 'x-request-id': 'test-request-id' },
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.searchProduct({
        productCode: 'PRD001',
        date: '25/12/2023'
      });

      expect(result).toEqual(mockProductData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/product/search',
        { productCode: 'PRD001', date: '25/12/2023' }
      );
    });

    it('should handle API error response', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            error: 'Produto não encontrado',
            code: ErrorCodes.PRODUCT_NOT_FOUND
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        ApiService.searchProduct({ productCode: 'INVALID' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'INVALID' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(404);
        expect((error as APIError).code).toBe(ErrorCodes.PRODUCT_NOT_FOUND);
        expect((error as APIError).message).toBe('Produto não encontrado');
      }
    });

    it('should handle network error', async () => {
      const mockError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(0);
        expect((error as APIError).code).toBe(ErrorCodes.NETWORK_ERROR);
      }
    });

    it('should handle timeout error', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(408);
        expect((error as APIError).code).toBe(ErrorCodes.TIMEOUT_ERROR);
      }
    });

    it('should handle unsuccessful API response', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: 'Internal server error',
          code: ErrorCodes.INTERNAL_ERROR
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toBe('Internal server error');
        expect((error as APIError).code).toBe(ErrorCodes.INTERNAL_ERROR);
      }
    });

    it('should handle missing data in response', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toBe('No product data received');
        expect((error as APIError).code).toBe(ErrorCodes.INTERNAL_ERROR);
      }
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockResponse = {
        data: {
          connected: true,
          message: 'Connection successful',
          timestamp: '2023-12-25T10:00:00.000Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.testConnection();

      expect(result).toEqual({
        connected: true,
        message: 'Connection successful',
        timestamp: '2023-12-25T10:00:00.000Z'
      });
      expect(mockedAxios.get).toHaveBeenCalledWith('/product/test-connection');
    });

    it('should handle connection failure', async () => {
      const mockError = {
        response: {
          status: 503,
          data: {
            connected: false,
            message: 'Service unavailable'
          }
        }
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);

      const result = await ApiService.testConnection();

      expect(result).toEqual({
        connected: false,
        message: 'Failed to test connection',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getHealthStatus', () => {
    it('should get health status successfully', async () => {
      const mockHealthData = {
        status: 'ok',
        timestamp: '2023-12-25T10:00:00.000Z',
        environment: 'test',
        uptime: 12345,
        memory: { used: 100, total: 1000 },
        version: '1.0.0'
      };

      const mockResponse = {
        data: mockHealthData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getHealthStatus();

      expect(result).toEqual(mockHealthData);
      expect(mockedAxios.get).toHaveBeenCalledWith('/health');
    });

    it('should handle health check failure', async () => {
      const mockError = {
        response: {
          status: 503,
          data: { error: 'Service unavailable' }
        }
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(ApiService.getHealthStatus()).rejects.toThrow(APIError);
    });
  });

  describe('getSearchStats', () => {
    it('should get search statistics successfully', async () => {
      const mockStatsData = {
        totalSearches: 100,
        successfulSearches: 95,
        failedSearches: 5,
        averageResponseTime: 250,
        lastSearch: '2023-12-25T10:00:00.000Z',
        popularProducts: ['PRD001', 'PRD002']
      };

      const mockResponse = {
        data: { data: mockStatsData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.getSearchStats();

      expect(result).toEqual(mockStatsData);
      expect(mockedAxios.get).toHaveBeenCalledWith('/product/stats');
    });
  });

  describe('isApiAvailable', () => {
    it('should return true when API is available', async () => {
      const mockResponse = {
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.isApiAvailable();

      expect(result).toBe(true);
    });

    it('should return false when API is not available', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiService.isApiAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return formatted message for APIError', () => {
      const apiError = new APIError(
        'Test error',
        404,
        ErrorCodes.PRODUCT_NOT_FOUND
      );

      const message = ApiService.getErrorMessage(apiError);

      expect(message).toBe('Produto não encontrado no OMIE');
    });

    it('should return formatted message for validation error', () => {
      const apiError = new APIError(
        'Invalid input',
        400,
        ErrorCodes.VALIDATION_ERROR
      );

      const message = ApiService.getErrorMessage(apiError);

      expect(message).toBe('Erro de validação: Invalid input');
    });

    it('should return formatted message for OMIE API error', () => {
      const apiError = new APIError(
        'OMIE service error',
        502,
        ErrorCodes.OMIE_API_ERROR
      );

      const message = ApiService.getErrorMessage(apiError);

      expect(message).toBe('Erro na API do OMIE. Tente novamente em alguns instantes.');
    });

    it('should return default message for unknown error', () => {
      const error = new Error('Unknown error');

      const message = ApiService.getErrorMessage(error);

      expect(message).toBe('Erro inesperado. Verifique sua conexão e tente novamente.');
    });
  });

  describe('retryRequest', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await ApiService.retryRequest(mockFn, 3, 100);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const result = await ApiService.retryRequest(mockFn, 3, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry validation errors', async () => {
      const validationError = new APIError(
        'Validation failed',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
      const mockFn = jest.fn().mockRejectedValue(validationError);

      await expect(
        ApiService.retryRequest(mockFn, 3, 10)
      ).rejects.toThrow(validationError);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry product not found errors', async () => {
      const notFoundError = new APIError(
        'Product not found',
        404,
        ErrorCodes.PRODUCT_NOT_FOUND
      );
      const mockFn = jest.fn().mockRejectedValue(notFoundError);

      await expect(
        ApiService.retryRequest(mockFn, 3, 10)
      ).rejects.toThrow(notFoundError);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent failure');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(
        ApiService.retryRequest(mockFn, 2, 10)
      ).rejects.toThrow(error);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('APIError class', () => {
    it('should create APIError with all properties', () => {
      const error = new APIError(
        'Test error',
        404,
        ErrorCodes.PRODUCT_NOT_FOUND,
        { additional: 'data' },
        'request-123'
      );

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe(ErrorCodes.PRODUCT_NOT_FOUND);
      expect(error.details).toEqual({ additional: 'data' });
      expect(error.requestId).toBe('request-123');
      expect(error.timestamp).toBeDefined();
      expect(error.name).toBe('APIError');
    });

    it('should create APIError with default values', () => {
      const error = new APIError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR);
      expect(error.details).toBeUndefined();
      expect(error.requestId).toBeUndefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new APIError(
        'Test error',
        404,
        ErrorCodes.PRODUCT_NOT_FOUND,
        { test: 'data' },
        'req-123'
      );

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'APIError',
        message: 'Test error',
        statusCode: 404,
        code: ErrorCodes.PRODUCT_NOT_FOUND,
        details: { test: 'data' },
        timestamp: error.timestamp,
        requestId: 'req-123',
        stack: error.stack,
      });
    });
  });
});