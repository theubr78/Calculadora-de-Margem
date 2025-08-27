import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductSearch from '../ProductSearch';
import { AppProvider } from '../../../context/AppContext';
import { ToastProvider } from '../../../context/ToastContext';
import { ApiService } from '../../../services/api';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('../../../hooks/useAccessibility', () => ({
  useAnnouncements: () => ({
    announce: jest.fn(),
  }),
}));
jest.mock('../../../hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleAsyncError: jest.fn((fn) => fn()),
  }),
}));

const MockedApiService = ApiService as jest.Mocked<typeof ApiService>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <ToastProvider position="top-right">
      {children}
    </ToastProvider>
  </AppProvider>
);

describe('ProductSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search form', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/código do produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data.*opcional/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar produto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
  });

  it('should have proper form accessibility attributes', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('aria-label', 'Busca de produto no OMIE');
  });

  it('should handle product code input', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });

    expect(productCodeInput).toHaveValue('PRD001');
  });

  it('should handle date input', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const dateInput = screen.getByLabelText(/data.*opcional/i);
    fireEvent.change(dateInput, { target: { value: '25/12/2023' } });

    expect(dateInput).toHaveValue('25/12/2023');
  });

  it('should fill current date when "Hoje" button is clicked', () => {
    // Mock current date
    const mockDate = new Date('2023-12-25');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const todayButton = screen.getByRole('button', { name: /preencher com a data de hoje/i });
    fireEvent.click(todayButton);

    const dateInput = screen.getByLabelText(/data.*opcional/i);
    expect(dateInput).toHaveValue('25/12/2023');

    // Restore Date
    (global.Date as any).mockRestore();
  });

  it('should disable submit button when product code is empty', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /buscar produto/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when product code is provided', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should search product successfully', async () => {
    const mockProductData = {
      codigo_produto: 'PRD001',
      cDescricao: 'Produto Teste',
      nValorUnitario: 100.50,
    };

    MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData as any);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
        productCode: 'PRD001',
        date: undefined,
      });
    });
  });

  it('should search product with date', async () => {
    const mockProductData = {
      codigo_produto: 'PRD001',
      cDescricao: 'Produto Teste',
      nValorUnitario: 100.50,
    };

    MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData as any);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const dateInput = screen.getByLabelText(/data.*opcional/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.change(dateInput, { target: { value: '25/12/2023' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
        productCode: 'PRD001',
        date: '25/12/2023',
      });
    });
  });

  it('should show loading state during search', async () => {
    MockedApiService.searchProduct.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({} as any), 100))
    );

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText(/buscando produto no omie/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Check button is disabled during loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Buscando...');

    await waitFor(() => {
      expect(screen.queryByText(/buscando produto no omie/i)).not.toBeInTheDocument();
    });
  });

  it('should handle search error', async () => {
    const mockError = new Error('Produto não encontrado');
    MockedApiService.searchProduct.mockRejectedValueOnce(mockError);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'INVALID' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/produto não encontrado/i)).toBeInTheDocument();
    });
  });

  it('should clear form when clear button is clicked', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const dateInput = screen.getByLabelText(/data.*opcional/i);
    const clearButton = screen.getByRole('button', { name: /limpar/i });

    // Fill form
    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.change(dateInput, { target: { value: '25/12/2023' } });

    // Clear form
    fireEvent.click(clearButton);

    expect(productCodeInput).toHaveValue('');
    expect(dateInput).toHaveValue('');
  });

  it('should validate product code format', async () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    // Test invalid product code
    fireEvent.change(productCodeInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);

    // Should not call API with invalid code
    expect(MockedApiService.searchProduct).not.toHaveBeenCalled();
  });

  it('should validate date format', async () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const dateInput = screen.getByLabelText(/data.*opcional/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.change(dateInput, { target: { value: 'invalid-date' } });
    fireEvent.click(submitButton);

    // Should not call API with invalid date
    expect(MockedApiService.searchProduct).not.toHaveBeenCalled();
  });

  it('should handle form submission with Enter key', async () => {
    const mockProductData = {
      codigo_produto: 'PRD001',
      cDescricao: 'Produto Teste',
      nValorUnitario: 100.50,
    };

    MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData as any);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.keyDown(productCodeInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
        productCode: 'PRD001',
        date: undefined,
      });
    });
  });

  it('should disable form during loading', async () => {
    MockedApiService.searchProduct.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({} as any), 100))
    );

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const dateInput = screen.getByLabelText(/data.*opcional/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });
    const clearButton = screen.getByRole('button', { name: /limpar/i });
    const todayButton = screen.getByRole('button', { name: /preencher com a data de hoje/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.click(submitButton);

    // All form elements should be disabled during loading
    expect(productCodeInput).toBeDisabled();
    expect(dateInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
    expect(todayButton).toBeDisabled();

    await waitFor(() => {
      expect(productCodeInput).not.toBeDisabled();
    });
  });

  it('should format product code correctly', async () => {
    const mockProductData = {
      codigo_produto: 'PRD001',
      cDescricao: 'Produto Teste',
      nValorUnitario: 100.50,
    };

    MockedApiService.searchProduct.mockResolvedValueOnce(mockProductData as any);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    // Input lowercase code
    fireEvent.change(productCodeInput, { target: { value: 'prd001' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(MockedApiService.searchProduct).toHaveBeenCalledWith({
        productCode: 'PRD001', // Should be formatted to uppercase
        date: undefined,
      });
    });
  });

  it('should have proper ARIA labels and descriptions', () => {
    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const dateInput = screen.getByLabelText(/data.*opcional/i);

    expect(productCodeInput).toHaveAttribute('aria-label', 'Código do produto para busca no OMIE');
    expect(productCodeInput).toHaveAttribute('aria-describedby', 'product-code-help');
    
    expect(dateInput).toHaveAttribute('aria-label', 'Data para consulta do produto, opcional');
    expect(dateInput).toHaveAttribute('aria-describedby', 'date-help');
  });

  it('should show retry option on error', async () => {
    const mockError = new Error('Erro de conexão');
    MockedApiService.searchProduct.mockRejectedValueOnce(mockError);

    render(
      <TestWrapper>
        <ProductSearch />
      </TestWrapper>
    );

    const productCodeInput = screen.getByLabelText(/código do produto/i);
    const submitButton = screen.getByRole('button', { name: /buscar produto/i });

    fireEvent.change(productCodeInput, { target: { value: 'PRD001' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
  });
});