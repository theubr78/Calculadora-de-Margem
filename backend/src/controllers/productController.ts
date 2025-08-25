import { Request, Response, NextFunction } from 'express';
import { getOMIEService } from '../services/omieService';
import { validateProductCode, validateDate } from '../utils/validation';
import { APIResponse, ProductData, ErrorCodes } from '../types';
import { createError } from '../middleware/errorHandler';

/**
 * Search for a product in OMIE
 */
export const searchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productCode, date } = req.body;

    // Validate required fields
    if (!productCode) {
      return next(createError(
        'Product code is required',
        400,
        ErrorCodes.VALIDATION_ERROR
      ));
    }

    // Validate and sanitize product code
    const validatedProductCode = validateProductCode(productCode);

    // Validate date if provided
    let validatedDate: string | undefined;
    if (date) {
      validatedDate = validateDate(date);
    }

    console.log(`[API] Searching product: ${validatedProductCode}${validatedDate ? ` for date: ${validatedDate}` : ''}`);

    // Get OMIE service instance
    const omieService = getOMIEService();

    // Search product in OMIE
    const productData = await omieService.searchProduct(validatedProductCode, validatedDate);

    // Return successful response
    const response: APIResponse<ProductData> = {
      success: true,
      data: productData,
      message: 'Product found successfully'
    };

    console.log(`[API] Product search successful: ${productData.cDescricao}`);
    res.json(response);

  } catch (error: any) {
    console.error(`[API] Product search error:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      productCode: req.body?.productCode
    });
    
    next(error);
  }
};

/**
 * Test OMIE API connection
 */
export const testConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('[API] Testing OMIE connection...');

    const omieService = getOMIEService();
    const isConnected = await omieService.testConnection();

    const response = {
      success: true,
      connected: isConnected,
      message: isConnected ? 'OMIE API connection successful' : 'OMIE API connection failed',
      timestamp: new Date().toISOString()
    };

    console.log(`[API] OMIE connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    res.json(response);

  } catch (error: any) {
    console.error('[API] OMIE connection test error:', error.message);
    next(error);
  }
};

/**
 * Get product search statistics (for monitoring)
 */
export const getSearchStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This would typically come from a database or cache
    // For now, return mock statistics
    const stats = {
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
    };

    res.json(stats);

  } catch (error: any) {
    console.error('[API] Get search stats error:', error.message);
    next(error);
  }
};