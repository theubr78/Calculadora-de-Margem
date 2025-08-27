import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider, useApp } from '../AppContext';
import { ProductData } from '../../types';

const mockProductData: ProductData = {
  codigo_produto: 'PRD001',
  cDescricao: 'Produto Teste',
  nValorUnitario: 100.50,
  cCodigo: 'PRD001',
  nCodProd: 12345,
  cEAN: '1234567890123',
  cNCM: '12345678',
  cReducaoBaseICMS: '0',
  nPesoLiq: 1.5,
  nPesoBruto: 2.0,
  cUnidade: 'UN',
  cOrigem: '0',
  cCST: '00',
  nAliqICMS: 18,
  nAliqIPI: 0,
  nAliqPIS: 1.65,
  nAliqCOFINS: 7.6,
  cCFOP: '5102',
  cTipoItem: 'P',
  cInativo: 'N',
  dAlt: '01/01/2023',
  hAlt: '10:00:00',
  cCodCateg: 'CAT001',
  cDescricaoCategoria: 'Categoria Teste',
  cCodFamilia: 'FAM001',
  cDescricaoFamilia: 'Família Teste',
  cCodMarca: 'MAR001',
  cDescricaoMarca: 'Marca Teste',
  cObservacoes: 'Observações do produto',
  nEstoque: 100,
  nEstoqueMinimo: 10,
  nEstoqueMaximo: 1000,
  cLocalizacao: 'A1-B2-C3',
  nCustoMedio: 80.00,
  nCustoUltCompra: 85.00,
  dUltCompra: '15/12/2023',
  nPrecoVenda: 120.00,
  nMargemLucro: 20.00,
  cControlaEstoque: 'S',
  cAtivo: 'S'
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  describe('Initial State', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current.state).toEqual({
        productData: null,
        profitResult: null,
        loading: false,
        error: null,
      });
    });

    it('should provide all action functions', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(typeof result.current.setProductData).toBe('function');
      expect(typeof result.current.setProfitResult).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.clearData).toBe('function');
    });
  });

  describe('Product Data Management', () => {
    it('should set product data', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setProductData(mockProductData);
      });

      expect(result.current.state.productData).toEqual(mockProductData);
    });

    it('should clear product data', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Set product data first
      act(() => {
        result.current.setProductData(mockProductData);
      });

      expect(result.current.state.productData).toEqual(mockProductData);

      // Clear product data
      act(() => {
        result.current.setProductData(null);
      });

      expect(result.current.state.productData).toBeNull();
    });
  });

  describe('Profit Result Management', () => {
    it('should set profit result', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const profitResult = {
        sellingPrice: 120,
        costPrice: 100,
        profitAmount: 20,
        profitMargin: 16.67,
        markup: 20,
      };

      act(() => {
        result.current.setProfitResult(profitResult);
      });

      expect(result.current.state.profitResult).toEqual(profitResult);
    });

    it('should clear profit result', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const profitResult = {
        sellingPrice: 120,
        costPrice: 100,
        profitAmount: 20,
        profitMargin: 16.67,
        markup: 20,
      };

      // Set profit result first
      act(() => {
        result.current.setProfitResult(profitResult);
      });

      expect(result.current.state.profitResult).toEqual(profitResult);

      // Clear profit result
      act(() => {
        result.current.setProfitResult(null);
      });

      expect(result.current.state.profitResult).toBeNull();
    });
  });

  describe('Loading State Management', () => {
    it('should set loading state to true', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.state.loading).toBe(true);
    });

    it('should set loading state to false', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Set loading to true first
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.state.loading).toBe(true);

      // Set loading to false
      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('Error State Management', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const errorMessage = 'Something went wrong';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.state.error).toBe(errorMessage);
    });

    it('should set error object', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const errorObject = new Error('Test error');

      act(() => {
        result.current.setError(errorObject);
      });

      expect(result.current.state.error).toBe(errorObject);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Set error first
      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.state.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.setError(null);
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Clear Data Functionality', () => {
    it('should clear all data', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const profitResult = {
        sellingPrice: 120,
        costPrice: 100,
        profitAmount: 20,
        profitMargin: 16.67,
        markup: 20,
      };

      // Set all data first
      act(() => {
        result.current.setProductData(mockProductData);
        result.current.setProfitResult(profitResult);
        result.current.setError('Test error');
      });

      // Verify data is set
      expect(result.current.state.productData).toEqual(mockProductData);
      expect(result.current.state.profitResult).toEqual(profitResult);
      expect(result.current.state.error).toBe('Test error');

      // Clear all data
      act(() => {
        result.current.clearData();
      });

      // Verify all data is cleared
      expect(result.current.state.productData).toBeNull();
      expect(result.current.state.profitResult).toBeNull();
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setProductData(mockProductData);
        result.current.setLoading(true);
      });

      expect(result.current.state.productData).toEqual(mockProductData);
      expect(result.current.state.loading).toBe(true);

      rerender();

      expect(result.current.state.productData).toEqual(mockProductData);
      expect(result.current.state.loading).toBe(true);
    });
  });

  describe('Context Provider', () => {
    it('should render children', () => {
      render(
        <AppProvider>
          <div data-testid="child">Test Child</div>
        </AppProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should throw error when useApp is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within an AppProvider');

      console.error = originalError;
    });
  });

  describe('Complex State Updates', () => {
    it('should handle multiple state updates in sequence', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setLoading(true);
        result.current.setProductData(mockProductData);
        result.current.setLoading(false);
      });

      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.productData).toEqual(mockProductData);
    });

    it('should handle concurrent state updates', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const profitResult = {
        sellingPrice: 120,
        costPrice: 100,
        profitAmount: 20,
        profitMargin: 16.67,
        markup: 20,
      };

      act(() => {
        result.current.setProductData(mockProductData);
        result.current.setProfitResult(profitResult);
        result.current.setError('Test error');
        result.current.setLoading(true);
      });

      expect(result.current.state).toEqual({
        productData: mockProductData,
        profitResult: profitResult,
        error: 'Test error',
        loading: true,
      });
    });
  });

  describe('Type Safety', () => {
    it('should accept valid product data structure', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setProductData(mockProductData);
      });

      expect(result.current.state.productData?.codigo_produto).toBe('PRD001');
      expect(result.current.state.productData?.cDescricao).toBe('Produto Teste');
      expect(result.current.state.productData?.nValorUnitario).toBe(100.50);
    });

    it('should accept valid profit result structure', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const profitResult = {
        sellingPrice: 120,
        costPrice: 100,
        profitAmount: 20,
        profitMargin: 16.67,
        markup: 20,
      };

      act(() => {
        result.current.setProfitResult(profitResult);
      });

      expect(result.current.state.profitResult?.sellingPrice).toBe(120);
      expect(result.current.state.profitResult?.profitMargin).toBe(16.67);
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const error = new Error('Test error message');

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.state.error).toBe(error);
    });

    it('should handle string errors', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      const errorMessage = 'String error message';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.state.error).toBe(errorMessage);
    });

    it('should handle null errors', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.setError('Initial error');
        result.current.setError(null);
      });

      expect(result.current.state.error).toBeNull();
    });
  });
});