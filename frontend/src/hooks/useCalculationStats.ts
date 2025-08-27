import { useState, useEffect } from 'react';
import { profitStorage } from '../utils/storage';

interface CalculationStats {
  totalCalculations: number;
  averageMargin: number;
  uniqueProducts: number;
  totalProfit: number;
  profitableCalculations: number;
  lastCalculationDate: Date | null;
}

export const useCalculationStats = () => {
  const [stats, setStats] = useState<CalculationStats>({
    totalCalculations: 0,
    averageMargin: 0,
    uniqueProducts: 0,
    totalProfit: 0,
    profitableCalculations: 0,
    lastCalculationDate: null,
  });

  const [loading, setLoading] = useState(true);

  const calculateStats = () => {
    try {
      const history = profitStorage.getCalculationHistory();
      
      if (history.length === 0) {
        setStats({
          totalCalculations: 0,
          averageMargin: 0,
          uniqueProducts: 0,
          totalProfit: 0,
          profitableCalculations: 0,
          lastCalculationDate: null,
        });
        return;
      }

      // Calculate total calculations
      const totalCalculations = history.length;

      // Calculate average margin
      const totalMargin = history.reduce((sum, calc) => sum + calc.profitMargin, 0);
      const averageMargin = totalMargin / totalCalculations;

      // Calculate unique products
      const uniqueProductCodes = new Set(history.map(calc => calc.productCode));
      const uniqueProducts = uniqueProductCodes.size;

      // Calculate total profit amount
      const totalProfit = history.reduce((sum, calc) => sum + calc.profitAmount, 0);

      // Calculate profitable calculations (positive margin)
      const profitableCalculations = history.filter(calc => calc.profitMargin > 0).length;

      // Get last calculation date
      const lastCalculationDate = history.length > 0 
        ? new Date(Math.max(...history.map(calc => calc.timestamp)))
        : null;

      setStats({
        totalCalculations,
        averageMargin,
        uniqueProducts,
        totalProfit,
        profitableCalculations,
        lastCalculationDate,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();

    // Listen for storage changes to update stats in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'calculation-history') {
        calculateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when calculations are saved
    const handleCalculationSaved = () => {
      calculateStats();
    };

    window.addEventListener('calculationSaved', handleCalculationSaved);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('calculationSaved', handleCalculationSaved);
    };
  }, []);

  return { stats, loading, refreshStats: calculateStats };
};