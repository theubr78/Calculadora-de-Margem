import axios, { AxiosResponse } from 'axios';
import { ProductData, OMIERequest, ErrorCodes } from '../types';
import { createError } from '../middleware/errorHandler';

export class OMIEService {
  private readonly apiUrl: string;
  private readonly appKey: string;
  private readonly appSecret: string;

  constructor() {
    this.apiUrl = process.env.OMIE_API_URL || '';
    this.appKey = process.env.OMIE_APP_KEY || '';
    this.appSecret = process.env.OMIE_APP_SECRET || '';

    if (!this.apiUrl || !this.appKey || !this.appSecret) {
      throw new Error('OMIE API credentials not configured');
    }
  }

  /**
   * Search for a product in OMIE by product code
   */
  async searchProduct(productCode: string, date?: string): Promise<ProductData> {
    try {
      const requestDate = date || this.getCurrentDate();

      const requestBody: OMIERequest = {
        call: "ObterEstoqueProduto",
        param: [{
          cCodigo: productCode,
          nIdProduto: 0,
          cEAN: "",
          xCodigo: "",
          dDia: requestDate
        }],
        app_key: this.appKey,
        app_secret: this.appSecret
      };

      console.log(`[OMIE] Searching product: ${productCode} for date: ${requestDate}`);

      const response: AxiosResponse = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Content-type': 'application/json'
        },
        timeout: 30000, // 30 seconds timeout
        validateStatus: (status) => status >= 200 && status < 600, // capture XML bodies too
      });

      // Debug: log content-type and a small snippet for diagnostics
      const contentType = (response.headers as any)?.['content-type'] || '';
      const rawSnippet = typeof response.data === 'string' ? response.data.slice(0, 300) : JSON.stringify(response.data).slice(0, 300);
      console.log(`[OMIE] Response content-type: ${contentType}`);
      console.log(`[OMIE] Response snippet:`, rawSnippet);

      if (!response.data) {
        throw createError(
          'Empty response from OMIE API',
          502,
          ErrorCodes.OMIE_API_ERROR
        );
      }

      // If OMIE sent JSON as string, try to parse
      let data: any = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          throw createError(
            'Non-JSON response from OMIE API',
            502,
            ErrorCodes.OMIE_API_ERROR
          );
        }
      }

      // Check if OMIE returned an error
      if (data.faultstring) {
        console.error(`[OMIE] API Error: ${data.faultstring}`);

        // Handle specific OMIE errors
        if (data.faultstring.includes('não encontrado') ||
          data.faultstring.includes('not found')) {
          throw createError(
            `Product ${productCode} not found in OMIE`,
            404,
            ErrorCodes.PRODUCT_NOT_FOUND
          );
        }

        throw createError(
          `OMIE API Error: ${data.faultstring}`,
          502,
          ErrorCodes.OMIE_API_ERROR
        );
      }

      // Validate response structure
      const productData = this.validateAndTransformResponse(data, productCode);

      console.log(`[OMIE] Product found: ${productData.cDescricao} (Cost: R$ ${productData.nCMC})`);

      return productData;

    } catch (error: any) {
      // Re-throw our custom errors
      if (error.isOperational) {
        throw error;
      }

      // Handle axios errors
      if (error.code === 'ECONNABORTED') {
        throw createError(
          'OMIE API request timeout',
          504,
          ErrorCodes.OMIE_API_ERROR
        );
      }

      if (error.response) {
        // OMIE API returned an error status
        const contentType = error.response.headers?.['content-type'] || '';
        console.error(`[OMIE] HTTP Error ${error.response.status}:`, error.response.data);

        // If OMIE returned XML/SOAP, convert to a generic error message
        const isXml = typeof error.response.data === 'string' && contentType.includes('xml');
        const message = isXml ? 'OMIE API Bad Request (verifique credenciais e payload)' : `OMIE API returned status ${error.response.status}`;

        throw createError(
          message,
          502,
          ErrorCodes.OMIE_API_ERROR
        );
      }

      if (error.request) {
        // Network error
        console.error('[OMIE] Network error:', error.message);
        throw createError(
          'Unable to connect to OMIE API',
          503,
          ErrorCodes.OMIE_API_ERROR
        );
      }

      // Unknown error
      console.error('[OMIE] Unknown error:', error.message);
      throw createError(
        'Unexpected error while calling OMIE API',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  /**
   * Validate and transform OMIE API response to our ProductData format
   */
  private validateAndTransformResponse(data: any, productCode: string): ProductData {
    // Check if required fields exist
    if (!data.cCodigo && !data.nIdProduto) {
      throw createError(
        'Invalid response format from OMIE API',
        502,
        ErrorCodes.OMIE_API_ERROR
      );
    }

    // Calculate totals from listaEstoque
    let totalFisico = 0;
    let totalCMC = 0;
    let totalValue = 0;

    if (data.listaEstoque && Array.isArray(data.listaEstoque)) {
      for (const estoque of data.listaEstoque) {
        const fisico = this.parseNumber(estoque.fisico, 'fisico');
        const cmc = this.parseNumber(estoque.nCMC, 'nCMC');
        
        totalFisico += fisico;
        totalValue += fisico * cmc;
      }
      
      // Calculate weighted average CMC
      if (totalFisico > 0) {
        totalCMC = totalValue / totalFisico;
      }
    }

    // Extract product data with sensible fallbacks
    const fallbackCMC = this.parseNumber((data as any).nCMC, 'nCMC');
    const fallbackFisico = this.parseNumber((data as any).fIsico ?? (data as any).fisico, 'fisico');

    const productData: ProductData = {
      nIdProduto: data.nIdProduto || 0,
      cCodigo: data.cCodigo || productCode,
      cDescricao: data.cDescricao || 'Produto sem descrição',
      nCMC: totalFisico > 0 ? totalCMC : fallbackCMC,
      fIsico: totalFisico > 0 ? totalFisico : fallbackFisico
    };

    // Validate critical fields
    if (!productData.cDescricao || productData.cDescricao.trim() === '') {
      productData.cDescricao = `Produto ${productCode}`;
    }

    if (productData.nCMC < 0) {
      console.warn(`[OMIE] Warning: Negative cost for product ${productCode}: ${productData.nCMC}`);
    }

    console.log(`[OMIE] Processed product data:`, {
      codigo: productData.cCodigo,
      descricao: productData.cDescricao,
      totalEstoque: productData.fIsico,
      cmcMedio: productData.nCMC,
      locaisEstoque: data.listaEstoque?.length || 0
    });

    return productData;
  }

  /**
   * Safely parse numeric values from OMIE response
   */
  private parseNumber(value: any, fieldName: string): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const parsed = typeof value === 'number' ? value : parseFloat(value);

    if (isNaN(parsed)) {
      console.warn(`[OMIE] Warning: Invalid ${fieldName} value: ${value}, using 0`);
      return 0;
    }

    return parsed;
  }

  /**
   * Get current date in OMIE format (DD/MM/YYYY)
   */
  private getCurrentDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Test OMIE API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to search for a non-existent product to test the connection
      await this.searchProduct('TEST_CONNECTION_' + Date.now());
      return true;
    } catch (error: any) {
      // If we get a "not found" error, the connection is working
      if (error.code === ErrorCodes.PRODUCT_NOT_FOUND) {
        return true;
      }
      // Any other error means connection issues
      return false;
    }
  }
}

// Export singleton instance factory
let omieServiceInstance: OMIEService | null = null;

export const getOMIEService = (): OMIEService => {
  if (!omieServiceInstance) {
    omieServiceInstance = new OMIEService();
  }
  return omieServiceInstance;
};

// For testing purposes
export const resetOMIEService = (): void => {
  omieServiceInstance = null;
};