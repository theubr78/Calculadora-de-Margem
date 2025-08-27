import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProfit, validateSalePrice } from '../../utils/calculations';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import { ProfitCalculationForm } from '../../types';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Alert from '../UI/Alert';
import ResultsDisplay from './ResultsDisplay';
import PricingScenarios from './PricingScenarios';

const ProfitCalculator: React.FC = () => {
  const { state, setProfitResult } = useApp();
  const [formData, setFormData] = useState<ProfitCalculationForm>({
    salePrice: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<ProfitCalculationForm>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Clear form when product changes
  useEffect(() => {
    if (!state.productData) {
      setFormData({ salePrice: '' });
      setFormErrors({});
      setProfitResult(null);
    }
  }, [state.productData, setProfitResult]);

  // Real-time calculation when sale price changes
  useEffect(() => {
    if (state.productData && formData.salePrice && !formErrors.salePrice) {
      const salePrice = parseCurrency(formData.salePrice);
      if (salePrice > 0) {
        const result = calculateProfit(state.productData.nCMC, salePrice);
        setProfitResult(result);
      } else {
        setProfitResult(null);
      }
    } else {
      setProfitResult(null);
    }
  }, [formData.salePrice, state.productData, formErrors.salePrice, setProfitResult]);

  // Handle input changes
  const handleSalePriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, salePrice: value }));
    
    // Clear field error when user starts typing
    if (formErrors.salePrice) {
      setFormErrors(prev => ({ ...prev, salePrice: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<ProfitCalculationForm> = {};

    // Validate sale price
    const salePriceValidation = validateSalePrice(formData.salePrice);
    if (!salePriceValidation.isValid) {
      errors.salePrice = salePriceValidation.error;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle manual calculation (for validation)
  const handleCalculate = async () => {
    if (!state.productData) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);

    try {
      const salePrice = parseCurrency(formData.salePrice);
      const result = calculateProfit(state.productData.nCMC, salePrice);
      setProfitResult(result);
    } catch (error) {
      console.error('[ProfitCalculator] Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setFormData({ salePrice: '' });
    setFormErrors({});
    setProfitResult(null);
  };

  // Quick price suggestions
  const handleQuickPrice = (multiplier: number) => {
    if (!state.productData) return;
    
    const suggestedPrice = state.productData.nCMC * multiplier;
    const formattedPrice = formatCurrency(suggestedPrice).replace('R$ ', '');
    handleSalePriceChange(formattedPrice);
  };

  // If no product data, show message
  if (!state.productData) {
    return (
      <Alert type="info">
        Busque um produto primeiro para calcular a margem de lucro.
      </Alert>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Product Summary */}
      <div className="bg-background border border-gray-200 rounded-lg p-md">
        <h3 className="font-semibold text-gray-800 mb-sm">Produto Selecionado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-body-small">
          <div>
            <span className="text-gray-600 font-medium">Código:</span>
            <span className="ml-sm font-mono">{state.productData.cCodigo}</span>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Custo Médio:</span>
            <span className="ml-sm font-bold text-success">
              {formatCurrency(state.productData.nCMC)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Estoque:</span>
            <span className="ml-sm">{state.productData.fIsico} unidades</span>
          </div>
        </div>
      </div>

      {/* Price Input Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Preço de Venda"
              type="text"
              value={formData.salePrice}
              onChange={(e) => handleSalePriceChange(e.target.value)}
              error={formErrors.salePrice}
              placeholder="Ex: 1.500,00"
              required
              helperText="Digite o preço de venda desejado"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleCalculate}
              loading={isCalculating}
              disabled={!formData.salePrice.trim() || !!formErrors.salePrice}
              className="mr-2"
            >
              Calcular
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={isCalculating}
            >
              Limpar
            </Button>
          </div>
        </div>

        {/* Quick Price Suggestions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sugestões de Preço:
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickPrice(1.2)}
              disabled={isCalculating}
            >
              +20% ({formatCurrency(state.productData.nCMC * 1.2)})
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickPrice(1.5)}
              disabled={isCalculating}
            >
              +50% ({formatCurrency(state.productData.nCMC * 1.5)})
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickPrice(2.0)}
              disabled={isCalculating}
            >
              +100% ({formatCurrency(state.productData.nCMC * 2.0)})
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickPrice(1.0)}
              disabled={isCalculating}
            >
              Custo ({formatCurrency(state.productData.nCMC)})
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {state.profitResult && (
        <div className="mt-6">
          <ResultsDisplay
            productData={state.productData}
            profitResult={state.profitResult}
            showDetailedInfo={true}
            showRecommendations={true}
          />
        </div>
      )}

      {/* Pricing Scenarios */}
      {state.productData && (
        <div className="mt-6">
          <PricingScenarios
            productData={state.productData}
            currentPrice={state.profitResult?.salePrice}
          />
        </div>
      )}
    </div>
  );
};

export default ProfitCalculator;