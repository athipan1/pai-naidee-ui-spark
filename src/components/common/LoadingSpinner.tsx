interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner = ({ size = 'md', text, className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${className}`}>
      <div 
        className={`animate-spin rounded-full border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-4 text-muted-foreground text-sm animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingSpinner;
