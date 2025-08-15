import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect components for backward compatibility with legacy routes

export const ExploreRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/discover?mode=category', { replace: true });
  }, [navigate]);
  
  return null;
};

export const FavoritesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/saved', { replace: true });
  }, [navigate]);
  
  return null;
};

export const SearchRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/discover?mode=search', { replace: true });
  }, [navigate]);
  
  return null;
};

export const MapRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/discover?mode=map', { replace: true });
  }, [navigate]);
  
  return null;
};

export const AIAssistantRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return null;
};

export const AdminPanelRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);
  
  return null;
};

export const EnhancedAdminRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);
  
  return null;
};

export const DashboardRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);
  
  return null;
};

export const ProfileRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/me', { replace: true });
  }, [navigate]);
  
  return null;
};