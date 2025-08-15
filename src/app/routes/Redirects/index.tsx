import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Redirect component for legacy /explore route to /discover with category mode
 */
const ExploreRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/discover?mode=category', { replace: true });
  }, [navigate]);

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
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    
    const newParams = new URLSearchParams();
    newParams.set('mode', 'search');
    
    if (query) {
      newParams.set('q', query);
    }
    
    if (category) {
      newParams.set('cat', category);
    }
    
    navigate(`/discover?${newParams.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

/**
 * Redirect component for legacy /map route to /discover with map mode
 */
const MapRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const id = searchParams.get('id') || '';
    
    const newParams = new URLSearchParams();
    newParams.set('mode', 'map');
    
    if (id) {
      newParams.set('id', id);
    }
    
    navigate(`/discover?${newParams.toString()}`, { replace: true });
  }, [navigate, searchParams]);

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
 * Redirect component for legacy /dashboard route to /admin
 */
const DashboardRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

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
 * Redirect component for legacy /history route
 */
const HistoryRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/history', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /settings route
 */
const SettingsRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/settings', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /about route
 */
const AboutRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/about', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /contact route
 */
const ContactRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/contact', { replace: true });
  }, [navigate]);

  return null;
};

/**
 * Redirect component for legacy /help route
 */
const HelpRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/help', { replace: true });
  }, [navigate]);

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
  HistoryRedirect,
  SettingsRedirect,
  AboutRedirect,
  ContactRedirect,
  HelpRedirect
};