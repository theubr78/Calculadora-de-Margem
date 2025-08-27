import { Storage, profitStorage } from '../storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utils', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new Storage('test');
    localStorageMock.clear();
  });

  describe('Storage class', () => {
    it('should set and get items', () => {
      const testData = { name: 'test', value: 123 };
      
      const setResult = storage.setItem('test-key', testData);
      expect(setResult).toBe(true);

      const retrievedData = storage.getItem('test-key');
      expect(retrievedData).toEqual(testData);
    });

    it('should return default value when item does not exist', () => {
      const defaultValue = { default: true };
      const result = storage.getItem('non-existent', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should handle expiration', () => {
      const testData = { name: 'test' };
      
      // Set item with 1ms expiration
      storage.setItem('expiring-key', testData, { expiry: 1 });
      
      // Should be available immediately
      expect(storage.getItem('expiring-key')).toEqual(testData);
      
      // Mock time passage
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2);
      
      // Should be expired now
      expect(storage.getItem('expiring-key')).toBeUndefined();
      
      jest.restoreAllMocks();
    });

    it('should remove items', () => {
      storage.setItem('remove-test', 'value');
      expect(storage.getItem('remove-test')).toBe('value');
      
      const removeResult = storage.removeItem('remove-test');
      expect(removeResult).toBe(true);
      expect(storage.getItem('remove-test')).toBeUndefined();
    });

    it('should clear all prefixed items', () => {
      storage.setItem('item1', 'value1');
      storage.setItem('item2', 'value2');
      
      const otherStorage = new Storage('other');
      otherStorage.setItem('item3', 'value3');
      
      storage.clear();
      
      expect(storage.getItem('item1')).toBeUndefined();
      expect(storage.getItem('item2')).toBeUndefined();
      expect(otherStorage.getItem('item3')).toBe('value3');
    });

    it('should get keys with prefix', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      
      const keys = storage.getKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should check availability', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    it('should get usage information', () => {
      const usage = storage.getUsage();
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(usage).toHaveProperty('percentage');
      expect(typeof usage.used).toBe('number');
      expect(typeof usage.available).toBe('number');
      expect(typeof usage.percentage).toBe('number');
    });
  });

  describe('profitStorage', () => {
    beforeEach(() => {
      localStorageMock.clear();
    });

    it('should save and retrieve calculation history', () => {
      const calculation = {
        productCode: 'PRD001',
        productName: 'Test Product',
        costPrice: 100,
        salePrice: 150,
        profitMargin: 33.33,
        profitAmount: 50,
        timestamp: Date.now(),
      };

      const saveResult = profitStorage.saveCalculation(calculation);
      expect(saveResult).toBe(true);

      const history = profitStorage.getCalculationHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(calculation);
    });

    it('should limit calculation history to 50 items', () => {
      // Add 52 calculations
      for (let i = 0; i < 52; i++) {
        profitStorage.saveCalculation({
          productCode: `PRD${i.toString().padStart(3, '0')}`,
          productName: `Product ${i}`,
          costPrice: 100,
          salePrice: 150,
          profitMargin: 33.33,
          profitAmount: 50,
          timestamp: Date.now() + i,
        });
      }

      const history = profitStorage.getCalculationHistory();
      expect(history).toHaveLength(50);
      expect(history[0].productCode).toBe('PRD051'); // Most recent
    });

    it('should save and retrieve user preferences', () => {
      const preferences = {
        defaultMargin: 25,
        currency: 'USD',
        decimalPlaces: 3,
        autoCalculate: false,
      };

      const saveResult = profitStorage.savePreferences(preferences);
      expect(saveResult).toBe(true);

      const retrievedPreferences = profitStorage.getPreferences();
      expect(retrievedPreferences).toEqual(preferences);
    });

    it('should return default preferences when none saved', () => {
      const preferences = profitStorage.getPreferences();
      expect(preferences).toEqual({
        defaultMargin: 20,
        currency: 'BRL',
        decimalPlaces: 2,
        autoCalculate: true,
      });
    });

    it('should save and retrieve recent searches', () => {
      profitStorage.saveRecentSearch('PRD001');
      profitStorage.saveRecentSearch('PRD002');
      profitStorage.saveRecentSearch('PRD003');

      const recent = profitStorage.getRecentSearches();
      expect(recent).toEqual(['PRD003', 'PRD002', 'PRD001']);
    });

    it('should avoid duplicate recent searches', () => {
      profitStorage.saveRecentSearch('PRD001');
      profitStorage.saveRecentSearch('PRD002');
      profitStorage.saveRecentSearch('PRD001'); // Duplicate

      const recent = profitStorage.getRecentSearches();
      expect(recent).toEqual(['PRD001', 'PRD002']);
    });

    it('should limit recent searches to 10 items', () => {
      // Add 12 searches
      for (let i = 0; i < 12; i++) {
        profitStorage.saveRecentSearch(`PRD${i.toString().padStart(3, '0')}`);
      }

      const recent = profitStorage.getRecentSearches();
      expect(recent).toHaveLength(10);
      expect(recent[0]).toBe('PRD011'); // Most recent
    });

    it('should clear calculation history', () => {
      profitStorage.saveCalculation({
        productCode: 'PRD001',
        productName: 'Test Product',
        costPrice: 100,
        salePrice: 150,
        profitMargin: 33.33,
        profitAmount: 50,
        timestamp: Date.now(),
      });

      expect(profitStorage.getCalculationHistory()).toHaveLength(1);
      
      const clearResult = profitStorage.clearCalculationHistory();
      expect(clearResult).toBe(true);
      expect(profitStorage.getCalculationHistory()).toHaveLength(0);
    });

    it('should clear recent searches', () => {
      profitStorage.saveRecentSearch('PRD001');
      expect(profitStorage.getRecentSearches()).toHaveLength(1);
      
      const clearResult = profitStorage.clearRecentSearches();
      expect(clearResult).toBe(true);
      expect(profitStorage.getRecentSearches()).toHaveLength(0);
    });
  });
});