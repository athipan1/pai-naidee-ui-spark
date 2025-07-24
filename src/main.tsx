import { createRoot } from 'react-dom/client'
import { StrictMode, Suspense, lazy } from 'react'
import LoadingSpinner from './components/common/LoadingSpinner'
import './app/styles/index.css'

// Lazy load the App component for better performance
const App = lazy(() => import('./app/AppMinimal.tsx'))

// Get the root element with proper error handling
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element. Please ensure there is a div with id="root" in your HTML.')
}

// Render the application with StrictMode and Suspense
createRoot(rootElement).render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  </StrictMode>
)
