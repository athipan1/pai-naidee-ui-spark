// src/config/api.ts

// Use the new Hugging Face backend URL from environment variables.
// Fallback to the old local URL if it's not set.
let apiBaseUrl = import.meta.env.VITE_HF_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

// Enhanced validation and fallback handling
const validateApiUrl = (url: string | undefined): string | null => {
  if (!url || url === 'undefined' || url === 'your_hf_api_key_here') {
    return null;
  }
  
  try {
    // Validate URL format
    new URL(url);
    return url;
  } catch {
    console.warn(`Invalid API URL format: ${url}`);
    return null;
  }
};

// Primary URL validation
const primaryUrl = validateApiUrl(import.meta.env.VITE_HF_BACKEND_URL);
const fallbackUrl = validateApiUrl(import.meta.env.VITE_API_BASE_URL);

// Set API base URL with proper fallback chain
if (primaryUrl) {
  apiBaseUrl = primaryUrl;
  console.log('Using Hugging Face Backend URL:', primaryUrl);
} else if (fallbackUrl) {
  apiBaseUrl = fallbackUrl;
  console.log('Using fallback API URL:', fallbackUrl);
} else {
  // Default fallback for development
  apiBaseUrl = 'http://localhost:5000/api';
  console.warn('No valid API URL found in environment variables. Using default development URL:', apiBaseUrl);
}

// The environment variable should contain the full, correct base URL.
// We just need to remove any trailing slash to avoid double slashes in requests.
if (apiBaseUrl) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  
  // Add /api suffix if not present and not already a full API URL
  if (!apiBaseUrl.includes('/api') && !apiBaseUrl.includes('localhost')) {
    apiBaseUrl = `${apiBaseUrl}/api`;
  }
}

const API_BASE = apiBaseUrl;

// Export additional utilities for debugging
export const getApiConfig = () => ({
  primary: import.meta.env.VITE_HF_BACKEND_URL,
  fallback: import.meta.env.VITE_API_BASE_URL,
  current: API_BASE,
  environment: import.meta.env.MODE,
});

// Runtime API health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default API_BASE;
