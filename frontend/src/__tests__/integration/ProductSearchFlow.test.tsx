import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../App';
import { ApiService } from '../../services/api';
import { ProductData } from '../../types';

// Mock API Service
jest.mock('../../services/api');
const MockedApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('Product Search Flow Integration', () => {
  const mockProductData: ProductData = {
    codigo_produto: 'PRD001',
    cDescricao: 'Produto Teste Integração',
    nValorUnitario: 150.75,
    cCodigo: 'PRD001',
    nCodProd: 12345,
    cEAN: '1234567890123',
    cNCM: '12345678',
    cReducaoBaseICMS: '0',
    nPesoLiq: 2.5,
    nPesoBruto: 3.0,
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
    cObservacoes: 'Observações do produto de teste',
    nEstoque: 50,
    nEstoqueMinimo: 5,
    nEstoqueMaximo: 500,
    cLocalizacao: 'A1-B2-C3',
    nCustoMedio: 120.00,
    nCustoUltCompra: 125.00,
    dUltCompra: '20/12/2023',
    nPrecoVenda: 180.00,
    nMargemLucro: 25.00,
    cControlaEstoque: 'S',
    cAtivo: 'S'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Product Search and Calculation Flow', () => {
    it('should complete full user workflow from search to calculation', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      // Step 1: Verify initial state
      expect(screen.getByText('Busca de Produto')).toBeInTheDocument();
      expect(screen.getByLabelText(/código do produto/i)).toBeInTheDocument();
      
      // Step 2: Fill product search form
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');
      
      expect(productCodeInput).toHaveValue('PRD001');

      // Step 3: Submit search form
      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      expect(searchButton).not.toBeDisabled();
      
      await user.click(searchButton);

      // Step 4: Verify loading state
      expect(screen.getByText(/buscando produto no omie/i)).toBeInTheDocument();
      expect(searchButton).toBeDisabled();

      // Step 5: Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });

      // Step 6: Verify product information is displayed
      expect(screen.getByText('PRD001')).toBeInTheDocument();
      expect(screen.getByText('R$ 150,75')).toBeInTheDocument();
      expect(screen.getByText('Categoria Teste')).toBeInTheDocument();

      // Step 7: Verify profit calculator is now available
      expect(screen.getByText('Cálculo de Margem')).toBeInTheDocument();
      const priceInput = screen.getByLabelText(/preço de venda/i);
      expect(priceInput).toBeInTheDocument();

      // Step 8: Enter selling price for calculation
      await user.clear(priceInput);
      await user.type(priceInput, '200.00');

      // Step 9: Verify calculations are displayed
      await waitFor(() => {
        expect(screen.getByText(/margem de lucro/i)).toBeInTheDocument();
        expect(screen.getByText(/valor do lucro/i)).toBeInTheDocument();
      });

      // Step 10: Verify API was called correctly
      expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
        productCode: 'PRD001',
        date: undefined,
      });
    });

    it('should handle search with date parameter', async () => {
      const user = userEvent.setup();
      
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      // Fill form with date
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      const dateInput = screen.getByLabelText(/data.*opcional/i);
      
      await user.type(productCodeInput, 'PRD001');
      await user.type(dateInput, '25/12/2023');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
          productCode: 'PRD001',
          date: '25/12/2023',
        });
      });
    });

    it('should handle product not found error gracefully', async () => {
      const user = userEvent.setup();
      
      MockedApiService.searchProduct.mockRejectedValueOnce(
        new Error('Produto não encontrado')
      );

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'INVALID');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/produto não encontrado/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();

      // Verify calculator is not shown
      expect(screen.queryByText('Cálculo de Margem')).not.toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      
      // First call fails, second succeeds
      MockedApiService.searchProduct
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockProductData);

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      await user.click(retryButton);

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });

      expect(MockedApiService.searchProduct).toHaveBeenCalledTimes(2);
    });

    it('should clear form and results when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      // Search for product
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });

      // Clear form
      const clearButton = screen.getByRole('button', { name: /limpar/i });
      await user.click(clearButton);

      // Verify form is cleared
      expect(productCodeInput).toHaveValue('');
      
      // Verify results are cleared
      expect(screen.queryByText('Produto Teste Integração')).not.toBeInTheDocument();
      expect(screen.queryByText('Cálculo de Margem')).not.toBeInTheDocument();
    });

    it('should handle multiple searches in sequence', async () => {
      const user = userEvent.setup();
      
      const secondProductData = {
        ...mockProductData,
        codigo_produto: 'PRD002',
        cDescricao: 'Segundo Produto',
        nValorUnitario: 75.50,
      };

      MockedApiService.searchProduct
        .mockResolvedValueOnce(mockProductData)
        .mockResolvedValueOnce(secondProductData);

      render(<App />);

      // First search
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      let searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });

      // Second search
      await user.clear(productCodeInput);
      await user.type(productCodeInput, 'PRD002');

      searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Segundo Produto')).toBeInTheDocument();
      });

      // Verify first product is no longer displayed
      expect(screen.queryByText('Produto Teste Integração')).not.toBeInTheDocument();

      expect(MockedApiService.searchProduct).toHaveBeenCalledTimes(2);
    });
  });

  describe('Profit Calculation Integration', () => {
    beforeEach(async () => {
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);
      
      render(<App />);
      
      // Search for product first
      const user = userEvent.setup();
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');
      
      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });
    });

    it('should calculate profit margins in real-time', async () => {
      const user = userEvent.setup();
      
      const priceInput = screen.getByLabelText(/preço de venda/i);
      
      // Test different selling prices
      await user.clear(priceInput);
      await user.type(priceInput, '200.00');
      
      await waitFor(() => {
        // Should show calculated values
        expect(screen.getByText(/margem de lucro/i)).toBeInTheDocument();
        expect(screen.getByText(/valor do lucro/i)).toBeInTheDocument();
      });

      // Change price and verify recalculation
      await user.clear(priceInput);
      await user.type(priceInput, '180.00');
      
      await waitFor(() => {
        // Values should update
        expect(screen.getByText(/margem de lucro/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid selling prices', async () => {
      const user = userEvent.setup();
      
      const priceInput = screen.getByLabelText(/preço de venda/i);
      
      // Test negative price
      await user.clear(priceInput);
      await user.type(priceInput, '-50.00');
      
      await waitFor(() => {
        expect(screen.getByText(/preço não pode ser negativo/i)).toBeInTheDocument();
      });

      // Test invalid characters
      await user.clear(priceInput);
      await user.type(priceInput, 'abc');
      
      await waitFor(() => {
        expect(screen.getByText(/preço deve ser um número válido/i)).toBeInTheDocument();
      });
    });

    it('should show scenario comparison when available', async () => {
      const user = userEvent.setup();
      
      // Enter a selling price to enable calculations
      const priceInput = screen.getByLabelText(/preço de venda/i);
      await user.type(priceInput, '200.00');
      
      await waitFor(() => {
        expect(screen.getByText(/cenários de precificação/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Integration', () => {
    it('should work on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const user = userEvent.setup();
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      // Should still work on mobile
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });
    });

    it('should work on tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const user = userEvent.setup();
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation throughout the flow', async () => {
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      
      // Focus and type using keyboard
      productCodeInput.focus();
      fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
      
      // Submit using Enter key
      fireEvent.keyDown(productCodeInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });

      // Navigate to price input using Tab
      const priceInput = screen.getByLabelText(/preço de venda/i);
      priceInput.focus();
      fireEvent.change(priceInput, { target: { value: '200.00' } });

      await waitFor(() => {
        expect(screen.getByText(/margem de lucro/i)).toBeInTheDocument();
      });
    });

    it('should announce important changes to screen readers', async () => {
      const user = userEvent.setup();
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      // Check for ARIA live regions
      await waitFor(() => {
        const liveRegions = screen.getAllByRole('status');
        expect(liveRegions.length).toBeGreaterThan(0);
      });
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData);

      render(<App />);

      // Test skip links
      const skipLinks = screen.getAllByText(/pular para/i);
      expect(skipLinks.length).toBeGreaterThan(0);

      // Test focus trap in forms
      const productCodeInput = screen.getByLabelText(/código do produto/i);
      productCodeInput.focus();
      expect(document.activeElement).toBe(productCodeInput);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from network errors', async () => {
      const user = userEvent.setup();
      
      // Simulate network error then recovery
      MockedApiService.searchProduct
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(mockProductData);

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Produto Teste Integração')).toBeInTheDocument();
      });
    });

    it('should handle API timeout gracefully', async () => {
      const user = userEvent.setup();
      
      MockedApiService.searchProduct.mockRejectedValueOnce(
        new Error('Request timeout')
      );

      render(<App />);

      const productCodeInput = screen.getByLabelText(/código do produto/i);
      await user.type(productCodeInput, 'PRD001');

      const searchButton = screen.getByRole('button', { name: /buscar produto/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/timeout/i)).toBeInTheDocument();
      });

      // Should show retry option
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });
  });
});