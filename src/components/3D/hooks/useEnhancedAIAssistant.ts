import { useState, useEffect, useCallback } from 'react';
import { AIAssistantConfig, defaultConfig, getResponsiveConfig, validateConfig } from '../config/AIAssistantConfig';

export interface GestureState {
  current: string;
  target: string;
  isTransitioning: boolean;
  queue: string[];
}

export interface InteractionState {
  isHovered: boolean;
  isClicked: boolean;
  lastInteraction: Date | null;
  interactionCount: number;
}

export interface PerformanceState {
  fps: number;
  polyCount: number;
  textureMemory: number;
  isOptimized: boolean;
  lodLevel: number;
}

export const useEnhancedAIAssistant = (initialConfig?: Partial<AIAssistantConfig>) => {
  const [config, setConfig] = useState<AIAssistantConfig>(() => 
    validateConfig(initialConfig || {})
  );
  
  const [gestureState, setGestureState] = useState<GestureState>({
    current: 'idle',
    target: 'idle',
    isTransitioning: false,
    queue: []
  });

  const [interactionState, setInteractionState] = useState<InteractionState>({
    isHovered: false,
    isClicked: false,
    lastInteraction: null,
    interactionCount: 0
  });

  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    polyCount: 0,
    textureMemory: 0,
    isOptimized: false,
    lodLevel: 0
  });

  // Responsive configuration update
  useEffect(() => {
    if (!config.model.responsive) return;

    const handleResize = () => {
      const responsiveConfig = getResponsiveConfig(window.innerWidth);
      setConfig(prev => ({
        ...prev,
        model: { ...prev.model, ...responsiveConfig }
      }));
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, [config.model.responsive]);

  // Gesture management
  const triggerGesture = useCallback((gestureType: string, immediate = false) => {
    if (!config.animations.gestures) return;

    setGestureState(prev => {
      if (immediate) {
        return {
          ...prev,
          current: gestureType,
          target: gestureType,
          isTransitioning: false,
          queue: []
        };
      }

      if (prev.isTransitioning) {
        return {
          ...prev,
          queue: [...prev.queue, gestureType]
        };
      }

      return {
        ...prev,
        target: gestureType,
        isTransitioning: true,
        queue: prev.queue.filter(g => g !== gestureType)
      };
    });
  }, [config.animations.gestures]);

  // Process gesture queue
  useEffect(() => {
    if (gestureState.queue.length > 0 && !gestureState.isTransitioning) {
      const nextGesture = gestureState.queue[0];
      setGestureState(prev => ({
        ...prev,
        target: nextGesture,
        isTransitioning: true,
        queue: prev.queue.slice(1)
      }));
    }
  }, [gestureState.queue, gestureState.isTransitioning]);

  // Complete gesture transition
  const completeGesture = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      current: prev.target,
      isTransitioning: false
    }));
  }, []);

  // Map AI status to gestures
  const mapStatusToGesture = useCallback((status: string, message?: string) => {
    if (!config.animations.gestures) return;

    let gestureType = 'idle';
    
    switch (status) {
      case 'listening':
        gestureType = config.gestures.agreement;
        break;
      case 'thinking':
        gestureType = config.gestures.thinking;
        break;
      case 'talking':
        if (message) {
          // Simple text analysis for contextual gestures
          const messageText = message.toLowerCase();
          if (messageText.includes('restaurant') || messageText.includes('food')) {
            gestureType = config.gestures.restaurant;
          } else if (messageText.includes('hotel') || messageText.includes('accommodation')) {
            gestureType = config.gestures.hotel;
          } else if (messageText.includes('transport') || messageText.includes('travel')) {
            gestureType = config.gestures.transportation;
          } else if (messageText.includes('weather') || messageText.includes('rain')) {
            gestureType = config.gestures.weather;
          } else {
            gestureType = config.gestures.explaining;
          }
        } else {
          gestureType = config.gestures.explaining;
        }
        break;
      default:
        gestureType = 'idle';
    }

    triggerGesture(gestureType);
  }, [config.gestures, config.animations.gestures, triggerGesture]);

  // Interaction handlers
  const handleInteraction = useCallback((type: 'hover' | 'click' | 'unhover') => {
    if (!config.interactivity) return;

    const now = new Date();
    
    setInteractionState(prev => {
      const newState = { ...prev, lastInteraction: now };
      
      switch (type) {
        case 'hover':
          newState.isHovered = true;
          break;
        case 'unhover':
          newState.isHovered = false;
          break;
        case 'click':
          newState.isClicked = true;
          newState.interactionCount = prev.interactionCount + 1;
          // Reset click state after short delay
          setTimeout(() => {
            setInteractionState(current => ({ ...current, isClicked: false }));
          }, 200);
          break;
      }
      
      return newState;
    });

    // Trigger interaction gestures
    if (type === 'click') {
      triggerGesture(config.gestures.greeting);
    }
  }, [config.interactivity, config.gestures.greeting, triggerGesture]);

  // Performance monitoring
  const updatePerformance = useCallback((stats: Partial<PerformanceState>) => {
    setPerformanceState(prev => ({ ...prev, ...stats }));
  }, []);

  // Auto-optimization based on performance
  useEffect(() => {
    if (!config.performance.autoOptimize) return;

    if (performanceState.fps < 30 && performanceState.fps > 0) {
      // Reduce quality automatically
      setConfig(prev => ({
        ...prev,
        animations: {
          ...prev.animations,
          quality: prev.animations.quality === 'high' ? 'medium' : 'low'
        },
        performance: {
          ...prev.performance,
          maxPolycount: Math.max(3000, prev.performance.maxPolycount * 0.8),
          textureSize: prev.performance.textureSize > 256 ? 256 : prev.performance.textureSize
        }
      }));
    }
  }, [performanceState.fps, config.performance.autoOptimize]);

  // Configuration update function
  const updateConfig = useCallback((newConfig: Partial<AIAssistantConfig>) => {
    setConfig(prev => validateConfig({ ...prev, ...newConfig }));
  }, []);

  return {
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
  };
};