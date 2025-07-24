
import { useState, useCallback } from 'react';
import { apiClient, switchToMockApi, switchToRealApi, getCurrentApiMode } from '../utils/apiClient';

export const useApiClient = () => {
  const [currentMode, setCurrentMode] = useState<string>(getCurrentApiMode());

  const switchToMock = useCallback(() => {
    switchToMockApi();
    setCurrentMode('Mock API');
  }, []);

  const switchToReal = useCallback(() => {
    switchToRealApi();
    setCurrentMode('Real API');
  }, []);

  const toggleApiMode = useCallback(() => {
    if (currentMode === 'Mock API') {
      switchToReal();
    } else {
      switchToMock();
    }
  }, [currentMode, switchToMock, switchToReal]);

  return {
    apiClient,
    currentMode,
    switchToMock,
    switchToReal,
    toggleApiMode,
    isMockMode: currentMode === 'Mock API',
  };
};
