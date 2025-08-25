import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(healthData);
};

export const readinessCheck = (req: Request, res: Response) => {
  // Check if all required environment variables are set
  const requiredEnvVars = ['OMIE_APP_KEY', 'OMIE_APP_SECRET', 'OMIE_API_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    return res.status(503).json({
      status: 'not ready',
      message: 'Missing required environment variables',
      missing: missingEnvVars
    });
  }

  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    services: {
      omie: 'configured'
    }
  });
};