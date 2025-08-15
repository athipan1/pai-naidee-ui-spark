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
        // Log but don't throw — ensure SW failure doesn't cause blank page
        logger.error('Service worker registration failed', { error: registrationError?.message ?? registrationError });
      });
  });
}

// Get the root element with safer handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  const message = 'Root element with id="root" not found. Ensure index.html contains <div id="root"></div>.';
  console.error(message);
  // Add a visible fallback so deployers/users see an error on the page rather than a blank page
  const fallback = document.createElement('div');
  fallback.style.padding = '20px';
  fallback.style.background = '#fee';
  fallback.style.color = '#900';
  fallback.style.fontFamily = 'sans-serif';
  fallback.textContent = message;
  document.body.appendChild(fallback);
} else {
  try {
    createRoot(rootElement).render(
      <GlobalErrorBoundary>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </GlobalErrorBoundary>
    );
  } catch (err) {
    console.error('Error while rendering React app:', err);
    const fallback = document.createElement('div');
    fallback.style.padding = '20px';
    fallback.style.background = '#fee';
    fallback.style.color = '#900';
    fallback.style.fontFamily = 'sans-serif';
    fallback.textContent = 'Application failed to start. Check console for details.';
    document.body.appendChild(fallback);
  }
}
