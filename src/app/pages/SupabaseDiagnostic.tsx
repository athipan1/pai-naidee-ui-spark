// Supabase Diagnostic Page
import React from 'react';
import SupabaseStatusComponent from '@/components/diagnostic/SupabaseStatus';

/**
 * SupabaseDiagnostic Page
 * 
 * This page provides comprehensive diagnostics for Supabase backend connectivity.
 * It displays:
 * - Configuration status (URL and API key)
 * - Connection status
 * - Table accessibility for main tables (users, bookings, attractions, places)
 * - Sample data from accessible tables
 * - Detailed diagnostic report
 */
const SupabaseDiagnostic: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supabase Backend Diagnostic</h1>
        <p className="text-gray-600">
          This page verifies the Supabase backend connection and displays diagnostic information
          including table accessibility and sample data.
        </p>
      </div>
      
      <SupabaseStatusComponent />
    </div>
  );
};

export default SupabaseDiagnostic;