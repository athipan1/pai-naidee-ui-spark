import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Community from './Community';

vi.mock('@/components/common/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/common/BottomNavigation', () => ({
    default: () => <div data-testid="bottom-navigation" />,
}));

vi.mock('@/components/community/UnifiedTravelCommunityFeed', () => ({
    UnifiedTravelCommunityFeed: () => <div data-testid="unified-travel-community-feed" />,
}));

describe('Community Component', () => {
  it('should call onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    render(
      <MemoryRouter>
        <Community currentLanguage="en" onLanguageChange={() => {}} onBack={onBack} />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button');
    await userEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });
});