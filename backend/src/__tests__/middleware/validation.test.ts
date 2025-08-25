import { Request, Response, NextFunction } from 'express';
import {
  sanitizeString,
  validateProductCode,
  validateDate,
  validatePrice,
  validatePercentage,
  handleValidationErrors,
  sanitizeRequestBody,
  validateRateLimit,
  validateContentType,
  validateRequestSize
} from '../../middleware/validation';
import { validationResult } from 'express-validator';

// Mock apenas validationResult, preservando o restante do módulo
jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(),
  };
});
const mockedValidationResult = validationResult as unknown as jest.MockedFunction<typeof validationResult>;

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      ip: '127.0.0.1',
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('hello<script>alert("xss")</script>world')).toBe('helloalert("xss")world');
    });

    it('should remove javascript protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('onload=malicious()')).toBe('malicious()');
    });

    it('should limit string length', () => {
      const longString = 'a'.repeat(1500);
      const result = sanitizeString(longString);
      expect(result).toHaveLength(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(123 as any)).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('validateProductCode', () => {
    it('should create validation chain for product code', () => {
      const validators = validateProductCode();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validateDate', () => {
    it('should create validation chain for date', () => {
      const validators = validateDate();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validatePrice', () => {
    it('should create validation chain for price', () => {
      const validators = validatePrice();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThanOrEqual(1);
    });

    it('should create validation chain for custom field', () => {
      const validators = validatePrice('customPrice');
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('validatePercentage', () => {
    it('should create validation chain for percentage', () => {
      const validators = validatePercentage();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next when no validation errors', () => {
      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => true,
        array: () => []
      } as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 when validation errors exist', () => {
      const mockErrors = [
        {
          param: 'productCode',
          msg: 'Código do produto é obrigatório',
          value: ''
        },
        {
          param: 'date',
          msg: 'Data inválida',
          value: 'invalid-date'
        }
      ];

      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => mockErrors
      } as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Dados de entrada inválidos',
        code: 'VALIDATION_ERROR',
        details: [
          {
            field: 'productCode',
            message: 'Código do produto é obrigatório',
            value: ''
          },
          {
            field: 'date',
            message: 'Data inválida',
            value: 'invalid-date'
          }
        ],
        timestamp: expect.any(String)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should log validation errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockErrors = [
        {
          param: 'productCode',
          msg: 'Código do produto é obrigatório',
          value: ''
        }
      ];

      mockedValidationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => mockErrors
      } as any);

      handleValidationErrors(mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Validation] Validation errors:',
        expect.arrayContaining([
          expect.objectContaining({
            field: 'productCode',
            message: 'Código do produto é obrigatório'
          })
        ])
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sanitizeRequestBody', () => {
    it('should sanitize string values in request body', () => {
      mockRequest.body = {
        productCode: '  PRD001  ',
        description: 'Test<script>alert("xss")</script>',
        number: 123,
        nested: {
          value: 'not sanitized' // nested objects not sanitized
        }
      };

      sanitizeRequestBody(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.productCode).toBe('PRD001');
      expect(mockRequest.body.description).toBe('Testalert("xss")');
      expect(mockRequest.body.number).toBe(123);
      expect(mockRequest.body.nested.value).toBe('not sanitized');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null or undefined body', () => {
      mockRequest.body = null;

      sanitizeRequestBody(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle non-object body', () => {
      mockRequest.body = 'string body';

      sanitizeRequestBody(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const rateLimiter = validateRateLimit(60000, 10); // 10 requests per minute

      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding rate limit', () => {
      const rateLimiter = validateRateLimit(60000, 2); // 2 requests per minute

      // Make 3 requests quickly
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns instantes.',
        code: 'RATE_LIMIT_ERROR',
        retryAfter: 60,
        timestamp: expect.any(String)
      });
    });

    it('should reset rate limit after window expires', (done) => {
      const rateLimiter = validateRateLimit(100, 1); // 1 request per 100ms

      // First request should pass
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request should be blocked
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(429);

      // After window expires, request should pass again
      setTimeout(() => {
        rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(2);
        done();
      }, 150);
    });

    it('should handle different client IPs separately', () => {
      const rateLimiter = validateRateLimit(60000, 1);

      // First client
      Object.defineProperty(mockRequest, 'ip', { value: '127.0.0.1', configurable: true });
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second client should not be affected
      Object.defineProperty(mockRequest, 'ip', { value: '192.168.1.1', configurable: true });
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateContentType', () => {
    it('should allow GET requests without content type check', () => {
      mockRequest.method = 'GET';
      const validator = validateContentType(['application/json']);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow DELETE requests without content type check', () => {
      mockRequest.method = 'DELETE';
      const validator = validateContentType(['application/json']);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow valid content type', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue('application/json');
      const validator = validateContentType(['application/json']);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject invalid content type', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue('text/plain');
      const validator = validateContentType(['application/json']);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(415);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Tipo de conteúdo não suportado',
        code: 'UNSUPPORTED_MEDIA_TYPE',
        allowedTypes: ['application/json'],
        timestamp: expect.any(String)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing content type', () => {
      mockRequest.method = 'POST';
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);
      const validator = validateContentType(['application/json']);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(415);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateRequestSize', () => {
    it('should allow requests within size limit', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('1000');
      const validator = validateRequestSize(2048);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('2048');
      const validator = validateRequestSize(1024);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(413);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Requisição muito grande',
        code: 'REQUEST_TOO_LARGE',
        maxSize: 1024,
        receivedSize: 2048,
        timestamp: expect.any(String)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing content-length header', () => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);
      const validator = validateRequestSize(1024);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle invalid content-length header', () => {
      (mockRequest.get as jest.Mock).mockReturnValue('invalid');
      const validator = validateRequestSize(1024);

      validator(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});