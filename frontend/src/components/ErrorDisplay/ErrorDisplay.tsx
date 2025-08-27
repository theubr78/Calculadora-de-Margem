import React from 'react';
import { Alert, Button } from '../UI';
import { APIError } from '../../services/api';
import { ErrorCodes } from '../../types';

interface ErrorDisplayProps {
  error: Error | APIError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  const getErrorInfo = () => {
    if (typeof error === 'string') {
      return {
        title: 'Erro',
        message: error,
        code: undefined,
        canRetry: true,
      };
    }

    if (error instanceof APIError) {
      let title = 'Erro';
      let canRetry = true;

      switch (error.code) {
        case ErrorCodes.PRODUCT_NOT_FOUND:
          title = 'Produto Não Encontrado';
          canRetry = false;
          break;
        case ErrorCodes.VALIDATION_ERROR:
          title = 'Erro de Validação';
          canRetry = false;
          break;
        case ErrorCodes.OMIE_API_ERROR:
          title = 'Erro na API do OMIE';
          canRetry = true;
          break;
        case ErrorCodes.NETWORK_ERROR:
          title = 'Erro de Conexão';
          canRetry = true;
          break;
        case ErrorCodes.TIMEOUT_ERROR:
          title = 'Tempo Esgotado';
          canRetry = true;
          break;
        case ErrorCodes.RATE_LIMIT_ERROR:
          title = 'Muitas Tentativas';
          canRetry = true;
          break;
        case ErrorCodes.SERVER_ERROR:
          title = 'Erro do Servidor';
          canRetry = true;
          break;
        default:
          title = 'Erro na API';
          canRetry = true;
      }

      return {
        title,
        message: error.message,
        code: error.code,
        canRetry,
        statusCode: error.statusCode,
        requestId: error.requestId,
        timestamp: error.timestamp,
      };
    }

    if (error instanceof Error) {
      return {
        title: 'Erro',
        message: error.message,
        code: undefined,
        canRetry: true,
      };
    }

    return {
      title: 'Erro',
      message: 'Ocorreu um erro inesperado',
      code: undefined,
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo();

  const getActionButtons = () => {
    const buttons = [];

    if (onRetry && errorInfo.canRetry) {
      buttons.push(
        <Button
          key="retry"
          variant="primary"
          size="sm"
          onClick={onRetry}
          ariaLabel="Tentar novamente"
        >
          Tentar Novamente
        </Button>
      );
    }

    if (onDismiss) {
      buttons.push(
        <Button
          key="dismiss"
          variant="secondary"
          size="sm"
          onClick={onDismiss}
          ariaLabel="Fechar erro"
        >
          Fechar
        </Button>
      );
    }

    return buttons.length > 0 ? (
      <div className="flex flex-wrap gap-sm mt-md">
        {buttons}
      </div>
    ) : null;
  };

  const getHelpText = () => {
    switch (errorInfo.code) {
      case ErrorCodes.PRODUCT_NOT_FOUND:
        return 'Verifique se o código do produto está correto e se o produto existe no OMIE.';
      case ErrorCodes.VALIDATION_ERROR:
        return 'Verifique os dados informados e tente novamente.';
      case ErrorCodes.NETWORK_ERROR:
        return 'Verifique sua conexão com a internet e tente novamente.';
      case ErrorCodes.TIMEOUT_ERROR:
        return 'A operação demorou mais que o esperado. Tente novamente em alguns instantes.';
      case ErrorCodes.RATE_LIMIT_ERROR:
        return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes antes de tentar novamente.';
      case ErrorCodes.SERVER_ERROR:
        return 'Erro interno do servidor. Nossa equipe foi notificada e está trabalhando para resolver o problema.';
      case ErrorCodes.OMIE_API_ERROR:
        return 'Erro na comunicação com o OMIE. Tente novamente em alguns instantes.';
      default:
        return 'Se o problema persistir, entre em contato com o suporte.';
    }
  };

  return (
    <div className={className}>
      <Alert
        type="error"
        title={errorInfo.title}
        onClose={onDismiss}
        actions={getActionButtons()}
      >
        <div className="space-y-sm">
          <p>{errorInfo.message}</p>
          
          <p className="text-body-small text-gray-600">
            {getHelpText()}
          </p>

          {showDetails && error instanceof APIError && (
            <details className="mt-md">
              <summary className="cursor-pointer text-body-small font-medium text-gray-700 hover:text-gray-900">
                Detalhes técnicos
              </summary>
              <div className="mt-sm p-sm bg-background rounded text-caption space-y-sm">
                {errorInfo.code && (
                  <div>
                    <strong>Código:</strong> {errorInfo.code}
                  </div>
                )}
                {errorInfo.statusCode && (
                  <div>
                    <strong>Status HTTP:</strong> {errorInfo.statusCode}
                  </div>
                )}
                {errorInfo.requestId && (
                  <div>
                    <strong>ID da Requisição:</strong> {errorInfo.requestId}
                  </div>
                )}
                {errorInfo.timestamp && (
                  <div>
                    <strong>Timestamp:</strong> {new Date(errorInfo.timestamp).toLocaleString()}
                  </div>
                )}
                {process.env.NODE_ENV === 'development' && error instanceof Error && error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap text-caption mt-xs p-sm bg-gray-100 rounded overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default ErrorDisplay;