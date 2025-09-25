import axios from 'axios';
import { OMIEService } from '../services/omieService';
import { ErrorCodes } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OMIEService', () => {
  let omieService: OMIEService;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.OMIE_API_URL = 'https://app.omie.com.br/api/v1/estoque/resumo/';
    process.env.OMIE_APP_KEY = 'test_app_key';
    process.env.OMIE_APP_SECRET = 'test_app_secret';
    
    omieService = new OMIEService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if credentials are missing', () => {
      delete process.env.OMIE_APP_KEY;
      expect(() => new OMIEService()).toThrow('OMIE API credentials not configured');
    });
  });

  describe('searchProduct', () => {
    it('should successfully search for a product', async () => {
      const mockResponse = {
        data: {
          nIdProduto: 243426229,
          cCodigo: 'PRD00003',
          cDescricao: 'Computador',
          nCMC: 4856.199914,
          fIsico: 25
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await omieService.searchProduct('PRD00003');

      expect(result).toEqual({
        nIdProduto: 243426229,
        cCodigo: 'PRD00003',
        cDescricao: 'Computador',
        nCMC: 4856.199914,
        fIsico: 25
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://app.omie.com.br/api/v1/estoque/resumo/',
        expect.objectContaining({
          call: 'ObterEstoqueProduto',
          param: expect.arrayContaining([
            expect.objectContaining({
              cCodigo: 'PRD00003'
            })
          ]),
          app_key: 'test_app_key',
          app_secret: 'test_app_secret'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-type': 'application/json'
          }),
          timeout: 30000
        })
      );
    });

    it('should handle product not found error', async () => {
      const mockResponse = {
        data: {
          faultstring: 'Produto não encontrado'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(omieService.searchProduct('INVALID')).rejects.toMatchObject({
        message: 'Product INVALID not found in OMIE',
        statusCode: 404,
        code: ErrorCodes.PRODUCT_NOT_FOUND
      });
    });

    it('should handle OMIE API errors', async () => {
      const mockResponse = {
        data: {
          faultstring: 'Invalid credentials'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(omieService.searchProduct('PRD00003')).rejects.toMatchObject({
        message: 'OMIE API Error: Invalid credentials',
        statusCode: 502,
        code: ErrorCodes.OMIE_API_ERROR
      });
    });

    it('should handle network timeout', async () => {
      const timeoutError = new Error('timeout') as any;
      timeoutError.code = 'ECONNABORTED';

      mockedAxios.post.mockRejectedValueOnce(timeoutError);

      await expect(omieService.searchProduct('PRD00003')).rejects.toMatchObject({
        message: 'OMIE API request timeout',
        statusCode: 504,
        code: ErrorCodes.OMIE_API_ERROR
      });
    });

    it('should handle HTTP errors', async () => {
      const httpError = {
        response: {
          status: 500,
          data: 'Internal Server Error'
        }
      };

      mockedAxios.post.mockRejectedValueOnce(httpError);

      await expect(omieService.searchProduct('PRD00003')).rejects.toMatchObject({
        message: 'OMIE API returned status 500',
        statusCode: 502,
        code: ErrorCodes.OMIE_API_ERROR
      });
    });

    it('should handle network connection errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(omieService.searchProduct('PRD00003')).rejects.toMatchObject({
        message: 'Unable to connect to OMIE API',
        statusCode: 503,
        code: ErrorCodes.OMIE_API_ERROR
      });
    });

    it('should handle missing numeric values gracefully', async () => {
      const mockResponse = {
        data: {
          nIdProduto: 123,
          cCodigo: 'PRD00003',
          cDescricao: 'Test Product',
          nCMC: null,
          fIsico: 'invalid'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await omieService.searchProduct('PRD00003');

      expect(result).toEqual({
        nIdProduto: 123,
        cCodigo: 'PRD00003',
        cDescricao: 'Test Product',
        nCMC: 0,
        fIsico: 0
      });
    });

    it('should use custom date when provided', async () => {
      const mockResponse = {
        data: {
          nIdProduto: 123,
          cCodigo: 'PRD00003',
          cDescricao: 'Test Product',
          nCMC: 100,
          fIsico: 10
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await omieService.searchProduct('PRD00003', '01/01/2025');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          param: expect.arrayContaining([
            expect.objectContaining({
              dDia: '01/01/2025'
            })
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is working (product not found)', async () => {
      const mockResponse = {
        data: {
          faultstring: 'Produto não encontrado'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await omieService.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.post.mockRejectedValueOnce(networkError);

      const result = await omieService.testConnection();
      expect(result).toBe(false);
    });
  });
});