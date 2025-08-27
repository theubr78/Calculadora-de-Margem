import React, { useMemo } from 'react';
import { ProductData } from '../../types';
import { calculateProfit } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import StatusIcon from '../UI/StatusIcon';

interface PricingScenario {
  name: string;
  price: number;
  margin: number;
  profit: number;
  isProfit: boolean;
}

interface PricingScenariosProps {
  productData: ProductData;
  currentPrice?: number;
}

const PricingScenarios: React.FC<PricingScenariosProps> = ({
  productData,
  currentPrice,
}) => {
  const scenarios = useMemo(() => {
    const costPrice = productData.nCMC;
    const baseScenarios: PricingScenario[] = [];

    // Generate scenarios based on different margins
    const margins = [10, 15, 20, 25, 30, 40, 50];
    
    margins.forEach(targetMargin => {
      const price = costPrice / (1 - targetMargin / 100);
      const result = calculateProfit(costPrice, price);
      
      baseScenarios.push({
        name: `${targetMargin}% margem`,
        price: result.salePrice,
        margin: result.profitMargin,
        profit: result.profitAmount,
        isProfit: result.isProfit,
      });
    });

    // Add break-even scenario
    baseScenarios.unshift({
      name: 'Break-even',
      price: costPrice,
      margin: 0,
      profit: 0,
      isProfit: false,
    });

    // Add current price scenario if provided
    if (currentPrice && currentPrice > 0) {
      const currentResult = calculateProfit(costPrice, currentPrice);
      baseScenarios.push({
        name: 'Preço Atual',
        price: currentResult.salePrice,
        margin: currentResult.profitMargin,
        profit: currentResult.profitAmount,
        isProfit: currentResult.isProfit,
      });
    }

    return baseScenarios.sort((a, b) => a.price - b.price);
  }, [productData.nCMC, currentPrice]);

  const getRowClassName = (scenario: PricingScenario) => {
    if (currentPrice && Math.abs(scenario.price - currentPrice) < 0.01) {
      return 'bg-primary bg-opacity-10 border-primary';
    }
    if (scenario.margin < 0) {
      return 'bg-error bg-opacity-5';
    }
    if (scenario.margin > 30) {
      return 'bg-success bg-opacity-5';
    }
    if (scenario.margin > 15) {
      return 'bg-warning bg-opacity-5';
    }
    return 'bg-gray-800';
  };

  const getMarginColor = (margin: number) => {
    if (margin < 0) return 'text-error';
    if (margin > 30) return 'text-success';
    if (margin > 15) return 'text-warning';
    return 'text-gray-300';
  };

  return (
    <div className="bg-surface border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">📊</span>
          Cenários de Precificação
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Compare diferentes preços e suas respectivas margens de lucro
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Cenário
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Preço de Venda
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Margem
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Lucro por Unidade
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {scenarios.map((scenario, index) => (
              <tr
                key={index}
                className={`${getRowClassName(scenario)} hover:bg-gray-700 transition-colors`}
              >
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {scenario.name}
                  {currentPrice && Math.abs(scenario.price - currentPrice) < 0.01 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary bg-opacity-20 text-primary">
                      Atual
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-300">
                  {formatCurrency(scenario.price)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono font-semibold ${getMarginColor(scenario.margin)}`}>
                  {scenario.margin.toFixed(2)}%
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${
                  scenario.isProfit ? 'text-success' : 'text-error'
                }`}>
                  {formatCurrency(scenario.profit)}
                </td>
                <td className="px-4 py-3 text-center">
                  {scenario.margin < 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-error bg-error bg-opacity-10 text-error">
                      <StatusIcon type="error" size={16} aria-label="Prejuízo" />
                      Prejuízo
                    </span>
                  ) : scenario.margin > 30 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-success bg-success bg-opacity-10 text-success">
                      <StatusIcon type="success" size={16} aria-label="Excelente" />
                      Excelente
                    </span>
                  ) : scenario.margin > 15 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-warning bg-warning bg-opacity-10 text-warning">
                      <StatusIcon type="warning" size={16} aria-label="Bom" />
                      Bom
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-primary bg-primary bg-opacity-10 text-primary">
                      <StatusIcon type="info" size={16} aria-label="Baixo" />
                      Baixo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            <span className="font-medium">Custo base:</span> {formatCurrency(productData.nCMC)}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <StatusIcon type="error" size={14} aria-label="Prejuízo" className="mr-1" />
              <span>Prejuízo</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon type="info" size={14} aria-label="Baixa margem" className="mr-1" />
              <span>Baixa margem</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon type="warning" size={14} aria-label="Boa margem" className="mr-1" />
              <span>Boa margem</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon type="success" size={14} aria-label="Excelente" className="mr-1" />
              <span>Excelente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingScenarios;
