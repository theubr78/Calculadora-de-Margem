import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, ProductData, ProfitResult } from '../types';

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | string | null }
  | { type: 'SET_PRODUCT_DATA'; payload: ProductData | null }
  | { type: 'SET_PROFIT_RESULT'; payload: ProfitResult | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  productData: null,
  profitResult: null,
  loading: false,
  error: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCT_DATA':
      return { 
        ...state, 
        productData: action.payload, 
        loading: false, 
        error: null,
        // Reset profit result when product changes
        profitResult: action.payload ? state.profitResult : null
      };
    case 'SET_PROFIT_RESULT':
      return { ...state, profitResult: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setLoading: (loading: boolean) => void;
  setError: (error: Error | string | null) => void;
  setProductData: (data: ProductData | null) => void;
  setProfitResult: (result: ProfitResult | null) => void;
  resetState: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: Error | string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setProductData = (data: ProductData | null) => {
    dispatch({ type: 'SET_PRODUCT_DATA', payload: data });
  };

  const setProfitResult = (result: ProfitResult | null) => {
    dispatch({ type: 'SET_PROFIT_RESULT', payload: result });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setProductData,
    setProfitResult,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};