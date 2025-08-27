import { debounce, throttle, once, delay, memoize } from '../debounce';

// Mock timers for testing
jest.useFakeTimers();

describe('Debounce Utils', () => {
  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should execute immediately when immediate is true', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, true);

      debouncedFn('test');
      expect(mockFn).toHaveBeenCalledWith('test');
    });
  });

  describe('throttle', () => {
    it('should limit function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('third');
    });
  });

  describe('once', () => {
    it('should execute function only once', () => {
      const mockFn = jest.fn(() => 'result');
      const onceFn = once(mockFn);

      const result1 = onceFn('test1');
      const result2 = onceFn('test2');
      const result3 = onceFn('test3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(result3).toBe('result');
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const promise = delay(100);
      
      jest.advanceTimersByTime(50);
      expect(promise).not.toHaveProperty('resolved');
      
      jest.advanceTimersByTime(50);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const mockFn = jest.fn((x: number, y: number) => x + y);
      const memoizedFn = memoize(mockFn);

      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);
      const result3 = memoizedFn(2, 3);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(5);
    });

    it('should use custom key function', () => {
      const mockFn = jest.fn((obj: { id: number; name: string }) => obj.name.toUpperCase());
      const memoizedFn = memoize(mockFn, (obj) => obj.id.toString());

      const result1 = memoizedFn({ id: 1, name: 'test' });
      const result2 = memoizedFn({ id: 1, name: 'different' }); // Same ID, should use cache
      const result3 = memoizedFn({ id: 2, name: 'test' }); // Different ID, should call function

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result1).toBe('TEST');
      expect(result2).toBe('TEST'); // Cached result
      expect(result3).toBe('TEST');
    });
  });
});

// Restore real timers after tests
afterAll(() => {
  jest.useRealTimers();
});