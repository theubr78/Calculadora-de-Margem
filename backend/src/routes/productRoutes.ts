import { Router } from 'express';
import { searchProduct, testConnection, getSearchStats } from '../controllers/productController';
import { omieApiLimiter } from '../middleware/security';
import { 
  validateProductCode, 
  validateDate, 
  handleValidationErrors,
  sanitizeRequestBody,
  validateContentType,
  validateRequestSize 
} from '../middleware/validation';

const router = Router();

// Apply middleware to all product routes
router.use(omieApiLimiter);
router.use(validateContentType(['application/json']));
router.use(validateRequestSize(1024 * 10)); // 10KB max
router.use(sanitizeRequestBody);

/**
 * POST /api/product/search
 * Search for a product in OMIE
 */
router.post('/search', 
  validateProductCode(),
  validateDate(),
  handleValidationErrors,
  searchProduct
);

/**
 * GET /api/product/test-connection
 * Test OMIE API connection
 */
router.get('/test-connection', testConnection);

/**
 * GET /api/product/stats
 * Get product search statistics
 */
router.get('/stats', getSearchStats);

export default router;