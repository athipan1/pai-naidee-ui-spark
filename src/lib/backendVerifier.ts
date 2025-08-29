/**
 * This module provides functions to verify the backend connection.
 */
import apiClient from './axios';

// 1. Define the correct base URL for the backend API.
// This should point to the Hugging Face Spaces backend.
export const API_BASE = "https://athipan-painai-backend.hf.space";

/**
 * Verifies the backend URL and checks the health of the backend service.
 * @returns {Promise<boolean>} A promise that resolves to true if the backend is correctly configured and responsive, false otherwise.
 */
export const verifyBackendUrl = async (): Promise<boolean> => {
  console.log("Verifying backend connection...");

  // Get the currently configured baseURL from the axios client.
  const currentBaseUrl = apiClient.defaults.baseURL || '';

  // 2. Check if the current URL matches the required backend URL.
  // We use startsWith because the baseURL in axios might include a path like '/api'.
  if (!currentBaseUrl.startsWith(API_BASE)) {
    console.error(
      `[Backend Verification Failed]
      - Expected API Base: ${API_BASE}
      - Found API Base: ${currentBaseUrl}
      Please check your '.env' file and ensure 'VITE_API_BASE_URL' is set correctly.`
    );
    // Display error in the UI as well.
    // This part can be integrated with a global state or toast notification system.
    return false;
  }

  console.log("Backend URL configuration is correct.", { url: currentBaseUrl });

  try {
    // 3. Call a simple endpoint (e.g., /health) to ensure the backend is responsive.
    const response = await apiClient.get('/health');

    // 4. Check for a successful response status (e.g., 200 OK).
    if (response.status === 200) {
      console.log("Backend health check successful.", { status: response.status, data: response.data });
      return true; // Backend is connected and healthy.
    } else {
      console.error(
        `[Backend Verification Failed]
        - Health check returned an unexpected status: ${response.status}`
      );
      return false;
    }
  } catch (error: any) {
    // The existing axios interceptor will likely handle this, but we also log it here for clarity.
    console.error(
      `[Backend Verification Failed]
      - An error occurred during the health check. The backend might be down or unreachable.`,
      error.message
    );
    return false;
  }
};
