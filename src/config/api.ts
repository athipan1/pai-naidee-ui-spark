// src/config/api.ts

// Use the new Hugging Face backend URL from environment variables.
// Fallback to the old local URL if it's not set.
const API_BASE = import.meta.env.VITE_HF_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

export default API_BASE;
