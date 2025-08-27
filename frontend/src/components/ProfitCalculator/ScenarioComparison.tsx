import React, { useState } from 'react';
import { calculateProfit } from '../../utils/calculations';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import { ProductData, ProfitResult } from '../../types';
import Card from '../Layout/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface Scenario {
  id: string;
  name: string;
  salePrice: number;
  result: ProfitResult;
}

interface ScenarioComparisonProps {
  productData: ProductData;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({ productData }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioPrice, setNewScenarioPrice] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  // Add new scenario
  const addScenario = () => {
    if (!newScenarioName.trim() || !newScenarioPrice.trim()) {
      return;
    }

    const salePrice = parseCurrency(newScenarioPrice);
    if (salePrice <= 0) {
      return;
    }

    const result = calculateProfit(productData.nCMC, salePrice);
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newScenarioName.trim(),
      salePrice,
      result,
    };

    setScenarios(prev => [...prev, newScenario]);
    setNewScenarioName('');
    setNewScenarioPrice('');
  };

  // Remove scenario
  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  // Clear all scenarios
  const clearScenarios = () => {
    setScenarios([]);
  };

  // Add quick scenarios
  const addQuickScenarios = () => {
    const quickScenarios = [
      { name: 'Margem 20%', multiplier: 1.25 },
      { name: 'Margem 30%', multiplier: 1.43 },
      { name: 'Margem 50%', multiplier: 2.0 },
    ];

    const newScenarios = quickScenarios.map(qs => {
      const salePrice = productData.nCMC * qs.multiplier;
      const result = calculateProfit(productData.nCMC, salePrice);
      return {
        id: `quick-${Date.now()}-${qs.name}`,
        name: qs.name,
        salePrice,
        result,
      };
    });

    setScenarios(prev => [...prev, ...newScenarios]);
  };

  return (
    <Card title="Comparação de Cenários" className="mt-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Ocultar' : 'Mostrar'} Comparação
          </Button>
          
          {scenarios.length === 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addQuickScenarios}
            >
              Adicionar Cenários Rápidos
            </Button>
          )}
        </div>

        {showComparison && (
          <div className="space-y-4">
            {/* Add New Scenario */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Adicionar Cenário</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Nome do Cenário"
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Ex: Promoção"
                />
                <Input
                  label="Preço de Venda"
                  type="text"
                  value={newScenarioPrice}
                  onChange={(e) => setNewScenarioPrice(e.target.value)}
                  placeholder="Ex: 1.500,00"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={addScenario}
                    disabled={!newScenarioName.trim() || !newScenarioPrice.trim()}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Scenarios List */}
            {scenarios.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Cenários ({scenarios.length})</h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={clearScenarios}
                  >
                    Limpar Todos
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cenário</th>
                        <th className="text-right py-2">Preço</th>
                        <th className="text-right py-2">Lucro/Prejuízo</th>
                        <th className="text-right py-2">Margem</th>
                        <th className="text-right py-2">Markup</th>
                        <th className="text-center py-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios
                        .sort((a, b) => b.result.profitMargin - a.result.profitMargin)
                        .map((scenario) => (
                          <tr key={scenario.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 font-medium">{scenario.name}</td>
                            <td className="py-2 text-right font-mono">
                              {formatCurrency(scenario.salePrice)}
                            </td>
                            <td className={`py-2 text-right font-medium ${
                              scenario.result.isProfit ? 'text-success' : 'text-error'
                            }`}>
                              {formatCurrency(Math.abs(scenario.result.profitAmount))}
                            </td>
                            <td className={`py-2 text-right font-medium ${
                              scenario.result.isProfit ? 'text-success' : 'text-error'
                            }`}>
                              {scenario.result.profitMargin.toFixed(2)}%
                            </td>
                            <td className="py-2 text-right">
                              {((scenario.salePrice / productData.nCMC) * 100).toFixed(1)}%
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => removeScenario(scenario.id)}
                                className="text-error hover:text-red-700 text-sm"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Resumo dos Cenários</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Melhor Margem:</span>
                      <div className="font-medium">
                        {Math.max(...scenarios.map(s => s.result.profitMargin)).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-600">Maior Lucro:</span>
                      <div className="font-medium">
                        {formatCurrency(Math.max(...scenarios.map(s => s.result.profitAmount)))}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-600">Cenários Lucrativos:</span>
                      <div className="font-medium">
                        {scenarios.filter(s => s.result.isProfit).length} de {scenarios.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScenarioComparison;