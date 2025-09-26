#!/usr/bin/env tsx
// Manual Supabase connectivity check script
// Run with: npm run check:supabase or npx tsx scripts/check-supabase.ts

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

// Load environment variables manually for Node.js execution
function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

// Setup environment variables for Node.js context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Load environment files in order of precedence
loadEnvFile(join(projectRoot, '.env.local'));
loadEnvFile(join(projectRoot, '.env.development'));
loadEnvFile(join(projectRoot, '.env'));

// Mock import.meta.env for Node.js context
if (typeof globalThis !== 'undefined') {
  (globalThis as any).import = {
    meta: {
      env: process.env
    }
  };
}

import { 
  getSupabaseFullStatus, 
  generateSupabaseReport 
} from '../src/services/supabase-connectivity.service';

async function main() {
  console.log('🔍 Starting Supabase connectivity verification...\n');
  
  // Show loaded environment variables (safely)
  console.log('📊 Environment Configuration:');
  console.log(`• VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`• VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}\n`);
  
  try {
    const status = await getSupabaseFullStatus();
    const report = generateSupabaseReport(status);
    
    console.log(report);
    
    // Exit with appropriate code
    const hasConnection = status.connection.isConnected;
    const hasAccessibleTables = status.tables.some(table => table.isAccessible);
    const isConfigured = status.configurationStatus.isFullyConfigured;
    
    if (isConfigured && hasConnection && hasAccessibleTables) {
      console.log('\n🎉 Supabase connectivity check completed successfully!');
      process.exit(0);
    } else if (!isConfigured) {
      console.log('\n⚠️ Supabase is not properly configured. Please update your environment variables.');
      process.exit(1);
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