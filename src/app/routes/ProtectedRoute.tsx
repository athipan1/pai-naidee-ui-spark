import { useAuth } from '@/shared/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    // Show a loading spinner while the auth state is being initialized
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!user) {
    // If initialization is complete and there's no user, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;