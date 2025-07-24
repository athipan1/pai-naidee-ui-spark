
import { useState, useCallback, useEffect } from 'react';

export const useApiClient = () => {
  const [currentMode, setCurrentMode] = useState<string>('Mock API');

  useEffect(() => {
    // Delay the import to avoid circular dependencies
    const initializeMode = async () => {
      try {
        const { getCurrentApiMode } = await import('../utils/apiClient');
        setCurrentMode(getCurrentApiMode());
      } catch (error) {
        console.error('Failed to initialize API mode:', error);
      }
    };
    initializeMode();
  }, []);

  const switchToMock = useCallback(async () => {
    try {
      const { switchToMockApi } = await import('../utils/apiClient');
      switchToMockApi();
      setCurrentMode('Mock API');
    } catch (error) {
      console.error('Failed to switch to mock API:', error);
    }
  }, []);

  const switchToReal = useCallback(async () => {
    try {
      const { switchToRealApi } = await import('../utils/apiClient');
      switchToRealApi();
      setCurrentMode('Real API');
    } catch (error) {
      console.error('Failed to switch to real API:', error);
    }
  }, []);

  const toggleApiMode = useCallback(() => {
    if (currentMode === 'Mock API') {
      switchToReal();
    } else {
      switchToMock();
    }
  }, [currentMode, switchToMock, switchToReal]);

  return {
    currentMode,
    switchToMock,
    switchToReal,
    toggleApiMode,
    isMockMode: currentMode === 'Mock API',
  };
};
