import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter, securityHeaders } from './middleware/security';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple request id generator
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// CORS configuration (supports multiple origins via comma-separated FRONTEND_URL)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Time']
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
app.use(securityHeaders);
app.use(cors(corsOptions));
// Preflight for all routes
app.options('*', cors(corsOptions));

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip} - reqId=${requestId}`);
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
    console.log(`🔒 Security headers enabled`);
    console.log(`⚡ Rate limiting active`);
  });

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`❌ Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

export default app;