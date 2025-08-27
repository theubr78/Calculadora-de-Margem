import { useCallback } from 'react';
import { useToastContext } from '../context/ToastContext';
import { APIError } from '../services/api';
import { ErrorCodes } from '../types';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export const useErrorHandler = () => {
  const { showError } = useToastContext();

  const logErrorToService = useCallback((error: unknown, errorCode?: string) => {
    // In a real application, you would send this to a monitoring service
    const errorData = {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      errorCode,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: null, // Add user ID if available
    };

    console.error('[ErrorHandler] Error logged to service:', errorData);
    
    // Example: Send to monitoring service
    // monitoringService.captureException(error, { extra: errorData });
  }, []);

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'Ocorreu um erro inesperado',
      onError,
    } = options;

    let errorMessage = fallbackMessage;
    let errorTitle = 'Erro';
    let errorCode: string | undefined;

    // Log error to console
    if (logError) {
      console.error('[ErrorHandler] Error caught:', error);
    }

    // Handle different error types
    if (error instanceof APIError) {
      errorMessage = error.message;
      errorCode = error.code;
      
      // Customize error messages based on error codes
      switch (error.code) {
        case ErrorCodes.PRODUCT_NOT_FOUND:
          errorTitle = 'Produto Não Encontrado';
          break;
        case ErrorCodes.VALIDATION_ERROR:
          errorTitle = 'Erro de Validação';
          break;
        case ErrorCodes.OMIE_API_ERROR:
          errorTitle = 'Erro na API do OMIE';
          errorMessage = 'Erro na comunicação com o OMIE. Tente novamente em alguns instantes.';
          break;
        case ErrorCodes.NETWORK_ERROR:
          errorTitle = 'Erro de Conexão';
          errorMessage = 'Verifique sua conexão com a internet e tente novamente.';
          break;
        case ErrorCodes.TIMEOUT_ERROR:
          errorTitle = 'Tempo Esgotado';
          errorMessage = 'A operação demorou mais que o esperado. Tente novamente.';
          break;
        case ErrorCodes.RATE_LIMIT_ERROR:
          errorTitle = 'Muitas Tentativas';
          errorMessage = 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.';
          break;
        case ErrorCodes.SERVER_ERROR:
          errorTitle = 'Erro do Servidor';
          errorMessage = 'Erro interno do servidor. Nossa equipe foi notificada.';
          break;
        default:
          errorTitle = 'Erro na API';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific JavaScript errors
      if (error.name === 'TypeError') {
        errorTitle = 'Erro de Tipo';
        errorMessage = 'Erro interno da aplicação. Tente recarregar a página.';
      } else if (error.name === 'ReferenceError') {
        errorTitle = 'Erro de Referência';
        errorMessage = 'Erro interno da aplicação. Tente recarregar a página.';
      } else if (error.name === 'SyntaxError') {
        errorTitle = 'Erro de Sintaxe';
        errorMessage = 'Erro interno da aplicação. Tente recarregar a página.';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = fallbackMessage;
    }

    // Show toast notification
    if (showToast) {
      showError(errorMessage, errorTitle);
    }

    // Call custom error handler
    if (onError && error instanceof Error) {
      onError(error);
    }

    // Log error to monitoring service
    logErrorToService(error, errorCode);

    return {
      message: errorMessage,
      title: errorTitle,
      code: errorCode,
    };
  }, [showError, logErrorToService]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  const createErrorHandler = useCallback((
    options: ErrorHandlerOptions = {}
  ) => {
    return (error: unknown) => handleError(error, options);
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
    logErrorToService,
  };
};

export default useErrorHandler;
