import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, RefreshCw } from "lucide-react";
import error404Monitor from "@/lib/error404Monitor";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Enhanced logging with more context
    const errorDetails = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    
    console.error("404 Error: User attempted to access non-existent route:", errorDetails);
    
    // Track 404 error with monitoring system
    error404Monitor.trackRoute404(location.pathname, {
      search: location.search,
      hash: location.hash,
      referrer: document.referrer,
    });
  }, [location.pathname, location.search, location.hash]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Extract potential route suggestions based on the attempted path
  const getSuggestions = (pathname: string) => {
    const suggestions = [];
    
    if (pathname.includes('attraction')) {
      suggestions.push({ path: '/discover', label: 'Browse Attractions' });
    }
    if (pathname.includes('community') || pathname.includes('post')) {
      suggestions.push({ path: '/community', label: 'Community Feed' });
    }
    if (pathname.includes('profile') || pathname.includes('user')) {
      suggestions.push({ path: '/me', label: 'My Profile' });
    }
    if (pathname.includes('admin') || pathname.includes('dashboard')) {
      suggestions.push({ path: '/admin', label: 'Admin Panel' });
    }
    if (pathname.includes('save') || pathname.includes('favorite')) {
      suggestions.push({ path: '/saved', label: 'Saved Items' });
    }
    
    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        { path: '/discover', label: 'Discover Attractions' },
        { path: '/community', label: 'Community' }
      );
    }
    
    return suggestions;
  };

  const suggestions = getSuggestions(location.pathname);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon and Title */}
          <div className="mb-6">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
            <p className="text-gray-500">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Attempted Path Info */}
          {location.pathname !== "/" && (
            <div className="bg-gray-50 rounded-md p-3 mb-6 text-sm text-gray-600">
              <span className="font-medium">Attempted path:</span>
              <br />
              <code className="text-red-600">{location.pathname}</code>
            </div>
          )}

          {/* Suggested Actions */}
          <div className="space-y-3 mb-6">
            <Button onClick={handleGoHome} className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={handleRefresh} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Suggested Pages */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                You might be looking for:
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    to={suggestion.path}
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Search className="w-3 h-3 inline mr-2" />
                    {suggestion.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Additional Help */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>
              If you believe this is an error, please contact support or try again later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
