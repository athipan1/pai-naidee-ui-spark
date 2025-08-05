import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./app/styles/index.css";

// Register service worker for PWA only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
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
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
