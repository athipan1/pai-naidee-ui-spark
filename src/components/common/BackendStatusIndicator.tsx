import React, { useState, useEffect } from 'react';
import { verifyBackendUrl } from '@/lib/backendVerifier';
import { Badge } from '@/components/ui/badge'; // Using a badge component for styling

// Define the possible states for the connection status
type Status = 'connecting' | 'connected' | 'failed';

/**
 * A React component that verifies and displays the backend connection status.
 */
const BackendStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<Status>('connecting');
  const [backendUrl, setBackendUrl] = useState<string>('');

  useEffect(() => {
    // This effect runs once on component mount to verify the backend.
    const checkBackend = async () => {
      const isConnected = await verifyBackendUrl();
      setStatus(isConnected ? 'connected' : 'failed');
    };

    checkBackend();
  }, []); // Empty dependency array ensures this runs only once.

  // Helper function to determine badge variant based on status
  const getBadgeVariant = () => {
    switch (status) {
      case 'connected':
        return 'default'; // Or a custom 'success' variant if available
      case 'failed':
        return 'destructive';
      case 'connecting':
      default:
        return 'secondary';
    }
  };

  // Helper function to render the status message
  const renderStatusMessage = () => {
    switch (status) {
      case 'connected':
        return '✔️ Connected to Backend';
      case 'failed':
        return '❌ Failed to Connect to Backend';
      case 'connecting':
      default:
        return '... Connecting to Backend';
    }
  };

  return (
    <div style={{ padding: '8px', textAlign: 'center' }}>
      <Badge variant={getBadgeVariant()}>
        {renderStatusMessage()}
      </Badge>
    </div>
  );
};

export default BackendStatusIndicator;
