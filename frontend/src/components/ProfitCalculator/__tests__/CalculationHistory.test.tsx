import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalculationHistory from '../CalculationHistory';
import { ProductData, ProfitResult } from '../../../types';

const mockProductData: ProductData = {
  nIdProduto: 123,
  cCodigo: 'PRD001',
  cDescricao: 'Test Product',
  nCMC: 100.0,
  fIsico: 10,
};

const mockProfitResult: ProfitResult = {
  salePrice: 150.0,
  profitMargin: 33.33,
  profitAmount: 50.0,
  isProfit: true,
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CalculationHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should not render when no history exists', () => {
    const { container } = render(<CalculationHistory />);
    expect(container.firstChild).toBeNull();
  });

  it('should load history from localStorage', () => {
    const mockHistory = JSON.stringify([
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        productData: mockProductData,
        profitResult: mockProfitResult,
      },
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<CalculationHistory />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('profit-calculation-history');
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { container } = render(<CalculationHistory />);
    expect(container.firstChild).toBeNull();
  });

  it('should save new calculations to history', () => {
    render(
      <CalculationHistory 
        currentProduct={mockProductData}
        currentResult={mockProfitResult}
      />
    );
    
    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should show/hide history when button is clicked', () => {
    const mockHistory = JSON.stringify([
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        productData: mockProductData,
        profitResult: mockProfitResult,
      },
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<CalculationHistory />);
    
    const toggleButton = screen.getByText(/mostrar histórico/i);
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/ocultar histórico/i)).toBeInTheDocument();
  });

  it('should clear history when clear button is clicked', () => {
    const mockHistory = JSON.stringify([
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        productData: mockProductData,
        profitResult: mockProfitResult,
      },
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<CalculationHistory />);
    
    const clearButton = screen.getByText(/limpar histórico/i);
    fireEvent.click(clearButton);
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('profit-calculation-history');
  });

  it('should remove individual items', () => {
    const mockHistory = JSON.stringify([
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        productData: mockProductData,
        profitResult: mockProfitResult,
      },
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<CalculationHistory />);
    
    // Show history first
    const toggleButton = screen.getByText(/mostrar histórico/i);
    fireEvent.click(toggleButton);
    
    // Find and click remove button
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should avoid duplicate entries', () => {
    render(
      <CalculationHistory 
        currentProduct={mockProductData}
        currentResult={mockProfitResult}
      />
    );
    
    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should limit history to 20 items', () => {
    // Create 25 mock history items
    const mockHistory = Array.from({ length: 25 }, (_, i) => ({
      id: `test-${i}`,
      timestamp: new Date().toISOString(),
      productData: { ...mockProductData, cCodigo: `PRD${i}` },
      profitResult: mockProfitResult,
    }));
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
    
    render(
      <CalculationHistory 
        currentProduct={mockProductData}
        currentResult={mockProfitResult}
      />
    );
    
    // Should save limited history
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.length).toBeLessThanOrEqual(20);
  });
});