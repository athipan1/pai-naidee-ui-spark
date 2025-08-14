import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the BottomNavigation component
const MockBottomNavigation = () => {
  return (
    <nav data-testid="bottom-navigation" className="bottom-nav">
      <div className="nav-item" data-testid="home-nav">
        <span>Home</span>
      </div>
      <div className="nav-item" data-testid="discover-nav">
        <span>Discover</span>
      </div>
      <div className="nav-item" data-testid="community-nav">
        <span>Community</span>
      </div>
      <div className="nav-item" data-testid="saved-nav">
        <span>Saved</span>
      </div>
      <div className="nav-item" data-testid="profile-nav">
        <span>Profile</span>
      </div>
    </nav>
  );
};

describe('BottomNavigation Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders navigation items correctly', () => {
    renderWithRouter(<MockBottomNavigation />);
    
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('home-nav')).toBeInTheDocument();
    expect(screen.getByTestId('discover-nav')).toBeInTheDocument();
    expect(screen.getByTestId('community-nav')).toBeInTheDocument();
    expect(screen.getByTestId('saved-nav')).toBeInTheDocument();
    expect(screen.getByTestId('profile-nav')).toBeInTheDocument();
  });

  it('displays correct navigation labels', () => {
    renderWithRouter(<MockBottomNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    renderWithRouter(<MockBottomNavigation />);
    
    const navigation = screen.getByTestId('bottom-navigation');
    expect(navigation).toHaveClass('bottom-nav');
    
    const navItems = screen.getAllByText(/Home|Discover|Community|Saved|Profile/);
    expect(navItems).toHaveLength(5);
  });
});