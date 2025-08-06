import React, { useState, useEffect } from 'react';

interface CSS3DAvatarProps {
  status: string;
  statusColor: string;
  messages: any[];
}

const CSS3DAvatar: React.FC<CSS3DAvatarProps> = ({ status, statusColor, messages }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status === 'talking' || status === 'thinking') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [status]);

  const getStatusAnimation = () => {
    switch (status) {
      case 'listening':
        return 'animate-pulse';
      case 'thinking':
        return 'animate-spin';
      case 'talking':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const shouldShowBubble = latestMessage && latestMessage.sender === 'ai';

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 3D-style avatar using CSS */}
      <div className="relative">
        {/* Main head */}
        <div 
          className={`w-32 h-32 rounded-full border-4 ${getStatusAnimation()} transition-all duration-300`}
          style={{ 
            backgroundColor: statusColor,
            borderColor: statusColor,
            boxShadow: `0 0 30px ${statusColor}40`,
            transform: isAnimating ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          {/* Eyes */}
          <div className="absolute top-8 left-6 w-4 h-4 bg-white rounded-full">
            <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="absolute top-8 right-6 w-4 h-4 bg-white rounded-full">
            <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full"></div>
          </div>
          
          {/* Mouth */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full transition-all duration-200 ${
            status === 'talking' ? 'animate-ping' : ''
          }`}></div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div 
            className="px-4 py-2 rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: statusColor }}
          >
            {status.toUpperCase()}
          </div>
        </div>

        {/* Floating chat bubble */}
        {shouldShowBubble && (
          <div className="absolute -right-40 -top-4 transform transition-all duration-500 ease-out">
            <div className="relative bg-white rounded-2xl p-4 shadow-2xl max-w-xs animate-fade-in">
              <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2">
                <div className="w-0 h-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
              <p className="text-gray-800 text-sm">{latestMessage.text}</p>
              <div className="text-xs text-gray-500 mt-1">
                {latestMessage.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ambient particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Additional visual effects based on status */}
      {status === 'listening' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-green-400 rounded-full animate-ping opacity-30"></div>
        </div>
      )}
    </div>
  );
};

export default CSS3DAvatar;