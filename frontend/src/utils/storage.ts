/**
 * Local storage utilities with error handling and type safety
 */

export interface StorageOptions {
  prefix?: string;
  expiry?: number; // Time in milliseconds
  serialize?: boolean;
}

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

/**
 * Enhanced localStorage wrapper with error handling and expiration
 */
export class Storage {
  private prefix: string;

  constructor(prefix: string = 'omie-calc') {
    this.prefix = prefix;
  }

  /**
   * Set item in localStorage with optional expiration
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const { expiry, serialize = true } = options;
      const prefixedKey = this.getPrefixedKey(key);
      
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : undefined,
      };

      const serializedValue = serialize ? JSON.stringify(item) : String(item);
      localStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to set item "${key}":`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with expiration check
   */
  getItem<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serializedValue = localStorage.getItem(prefixedKey);
      
      if (!serializedValue) {
        return defaultValue;
      }

      const item: StorageItem<T> = JSON.parse(serializedValue);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.warn(`[Storage] Failed to get item "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.warn(`[Storage] Failed to remove item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items with the current prefix
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
      
      prefixedKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.warn('[Storage] Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get all keys with the current prefix
   */
  getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      console.warn('[Storage] Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getUsage(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        used += key.length + (localStorage.getItem(key)?.length || 0);
      });

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB
      const available = estimated - used;
      const percentage = (used / estimated) * 100;

      return {
        used,
        available: Math.max(0, available),
        percentage: Math.min(100, percentage),
      };
    } catch (error) {
      console.warn('[Storage] Failed to get usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  private getPrefixedKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}

// Default storage instance
export const storage = new Storage();

// Specific storage utilities for the profit calculator
export const profitStorage = {
  // Save calculation history
  saveCalculation: (calculation: {
    productCode: string;
    productName: string;
    costPrice: number;
    salePrice: number;
    profitMargin: number;
    profitAmount: number;
    timestamp: number;
  }): boolean => {
    const history = profitStorage.getCalculationHistory();
    const newHistory = [calculation, ...history.slice(0, 49)]; // Keep last 50
    return storage.setItem('calculation-history', newHistory);
  },

  // Get calculation history
  getCalculationHistory: (): Array<{
    productCode: string;
    productName: string;
    costPrice: number;
    salePrice: number;
    profitMargin: number;
    profitAmount: number;
    timestamp: number;
  }> => {
    return storage.getItem('calculation-history', []) || [];
  },

  // Clear calculation history
  clearCalculationHistory: (): boolean => {
    return storage.removeItem('calculation-history');
  },

  // Save user preferences
  savePreferences: (preferences: {
    defaultMargin?: number;
    currency?: string;
    decimalPlaces?: number;
    autoCalculate?: boolean;
  }): boolean => {
    return storage.setItem('user-preferences', preferences);
  },

  // Get user preferences
  getPreferences: (): {
    defaultMargin?: number;
    currency?: string;
    decimalPlaces?: number;
    autoCalculate?: boolean;
  } => {
    return storage.getItem('user-preferences') || {
      defaultMargin: 20,
      currency: 'BRL',
      decimalPlaces: 2,
      autoCalculate: true,
    };
  },

  // Save recent product searches
  saveRecentSearch: (productCode: string): boolean => {
    const recent = profitStorage.getRecentSearches();
    const newRecent = [
      productCode,
      ...recent.filter(code => code !== productCode).slice(0, 9)
    ]; // Keep last 10 unique searches
    return storage.setItem('recent-searches', newRecent);
  },

  // Get recent product searches
  getRecentSearches: (): string[] => {
    return storage.getItem('recent-searches', []) || [];
  },

  // Clear recent searches
  clearRecentSearches: (): boolean => {
    return storage.removeItem('recent-searches');
  },
};