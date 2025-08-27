import { useState, useCallback } from 'react';
import { ApiService } from '../services/api';
import { ProductData } from '../types';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Product search hook
export const useProductSearch = () => {
  const [state, setState] = useState<ApiState<ProductData>>({
    data: null,
    loading: false,
    error: null,
  });

  const searchProduct = useCallback(async (productCode: string, date?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await ApiService.searchProduct({ productCode, date });
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = ApiService.getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const clearData = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    searchProduct,
    clearData,
  };
};

// Connection test hook
export const useConnectionTest = () => {
  const [state, setState] = useState<ApiState<boolean>>({
    data: null,
    loading: false,
    error: null,
  });

  const testConnection = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ApiService.testConnection();
      setState({ 
        data: result.connected, 
        loading: false, 
        error: result.connected ? null : result.message 
      });
      return result;
    } catch (error: any) {
      const errorMessage = ApiService.getErrorMessage(error);
      setState({ data: false, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    testConnection,
  };
};

// Health status hook
export const useHealthStatus = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const getHealthStatus = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await ApiService.getHealthStatus();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = ApiService.getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    getHealthStatus,
  };
};

// Generic API hook for any request
export const useApiRequest = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (requestFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await requestFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = ApiService.getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// API availability hook
export const useApiAvailability = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(async () => {
    setChecking(true);
    try {
      const available = await ApiService.isApiAvailable();
      setIsAvailable(available);
      return available;
    } catch (error) {
      setIsAvailable(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    isAvailable,
    checking,
    checkAvailability,
  };
};
