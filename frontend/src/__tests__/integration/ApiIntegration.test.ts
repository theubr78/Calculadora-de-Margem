import axios from 'axios';
import { ApiService, APIError } from '../../services/api';
import { ProductData, ErrorCodes } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup axios defaults
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  const mockProductData: ProductData = {
    codigo_produto: 'PRD001',
    cDescricao: 'Produto Integração',
    nValorUnitario: 100.00,
    cCodigo: 'PRD001',
    nCodProd: 12345,
    cEAN: '1234567890123',
    cNCM: '12345678',
    cReducaoBaseICMS: '0',
    nPesoLiq: 1.0,
    nPesoBruto: 1.5,
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
    cDescricaoCategoria: 'Categoria',
    cCodFamilia: 'FAM001',
    cDescricaoFamilia: 'Família',
    cCodMarca: 'MAR001',
    cDescricaoMarca: 'Marca',
    cObservacoes: 'Observações',
    nEstoque: 100,
    nEstoqueMinimo: 10,
    nEstoqueMaximo: 1000,
    cLocalizacao: 'A1-B2',
    nCustoMedio: 80.00,
    nCustoUltCompra: 85.00,
    dUltCompra: '15/12/2023',
    nPrecoVenda: 120.00,
    nMargemLucro: 20.00,
    cControlaEstoque: 'S',
    cAtivo: 'S'
  };

  describe('Product Search Integration', () => {
    it('should handle complete search workflow with OMIE API simulation', async () => {
      // Simulate OMIE API response structure
      const omieApiResponse = {
        data: {
          success: true,
          data: mockProductData,
          timestamp: '2023-12-25T10:00:00.000Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {
          'x-request-id': 'req-12345',
          'content-type': 'application/json'
        },
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(omieApiResponse);

      const result = await ApiService.searchProduct({
        productCode: 'PRD001'
      });

      expect(result).toEqual(mockProductData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/product/search',
        { productCode: 'PRD001' }
      );
    });

    it('should handle OMIE API rate limiting', async () => {
      const rateLimitResponse = {
        response: {
          status: 429,
          data: {
            success: false,
            error: 'Rate limit exceeded',
            code: ErrorCodes.RATE_LIMIT_ERROR,
            retryAfter: 60
          },
          headers: {
            'retry-after': '60',
            'x-ratelimit-remaining': '0'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(rateLimitResponse);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(429);
        expect((error as APIError).code).toBe(ErrorCodes.RATE_LIMIT_ERROR);
      }
    });

    it('should handle OMIE API authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: {
            success: false,
            error: 'Invalid credentials',
            code: ErrorCodes.OMIE_API_ERROR
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(authError);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);
    });

    it('should handle OMIE API service unavailable', async () => {
      const serviceUnavailable = {
        response: {
          status: 503,
          data: {
            success: false,
            error: 'Service temporarily unavailable',
            code: ErrorCodes.SERVER_ERROR
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(serviceUnavailable);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);

      try {
        await ApiService.searchProduct({ productCode: 'PRD001' });
      } catch (error) {
        expect((error as APIError).statusCode).toBe(503);
        expect((error as APIError).code).toBe(ErrorCodes.SERVER_ERROR);
      }
    });

    it('should handle malformed OMIE API responses', async () => {
      const malformedResponse = {
        data: {
          // Missing success field
          data: null,
          timestamp: '2023-12-25T10:00:00.000Z'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce(malformedResponse);

      await expect(
        ApiService.searchProduct({ productCode: 'PRD001' })
      ).rejects.toThrow(APIError);
    });

    it('should handle OMIE API timeout with retry mechanism', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      // First call times out, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: mockProductData,
            timestamp: '2023-12-25T10:00:00.000Z'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {}
        });

      const result = await ApiService.retryRequest(
        () => ApiService.searchProduct({ productCode: 'PRD001' }),
        2,
        100
      );

      expect(result).toEqual(mockProductData);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Connection Testing Integration', () => {
    it('should test connection to backend and OMIE', async () => {
      const connectionResponse = {
        data: {
          connected: true,
          message: 'Connection to OMIE API successful',
          timestamp: '2023-12-25T10:00:00.000Z',
          omieStatus: 'online',
          responseTime: 250
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(connectionResponse);

      const result = await ApiService.testConnection();

      expect(result.connected).toBe(true);
      expect(result.message).toContain('OMIE API successful');
      expect(mockedAxios.get).toHaveBeenCalledWith('/product/test-connection');
    });

    it('should handle backend connection failure', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.get.mockRejectedValueOnce(networkError);

      const result = await ApiService.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toBe('Failed to test connection');
    });

    it('should handle OMIE connection failure through backend', async () => {
      const omieConnectionError = {
        data: {
          connected: false,
          message: 'Failed to connect to OMIE API',
          timestamp: '2023-12-25T10:00:00.000Z',
          omieStatus: 'offline',
          error: 'OMIE API unreachable'
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(omieConnectionError);

      const result = await ApiService.testConnection();

      expect(result.connected).toBe(false);
      expect(result.message).toContain('Failed to connect to OMIE API');
    });
  });

  describe('Health Status Integration', () => {
    it('should get comprehensive health status', async () => {
      const healthResponse = {
        data: {
          status: 'ok',
          timestamp: '2023-12-25T10:00:00.000Z',
          environment: 'production',
          uptime: 86400,
          memory: {
            used: 512,
            total: 2048
          },
          version: '1.0.0',
          services: {
            omie: {
              status: 'online',
              responseTime: 200,
              lastCheck: '2023-12-25T09:59:00.000Z'
            },
            database: {
              status: 'online',
              connections: 5,
              maxConnections: 100
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(healthResponse);

      const result = await ApiService.getHealthStatus();

      expect(result.status).toBe('ok');
      expect(result.services.omie.status).toBe('online');
      expect(result.services.database.status).toBe('online');
    });

    it('should handle degraded health status', async () => {
      const degradedHealthResponse = {
        data: {
          status: 'degraded',
          timestamp: '2023-12-25T10:00:00.000Z',
          environment: 'production',
          uptime: 86400,
          memory: {
            used: 1800,
            total: 2048
          },
          version: '1.0.0',
          services: {
            omie: {
              status: 'slow',
              responseTime: 5000,
              lastCheck: '2023-12-25T09:59:00.000Z'
            },
            database: {
              status: 'online',
              connections: 95,
              maxConnections: 100
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(degradedHealthResponse);

      const result = await ApiService.getHealthStatus();

      expect(result.status).toBe('degraded');
      expect(result.services.omie.status).toBe('slow');
    });
  });

  describe('Statistics Integration', () => {
    it('should get search statistics with analytics', async () => {
      const statsResponse = {
        data: {
          data: {
            totalSearches: 1500,
            successfulSearches: 1425,
            failedSearches: 75,
            averageResponseTime: 350,
            lastSearch: '2023-12-25T09:55:00.000Z',
            popularProducts: ['PRD001', 'PRD002', 'PRD003'],
            searchesByHour: [
              { hour: '09:00', count: 45 },
              { hour: '10:00', count: 52 },
              { hour: '11:00', count: 38 }
            ],
            errorBreakdown: {
              'PRODUCT_NOT_FOUND': 45,
              'NETWORK_ERROR': 20,
              'TIMEOUT_ERROR': 10
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      mockedAxios.get.mockResolvedValueOnce(statsResponse);

      const result = await ApiService.getSearchStats();

      expect(result.totalSearches).toBe(1500);
      expect(result.successfulSearches).toBe(1425);
      expect(result.popularProducts).toHaveLength(3);
      expect(result.searchesByHour).toHaveLength(3);
      expect(result.errorBreakdown).toHaveProperty('PRODUCT_NOT_FOUND');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network connectivity issues', async () => {
      // Simulate various network issues
      const networkErrors = [
        { code: 'ENOTFOUND', message: 'DNS lookup failed' },
        { code: 'ECONNREFUSED', message: 'Connection refused' },
        { code: 'ETIMEDOUT', message: 'Connection timeout' },
        { request: {}, message: 'Network Error' }
      ];

      for (const error of networkErrors) {
        mockedAxios.post.mockRejectedValueOnce(error);

        await expect(
          ApiService.searchProduct({ productCode: 'PRD001' })
        ).rejects.toThrow(APIError);

        try {
          await ApiService.searchProduct({ productCode: 'PRD001' });
        } catch (apiError) {
          expect(apiError).toBeInstanceOf(APIError);
          if (error.code === 'ETIMEDOUT') {
            expect((apiError as APIError).code).toBe(ErrorCodes.TIMEOUT_ERROR);
          } else {
            expect((apiError as APIE