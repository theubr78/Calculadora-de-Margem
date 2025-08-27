import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ProfitResult, ProductData } from '../../types';
import Card from '../Layout/Card';
import Button from '../UI/Button';

// Calculation history item
interface CalculationHistoryItem {
  id: string;
  timestamp: Date;
  productData: ProductData;
  profitResult: ProfitResult;
}

interface CalculationHistoryProps {
  currentProduct?: ProductData | null;
  currentResult?: ProfitResult | null;
}

const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  currentProduct,
  currentResult,
}) => {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('profit-calculation-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Error loading calculation history:', error);
      }
    }
  }, []);

  // Save current calculation to history
  useEffect(() => {
    if (currentProduct && currentResult && currentResult.salePrice > 0) {
      const newItem: CalculationHistoryItem = {
        id: `${currentProduct.cCodigo}-${Date.now()}`,
        timestamp: new Date(),
        productData: currentProduct,
        profitResult: currentResult,
      };

      setHistory(prev => {
        // Avoid duplicates (same product and price)
        const filtered = prev.filter(item => 
          !(item.productData.cCodigo === currentProduct.cCodigo && 
            Math.abs(item.profitResult.salePrice - currentResult.salePrice) < 0.01)
        );
        
        // Keep only last 20 items
        const updated = [newItem, ...filtered].slice(0, 20);
        
        // Save to localStorage
        try {
          localStorage.setItem('profit-calculation-history', JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving calculation history:', error);
        }
        
        return updated;
      });
    }
  }, [currentProduct, currentResult]);

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('profit-calculation-history');
  };

  // Remove specific item
  const removeItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('profit-calculation-history', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving calculation history:', error);
      }
      return updated;
    });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card title="Histórico de Cálculos" className="mt-lg bg-gray-800 border-gray-600">
      <div className="space-y-md">
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar' : 'Mostrar'} Histórico ({history.length})
          </Button>
          
          {history.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearHistory}
            >
              Limpar Histórico
            </Button>
          )}
        </div>

        {showHistory && (
          <div className="space-y-sm max-h-96 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-md rounded-lg border bg-gray-800 border-gray-600"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-sm">
                      <div className="font-medium text-white">
                        {item.productData.cCodigo} - {item.productData.cDescricao}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-white text-body-small"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-body-small">
                      <div>
                        <span className="text-gray-300">Custo:</span>
                        <div className="font-medium text-white">
                          {formatCurrency(item.productData.nCMC)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-300">Venda:</span>
                        <div className="font-medium text-white">
                          {formatCurrency(item.profitResult.salePrice)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-300">
                          {item.profitResult.isProfit ? 'Lucro:' : 'Prejuízo:'}
                        </span>
                        <div className={`font-medium ${
                          item.profitResult.isProfit ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(Math.abs(item.profitResult.profitAmount))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-300">Margem:</span>
                        <div className={`font-medium ${
                          item.profitResult.isProfit ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.profitResult.profitMargin.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-sm text-caption text-gray-400">
                      {formatDate(item.timestamp)} às {item.timestamp.toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalculationHistory;