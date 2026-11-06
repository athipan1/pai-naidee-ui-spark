import { describe, expect, it } from 'vitest';
import { canManageContent, getAppRole, isAdminRole } from '@/shared/auth/roles';
import type { User } from '@supabase/supabase-js';

const userIdentity = { id: 'test-user', aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' };

describe('authorization role helpers', () => {
  it('trusts admin role only from app_metadata', () => {
    const user: User = {
      ...userIdentity,
      app_metadata: { role: 'admin' },
      user_metadata: { role: 'viewer' },
    };

    expect(getAppRole(user)).toBe('admin');
    expect(isAdminRole(getAppRole(user))).toBe(true);
  });

  it('never grants privileges from user_metadata', () => {
    const user: User = {
      ...userIdentity,
      app_metadata: {},
      user_metadata: { role: 'admin' },
    };

    expect(getAppRole(user)).toBe('viewer');
    expect(isAdminRole(getAppRole(user))).toBe(false);
  });

  it('fails closed for unknown roles', () => {
    const user: User = {
      ...userIdentity,
      app_metadata: { role: 'superuser' },
      user_metadata: {},
    };

    expect(getAppRole(user)).toBe('viewer');
    expect(canManageContent(getAppRole(user))).toBe(false);
  });

  it('allows content management only for admin and editor', () => {
    expect(canManageContent('admin')).toBe(true);
    expect(canManageContent('editor')).toBe(true);
    expect(canManageContent('moderator')).toBe(false);
    expect(canManageContent('viewer')).toBe(false);
  });
});
