import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabase.service';
import { getAppRole, isAdminRole, type AppRole } from '@/shared/auth/roles';

interface AuthContextValue {
  session: Session | null;
  user: SupabaseUser | null;
  role: AppRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured()) {
      setSession(null);
      setIsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabaseClient();

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Failed to initialize auth session:', error.message);
        setSession(null);
      } else {
        setSession(data.session);
      }

      setIsLoading(false);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const role = getAppRole(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      role,
      isAuthenticated: Boolean(user),
      isAdmin: isAdminRole(role),
      isLoading,
      signOut: async () => {
        if (!isSupabaseConfigured()) return;
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) throw error;
      },
    }),
    [session, user, role, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return value;
}
