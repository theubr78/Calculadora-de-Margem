import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductInfo from '../ProductInfo';
import { ProductData } from '../../../types';

const mockProductData: ProductData = {
  nIdProduto: 243426229,
  cCodigo: 'PRD00003',
  cDescricao: 'Computador Desktop Intel Core i5',
  nCMC: 4856.199914,
  fIsico: 25,
};

describe('ProductInfo', () => {
  it('should render product information correctly', () => {
    render(<ProductInfo productData={mockProductData} />);
    
    expect(screen.getByText('PRD00003')).toBeInTheDocument();
    expect(screen.getByText('Computador Desktop Intel Core i5')).toBeInTheDocument();
    expect(screen.getByText('R$ 4.856,20')).toBeInTheDocument();
    expect(screen.getByText('25 unidades')).toBeInTheDocument();
    expect(screen.getByText('243426229')).toBeInTheDocument();
  });

  it('should show "Em estoque" status when stock is available', () => {
    render(<ProductInfo productData={mockProductData} />);
    
    expect(screen.getByText('Em estoque')).toBeInTheDocument();
  });

  it('should show "Sem estoque" status when stock is zero', () => {
    const noStockProduct = { ...mockProductData, fIsico: 0 };
    render(<ProductInfo productData={noStockProduct} />);
    
    expect(screen.getByText('Sem estoque')).toBeInTheDocument();
  });

  it('should truncate long product descriptions', () => {
    const longDescriptionProduct = {
      ...mockProductData,
      cDescricao: 'This is a very long product description that should be truncated when displayed in the component',
    };
    
    render(<ProductInfo productData={longDescriptionProduct} />);
    
    const descriptionElement = screen.getByText(/This is a very long product description/);
    expect(descriptionElement.textContent).toMatch(/\.\.\.$/);
  });

  it('should display formatted currency correctly', () => {
    const expensiveProduct = { ...mockProductData, nCMC: 12345.67 };
    render(<ProductInfo productData={expensiveProduct} />);
    
    expect(screen.getByText('R$ 12.345,67')).toBeInTheDocument();
  });

  it('should display formatted stock quantity correctly', () => {
    const highStockProduct = { ...mockProductData, fIsico: 1234 };
    render(<ProductInfo productData={highStockProduct} />);
    
    expect(screen.getByText('1.234 unidades')).toBeInTheDocument();
  });
});