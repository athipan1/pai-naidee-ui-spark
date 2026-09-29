import type { User as SupabaseUser } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'editor' | 'moderator' | 'viewer';

const VALID_ROLES = new Set<AppRole>(['admin', 'editor', 'moderator', 'viewer']);

export function getAppRole(user: SupabaseUser | null | undefined): AppRole {
  const role = user?.app_metadata?.role;
  return typeof role === 'string' && VALID_ROLES.has(role as AppRole)
    ? (role as AppRole)
    : 'viewer';
}

export function isAdminRole(role: AppRole): boolean {
  return role === 'admin';
}

export function canManageContent(role: AppRole): boolean {
  return role === 'admin' || role === 'editor';
}
