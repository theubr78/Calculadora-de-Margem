import React from 'react';
import { ProductData, ProfitResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useToastContext } from '../../context/ToastContext';

interface ResultsDisplayProps {
  productData: ProductData;
  profitResult: ProfitResult;
  showDetailedInfo?: boolean;
  showRecommendations?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  productData,
  profitResult,
  showDetailedInfo = true,
  showRecommendations = true,
}) => {
  const { showSuccess, showError } = useToastContext();
  // Calculate additional metrics
  const markup = ((profitResult.salePrice / productData.nCMC) - 1) * 100;
  const roi = (profitResult.profitAmount / productData.nCMC) * 100;
  
  // Determine result status
  const getResultStatus = () => {
    if (profitResult.profitMargin > 30) return 'excellent';
    if (profitResult.profitMargin > 15) return 'good';
    if (profitResult.profitMargin > 0) return 'acceptable';
    return 'loss';
  };

  const resultStatus = getResultStatus();

  // Get status colors and messages
  const getStatusConfig = () => {
    switch (resultStatus) {
      case 'excellent':
        return {
          bgColor: 'bg-success bg-opacity-10',
          borderColor: 'border-success border-opacity-20',
          textColor: 'text-success',
          iconColor: 'text-success',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          message: 'Excelente margem de lucro!',
        };
      case 'good':
        return {
          bgColor: 'bg-success bg-opacity-10',
          borderColor: 'border-success border-opacity-20',
          textColor: 'text-success',
          iconColor: 'text-success',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          message: 'Boa margem de lucro',
        };
      case 'acceptable':
        return {
          bgColor: 'bg-warning bg-opacity-10',
          borderColor: 'border-warning border-opacity-20',
          textColor: 'text-warning',
          iconColor: 'text-warning',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          message: 'Margem baixa - considere ajustar',
        };
      default:
        return {
          bgColor: 'bg-error bg-opacity-10',
          borderColor: 'border-error border-opacity-20',
          textColor: 'text-error',
          iconColor: 'text-error',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          message: 'Venda com prejuízo',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations: string[] = [];

    if (profitResult.profitMargin < 0) {
      recommendations.push('Aumente o preço de venda para evitar prejuízo');
      const breakEvenPrice = productData.nCMC;
      recommendations.push(`Preço mínimo sugerido: ${formatCurrency(breakEvenPrice)}`);
    } else if (profitResult.profitMargin < 10) {
      recommendations.push('Considere aumentar a margem para pelo menos 10%');
      const suggestedPrice = productData.nCMC / (1 - 0.1);
      recommendations.push(`Preço para 10% de margem: ${formatCurrency(suggestedPrice)}`);
    } else if (profitResult.profitMargin > 50) {
      recommendations.push('Margem muito alta pode afetar competitividade');
      recommendations.push('Considere reduzir preço para aumentar volume de vendas');
    }

    if (productData.fIsico < 10) {
      recommendations.push('Estoque baixo - considere reposição antes de promover');
    }

    return recommendations;
  };

  const recommendations = showRecommendations ? getRecommendations() : [];

  return (
    <div className="space-y-lg">
      {/* Main Results Card */}
      <div className={`rounded-lg p-lg border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        {/* Status Header */}
        <div className="flex items-center justify-center mb-lg">
          <div className={`mr-sm ${statusConfig.iconColor}`}>
            {statusConfig.icon}
          </div>
          <h3 className={`text-h3 font-semibold ${statusConfig.textColor}`}>
            {statusConfig.message}
          </h3>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
          <div className="text-center">
            <div className="text-body-small font-medium text-gray-600 mb-xs">
              Preço de Venda
            </div>
            <div className="text-h3 font-bold text-primary">
              {formatCurrency(profitResult.salePrice)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-body-small font-medium text-gray-600 mb-xs">
              {profitResult.isProfit ? 'Lucro' : 'Prejuízo'}
            </div>
            <div className={`text-h3 font-bold ${
              profitResult.isProfit ? 'text-success' : 'text-error'
            }`}>
              {formatCurrency(Math.abs(profitResult.profitAmount))}
            </div>
          </div>

          <div className="text-center">
            <div className="text-body-small font-medium text-gray-600 mb-xs">
              Margem de Lucro
            </div>
            <div className={`text-h3 font-bold ${
              profitResult.isProfit ? 'text-success' : 'text-error'
            }`}>
              {profitResult.profitMargin.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        {showDetailedInfo && (
          <div className="border-t border-gray-200 pt-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-body-small">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Custo Unitário:</span>
                <span className="font-mono">{formatCurrency(productData.nCMC)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Markup:</span>
                <span className="font-mono">{markup.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">ROI:</span>
                <span className="font-mono">{roi.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Estoque:</span>
                <span className="font-mono">{productData.fIsico} un.</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className="mt-md text-center">
          <div className={`font-medium ${statusConfig.textColor}`}>
            {profitResult.isProfit ? (
              <>Venda com lucro de {profitResult.profitMargin.toFixed(2)}%</>
            ) : (
              <>Venda com prejuízo de {Math.abs(profitResult.profitMargin).toFixed(2)}%</>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-background border border-gray-200 rounded-lg p-md">
          <h4 className="font-semibold text-gray-800 mb-md flex items-center">
            <svg className="w-5 h-5 mr-sm text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recomendações
          </h4>
          <ul className="space-y-sm">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-body-small text-gray-700">
                <span className="mr-sm mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-background border border-gray-200 rounded-lg p-md">
        <h4 className="font-semibold text-gray-800 mb-md">Ações Rápidas</h4>
        <div className="flex flex-wrap gap-sm">
          <button
            className="px-sm py-xs text-caption bg-surface border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={async () => {
              try {
                const text = `Produto: ${productData.cDescricao}\nCusto: ${formatCurrency(productData.nCMC)}\nPreço: ${formatCurrency(profitResult.salePrice)}\nMargem: ${profitResult.profitMargin.toFixed(2)}%\nLucro: ${formatCurrency(profitResult.profitAmount)}`;
                await navigator.clipboard.writeText(text);
                showSuccess('Resultado copiado para a área de transferência!');
              } catch (error) {
                showError('Erro ao copiar resultado');
              }
            }}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011 1v11a1 1 0 11-2 0V4a1 1 0 011-1zm4 0a1 1 0 011 1v11a1 1 0 11-2 0V4a1 1 0 011-1z" />
            </svg>
            Copiar Resultado
          </button>
          <button
            className="px-sm py-xs text-caption bg-surface border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => {
              // Import storage utility and save calculation
              import('../../utils/storage').then(({ profitStorage }) => {
                const success = profitStorage.saveCalculation({
                  productCode: productData.cCodigo,
                  productName: productData.cDescricao,
                  costPrice: productData.nCMC,
                  salePrice: profitResult.salePrice,
                  profitMargin: profitResult.profitMargin,
                  profitAmount: profitResult.profitAmount,
                  timestamp: Date.now(),
                });
                
                if (success) {
                  showSuccess('Cálculo salvo no histórico com sucesso!');
                } else {
                  showError('Erro ao salvar cálculo no histórico');
                }
              });
            }}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Salvar Cálculo
          </button>
          <button
            className="px-sm py-xs text-caption bg-surface border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => {
              window.print();
            }}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4v12h10V4H5zm1 1h8v10H6V5zm3 2a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;