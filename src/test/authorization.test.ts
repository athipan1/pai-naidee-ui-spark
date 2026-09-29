import { describe, expect, it } from 'vitest';
import { canManageContent, getAppRole, isAdminRole } from '@/shared/auth/roles';

describe('authorization role helpers', () => {
  it('trusts admin role only from app_metadata', () => {
    const user = {
      app_metadata: { role: 'admin' },
      user_metadata: { role: 'viewer' },
    } as any;

    expect(getAppRole(user)).toBe('admin');
    expect(isAdminRole(getAppRole(user))).toBe(true);
  });

  it('never grants privileges from user_metadata', () => {
    const user = {
      app_metadata: {},
      user_metadata: { role: 'admin' },
    } as any;

    expect(getAppRole(user)).toBe('viewer');
    expect(isAdminRole(getAppRole(user))).toBe(false);
  });

  it('fails closed for unknown roles', () => {
    const user = {
      app_metadata: { role: 'superuser' },
      user_metadata: {},
    } as any;

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
