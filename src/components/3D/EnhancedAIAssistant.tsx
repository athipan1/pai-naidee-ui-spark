import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import { AIStatus } from '@/shared/hooks/useSmartAI';
import { useEnhancedAIAssistant } from './hooks/useEnhancedAIAssistant';
import EnhancedAvatar from './EnhancedAvatar';
import { PerformanceMonitor, calculateLOD, analyzeMessageForGesture } from './utils/assistantUtils';
import { AIAssistantConfig } from './config/AIAssistantConfig';

interface EnhancedAIAssistantProps {
  status: AIStatus;
  statusColor: string;
  messages: Array<{ sender: string; text: string; timestamp: Date }>;
  className?: string;
  config?: Partial<AIAssistantConfig>;
  onConfigChange?: (config: AIAssistantConfig) => void;
}

// Fallback 2D Avatar for performance/compatibility
const FallbackAvatar: React.FC<{ status: AIStatus; statusColor: string; size: { width: number; height: number } }> = ({ 
  status, 
  statusColor, 
  size 
}) => {
  const getStatusAnimation = () => {
    switch (status) {
      case 'listening': return 'animate-pulse';
      case 'thinking': return 'animate-spin';
      case 'talking': return 'animate-bounce';
      default: return '';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
      <div className="relative">
        <div 
          className={`rounded-full border-4 ${getStatusAnimation()} transition-all duration-300`}
          style={{ 
            width: size.width * 0.6,
            height: size.width * 0.6,
            backgroundColor: statusColor,
            borderColor: statusColor,
            boxShadow: `0 0 30px ${statusColor}40`
          }}
        >
          {/* Simple face elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-red-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Error boundary component
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('3D Model Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const EnhancedAIAssistant: React.FC<EnhancedAIAssistantProps> = ({
  status,
  statusColor,
  messages,
  className = '',
  config: initialConfig,
  onConfigChange
}) => {
  const {
    config,
    gestureState,
    interactionState,
    performanceState,
    triggerGesture,
    completeGesture,
    mapStatusToGesture,
    handleInteraction,
    updatePerformance,
    updateConfig
  } = useEnhancedAIAssistant(initialConfig);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const performanceMonitor = useRef(new PerformanceMonitor());
  const [lodLevel, setLodLevel] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(5);

  // Handle status changes and trigger appropriate gestures
  useEffect(() => {
    const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    if (latestMessage && latestMessage.sender === 'ai') {
      const contextualGesture = analyzeMessageForGesture(latestMessage.text);
      mapStatusToGesture(status, latestMessage.text);
      
      // Trigger contextual gesture after a short delay
      setTimeout(() => {
        triggerGesture(contextualGesture);
      }, 500);
    } else {
      mapStatusToGesture(status);
    }
  }, [status, messages, mapStatusToGesture, triggerGesture]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const fps = performanceMonitor.current.updateFPS();
      const newLodLevel = calculateLOD(cameraDistance, window.innerWidth);
      
      setLodLevel(newLodLevel);
      updatePerformance({ 
        fps, 
        lodLevel: newLodLevel,
        isOptimized: fps >= 30
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraDistance, updatePerformance]);

  // Visibility based on screen size and performance
  useEffect(() => {
    const shouldBeVisible = window.innerWidth >= 768 && performanceState.fps >= 15;
    setIsVisible(shouldBeVisible);
  }, [performanceState.fps]);

  // Update config callback
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  // Calculate position styles
  const getPositionStyles = () => {
    const { position, size, offset, zIndex } = config.model;
    
    let positionStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex,
      pointerEvents: 'auto'
    };

    // Horizontal position
    if (position.x === 'left') {
      positionStyles.left = offset.x;
    } else if (position.x === 'right') {
      positionStyles.right = offset.x;
    } else {
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
    }

    // Vertical position
    if (position.y === 'top') {
      positionStyles.top = offset.y;
    } else if (position.y === 'bottom') {
      positionStyles.bottom = offset.y;
    } else {
      positionStyles.top = '50%';
      positionStyles.transform = positionStyles.transform 
        ? `${positionStyles.transform} translateY(-50%)`
        : 'translateY(-50%)';
    }

    // Size
    positionStyles.width = size.width;
    positionStyles.height = size.height;

    return positionStyles;
  };

  if (!config.enabled || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`rounded-lg shadow-lg bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden ${className}`}
      style={getPositionStyles()}
    >
      <ThreeErrorBoundary 
        fallback={
          <FallbackAvatar 
            status={status} 
            statusColor={statusColor} 
            size={config.model.size}
          />
        }
      >
        <Suspense 
          fallback={
            <FallbackAvatar 
              status={status} 
              statusColor={statusColor} 
              size={config.model.size}
            />
          }
        >
          <Canvas
            ref={canvasRef}
            camera={{ 
              position: [0, 0, cameraDistance], 
              fov: 60 
            }}
            performance={{
              min: 0.1,
              max: 1.0,
              debounce: 200
            }}
            dpr={Math.min(window.devicePixelRatio, 2)}
          >
            {/* Lighting optimized for performance */}
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={config.animations.quality === 'high' ? 0.8 : 0.5} 
            />
            {config.animations.quality === 'high' && (
              <pointLight 
                position={[-5, -5, -5]} 
                intensity={0.3} 
                color="#7DD3FC" 
              />
            )}

            {/* Enhanced Avatar */}
            <EnhancedAvatar
              status={status}
              statusColor={statusColor}
              gestureState={gestureState}
              onGestureComplete={completeGesture}
              quality={config.animations.quality}
              lodLevel={lodLevel}
              enableBreathing={config.animations.enableBreathing}
              enableEyeMovement={config.animations.enableEyeMovement}
              smoothTransitions={config.animations.smoothTransitions}
              onInteraction={handleInteraction}
            />

            {/* Floating decorative elements (only on high quality) */}
            {config.animations.quality === 'high' && (
              <>
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                  <Text
                    position={[-2, 1.5, 0]}
                    fontSize={0.2}
                    color="#0EA5E9"
                    anchorX="center"
                    anchorY="middle"
                  >
                    PaiNaiDee
                  </Text>
                </Float>
                
                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.5}>
                  <mesh position={[2, 1, -1]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial 
                      color="#86EFAC" 
                      emissive="#86EFAC" 
                      emissiveIntensity={0.2} 
                    />
                  </mesh>
                </Float>
              </>
            )}

            {/* Controls */}
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={8}
              autoRotate={status === 'idle' && config.animations.idle}
              autoRotateSpeed={0.3}
              onChange={(event) => {
                if (event?.target?.object?.position) {
                  const distance = event.target.object.position.distanceTo(new (window as any).THREE.Vector3(0, 0, 0));
                  setCameraDistance(distance);
                }
              }}
            />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>

      {/* Status indicators overlay */}
      <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              status === 'idle' ? 'bg-blue-500' :
              status === 'listening' ? 'bg-green-500 animate-pulse' :
              status === 'thinking' ? 'bg-yellow-500 animate-spin' :
              status === 'talking' ? 'bg-purple-500 animate-bounce' :
              'bg-red-500'
            }`}
          />
          <span className="capitalize">{status}</span>
        </div>
      </div>

      {/* Performance indicator (debug mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
          <div>FPS: {performanceState.fps}</div>
          <div>LOD: {lodLevel}</div>
        </div>
      )}

      {/* Interaction feedback */}
      {interactionState.isHovered && (
        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none animate-pulse" />
      )}

      {/* Message count indicator */}
      {messages.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          {messages.length}
        </div>
      )}

      {/* Gesture indicator */}
      {gestureState.current !== 'idle' && (
        <div className="absolute bottom-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs">
          {gestureState.current.replace('_', ' ')}
        </div>
      )}
    </div>
  );
};

export default EnhancedAIAssistant;