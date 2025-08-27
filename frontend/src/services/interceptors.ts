import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ErrorCodes } from '../types';

// Request timing interface
interface RequestTiming {
  startTime: number;
  endTime?: number;
  duration?: number;
}

// Request metadata
const requestTimings = new Map<string, RequestTiming>();

/**
 * Setup request interceptors
 */
export const setupRequestInterceptors = (client: AxiosInstance) => {
  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Generate request ID for timing
      const requestId = `${config.method?.toUpperCase()}_${config.url}_${Date.now()}`;
      (config as any).metadata = { requestId };
      
      // Start timing
      requestTimings.set(requestId, { startTime: Date.now() });
      
      // Log request
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
      
      // Add request timestamp
      if (config.headers) {
        config.headers['X-Request-Time'] = new Date().toISOString();
      }
      
      return config;
    },
    (error: AxiosError) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );
};

/**
 * Setup response interceptors
 */
export const setupResponseInterceptors = (client: AxiosInstance) => {
  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const requestId = (response.config as any).metadata?.requestId;
      if (requestId && requestTimings.has(requestId)) {
        const timing = requestTimings.get(requestId)!;
        timing.endTime = Date.now();
        timing.duration = timing.endTime - timing.startTime;
        
        console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          duration: `${timing.duration}ms`,
          size: JSON.stringify(response.data).length,
          data: response.data,
        });
        
        // Clean up timing data
        requestTimings.delete(requestId);
      }
      
      return response;
    },
    (error: AxiosError) => {
      // Calculate request duration for failed requests
      const requestId = (error.config as any)?.metadata?.requestId;
      if (requestId && requestTimings.has(requestId)) {
        const timing = requestTimings.get(requestId)!;
        timing.endTime = Date.now();
        timing.duration = timing.endTime - timing.startTime;
        
        console.error(`[API Error] ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          duration: `${timing.duration}ms`,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        
        // Clean up timing data
        requestTimings.delete(requestId);
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Setup retry interceptor
 */
export const setupRetryInterceptor = (client: AxiosInstance, maxRetries: number = 3) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      // Don't retry if we've already retried too many times
      if (!config || config.__retryCount >= maxRetries) {
        return Promise.reject(error);
      }
      
      // Don't retry on certain error codes
      const noRetryStatuses = [400, 401, 403, 404, 422];
      if (error.response && noRetryStatuses.includes(error.response.status)) {
        return Promise.reject(error);
      }
      
      // Don't retry on validation errors
      if ((error.response?.data as any)?.code === ErrorCodes.VALIDATION_ERROR) {
        return Promise.reject(error);
      }
      
      // Initialize retry count
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount++;
      
      // Calculate delay (exponential backoff)
      const delay = Math.pow(2, config.__retryCount) * 1000;
      
      console.log(`[API Retry] Attempt ${config.__retryCount}/${maxRetries} in ${delay}ms for ${config.method?.toUpperCase()} ${config.url}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return client(config);
    }
  );
};

/**
 * Setup cache interceptor for GET requests
 */
export const setupCacheInterceptor = (client: AxiosInstance, cacheDuration: number = 5 * 60 * 1000) => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  
  client.interceptors.request.use((config) => {
    // Only cache GET requests
    if (config.method?.toLowerCase() !== 'get') {
      return config;
    }
    
    const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      console.log(`[API Cache] Cache hit for ${config.url}`);
      // Return cached response
      return Promise.reject({
        __cached: true,
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    
    return config;
  });
  
  client.interceptors.response.use(
    (response) => {
      // Cache successful GET responses
      if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
        const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params)}`;
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
        
        console.log(`[API Cache] Cached response for ${response.config.url}`);
      }
      
      return response;
    },
    (error) => {
      // Handle cached responses
      if (error.__cached) {
        return Promise.resolve({
          data: error.data,
          status: error.status,
          statusText: error.statusText,
          headers: error.headers,
          config: error.config,
        });
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Setup all interceptors
 */
export const setupAllInterceptors = (client: AxiosInstance) => {
  setupRequestInterceptors(client);
  setupResponseInterceptors(client);
  setupRetryInterceptor(client, 2); // Max 2 retries
  setupCacheInterceptor(client, 2 * 60 * 1000); // 2 minutes cache
};