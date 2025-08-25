import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Mock console methods for cleaner test output
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test timeout
jest.setTimeout(30000);

// Mock external dependencies
jest.mock('axios');

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    url: '/',
    get: jest.fn(),
    ...overrides,
  }),

  createMockResponse: (overrides = {}) => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    ...overrides,
  }),

  createMockNext: () => jest.fn(),

  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  expectToBeCalledWithError: (mockFn: jest.Mock, errorMessage: string) => {
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining(errorMessage),
      })
    );
  },

  expectToBeCalledWithSuccess: (mockFn: jest.Mock, data?: any) => {
    const expectedCall = {
      success: true,
      timestamp: expect.any(String),
    };

    if (data) {
      (expectedCall as any).data = data;
    }

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(expectedCall));
  },
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTimestamp(): R;
      toBeValidUUID(): R;
      toBeValidProductCode(): R;
      toBeValidDate(): R;
    }
  }

  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: (overrides?: any) => any;
    createMockNext: () => jest.Mock;
    waitFor: (ms: number) => Promise<void>;
    expectToBeCalledWithError: (mockFn: jest.Mock, errorMessage: string) => void;
    expectToBeCalledWithSuccess: (mockFn: jest.Mock, data?: any) => void;
  };
}

expect.extend({
  toBeValidTimestamp(received: string) {
    const isValid = !isNaN(Date.parse(received));
    return {
      message: () => `expected ${received} to be a valid timestamp`,
      pass: isValid,
    };
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid UUID`,
      pass: isValid,
    };
  },

  toBeValidProductCode(received: string) {
    const isValid = /^[A-Z0-9_-]{2,50}$/.test(received);
    return {
      message: () => `expected ${received} to be a valid product code`,
      pass: isValid,
    };
  },

  toBeValidDate(received: string) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = received.match(dateRegex);
    
    if (!match) {
      return {
        message: () => `expected ${received} to be in DD/MM/YYYY format`,
        pass: false,
      };
    }

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const isValid = date.getFullYear() === parseInt(year) &&
                   date.getMonth() === parseInt(month) - 1 &&
                   date.getDate() === parseInt(day);

    return {
      message: () => `expected ${received} to be a valid date`,
      pass: isValid,
    };
  },
});

// Error handling for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

export {};