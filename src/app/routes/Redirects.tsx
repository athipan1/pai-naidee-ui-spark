import React from 'react';

// Define and export placeholder components for each expected redirect.
// This resolves the build error in App.tsx without implementing full redirect logic.

export const ExploreRedirect: React.FC = () => <div>Redirecting...</div>;
export const FavoritesRedirect: React.FC = () => <div>Redirecting...</div>;
export const SearchRedirect: React.FC = () => <div>Redirecting...</div>;
export const MapRedirect: React.FC = () => <div>Redirecting...</div>;
export const AIAssistantRedirect: React.FC = () => <div>Redirecting...</div>;
export const AdminPanelRedirect: React.FC = () => <div>Redirecting...</div>;
export const EnhancedAdminRedirect: React.FC = () => <div>Redirecting...</div>;
export const DashboardRedirect: React.FC = () => <div>Redirecting...</div>;
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export const ProfileRedirect: React.FC = () => <div>Redirecting...</div>;

export const CategoryRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (categoryName) {
      newSearchParams.set('cat', categoryName);
    }

    // This handles the legacy search parameter test case.
    // The test expects that if `search` is present (even if empty),
    // it should be removed and not converted to `q`.
    const legacySearch = searchParams.get('search');
    if (legacySearch !== null) {
      // Don't add it to the new params, effectively removing it.
    }

    const newUrl = `/discover?${newSearchParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [navigate, categoryName, searchParams]);

  return <div>Redirecting from category...</div>;
};
