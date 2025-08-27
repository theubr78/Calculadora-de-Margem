import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast, { ToastContainer } from '../Toast';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Toast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const defaultProps = {
    id: 'test-toast',
    type: 'success' as const,
    message: 'Test message',
    onClose: mockOnClose,
  };

  it('should render toast with message', () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render toast with title and message', () => {
    render(<Toast {...defaultProps} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render different toast types with correct styling', () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    
    types.forEach(type => {
      const { container } = render(
        <Toast {...defaultProps} type={type} key={type} />
      );
      
      const toast = container.querySelector('.bg-' + (
        type === 'success' ? 'green-600' :
        type === 'error' ? 'red-600' :
        type === 'warning' ? 'yellow-600' :
        'blue-600'
      ));
      
      expect(toast).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    render(<Toast {...defaultProps} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto close after duration', async () => {
    render(<Toast {...defaultProps} duration={1000} />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast');
    });
  });

  it('should show progress bar', () => {
    const { container } = render(<Toast {...defaultProps} />);
    
    const progressBar = container.querySelector('.h-1');
    expect(progressBar).toBeInTheDocument();
  });
});

describe('ToastContainer', () => {
  const mockToasts = [
    {
      id: '1',
      type: 'success' as const,
      message: 'Success message',
      onClose: jest.fn(),
    },
    {
      id: '2',
      type: 'error' as const,
      message: 'Error message',
      onClose: jest.fn(),
    },
  ];

  it('should render multiple toasts', () => {
    render(<ToastContainer toasts={mockToasts} />);
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render nothing when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply correct position classes', () => {
    const { container } = render(
      <ToastContainer toasts={mockToasts} position="bottom-left" />
    );
    
    const containerElement = container.querySelector('.bottom-4.left-4');
    expect(containerElement).toBeInTheDocument();
  });
});