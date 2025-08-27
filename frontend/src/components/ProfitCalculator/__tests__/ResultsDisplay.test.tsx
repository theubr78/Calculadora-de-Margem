import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDisplay from '../ResultsDisplay';
import { ProductData, ProfitResult } from '../../../types';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
});

describe('ResultsDisplay', () => {
  const mockProductData: ProductData = {
    nIdProduto: 123,
    cCodigo: 'PRD001',
    cDescricao: 'Produto Teste',
    nCMC: 100,
    fIsico: 50,
  };

  const mockProfitResult: ProfitResult = {
    salePrice: 150,
    profitMargin: 33.33,
    profitAmount: 50,
    isProfit: true,
  };

  const mockLossResult: ProfitResult = {
    salePrice: 80,
    profitMargin: -25,
    profitAmount: -20,
    isProfit: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profit results correctly', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
      />
    );

    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    expect(screen.getByText('33,33%')).toBeInTheDocument();
    expect(screen.getByText('Lucro')).toBeInTheDocument();
    expect(screen.getByText(/Venda com lucro de 33,33%/)).toBeInTheDocument();
  });

  it('should render loss results correctly', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockLossResult}
      />
    );

    expect(screen.getByText('R$ 80,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
    expect(screen.getByText('-25,00%')).toBeInTheDocument();
    expect(screen.getByText('Prejuízo')).toBeInTheDocument();
    expect(screen.getByText(/Venda com prejuízo de 25,00%/)).toBeInTheDocument();
  });

  it('should show excellent status for high margins', () => {
    const highMarginResult: ProfitResult = {
      salePrice: 200,
      profitMargin: 50,
      profitAmount: 100,
      isProfit: true,
    };

    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={highMarginResult}
      />
    );

    expect(screen.getByText('Excelente margem de lucro!')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('should show loss status for negative margins', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockLossResult}
      />
    );

    expect(screen.getByText('Venda com prejuízo')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should display detailed information when enabled', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
        showDetailedInfo={true}
      />
    );

    expect(screen.getByText('Custo Unitário:')).toBeInTheDocument();
    expect(screen.getByText('Markup:')).toBeInTheDocument();
    expect(screen.getByText('ROI:')).toBeInTheDocument();
    expect(screen.getByText('Estoque:')).toBeInTheDocument();
    expect(screen.getByText('50 un.')).toBeInTheDocument();
  });

  it('should hide detailed information when disabled', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
        showDetailedInfo={false}
      />
    );

    expect(screen.queryByText('Custo Unitário:')).not.toBeInTheDocument();
    expect(screen.queryByText('Markup:')).not.toBeInTheDocument();
  });

  it('should show recommendations for loss scenarios', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockLossResult}
        showRecommendations={true}
      />
    );

    expect(screen.getByText('Recomendações')).toBeInTheDocument();
    expect(screen.getByText(/Aumente o preço de venda para evitar prejuízo/)).toBeInTheDocument();
    expect(screen.getByText(/Preço mínimo sugerido/)).toBeInTheDocument();
  });

  it('should show recommendations for low margin scenarios', () => {
    const lowMarginResult: ProfitResult = {
      salePrice: 105,
      profitMargin: 4.76,
      profitAmount: 5,
      isProfit: true,
    };

    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={lowMarginResult}
        showRecommendations={true}
      />
    );

    expect(screen.getByText('Recomendações')).toBeInTheDocument();
    expect(screen.getByText(/Considere aumentar a margem para pelo menos 10%/)).toBeInTheDocument();
  });

  it('should show stock warning for low inventory', () => {
    const lowStockProduct: ProductData = {
      ...mockProductData,
      fIsico: 5,
    };

    render(
      <ResultsDisplay
        productData={lowStockProduct}
        profitResult={mockProfitResult}
        showRecommendations={true}
      />
    );

    expect(screen.getByText(/Estoque baixo - considere reposição/)).toBeInTheDocument();
  });

  it('should hide recommendations when disabled', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockLossResult}
        showRecommendations={false}
      />
    );

    expect(screen.queryByText('Recomendações')).not.toBeInTheDocument();
  });

  it('should copy result to clipboard when copy button is clicked', async () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
      />
    );

    const copyButton = screen.getByText('📋 Copiar Resultado');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Produto: Produto Teste')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Custo: R$ 100,00')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Preço: R$ 150,00')
    );
  });

  it('should trigger print when print button is clicked', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
      />
    );

    const printButton = screen.getByText('🖨️ Imprimir');
    fireEvent.click(printButton);

    expect(window.print).toHaveBeenCalled();
  });

  it('should log save action when save button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
      />
    );

    const saveButton = screen.getByText('💾 Salvar Cálculo');
    fireEvent.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith('Salvar cálculo:', {
      productData: mockProductData,
      profitResult: mockProfitResult,
    });

    consoleSpy.mockRestore();
  });

  it('should calculate and display markup correctly', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
        showDetailedInfo={true}
      />
    );

    // Markup should be (150/100 - 1) * 100 = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('should calculate and display ROI correctly', () => {
    render(
      <ResultsDisplay
        productData={mockProductData}
        profitResult={mockProfitResult}
        showDetailedInfo={true}
      />
    );

    // ROI should be (50/100) * 100 = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });
});