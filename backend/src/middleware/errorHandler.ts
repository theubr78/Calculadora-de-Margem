import { Request, Response, NextFunction } from 'express';
import { ErrorCodes } from '../types';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || ErrorCodes.INTERNAL_ERROR;
  
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    code,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = ErrorCodes.INTERNAL_ERROR
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};