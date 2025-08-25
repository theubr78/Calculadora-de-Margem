import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { createError } from './errorHandler';
import { ErrorCodes } from '../types';

// Basic string sanitizer used by multiple middlewares
export const sanitizeString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    // Remove full HTML tags like <script>...</script>
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, 1000);
};

// express-validator chain for productCode in body
export const validateProductCode = () => [
  body('productCode')
    .notEmpty()
    .withMessage('Código do produto é obrigatório')
    .isLength({ min: 1, max: 50 })
    .withMessage('Código do produto deve ter entre 1 e 50 caracteres')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Código do produto deve conter apenas letras, números, hífens e underscores')
    .customSanitizer((value) => sanitizeString(value).toUpperCase())
];

// Optional date in DD/MM/YYYY format
export const validateDate = () => [
  body('date')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    .withMessage('Data deve estar no formato DD/MM/AAAA')
    .custom((value) => {
      if (!value) return true;

      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return false;
      const [, day, month, year] = match;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (dayNum < 1 || dayNum > 31) {
        throw new Error('Dia deve estar entre 1 e 31');
      }
      if (monthNum < 1 || monthNum > 12) {
        throw new Error('Mês deve estar entre 1 e 12');
      }
      if (yearNum < 1900 || yearNum > 2100) {
        throw new Error('Ano deve estar entre 1900 e 2100');
      }

      const d = new Date(yearNum, monthNum - 1, dayNum);
      if (d.getFullYear() !== yearNum || d.getMonth() !== monthNum - 1 || d.getDate() !== dayNum) {
        throw new Error('Data inválida');
      }
      return true;
    })
    .customSanitizer((value) => (value ? sanitizeString(value) : undefined))
];

// Handle validation errors from express-validator
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((error: any) => ({
      field: error.param ?? error.path,
      message: error.msg,
      value: error.value,
    }));

    console.error('[Validation] Validation errors:', details);

    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos',
      code: ErrorCodes.VALIDATION_ERROR,
      details,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Sanitize all string fields in request body
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        (req.body as any)[key] = sanitizeString(value);
      }
    }
  }
  next();
};

// Validate content type for non-GET/DELETE requests
export const validateContentType = (allowedTypes: string[] = ['application/json']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }
    const contentType = req.get('Content-Type');
    if (!contentType || !allowedTypes.some((type) => contentType.includes(type))) {
      return res.status(415).json({
        success: false,
        error: 'Tipo de conteúdo não suportado',
        code: 'UNSUPPORTED_MEDIA_TYPE',
        allowedTypes,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};

// Validate request Content-Length
export const validateRequestSize = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Requisição muito grande',
        code: 'REQUEST_TOO_LARGE',
        maxSize,
        receivedSize: contentLength,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};

// Generic body required fields validator (kept for potential reuse)
export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter((field) => (req.body as any)[field] == null || (typeof (req.body as any)[field] === 'string' && (req.body as any)[field].trim() === ''));
    if (missingFields.length > 0) {
      return next(
        createError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400,
          ErrorCodes.VALIDATION_ERROR
        )
      );
    }
    next();
  };
};

// Optional: search query validator for future GETs
export const validateSearchQuery = () => [
  query('q')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 100 })
    .withMessage('Consulta de busca deve ter entre 1 e 100 caracteres')
    .customSanitizer((value) => (value ? sanitizeString(value) : undefined))
];

// Price validator
export const validatePrice = (fieldName: string = 'price') => [
  body(fieldName)
    .notEmpty()
    .withMessage('Preço é obrigatório')
    .isFloat({ min: 0, max: 999999999 })
    .withMessage('Preço deve ser um número válido entre 0 e 999.999.999')
    .customSanitizer((value) => {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return Math.round(num * 100) / 100;
    })
];

// Percentage validator
export const validatePercentage = (fieldName: string = 'percentage') => [
  body(fieldName)
    .optional({ nullable: true })
    .isFloat({ min: -100, max: 1000 })
    .withMessage('Porcentagem deve estar entre -100% e 1000%')
    .customSanitizer((value) => {
      if (value === null || value === undefined) return value as any;
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return Math.round(num * 100) / 100;
    })
];

// Simple in-memory rate limiter for validation layer
export const validateRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  const requests = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || (req.connection as any)?.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const clientRequests = (requests.get(clientId) || []).filter((t) => t > windowStart);
    if (clientRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns instantes.',
        code: 'RATE_LIMIT_ERROR',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    }

    clientRequests.push(now);
    requests.set(clientId, clientRequests);
    next();
  };
};