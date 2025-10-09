import React from 'react';

const EnvDebugDisplay: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const urlStatus = supabaseUrl ? 'Set' : 'NOT SET';
  const keyStatus = supabaseAnonKey ? 'Set' : 'NOT SET';

  // For security, we only show parts of the credentials
  const displayUrl = supabaseUrl
    ? `${supabaseUrl.substring(0, 20)}...`
    : 'N/A';

  const displayKey = supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 8)}...`
    : 'N/A';

  return (
    <div style={{
      backgroundColor: '#ffc',
      border: '2px solid #f00',
      padding: '10px',
      margin: '10px',
      position: 'fixed',
      top: '50px',
      left: '10px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h4>[DEBUG] Environment Variables:</h4>
      <p>
        <strong>VITE_SUPABASE_URL:</strong>
        <span style={{ color: urlStatus === 'Set' ? 'green' : 'red' }}> {urlStatus}</span>
        <br />
        Value: {displayUrl}
      </p>
      <p>
        <strong>VITE_SUPABASE_ANON_KEY:</strong>
        <span style={{ color: keyStatus === 'Set' ? 'green' : 'red' }}> {keyStatus}</span>
        <br />
        Value: {displayKey}
      </p>
    </div>
  );
};

export default EnvDebugDisplay;