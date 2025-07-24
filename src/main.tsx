import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './app/styles/index.css'

// Get the root element with proper error handling
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element. Please ensure there is a div with id="root" in your HTML.')
}

// Render the application directly without lazy loading
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
