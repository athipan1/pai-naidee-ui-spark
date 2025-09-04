// src/config/api.ts

// Use the new Hugging Face backend URL from environment variables.
// Fallback to the old local URL if it's not set.
let apiBaseUrl = import.meta.env.VITE_HF_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

// The environment variable should contain the full, correct base URL.
// We just need to remove any trailing slash to avoid double slashes in requests.
if (apiBaseUrl) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
}

const API_BASE = apiBaseUrl;

export default API_BASE;
