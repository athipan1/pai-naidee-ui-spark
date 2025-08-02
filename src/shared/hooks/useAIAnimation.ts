import { useState, useEffect, useRef } from 'react';
import type { AIStatus } from './useSmartAI';

export interface AnimationState {
  name: string;
  intensity: number;
  speed: number;
}

export interface AnimationConfig {
  idle: AnimationState;
  listening: AnimationState;
  thinking: AnimationState;
  talking: AnimationState;
  error: AnimationState;
}

const defaultAnimationConfig: AnimationConfig = {
  idle: {
    name: 'idle',
    intensity: 0.3,
    speed: 0.5
  },
  listening: {
    name: 'listening',
    intensity: 0.8,
    speed: 1.2
  },
  thinking: {
    name: 'thinking',
    intensity: 0.6,
    speed: 0.8
  },
  talking: {
    name: 'talking',
    intensity: 1.0,
    speed: 1.5
  },
  error: {
    name: 'error',
    intensity: 0.4,
    speed: 0.3
  }
};

const useAIAnimation = (
  status: AIStatus,
  config: AnimationConfig = defaultAnimationConfig
) => {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState>(config.idle);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Animation transition duration in milliseconds
  const transitionDuration = 500;

  useEffect(() => {
    const targetAnimation = config[status];
    
    if (currentAnimation.name !== targetAnimation.name) {
      // Start transition
      setTransitionProgress(0);
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - (startTimeRef.current || 0);
        const progress = Math.min(elapsed / transitionDuration, 1);
        
        // Easing function for smooth transition
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setTransitionProgress(easeProgress);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentAnimation(targetAnimation);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, config, currentAnimation.name]);

  // Interpolate between current and target animation
  const getInterpolatedAnimation = (): AnimationState => {
    if (transitionProgress >= 1) {
      return currentAnimation;
    }
    
    const targetAnimation = config[status];
    const t = transitionProgress;
    
    return {
      name: targetAnimation.name,
      intensity: currentAnimation.intensity + (targetAnimation.intensity - currentAnimation.intensity) * t,
      speed: currentAnimation.speed + (targetAnimation.speed - currentAnimation.speed) * t
    };
  };

  // Get color based on status
  const getStatusColor = (): string => {
    switch (status) {
      case 'idle':
        return '#3b82f6'; // blue-500
      case 'listening':
        return '#10b981'; // emerald-500
      case 'thinking':
        return '#f59e0b'; // amber-500
      case 'talking':
        return '#8b5cf6'; // violet-500
      case 'error':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Get animation multipliers for different aspects
  const getAnimationMultipliers = () => {
    const animation = getInterpolatedAnimation();
    
    return {
      // Scale pulsing based on intensity
      scaleMultiplier: 1 + (animation.intensity * 0.1 * Math.sin(Date.now() * 0.001 * animation.speed)),
      
      // Rotation speed based on status
      rotationSpeed: animation.speed * 0.5,
      
      // Color intensity
      colorIntensity: animation.intensity,
      
      // Glow effect
      glowIntensity: animation.intensity * 0.8,
      
      // Animation frame rate multiplier
      frameMultiplier: animation.speed
    };
  };

  // Generate talking animation parameters (for mouth movement simulation)
  const getTalkingParams = () => {
    if (status !== 'talking') {
      return { mouthOpenness: 0, headBob: 0 };
    }
    
    const time = Date.now() * 0.01;
    const animation = getInterpolatedAnimation();
    
    return {
      // Random mouth movement during talking
      mouthOpenness: Math.max(0, Math.sin(time * animation.speed) * animation.intensity * 0.5 + 
                     Math.sin(time * animation.speed * 1.7) * animation.intensity * 0.3),
      
      // Subtle head bobbing while talking
      headBob: Math.sin(time * animation.speed * 0.8) * animation.intensity * 0.05
    };
  };

  // Generate listening animation parameters (for ear/attention simulation)
  const getListeningParams = () => {
    if (status !== 'listening') {
      return { attentionLevel: 0, earTwitch: 0 };
    }
    
    const time = Date.now() * 0.001;
    const animation = getInterpolatedAnimation();
    
    return {
      // Attention level affects overall alertness
      attentionLevel: animation.intensity,
      
      // Subtle ear twitching effect
      earTwitch: Math.sin(time * animation.speed * 3) * animation.intensity * 0.1
    };
  };

  return {
    currentAnimation: getInterpolatedAnimation(),
    status,
    statusColor: getStatusColor(),
    transitionProgress,
    animationMultipliers: getAnimationMultipliers(),
    talkingParams: getTalkingParams(),
    listeningParams: getListeningParams(),
    isTransitioning: transitionProgress < 1
  };
};

export default useAIAnimation;