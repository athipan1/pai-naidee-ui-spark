import { getSupabaseClient } from '@/services/supabase.service';

interface HealthCheckResult {
  ok: boolean;
  error?: string;
}

export const checkSupabaseConnection = async (): Promise<HealthCheckResult> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // Handle Supabase-specific errors (e.g., network issues, invalid keys)
      return {
        ok: false,
        error: `Supabase authentication error: ${error.message}`,
      };
    }

    if (!data.session) {
      // This is not necessarily an error, but indicates no active session.
      // For a health check, we can consider this a successful connection.
      console.info('Supabase connection successful, but no active session.');
    }

    return { ok: true };
  } catch (err: unknown) {
    // Handle unexpected errors (e.g., configuration issues, client initialization failure)
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      ok: false,
      error: `An unexpected error occurred during the Supabase health check: ${errorMessage}`,
    };
  }
};
