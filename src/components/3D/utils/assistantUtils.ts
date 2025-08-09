import { MeshStandardMaterial } from 'three';

// Gesture system utilities
export const gestureTransitions = {
  idle: {
    duration: 2000,
    loop: true,
    easing: 'easeInOut'
  },
  wave: {
    duration: 1500,
    loop: false,
    easing: 'easeOut'
  },
  nod: {
    duration: 800,
    loop: false,
    easing: 'easeInOut'
  },
  point_to_ui: {
    duration: 1200,
    loop: false,
    easing: 'easeOut'
  },
  hand_gestures: {
    duration: 2000,
    loop: true,
    easing: 'linear'
  },
  jump_slightly: {
    duration: 600,
    loop: false,
    easing: 'easeOut'
  },
  scratch_head: {
    duration: 1800,
    loop: false,
    easing: 'easeInOut'
  },
  eating_gesture: {
    duration: 1500,
    loop: false,
    easing: 'easeInOut'
  },
  sleeping_gesture: {
    duration: 2500,
    loop: false,
    easing: 'easeInOut'
  },
  driving_gesture: {
    duration: 2000,
    loop: true,
    easing: 'linear'
  },
  weather_gesture: {
    duration: 1800,
    loop: false,
    easing: 'easeInOut'
  }
};

// Performance optimization utilities
export const calculateLOD = (distance: number, screenSize: number): number => {
  if (distance < 3) return 0; // Highest detail
  if (distance < 6) return 1; // Medium detail
  return 2; // Lowest detail
};

export const getPolygonReduction = (lodLevel: number): number => {
  switch (lodLevel) {
    case 0: return 1.0; // Full detail
    case 1: return 0.6; // 60% detail
    case 2: return 0.3; // 30% detail
    default: return 1.0;
  }
};

export const optimizeTexture = (textureSize: number, quality: 'low' | 'medium' | 'high'): number => {
  const baseSize = textureSize;
  switch (quality) {
    case 'low': return Math.min(baseSize, 256);
    case 'medium': return Math.min(baseSize, 512);
    case 'high': return Math.min(baseSize, 1024);
    default: return baseSize;
  }
};

// Material optimization
export const createOptimizedMaterial = (color: string, quality: 'low' | 'medium' | 'high'): MeshStandardMaterial => {
  const material = new MeshStandardMaterial({
    color: color,
    metalness: quality === 'high' ? 0.3 : 0.1,
    roughness: quality === 'high' ? 0.4 : 0.6,
  });

  // Disable unnecessary features for performance
  if (quality === 'low') {
    material.envMapIntensity = 0;
  }

  return material;
};

// Animation smoothing utilities
export const smoothTransition = (
  from: number,
  to: number,
  progress: number,
  easing: string = 'easeInOut'
): number => {
  let easedProgress = progress;
  
  switch (easing) {
    case 'easeIn':
      easedProgress = progress * progress;
      break;
    case 'easeOut':
      easedProgress = 1 - Math.pow(1 - progress, 2);
      break;
    case 'easeInOut':
      easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      break;
    case 'linear':
    default:
      easedProgress = progress;
      break;
  }
  
  return from + (to - from) * easedProgress;
};

// Text analysis for contextual gestures
export const analyzeMessageForGesture = (message: string): string => {
  const text = message.toLowerCase();
  
  // Greeting patterns
  if (/(hello|hi|hey|greetings|good morning|good afternoon|good evening)/.test(text)) {
    return 'greeting';
  }
  
  // Agreement patterns
  if (/(yes|sure|okay|alright|correct|exactly|absolutely)/.test(text)) {
    return 'agreement';
  }
  
  // Excitement patterns
  if (/(amazing|wonderful|fantastic|great|excellent|awesome|wow)/.test(text)) {
    return 'excitement';
  }
  
  // Restaurant/food patterns
  if (/(restaurant|food|eat|meal|cuisine|dining|delicious)/.test(text)) {
    return 'restaurant';
  }
  
  // Hotel/accommodation patterns
  if (/(hotel|accommodation|stay|sleep|room|resort)/.test(text)) {
    return 'hotel';
  }
  
  // Transportation patterns
  if (/(transport|travel|drive|walk|bus|train|taxi|car)/.test(text)) {
    return 'transportation';
  }
  
  // Weather patterns
  if (/(weather|rain|sunny|cloudy|hot|cold|temperature)/.test(text)) {
    return 'weather';
  }
  
  // Pointing/direction patterns
  if (/(here|there|this|that|look|see|point|direction)/.test(text)) {
    return 'pointing';
  }
  
  // Default to explaining
  return 'explaining';
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  
  updateFPS(): number {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    return this.fps;
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  isPerformanceGood(): boolean {
    return this.fps >= 30;
  }
  
  getOptimizationSuggestion(): 'none' | 'reduce_quality' | 'reduce_polycount' | 'disable_features' {
    if (this.fps >= 50) return 'none';
    if (this.fps >= 30) return 'reduce_quality';
    if (this.fps >= 20) return 'reduce_polycount';
    return 'disable_features';
  }
}

// Responsive design utilities
export const getResponsiveSize = (baseSize: { width: number; height: number }, screenWidth: number) => {
  if (screenWidth < 480) {
    return {
      width: baseSize.width * 0.6,
      height: baseSize.height * 0.6
    };
  } else if (screenWidth < 768) {
    return {
      width: baseSize.width * 0.75,
      height: baseSize.height * 0.75
    };
  } else if (screenWidth > 1920) {
    return {
      width: baseSize.width * 1.2,
      height: baseSize.height * 1.2
    };
  }
  return baseSize;
};

export const getResponsiveOffset = (baseOffset: { x: number; y: number }, screenWidth: number) => {
  if (screenWidth < 480) {
    return {
      x: baseOffset.x * 0.5,
      y: baseOffset.y * 0.5
    };
  } else if (screenWidth < 768) {
    return {
      x: baseOffset.x * 0.75,
      y: baseOffset.y * 0.75
    };
  }
  return baseOffset;
};