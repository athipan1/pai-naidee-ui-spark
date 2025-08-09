import React from 'react';

interface LoadingBarProps {
  isVisible: boolean;
  progress?: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ isVisible, progress = 0 }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-travel-neutral-500/20 rounded-full h-1 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-travel-blue-500 to-travel-green-500 h-full rounded-full transition-all duration-300 ease-out"
        style={{ 
          width: progress > 0 ? `${progress}%` : '100%',
          animation: progress === 0 ? 'loading-pulse 1.5s ease-in-out infinite' : undefined
        }}
      />
      <style jsx>{`
        @keyframes loading-pulse {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingBar;