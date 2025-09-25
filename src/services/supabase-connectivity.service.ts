// Supabase Connectivity Verification Service
import { supabase } from './supabase.service';

export interface ConnectivityResult {
  isConnected: boolean;
  error?: string;
  details?: any;
}

export interface TableDataResult {
  tableName: string;
  isAccessible: boolean;
  recordCount?: number;
  sampleData?: any[];
  error?: string;
}

export interface SupabaseStatus {
  connection: ConnectivityResult;
  tables: TableDataResult[];
  configurationStatus: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    urlPattern: string;
  };
}

/**
 * Verify basic Supabase connection by checking authentication status
 */
export const verifySupabaseConnection = async (): Promise<ConnectivityResult> => {
  try {
    // Try to get the current session to test connection
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
        sessionUser: data.session?.user?.id || null
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
 * Check configuration status
 */
export const checkSupabaseConfiguration = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    hasUrl: !!supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co',
    hasAnonKey: !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key',
    urlPattern: supabaseUrl || 'Not configured'
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
  report += `• URL Pattern: ${status.configurationStatus.urlPattern}\n\n`;
  
  // Connection Status
  report += '🔗 CONNECTION STATUS:\n';
  if (status.connection.isConnected) {
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
  
  report += '\n=== END REPORT ===';
  return report;
};