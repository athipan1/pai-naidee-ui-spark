#!/usr/bin/env tsx
// Manual Supabase connectivity check script
// Run with: npx tsx scripts/check-supabase.ts

import { 
  getSupabaseFullStatus, 
  generateSupabaseReport 
} from '../src/services/supabase-connectivity.service';

async function main() {
  console.log('🔍 Starting Supabase connectivity verification...\n');
  
  try {
    const status = await getSupabaseFullStatus();
    const report = generateSupabaseReport(status);
    
    console.log(report);
    
    // Exit with appropriate code
    const hasConnection = status.connection.isConnected;
    const hasAccessibleTables = status.tables.some(table => table.isAccessible);
    
    if (hasConnection && hasAccessibleTables) {
      console.log('\n🎉 Supabase connectivity check completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Supabase connectivity issues detected.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Connectivity check failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);