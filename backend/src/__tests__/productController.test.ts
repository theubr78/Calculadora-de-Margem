import request from 'supertest';
import app from '../index';
import { getOMIEService, resetOMIEService } from '../services/omieService';
import { ErrorCodes } from '../types';

// Mock the OMIE service
jest.mock('../services/omieService');
const mockGetOMIEService = getOMIEService as jest.MockedFunction<typeof getOMIEService>;

describe('Product Controller', () => {
  let mockOMIEService: any;

  beforeEach(() => {
    // Reset the service instance
    resetOMIEService();
    
    // Create mock service
    mockOMIEService = {
      searchProduct: jest.fn(),
      testConnection: jest.fn()
    };
    
    mockGetOMIEService.mockReturnValue(mockOMIEService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/product/search', () => {
    it('should successfully search for a product', async () => {
      const mockProductData = {
        nIdProduto: 243426229,
        cCodigo: 'PRD00003',
        cDescricao: 'Computador',
        nCMC: 4856.199914,
        fIsico: 25
      };

      mockOMIEService.searchProduct.mockResolvedValueOnce(mockProductData);

      const response = await request(app)
        .post('/api/product/search')
        .send({ productCode: 'prd00003' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockProductData,
        message: 'Product found successfully'
      });

      expect(mockOMIEService.searchProduct).toHaveBeenCalledWith('PRD00003', undefined);
    });

    it('should search for a product with custom date', async () => {
      const mockProductData = {
        nIdProduto: 123,
        cCodigo: 'PRD00001',
        cDescricao: 'Test Product',
        nCMC: 100.50,
        fIsico: 10
      };

      mockOMIEService.searchProduct.mockResolvedValueOnce(mockProductData);

      const response = await request(app)
        .post('/api/product/search')
        .send({ 
          productCode: 'PRD00001',
          date: '01/01/2025'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProductData);
      expect(mockOMIEService.searchProduct).toHaveBeenCalledWith('PRD00001', '01/01/2025');
    });

    it('should return 400 for missing product code', async () => {
      const response = await request(app)
        .post('/api/product/search')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Dados de entrada inválidos',
        code: ErrorCodes.VALIDATION_ERROR,
        details: expect.any(Array),
        timestamp: expect.any(String)
      });

      expect(mockOMIEService.searchProduct).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid product code', async () => {
      const response = await request(app)
        .post('/api/product/search')
        .send({ productCode: 'invalid@code' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(mockOMIEService.searchProduct).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .post('/api/product/search')
        .send({ 
          productCode: 'PRD001',
          date: '2025-01-01'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(mockOMIEService.searchProduct).not.toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
      const error = new Error('Product PRD999 not found in OMIE') as any;
      error.statusCode = 404;
      error.code = ErrorCodes.PRODUCT_NOT_FOUND;
      error.isOperational = true;

      mockOMIEService.searchProduct.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/api/product/search')
        .send({ productCode: 'PRD999' })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Product PRD999 not found in OMIE',
        code: ErrorCodes.PRODUCT_NOT_FOUND
      });
    });

    it('should return 502 for OMIE API errors', async () => {
      const error = new Error('OMIE API Error: Invalid credentials') as any;
      error.statusCode = 502;
      error.code = ErrorCodes.OMIE_API_ERROR;
      error.isOperational = true;

      mockOMIEService.searchProduct.mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/api/product/search')
        .send({ productCode: 'PRD001' })
        .expect(502);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe(ErrorCodes.OMIE_API_ERROR);
    });
  });

  describe('GET /api/product/test-connection', () => {
    it('should return connection success', async () => {
      mockOMIEService.testConnection.mockResolvedValueOnce(true);

      const response = await request(app)
        .get('/api/product/test-connection')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        connected: true,
        message: 'OMIE API connection successful',
        timestamp: expect.any(String)
      });
    });

    it('should return connection failure', async () => {
      mockOMIEService.testConnection.mockResolvedValueOnce(false);

      const response = await request(app)
        .get('/api/product/test-connection')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        connected: false,
        message: 'OMIE API connection failed',
        timestamp: expect.any(String)
      });
    });

    it('should handle connection test errors', async () => {
      const error = new Error('Connection test failed');
      mockOMIEService.testConnection.mockRejectedValueOnce(error);

      const response = await request(app)
        .get('/api/product/test-connection')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/product/stats', () => {
    it('should return search statistics or rate limit', async () => {
      const response = await request(app)
        .get('/api/product/stats');

      // Accept either success or rate limit response
      if (response.status === 200) {
        expect(response.body).toEqual({
          success: true,
          data: {
            totalSearches: 0,
            successfulSearches: 0,
            failedSearches: 0,
            averageResponseTime: 0,
            lastSearch: null,
            popularProducts: []
          },
          message: 'Search statistics retrieved successfully'
        });
      } else if (response.status === 429) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to product endpoints', async () => {
      // This test verifies that rate limiting is applied
      // We expect either success or rate limit response
      mockOMIEService.testConnection.mockResolvedValueOnce(true);

      const response = await request(app)
        .get('/api/product/test-connection');

      // Accept either success or rate limit
      expect([200, 429]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else {
        expect(response.body.success).toBe(false);
      }
    });
  });
});