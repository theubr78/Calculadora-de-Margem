import { Router } from 'express';
import { healthCheck, readinessCheck } from '../controllers/healthController';
import productRoutes from './productRoutes';

const router = Router();

// Health check routes
router.get('/health', healthCheck);
router.get('/ready', readinessCheck);

// Product routes
router.use('/product', productRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    name: 'OMIE Profit Calculator API',
    version: '1.0.0',
    description: 'API para cálculo de margem de lucro integrada ao OMIE',
    endpoints: {
      health: '/api/health',
      ready: '/api/ready',
      productSearch: '/api/product/search',
      testConnection: '/api/product/test-connection',
      searchStats: '/api/product/stats'
    },
    documentation: {
      productSearch: {
        method: 'POST',
        url: '/api/product/search',
        body: {
          productCode: 'string (required)',
          date: 'string (optional, DD/MM/YYYY format)'
        }
      }
    }
  });
});

export default router;