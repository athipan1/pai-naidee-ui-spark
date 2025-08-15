import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./app/styles/index.css";
import { logger } from './lib/logger';
import { GlobalErrorBoundary } from './components/system/GlobalErrorBoundary';
import { appConfig, env } from './lib/config';

// Add global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  logger.error('Unhandled error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack,
    url: window.location.href
  });
});

// Add global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', {
    reason: event.reason,
    url: window.location.href
  });
});

// Register service worker for PWA only in production
if ('serviceWorker' in navigator && appConfig.ENABLE_SW && env.isProduction()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.info('Service worker registered successfully', { registration: registration.scope });
      })
      .catch((registrationError) => {
        logger.error('Service worker registration failed', { error: registrationError.message });
      });
  });
}

// Get the root element with proper error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  const errorMessage = 'Failed to find the root element. Please ensure there is a div with id="root" in your HTML.';
  logger.error(errorMessage);
  
  // Create a fallback error display
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      background: #f8fafc;
    ">
      <div style="max-width: 400px;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">The application failed to initialize properly.</p>
        <button onclick="window.location.reload()" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `;
  throw new Error(errorMessage);
}

// Log successful initialization in development
if (appConfig.ENABLE_DEBUG) {
  logger.info('Application initializing...', {
    config: appConfig,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
}

// Render the application with enhanced error handling
try {
  createRoot(rootElement).render(
    <GlobalErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GlobalErrorBoundary>
  );
  
  // Remove initial loading indicator
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement) {
    loadingElement.remove();
  }
  
  // Mark app as loaded for error detection
  if (typeof window.__markAppLoaded === 'function') {
    window.__markAppLoaded();
  }
  
  if (appConfig.ENABLE_DEBUG) {
    logger.info('Application rendered successfully');
  }
} catch (error) {
  logger.error('Failed to render application:', error);
  
  // Remove loading indicator even on error
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement) {
    loadingElement.remove();
  }
  
  throw error;
}
