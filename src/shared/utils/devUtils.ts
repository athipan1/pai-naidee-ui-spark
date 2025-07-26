// Development utilities and helpers
export const isDevelopment = import.meta.env.MODE === "development";
export const isProduction = import.meta.env.MODE === "production";

// Debug logging helper
export const debugLog = (message: string, data?: unknown) => {
  if (isDevelopment && import.meta.env.VITE_ENABLE_DEBUG === "true") {
    console.log(`[PaiNaiDee Debug] ${message}`, data);
  }
};

// Performance monitoring helper
export const performanceLog = (label: string, startTime: number) => {
  if (isDevelopment) {
    const duration = performance.now() - startTime;
    debugLog(`Performance: ${label}`, `${duration.toFixed(2)}ms`);
  }
};

// Feature flag helper
export const isFeatureEnabled = (featureName: string): boolean => {
  const envVar = `VITE_ENABLE_${featureName.toUpperCase()}`;
  return import.meta.env[envVar] === "true";
};

// Environment info helper
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    features: {
      debug: isFeatureEnabled("debug"),
      analytics: isFeatureEnabled("analytics"),
      testingFeatures: isFeatureEnabled("testing_features"),
    },
  };
};
