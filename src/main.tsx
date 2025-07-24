import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Minimal Test App</h1>
      <p>Testing basic build functionality</p>
    </div>
  );
};

// Get the root element with proper error handling
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element. Please ensure there is a div with id="root" in your HTML.')
}

// Render the application with StrictMode
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
