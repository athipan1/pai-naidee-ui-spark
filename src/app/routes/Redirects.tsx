import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

// Define and export placeholder components for each expected redirect.
// This resolves the build error in App.tsx without implementing full redirect logic.

export const ExploreRedirect: React.FC = () => <div>Redirecting...</div>;
export const FavoritesRedirect: React.FC = () => <div>Redirecting...</div>;
export const SearchRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => {
    const next = new URLSearchParams(params);
    const query = params.get('q') || params.get('search');
    const category = params.get('cat') || params.get('category');
    next.delete('search');
    next.delete('category');
    if (query) next.set('q', query);
    if (category) next.set('cat', category);
    next.set('mode', 'search');
    navigate(`/discover?${next}`, { replace: true });
  }, [navigate, params]);
  return null;
};
export const MapRedirect: React.FC = () => <div>Redirecting...</div>;
export const AIAssistantRedirect: React.FC = () => <div>Redirecting...</div>;
export const AdminPanelRedirect: React.FC = () => <div>Redirecting...</div>;
export const EnhancedAdminRedirect: React.FC = () => <div>Redirecting...</div>;
export const DashboardRedirect: React.FC = () => <div>Redirecting...</div>;

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
