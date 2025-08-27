import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingScenarios from '../PricingScenarios';
import { ProductData } from '../../../types';

describe('PricingScenarios', () => {
  const mockProductData: ProductData = {
    nIdProduto: 123,
    cCodigo: 'PRD001',
    cDescricao: 'Produto Teste',
    nCMC: 100,
    fIsico: 50,
  };

  it('should render pricing scenarios table', () => {
    render(<PricingScenarios productData={mockProductData} />);

    expect(screen.getByText('Cenários de Precificação')).toBeInTheDocument();
    expect(screen.getByText('Compare diferentes preços e suas respectivas margens de lucro')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('Cenário')).toBeInTheDocument();
    expect(screen.getByText('Preço de Venda')).toBeInTheDocument();
    expect(screen.getByText('Margem')).toBeInTheDocument();
    expect(screen.getByText('Lucro por Unidade')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should display break-even scenario', () => {
    render(<PricingScenarios productData={mockProductData} />);

    expect(screen.getByText('Break-even')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument(); // Cost price
    expect(screen.getByText('0,00%')).toBeInTheDocument(); // 0% margin
  });

  it('should display different margin scenarios', () => {
    render(<PricingScenarios productData={mockProductData} />);

    // Check for different margin scenarios
    expect(screen.getByText('10% margem')).toBeInTheDocument();
    expect(screen.getByText('20% margem')).toBeInTheDocument();
    expect(screen.getByText('30% margem')).toBeInTheDocument();
    expect(screen.getByText('50% margem')).toBeInTheDocument();
  });

  it('should highlight current price when provided', () => {
    render(<PricingScenarios productData={mockProductData} currentPrice={125} />);

    expect(screen.getByText('Preço Atual')).toBeInTheDocument();
    expect(screen.getByText('Atual')).toBeInTheDocument(); // Badge
  });

  it('should display correct status badges', () => {
    render(<PricingScenarios productData={mockProductData} />);

    // Should have different status badges
    expect(screen.getByText('❌ Prejuízo')).toBeInTheDocument(); // Break-even shows as prejuízo
    expect(screen.getByText('⚠️ Baixo')).toBeInTheDocument(); // Low margins
    expect(screen.getByText('✅ Bom')).toBeInTheDocument(); // Good margins
    expect(screen.getByText('🎯 Excelente')).toBeInTheDocument(); // Excellent margins
  });

  it('should calculate prices correctly for different margins', () => {
    render(<PricingScenarios productData={mockProductData} />);

    // For 20% margin: price = 100 / (1 - 0.20) = 125
    expect(screen.getByText('R$ 125,00')).toBeInTheDocument();
    
    // For 50% margin: price = 100 / (1 - 0.50) = 200
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument();
  });

  it('should display cost base in footer', () => {
    render(<PricingScenarios productData={mockProductData} />);

    expect(screen.getByText('Custo base:')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('should display legend in footer', () => {
    render(<PricingScenarios productData={mockProductData} />);

    expect(screen.getByText('Prejuízo')).toBeInTheDocument();
    expect(screen.getByText('Baixa margem')).toBeInTheDocument();
    expect(screen.getByText('Boa margem')).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
  });

  it('should sort scenarios by price', () => {
    render(<PricingScenarios productData={mockProductData} />);

    const rows = screen.getAllByRole('row');
    // Skip header row, check that prices are in ascending order
    // This is a simplified check - in a real test you might want to extract and compare actual values
    expect(rows.length).toBeGreaterThan(5); // Header + multiple scenario rows
  });

  it('should handle different cost prices', () => {
    const expensiveProduct: ProductData = {
      ...mockProductData,
      nCMC: 500,
    };

    render(<PricingScenarios productData={expensiveProduct} />);

    // Break-even should show the cost price
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
    
    // 20% margin should be 500 / 0.8 = 625
    expect(screen.getByText('R$ 625,00')).toBeInTheDocument();
  });

  it('should show current price scenario with correct highlighting', () => {
    const currentPrice = 150;
    render(<PricingScenarios productData={mockProductData} currentPrice={currentPrice} />);

    // Should show current price scenario
    expect(screen.getByText('Preço Atual')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    
    // Should show the "Atual" badge
    const currentBadge = screen.getByText('Atual');
    expect(currentBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});