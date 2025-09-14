// src/config/api.ts

// Support both Vite and Next.js environment variable conventions
// Priority: VITE_HF_BACKEND_URL > VITE_API_BASE_URL > NEXT_PUBLIC_API_BASE_URL
let apiBaseUrl = import.meta.env.VITE_HF_BACKEND_URL || 
                 import.meta.env.VITE_API_BASE_URL || 
                 import.meta.env.NEXT_PUBLIC_API_BASE_URL;

// The environment variable should contain the full, correct base URL.
// We just need to remove any trailing slash to avoid double slashes in requests.
if (apiBaseUrl) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
}

const API_BASE = apiBaseUrl;

export default API_BASE;
