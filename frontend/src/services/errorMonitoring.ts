export interface ErrorData {
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorCode?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  sessionId?: string;
  buildVersion?: string;
  environment: string;
  additionalContext?: Record<string, any>;
}

export interface PerformanceData {
  name: string;
  duration: number;
  timestamp: string;
  url: string;
  additionalData?: Record<string, any>;
}

class ErrorMonitoringService {
  private isEnabled: boolean;
  private apiEndpoint: string;
  private sessionId: string;
  private buildVersion: string;
  private environment: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.apiEndpoint = process.env.REACT_APP_ERROR_MONITORING_ENDPOINT || '';
    this.sessionId = this.generateSessionId();
    this.buildVersion = process.env.REACT_APP_BUILD_VERSION || 'unknown';
    this.environment = process.env.NODE_ENV || 'development';

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        source: 'window.error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          source: 'unhandledrejection',
          promise: event.promise,
        }
      );
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError(new Error(`Resource loading error: ${event.target}`), {
          source: 'resource.error',
          target: event.target,
        });
      }
    }, true);
  }

  public captureError(
    error: Error | unknown,
    additionalContext?: Record<string, any>
  ): void {
    if (!this.isEnabled) {
      console.warn('[ErrorMonitoring] Error monitoring is disabled');
      return;
    }

    const errorData: ErrorData = {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : {
        name: 'UnknownError',
        message: String(error),
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment,
      additionalContext,
    };

    this.sendErrorData(errorData);
  }

  public captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    additionalContext?: Record<string, any>
  ): void {
    if (!this.isEnabled) {
      console.warn('[ErrorMonitoring] Error monitoring is disabled');
      return;
    }

    const errorData: ErrorData = {
      error: {
        name: `Message_${level}`,
        message,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment,
      additionalContext: {
        ...additionalContext,
        level,
      },
    };

    this.sendErrorData(errorData);
  }

  public capturePerformance(
    name: string,
    duration: number,
    additionalData?: Record<string, any>
  ): void {
    if (!this.isEnabled) {
      return;
    }

    const performanceData: PerformanceData = {
      name,
      duration,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      additionalData,
    };

    this.sendPerformanceData(performanceData);
  }

  private async sendErrorData(errorData: ErrorData): Promise<void> {
    try {
      // Log to console in development
      if (this.environment === 'development') {
        console.error('[ErrorMonitoring] Error captured:', errorData);
      }

      // Send to monitoring service
      if (this.apiEndpoint) {
        await fetch(`${this.apiEndpoint}/errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        });
      }

      // Store locally as fallback
      this.storeErrorLocally(errorData);
    } catch (sendError) {
      console.error('[ErrorMonitoring] Failed to send error data:', sendError);
      this.storeErrorLocally(errorData);
    }
  }

  private async sendPerformanceData(performanceData: PerformanceData): Promise<void> {
    try {
      if (this.apiEndpoint) {
        await fetch(`${this.apiEndpoint}/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(performanceData),
        });
      }
    } catch (error) {
      console.error('[ErrorMonitoring] Failed to send performance data:', error);
    }
  }

  private storeErrorLocally(errorData: ErrorData): void {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      storedErrors.push(errorData);
      
      // Keep only last 50 errors
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(storedErrors));
    } catch (error) {
      console.error('[ErrorMonitoring] Failed to store error locally:', error);
    }
  }

  public getStoredErrors(): ErrorData[] {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch (error) {
      console.error('[ErrorMonitoring] Failed to retrieve stored errors:', error);
      return [];
    }
  }

  public clearStoredErrors(): void {
    try {
      localStorage.removeItem('errorLogs');
    } catch (error) {
      console.error('[ErrorMonitoring] Failed to clear stored errors:', error);
    }
  }

  public setUserId(userId: string): void {
    // This would be called when user logs in
    console.log('[ErrorMonitoring] User ID set:', userId);
  }

  public addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    // Add breadcrumb for debugging context
    console.log('[ErrorMonitoring] Breadcrumb:', { message, category, data, timestamp: new Date().toISOString() });
  }
}

// Create singleton instance
export const errorMonitoringService = new ErrorMonitoringService();

// Export for use in components
export default errorMonitoringService;