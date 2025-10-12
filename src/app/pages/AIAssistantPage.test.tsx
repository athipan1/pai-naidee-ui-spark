import { render, screen } from '@testing-library/react';
import AIAssistantPage from './AIAssistantPage';
import React from 'react';
import { vi } from 'vitest';

vi.mock('@/components/AIAssistant3D', () => ({
  __esModule: true,
  default: vi.fn(({ language }) => <div data-testid="ai-assistant-3d">{language}</div>),
}));

vi.mock('@/components/3D/FloatingAIAssistant', () => ({
  __esModule: true,
  default: vi.fn(({ language }) => <div data-testid="floating-ai-assistant">{language}</div>),
}));

vi.mock('@/components/attraction/BackButton', () => ({
  __esModule: true,
  BackButton: vi.fn(() => <button>Back</button>),
}));

describe('AIAssistantPage', () => {
  it('should pass the currentLanguage prop to AIAssistant3D and FloatingAIAssistant', () => {
    render(<AIAssistantPage currentLanguage="th" onBack={() => {}} />);

    const assistant3D = screen.getByTestId('ai-assistant-3d');
    const floatingAssistant = screen.getByTestId('floating-ai-assistant');

    expect(assistant3D.textContent).toBe('th');
    expect(floatingAssistant.textContent).toBe('th');
  });

  it('should pass "en" as the language to child components when currentLanguage is "en"', () => {
    render(<AIAssistantPage currentLanguage="en" onBack={() => {}} />);

    const assistant3D = screen.getByTestId('ai-assistant-3d');
    const floatingAssistant = screen.getByTestId('floating-ai-assistant');

    expect(assistant3D.textContent).toBe('en');
    expect(floatingAssistant.textContent).toBe('en');
  });
});