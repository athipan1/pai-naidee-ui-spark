// AI Assistant Configuration System
export interface ModelConfig {
  position: {
    x: 'left' | 'right' | 'center';
    y: 'top' | 'bottom' | 'center';
  };
  size: {
    width: number;
    height: number;
  };
  offset: {
    x: number;
    y: number;
  };
  responsive: boolean;
  zIndex: number;
}

export interface AnimationConfig {
  idle: boolean;
  gestures: boolean;
  expressions: boolean;
  quality: 'low' | 'medium' | 'high';
  enableBreathing: boolean;
  enableEyeMovement: boolean;
  smoothTransitions: boolean;
}

export interface PerformanceConfig {
  autoOptimize: boolean;
  maxPolycount: number;
  textureSize: 256 | 512 | 1024;
  animationQuality: 'low' | 'medium' | 'high';
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  cacheSize: string;
  maxFPS: number;
}

export interface GestureMapping {
  greeting: string;
  agreement: string;
  pointing: string;
  explaining: string;
  excitement: string;
  thinking: string;
  restaurant: string;
  hotel: string;
  transportation: string;
  weather: string;
}

export interface AIAssistantConfig {
  model: ModelConfig;
  animations: AnimationConfig;
  performance: PerformanceConfig;
  gestures: GestureMapping;
  enabled: boolean;
  interactivity: boolean;
}

// Default configuration
export const defaultConfig: AIAssistantConfig = {
  model: {
    position: { x: 'right', y: 'bottom' },
    size: { width: 200, height: 300 },
    offset: { x: 20, y: 20 },
    responsive: true,
    zIndex: 100
  },
  animations: {
    idle: true,
    gestures: true,
    expressions: true,
    quality: 'high',
    enableBreathing: true,
    enableEyeMovement: true,
    smoothTransitions: true
  },
  performance: {
    autoOptimize: true,
    maxPolycount: 8000,
    textureSize: 512,
    animationQuality: 'medium',
    enableLOD: true,
    enableFrustumCulling: true,
    cacheSize: '50MB',
    maxFPS: 60
  },
  gestures: {
    greeting: 'wave',
    agreement: 'nod',
    pointing: 'point_to_ui',
    explaining: 'hand_gestures',
    excitement: 'jump_slightly',
    thinking: 'scratch_head',
    restaurant: 'eating_gesture',
    hotel: 'sleeping_gesture',
    transportation: 'driving_gesture',
    weather: 'weather_gesture'
  },
  enabled: true,
  interactivity: true
};

// Configuration presets for different scenarios
export const configPresets = {
  mobile: {
    ...defaultConfig,
    model: {
      ...defaultConfig.model,
      size: { width: 150, height: 225 },
      offset: { x: 10, y: 10 }
    },
    performance: {
      ...defaultConfig.performance,
      maxPolycount: 5000,
      textureSize: 256,
      animationQuality: 'low'
    }
  },
  desktop: {
    ...defaultConfig,
    model: {
      ...defaultConfig.model,
      size: { width: 250, height: 375 },
      offset: { x: 30, y: 30 }
    },
    performance: {
      ...defaultConfig.performance,
      maxPolycount: 10000,
      textureSize: 1024,
      animationQuality: 'high'
    }
  },
  performance: {
    ...defaultConfig,
    animations: {
      ...defaultConfig.animations,
      quality: 'low',
      enableBreathing: false,
      enableEyeMovement: false
    },
    performance: {
      ...defaultConfig.performance,
      maxPolycount: 3000,
      textureSize: 256,
      animationQuality: 'low',
      enableLOD: true
    }
  }
};

// Utility functions for configuration
export const getResponsiveConfig = (screenWidth: number): Partial<ModelConfig> => {
  if (screenWidth < 768) {
    return configPresets.mobile.model;
  } else if (screenWidth > 1920) {
    return configPresets.desktop.model;
  }
  return defaultConfig.model;
};

export const validateConfig = (config: Partial<AIAssistantConfig>): AIAssistantConfig => {
  return {
    ...defaultConfig,
    ...config,
    model: { ...defaultConfig.model, ...config.model },
    animations: { ...defaultConfig.animations, ...config.animations },
    performance: { ...defaultConfig.performance, ...config.performance },
    gestures: { ...defaultConfig.gestures, ...config.gestures }
  };
};