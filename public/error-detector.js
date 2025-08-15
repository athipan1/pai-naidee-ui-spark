/**
 * Runtime Error Detection and Reporting
 * Helps diagnose blank page issues in production
 */

// Error tracking state
let errorCount = 0;
let firstError = null;
const MAX_ERRORS = 10;

/**
 * Enhanced error reporter with detailed context
 */
function reportError(error, context = {}) {
  errorCount++;
  
  if (!firstError) {
    firstError = {
      error,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }
  
  const errorData = {
    message: error.message || String(error),
    stack: error.stack,
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorCount,
    ...context
  };
  
  // Log to console with styling for visibility
  console.group(`%c🚨 Runtime Error #${errorCount}`, 'color: #dc2626; font-weight: bold; font-size: 14px;');
  console.error('Error:', error);
  console.table(errorData);
  console.groupEnd();
  
  // Store in sessionStorage for debugging
  try {
    const storedErrors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
    storedErrors.push(errorData);
    if (storedErrors.length > MAX_ERRORS) {
      storedErrors.shift(); // Remove oldest error
    }
    sessionStorage.setItem('app_errors', JSON.stringify(storedErrors));
  } catch (_error) {
    console.warn('Failed to store error in sessionStorage:', _error);
  }
  
  // Show user-friendly error if too many errors
  if (errorCount >= 3) {
    showErrorDialog();
  }
}

/**
 * Show user-friendly error dialog
 */
function showErrorDialog() {
  if (document.getElementById('error-dialog')) return; // Already shown
  
  const dialog = document.createElement('div');
  dialog.id = 'error-dialog';
  dialog.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        ">
          <span style="color: #dc2626; font-size: 24px;">⚠️</span>
        </div>
        
        <h2 style="margin: 0 0 8px; color: #111827; font-size: 18px; font-weight: 600;">
          Something went wrong
        </h2>
        
        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.5;">
          The application encountered ${errorCount} error${errorCount > 1 ? 's' : ''}. 
          Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button onclick="window.location.reload()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Reload Page
          </button>
          
          <button onclick="window.__showErrorDetails()" style="
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Show Details
          </button>
          
          <button onclick="document.getElementById('error-dialog').remove()" style="
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
}

/**
 * Show error details in console
 */
window.__showErrorDetails = function() {
  console.group('%c🔍 Error Details', 'color: #059669; font-weight: bold; font-size: 16px;');
  
  if (firstError) {
    console.log('First Error:', firstError);
  }
  
  try {
    const storedErrors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
    console.log('All Errors:', storedErrors);
  } catch (e) {
    console.log('No stored errors available');
  }
  
  console.log('Environment Info:', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage }
  });
  
  console.groupEnd();
};

/**
 * Add loading timeout detection
 */
let appLoaded = false;
const LOADING_TIMEOUT = 10000; // 10 seconds

// Mark app as loaded when React renders
window.__markAppLoaded = function() {
  appLoaded = true;
  console.log('%c✅ App loaded successfully', 'color: #059669; font-weight: bold;');
};

// Check if app loaded within timeout
setTimeout(() => {
  if (!appLoaded) {
    reportError(new Error('App failed to load within timeout'), {
      type: 'loading_timeout',
      timeout: LOADING_TIMEOUT
    });
  }
}, LOADING_TIMEOUT);

// Global error handlers
window.addEventListener('error', (event) => {
  reportError(event.error || new Error(event.message), {
    type: 'javascript_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError(new Error('Unhandled Promise Rejection: ' + event.reason), {
    type: 'promise_rejection',
    reason: event.reason
  });
});

// React error boundary detection
window.addEventListener('react-error-boundary', (event) => {
  reportError(event.detail.error, {
    type: 'react_error_boundary',
    componentStack: event.detail.componentStack
  });
});

console.log('%c🔍 Runtime error detection enabled', 'color: #059669; font-weight: bold;');