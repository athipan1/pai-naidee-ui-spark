// src/config/api.ts

// Use the new Hugging Face backend URL from environment variables.
// Fallback to the old local URL if it's not set.
let apiBaseUrl = import.meta.env.VITE_HF_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

// Ensure the base URL includes the /api path for consistency,
// and remove any trailing slashes before appending.
if (apiBaseUrl) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  if (!apiBaseUrl.endsWith('/api')) {
    apiBaseUrl += '/api';
  }
}

const API_BASE = apiBaseUrl;

export default API_BASE;
