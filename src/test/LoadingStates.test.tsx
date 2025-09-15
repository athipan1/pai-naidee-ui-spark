import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  LoadingSpinner,
  Skeleton,
  AttractionCardSkeleton,
  PostCardSkeleton,
  ErrorState,
  NetworkStatus,
  LoadingOverlay,
  EmptyState
} from '@/components/common/LoadingStates';

describe('LoadingStates', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const icon = container.querySelector('.w-8.h-8');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders with default classes', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('rounded-md', 'bg-muted');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="w-full h-4" />);
      const skeleton = container.querySelector('.w-full.h-4');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('AttractionCardSkeleton', () => {
    it('renders attraction card skeleton structure', () => {
      const { container } = render(<AttractionCardSkeleton />);
      
      // Check for card structure
      expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
      
      // Check for image skeleton
      expect(container.querySelector('.h-48')).toBeInTheDocument();
      
      // Check for content skeletons
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(1);
    });
  });

  describe('PostCardSkeleton', () => {
    it('renders post card skeleton structure', () => {
      const { container } = render(<PostCardSkeleton />);
      
      // Check for card structure
      expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
      
      // Check for avatar skeleton
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
      
      // Check for image skeleton
      expect(container.querySelector('.h-64')).toBeInTheDocument();
      
      // Check for interaction buttons skeleton
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(3);
    });
  });

  describe('ErrorState', () => {
    it('renders with basic props', () => {
      render(
        <ErrorState
          title="Error occurred"
          message="Something went wrong"
        />
      );
      
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Error"
          message="Failed to load"
          onRetry={onRetry}
        />
      );
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('renders go home button when onGoHome is provided', () => {
      const onGoHome = vi.fn();
      render(
        <ErrorState
          title="Error"
          message="Failed to load"
          onGoHome={onGoHome}
        />
      );
      
      const homeButton = screen.getByText('Go Home');
      expect(homeButton).toBeInTheDocument();
      
      fireEvent.click(homeButton);
      expect(onGoHome).toHaveBeenCalledOnce();
    });

    it('renders different variants correctly', () => {
      const { container } = render(
        <ErrorState
          title="Network Error"
          message="Connection failed"
          variant="network"
        />
      );
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    });
  });

  describe('NetworkStatus', () => {
    it('does not render when online', () => {
      const { container } = render(
        <NetworkStatus isOnline={true} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders when offline', () => {
      render(
        <NetworkStatus isOnline={false} />
      );
      
      expect(screen.getByText('No internet connection')).toBeInTheDocument();
    });

    it('shows connecting state', () => {
      render(
        <NetworkStatus isOnline={false} isConnecting={true} />
      );
      
      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    });

    it('renders retry button when provided', () => {
      const onRetry = vi.fn();
      render(
        <NetworkStatus 
          isOnline={false} 
          onRetry={onRetry}
        />
      );
      
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe('LoadingOverlay', () => {
    it('does not render when not visible', () => {
      const { container } = render(
        <LoadingOverlay isVisible={false} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('renders when visible', () => {
      render(
        <LoadingOverlay isVisible={true} message="Processing..." />
      );
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('renders progress bar when progress is provided', () => {
      const { container } = render(
        <LoadingOverlay isVisible={true} progress={50} />
      );
      
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders with basic props', () => {
      render(
        <EmptyState
          title="No data"
          description="Nothing to show here"
        />
      );
      
      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No data"
          actionLabel="Add item"
          onAction={onAction}
        />
      );
      
      const actionButton = screen.getByText('Add item');
      expect(actionButton).toBeInTheDocument();
      
      fireEvent.click(actionButton);
      expect(onAction).toHaveBeenCalledOnce();
    });

    it('renders custom icon when provided', () => {
      const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
      render(
        <EmptyState
          title="No data"
          icon={customIcon}
        />
      );
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});