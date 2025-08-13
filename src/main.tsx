import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./app/styles/index.css";
import { logger } from './lib/logger';
import { GlobalErrorBoundary } from './components/system/GlobalErrorBoundary';

// Register service worker for PWA only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
  throw new Error(
    'Failed to find the root element. Please ensure there is a div with id="root" in your HTML.'
  );
}

// Render the application with lazy loading
createRoot(rootElement).render(
  <GlobalErrorBoundary>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GlobalErrorBoundary>
);
