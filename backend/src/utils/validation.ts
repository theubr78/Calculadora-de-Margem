import { ErrorCodes } from '../types';
import { createError } from '../middleware/errorHandler';

/**
 * Validate product code format
 */
export const validateProductCode = (productCode: string): string => {
  if (!productCode || typeof productCode !== 'string') {
    throw createError(
      'Product code is required and must be a string',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const trimmed = productCode.trim();
  
  if (trimmed.length === 0) {
    throw createError(
      'Product code cannot be empty',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (trimmed.length > 50) {
    throw createError(
      'Product code cannot exceed 50 characters',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Check for invalid characters (basic validation)
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    throw createError(
      'Product code can only contain letters, numbers, underscores, and hyphens',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  return trimmed.toUpperCase();
};

/**
 * Validate date format (DD/MM/YYYY)
 */
export const validateDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    throw createError(
      'Date is required and must be a string',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(datePattern);

  if (!match) {
    throw createError(
      'Date must be in DD/MM/YYYY format',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Basic date validation
  if (dayNum < 1 || dayNum > 31) {
    throw createError(
      'Day must be between 1 and 31',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (monthNum < 1 || monthNum > 12) {
    throw createError(
      'Month must be between 1 and 12',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (yearNum < 2000 || yearNum > 2100) {
    throw createError(
      'Year must be between 2000 and 2100',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Validate actual date
  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (date.getDate() !== dayNum || 
      date.getMonth() !== monthNum - 1 || 
      date.getFullYear() !== yearNum) {
    throw createError(
      'Invalid date',
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  return dateString;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Validate request body has required fields
 */
export const validateRequiredFields = (body: any, requiredFields: string[]): void => {
  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || 
    body[field] === null || 
    (typeof body[field] === 'string' && body[field].trim() === '')
  );

  if (missingFields.length > 0) {
    throw createError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }
};