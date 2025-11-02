// src/components/common/ConfigError.tsx
import React from 'react';

interface ConfigErrorProps {
  missingVariables: string[];
}

const ConfigError: React.FC<ConfigErrorProps> = ({ missingVariables }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Configuration Error</h1>
        <p style={styles.paragraph}>
          The application cannot start because some required environment variables are missing.
        </p>
        <p style={styles.paragraph}>
          Please make sure the following variables are set in your Vercel project settings:
        </p>
        <ul style={styles.list}>
          {missingVariables.map(variable => (
            <li key={variable} style={styles.listItem}>
              <code>{variable}</code>
            </li>
          ))}
        </ul>
        <p style={styles.paragraph}>
          After adding the variables, you may need to redeploy the application.
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'sans-serif',
  },
  card: {
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    maxWidth: '500px',
    textAlign: 'center',
  },
  header: {
    color: '#dc3545',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  paragraph: {
    margin: '1rem 0',
    lineHeight: '1.5',
    color: '#343a40',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0',
  },
  listItem: {
    backgroundColor: '#e9ecef',
    padding: '0.5rem',
    borderRadius: '4px',
    margin: '0.5rem 0',
  }
};

export default ConfigError;
