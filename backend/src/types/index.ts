export interface ProductData {
  nIdProduto: number;
  cCodigo: string;
  cDescricao: string;
  nCMC: number;
  fIsico: number;
}

export interface OMIERequest {
  call: "ObterEstoqueProduto";
  param: [{
    cCodigo: string;
    nIdProduto: number;
    cEAN: string;
    xCodigo: string;
    dDia: string;
  }];
  app_key: string;
  app_secret: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

export enum ErrorCodes {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_PRODUCT_CODE = 'INVALID_PRODUCT_CODE',
  OMIE_API_ERROR = 'OMIE_API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}