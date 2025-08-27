import { renderHook, act } from '@testing-library/react';
import { useProductSearch, useConnectionTest, useApiRequest } from '../useApi';
import { ApiService } from '../../services/api';

// Mock the ApiService
jest.mock('../../services/api');
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('useApi hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProductSearch', () => {
    it('should handle successful product search', async () => {
      const mockProduct = {
        nIdProduto: 123,
        cCodigo: 'PRD001',
        cDescricao: 'Test Product',
        nCMC: 100.50,
        fIsico: 10,
      };

      mockApiService.searchProduct.mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProductSearch());

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.searchProduct('PRD001');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockProduct);
      expect(result.current.error).toBe(null);
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Product not found');
      mockApiService.searchProduct.mockRejectedValue(mockError);
      mockApiService.getErrorMessage.mockReturnValue('Produto não encontrado');

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        try {
          await result.current.searchProduct('INVALID');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Produto não encontrado');
    });

    it('should clear data', async () => {
      const mockProduct = {
        nIdProduto: 123,
        cCodigo: 'PRD001',
        cDescricao: 'Test Product',
        nCMC: 100.50,
        fIsico: 10,
      };

      mockApiService.searchProduct.mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProduct('PRD001');
      });

      expect(result.current.data).toEqual(mockProduct);

      act(() => {
        result.current.clearData();
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useConnectionTest', () => {
    it('should handle successful connection test', async () => {
      const mockConnectionResult = {
        connected: true,
        message: 'Connection successful',
        timestamp: '2025-01-01T00:00:00Z',
      };

      mockApiService.testConnection.mockResolvedValue(mockConnectionResult);

      const { result } = renderHook(() => useConnectionTest());

      await act(async () => {
        await result.current.testConnection();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should handle connection test failure', async () => {
      const mockConnectionResult = {
        connected: false,
        message: 'Connection failed',
        timestamp: '2025-01-01T00:00:00Z',
      };

      mockApiService.testConnection.mockResolvedValue(mockConnectionResult);

      const { result } = renderHook(() => useConnectionTest());

      await act(async () => {
        await result.current.testConnection();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(false);
      expect(result.current.error).toBe('Connection failed');
    });
  });

  describe('useApiRequest', () => {
    it('should handle generic API requests', async () => {
      const mockData = { result: 'success' };
      const mockRequest = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiRequest<typeof mockData>());

      await act(async () => {
        await result.current.execute(mockRequest);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    it('should handle request errors', async () => {
      const mockError = new Error('Request failed');
      const mockRequest = jest.fn().mockRejectedValue(mockError);
      mockApiService.getErrorMessage.mockReturnValue('Request failed');

      const { result } = renderHook(() => useApiRequest());

      await act(async () => {
        try {
          await result.current.execute(mockRequest);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Request failed');
    });

    it('should reset state', async () => {
      const mockData = { result: 'success' };
      const mockRequest = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiRequest<typeof mockData>());

      await act(async () => {
        await result.current.execute(mockRequest);
      });

      expect(result.current.data).toEqual(mockData);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });
});