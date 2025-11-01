import { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

/**
 * Redirect component for legacy /explore route to /discover
 */
const ExploreRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    const queryString = newParams.toString();
    const redirectUrl = queryString ? `/discover?${queryString}` : '/discover';
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

/**
 * Redirect component for legacy /favorites route to /saved
 */
const FavoritesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/saved', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /search route to /discover with search mode
 */
const SearchRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', 'search');
    
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    
    if (category) {
      newParams.set('cat', category);
    }

    // Clean up legacy params
    newParams.delete('search');
    newParams.delete('category');
    
    navigate(`/discover?${newParams.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

/**
 * Redirect component for legacy /map route to /discover with map mode
 */
const MapRedirect = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Use ID from URL params if available, otherwise use query params
  const id = params.id || searchParams.get('id');
  
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', 'map');
    
    // Ensure any existing 'id' from query params is removed
    newParams.delete('id');

    // Only add the 'id' parameter if it has a value to avoid '/discover?id=null'
    if (id && id !== 'null' && id !== 'undefined') {
      newParams.set('id', id);
    }
    
    navigate(`/discover?${newParams.toString()}`, { replace: true });
  }, [navigate, id, searchParams]);

  return null;
};

/**
 * Redirect component for legacy /ai-assistant route 
 * Just redirects to home since AI assistant is now a global overlay
 */
const AIAssistantRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home and potentially trigger AI assistant overlay
    navigate('/', { replace: true });
    
    // TODO: Could dispatch an event here to open the AI assistant overlay
    // window.dispatchEvent(new CustomEvent('openAIAssistant'));
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /admin-panel route to /admin
 */
const AdminPanelRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /enhanced-admin route to /admin
 */
const EnhancedAdminRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /dashboard route to /admin or a nested route.
 * @param {object} props - The component props.
 * @param {string} [props.to="/admin"] - The target URL to redirect to.
 */
const DashboardRedirect = ({ to = "/admin" }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
};

/**
 * Redirect component for legacy /profile route to /me
 */
const ProfileRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/me', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /category/:categoryName route to /discover?cat=:categoryName
 */
const CategoryRedirect = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryName) {
      newParams.set('cat', categoryName);
    }

    const query = newParams.get('q') || newParams.get('search');
    if (query) {
      newParams.set('q', query);
      newParams.set('mode', 'search');
    }

    newParams.delete('search');
    newParams.delete('category');

    const queryString = newParams.toString();
    const redirectUrl = queryString ? `/discover?${queryString}` : '/discover';
    navigate(redirectUrl, { replace: true });
  }, [navigate, categoryName, searchParams]);

  return null;
};

export {
  ExploreRedirect,
  FavoritesRedirect,
  SearchRedirect,
  MapRedirect,
  AIAssistantRedirect,
  AdminPanelRedirect,
  EnhancedAdminRedirect,
  DashboardRedirect,
  ProfileRedirect,
  CategoryRedirect
};