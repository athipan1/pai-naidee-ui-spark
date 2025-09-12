import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  X, 
  Mic, 
  MicOff, 
  MapPin, 
  Star, 
  Utensils, 
  Map,
  Volume2,
  VolumeX,
  EyeOff
} from 'lucide-react';
import useSmartAI, { AIStatus } from '@/shared/hooks/useSmartAI';
import useVoiceInput from '@/shared/hooks/useVoiceInput';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageProvider';

const GlobalAIAssistant: React.FC = () => {
  const { language: lang, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 }); // right-6 bottom-6 in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();

  const { 
    status, 
    sendMessage,
    messages 
  } = useSmartAI();

  const {
    isListening,
    isSupported: isVoiceSupported,
    startListening,
    stopListening
  } = useVoiceInput({
    language: lang === 'th' ? 'th-TH' : 'en-US',
    continuous: false,
    interimResults: true
  });

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check localStorage on mount for hidden state
  useEffect(() => {
    const hidden = localStorage.getItem('aiAssistantHidden');
    if (hidden === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Quick actions based on language
  const quickActions = {
    th: [
      {
        id: 'nearby',
        icon: MapPin,
        label: 'หาที่ใกล้ฉัน',
        query: 'หาสถานที่ท่องเที่ยวใกล้ฉัน',
        color: 'bg-green-100 hover:bg-green-200 text-green-700'
      },
      {
        id: 'map',
        icon: Map,
        label: 'แผนที่ท่องเที่ยว',
        query: 'แสดงแผนที่สถานที่ท่องเที่ยวในประเทศไทย',
        color: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
      },
      {
        id: 'top-attractions',
        icon: Star,
        label: 'สถานที่ยอดนิยม',
        query: 'แนะนำสถานที่ท่องเที่ยวยอดนิยมในประเทศไทย',
        color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
      },
      {
        id: 'food',
        icon: Utensils,
        label: 'อาหารท้องถิ่น',
        query: 'แนะนำอาหารท้องถิ่นและร้านอาหารดีๆ',
        color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
      }
    ],
    en: [
      {
        id: 'nearby',
        icon: MapPin,
        label: 'Find nearby',
        query: 'Find tourist attractions near my location',
        color: 'bg-green-100 hover:bg-green-200 text-green-700'
      },
      {
        id: 'map',
        icon: Map,
        label: 'Travel map',
        query: 'Show me a travel map of Thailand',
        color: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
      },
      {
        id: 'top-attractions',
        icon: Star,
        label: 'Top attractions',
        query: 'Recommend top tourist attractions in Thailand',
        color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
      },
      {
        id: 'food',
        icon: Utensils,
        label: 'Local food',
        query: 'Recommend local Thai food and restaurants',
        color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
      }
    ]
  };

  const currentActions = lang === 'th' ? quickActions.th : quickActions.en;

  const handleQuickAction = (query: string) => {
    if (query === 'hide') {
      setIsHidden(true);
      localStorage.setItem('aiAssistantHidden', 'true');
      setIsMenuOpen(false);
      return;
    }
    sendMessage(query, lang);
    setIsMenuOpen(false);
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.removeItem('aiAssistantHidden');
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((result) => {
        if (result.isFinal && result.transcript.trim()) {
          sendMessage(result.transcript, lang);
          setIsMenuOpen(false);
        }
      });
    }
  };

  const getAvatarEmoji = (status: AIStatus) => {
    switch (status) {
      case 'listening': return '👂';
      case 'thinking': return '🤔';
      case 'talking': return '🗣️';
      case 'error': return '❌';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: AIStatus) => {
    switch (status) {
      case 'idle': return 'bg-blue-500';
      case 'listening': return 'bg-green-500 animate-pulse';
      case 'thinking': return 'bg-yellow-500 animate-pulse';
      case 'talking': return 'bg-purple-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newX = Math.max(16, Math.min(window.innerWidth - 80, dragStart.initialX - deltaX));
    const newY = Math.max(16, Math.min(window.innerHeight - 80, dragStart.initialY - deltaY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      initialX: position.x,
      initialY: position.y
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    
    const newX = Math.max(16, Math.min(window.innerWidth - 80, dragStart.initialX - deltaX));
    const newY = Math.max(16, Math.min(window.innerHeight - 80, dragStart.initialY - deltaY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart]);

  // Don't show on AI Assistant page to avoid duplication
  if (location.pathname === '/ai-assistant') {
    return null;
  }

  // Show restore button when hidden
  if (isHidden) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={handleShow}
          size="sm"
          variant="outline"
          className="bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent/50 text-xs shadow-lg"
        >
          {lang === 'th' ? 'แสดง AI' : 'Show AI'}
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed z-50 transition-all duration-300"
      style={{ 
        bottom: `${position.y}px`, 
        right: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Action Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-20 right-0 w-72 bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border p-4 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">
              {lang === 'th' ? 'ผู้ช่วย AI' : 'AI Assistant'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
              className="w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Controls */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={handleVoiceToggle}
              disabled={!isVoiceSupported}
              className="flex-1"
            >
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {lang === 'th' ?
                (isListening ? 'หยุดฟัง' : 'เริ่มพูด') : 
                (isListening ? 'Stop' : 'Speak')
              }
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  onClick={() => handleQuickAction(action.query)}
                  className={`h-auto p-3 flex flex-col items-center space-y-2 border-0 ${action.color}`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Hide Assistant Button */}
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction('hide')}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              {lang === 'th' ? 'ซ่อนผู้ช่วย' : 'Hide Assistant'}
            </Button>
          </div>

          {/* Status Display */}
          {status !== 'idle' && (
            <div className="mt-4 p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                <span className="text-sm text-muted-foreground capitalize">
                  {lang === 'th' ?
                    (status === 'listening' ? 'กำลังฟัง...' :
                     status === 'thinking' ? 'กำลังคิด...' :
                     status === 'talking' ? 'กำลังตอบ...' : status) : 
                    status
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D AI Avatar Button */}
      <div 
        className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-lg border border-primary/30 backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-200 relative"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 3D-like Avatar */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Main face */}
          <div 
            className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center ${
              status === 'listening' ? 'bg-green-400 animate-pulse' :
              status === 'thinking' ? 'bg-yellow-400' :
              status === 'talking' ? 'bg-blue-400 animate-bounce' :
              'bg-primary'
            }`}
          >
            <div className="text-white text-xl">
              {getAvatarEmoji(status)}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(status)}`}></div>
          
          {/* Message Count Badge */}
          {messages.length > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {messages.length > 9 ? '9+' : messages.length}
            </div>
          )}
          
          {/* Chat Icon Overlay */}
          {!isMenuOpen && (
            <div className="absolute -bottom-1 -left-1 bg-background border border-border rounded-full p-1">
              <MessageCircle className="h-3 w-3 text-primary" />
            </div>
          )}
        </div>

        {/* Tooltip for first-time users */}
        {!isMenuOpen && status === 'idle' && messages.length === 0 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-xs shadow-lg border animate-fade-in whitespace-nowrap">
            {lang === 'th' ? 'คลิกเพื่อสอบถาม AI' : 'Click to ask AI'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background/90"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAIAssistant;