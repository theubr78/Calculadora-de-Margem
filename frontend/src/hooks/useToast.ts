import { useState, useCallback } from 'react';
import { ToastProps } from '../components/UI/Toast';

interface ToastOptions {
  type: ToastProps['type'];
  title?: string;
  message: string;
  duration?: number;
}

interface UseToastReturn {
  toasts: ToastProps[];
  showToast: (options: ToastOptions) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = generateId();
    const newToast: ToastProps = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      onClose: (toastId: string) => hideToast(toastId),
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, [generateId, hideToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string): string => {
    return showToast({ type: 'success', message, title });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string): string => {
    return showToast({ type: 'error', message, title });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string): string => {
    return showToast({ type: 'warning', message, title });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string): string => {
    return showToast({ type: 'info', message, title });
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};