// Supabase Connectivity Verification Service
import { getSupabaseClient } from './supabase.service';

export type ConnectivityResult =
  | {
      isConnected: true;
      error?: never;
      details?: {
        hasActiveSession?: boolean;
        sessionUser?: string | null;
        configurationStatus?: SupabaseStatus['configurationStatus'];
      };
    }
  | { isConnected: false; error?: string; details?: unknown };

export interface TableDataResult {
  tableName: string;
  isAccessible: boolean;
  recordCount?: number;
  sampleData?: Record<string, unknown>[];
  error?: string;
}

export interface SupabaseStatus {
  connection: ConnectivityResult;
  tables: TableDataResult[];
  configurationStatus: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    urlPattern: string;
    isFullyConfigured: boolean;
    configurationIssues: string[];
  };
}

/**
 * Verify basic Supabase connection by checking authentication status
 */
export const verifySupabaseConnection = async (): Promise<ConnectivityResult> => {
  try {
    // First check if configuration is valid
    const config = checkSupabaseConfiguration();
    if (!config.isFullyConfigured) {
      return {
        isConnected: false,
        error: `Configuration incomplete: ${config.configurationIssues.join(', ')}`,
        details: { configurationStatus: config }
      };
    }

    // Try to get the current session to test connection
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        isConnected: false,
        error: `Authentication check failed: ${error.message}`,
        details: error
      };
    }

    // Connection is successful even if no user is logged in
    return {
      isConnected: true,
      details: {
        hasActiveSession: !!data.session,
        sessionUser: data.session?.user?.id || null,
        configurationStatus: config
      }
    };
  } catch (error) {
    return {
      isConnected: false,
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
};

/**
 * Test access to a specific table and fetch sample data
 */
export const testTableAccess = async (
  tableName: string, 
  limit: number = 5
): Promise<TableDataResult> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(limit);

    if (error) {
      return {
        tableName,
        isAccessible: false,
        error: `Table access failed: ${error.message}`,
      };
    }

    return {
      tableName,
      isAccessible: true,
      recordCount: count || 0,
      sampleData: data || [],
    };
  } catch (error) {
    return {
      tableName,
      isAccessible: false,
      error: `Table test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Check configuration status with comprehensive validation
 */
export const checkSupabaseConfiguration = () => {
  // Helper function to safely get environment variables
  function getEnvVar(key: string): string | undefined {
    // Browser context (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    
    // Node.js context (via global mock setup in scripts)
    if (typeof globalThis !== 'undefined') {
      const mockEnv = (globalThis as typeof globalThis & {
        import?: { meta?: { env?: Record<string, string | undefined> } };
      }).import?.meta?.env;
      if (mockEnv) return mockEnv[key];
    }
    
    // Direct Node.js environment access
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    
    return undefined;
  }

  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

  // List of invalid/placeholder URLs to check against
  const invalidUrls = [
    'https://your-project.supabase.co',
    'https://your-project-id.supabase.co',
    'https://demo-project.supabase.co'
  ];

  // List of invalid/placeholder API keys
  const invalidKeys = [
    'your-anon-key',
    'your_supabase_anon_key_here',
    'your-supabase-anon-key-here',
    'demo-anon-key-for-testing'
  ];

  const hasValidUrl = !!supabaseUrl && !invalidUrls.includes(supabaseUrl);
  const hasValidKey = !!supabaseAnonKey && !invalidKeys.includes(supabaseAnonKey);

  return {
    hasUrl: hasValidUrl,
    hasAnonKey: hasValidKey,
    urlPattern: supabaseUrl || 'Not configured',
    isFullyConfigured: hasValidUrl && hasValidKey,
    configurationIssues: [
      ...(hasValidUrl ? [] : ['Supabase URL is missing or using placeholder value']),
      ...(hasValidKey ? [] : ['Supabase anon key is missing or using placeholder value'])
    ]
  };
};

/**
 * Comprehensive Supabase status check
 */
export const getSupabaseFullStatus = async (): Promise<SupabaseStatus> => {
  // Check configuration first
  const configurationStatus = checkSupabaseConfiguration();
  
  // Test connection
  const connection = await verifySupabaseConnection();
  
  // Test main tables mentioned in the problem statement
  const tablesToTest = ['users', 'bookings', 'attractions', 'places'];
  const tableResults = await Promise.all(
    tablesToTest.map(tableName => testTableAccess(tableName))
  );

  return {
    connection,
    tables: tableResults,
    configurationStatus
  };
};

/**
 * Generate a human-readable report of the Supabase status
 */
export const generateSupabaseReport = (status: SupabaseStatus): string => {
  let report = '=== SUPABASE CONNECTIVITY REPORT ===\n\n';
  
  // Configuration Status
  report += '📋 CONFIGURATION STATUS:\n';
  report += `• URL Configured: ${status.configurationStatus.hasUrl ? '✅' : '❌'}\n`;
  report += `• API Key Configured: ${status.configurationStatus.hasAnonKey ? '✅' : '❌'}\n`;
  report += `• URL Pattern: ${status.configurationStatus.urlPattern}\n`;
  
  if (!status.configurationStatus.isFullyConfigured) {
    report += '⚠️ CONFIGURATION ISSUES:\n';
    status.configurationStatus.configurationIssues.forEach(issue => {
      report += `• ${issue}\n`;
    });
  }
  report += '\n';
  
  // Connection Status
  report += '🔗 CONNECTION STATUS:\n';
  if (status.connection.isConnected === true) {
    report += '• Connection: ✅ SUCCESSFUL\n';
    if (status.connection.details?.hasActiveSession) {
      report += `• Active Session: ✅ User ID: ${status.connection.details.sessionUser}\n`;
    } else {
      report += '• Active Session: ℹ️ No active user session (normal for public access)\n';
    }
  } else {
    report += `• Connection: ❌ FAILED\n`;
    report += `• Error: ${status.connection.error}\n`;
  }
  report += '\n';
  
  // Tables Status
  report += '📊 TABLES ACCESS STATUS:\n';
  if (status.tables.length === 0) {
    report += '• No tables tested (connection may be unavailable)\n';
  } else {
    status.tables.forEach(table => {
      if (table.isAccessible) {
        report += `• ${table.tableName}: ✅ ACCESSIBLE (${table.recordCount} records)\n`;
        if (table.sampleData && table.sampleData.length > 0) {
          report += `  Sample data preview: ${JSON.stringify(table.sampleData[0], null, 2).substring(0, 200)}...\n`;
        }
      } else {
        report += `• ${table.tableName}: ❌ INACCESSIBLE\n`;
        report += `  Error: ${table.error}\n`;
      }
    });
  }
  
  // Recommendations
  report += '\n💡 RECOMMENDATIONS:\n';
  if (!status.configurationStatus.isFullyConfigured) {
    report += '• Update your .env.local file with valid Supabase credentials\n';
    report += '• Get credentials from: https://supabase.com/dashboard > Your Project > Settings > API\n';
  }
  if (!status.connection.isConnected) {
    report += '• Verify your Supabase project is active and accessible\n';
    report += '• Check if your network allows connections to Supabase\n';
  }
  if (status.tables.every(t => !t.isAccessible) && status.connection.isConnected) {
    report += '• Verify your database tables exist and have proper RLS policies\n';
    report += '• Check your anon key permissions in Supabase dashboard\n';
  }
  
  report += '\n=== END REPORT ===';
  return report;
};
