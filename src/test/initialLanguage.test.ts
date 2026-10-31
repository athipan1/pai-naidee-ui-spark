import { describe, expect, it } from 'vitest';
import { getInitialLanguage } from '@/shared/i18n/initialLanguage';

describe('PaiNaiDee default language', () => {
  it('shows Thai to a new visitor without a saved language', () => {
    expect(getInitialLanguage({ getItem: () => null })).toBe('th');
  });

  it('remembers a visitor who explicitly chose English', () => {
    expect(getInitialLanguage({ getItem: () => 'en' })).toBe('en');
  });

  it('keeps a saved Thai selection', () => {
    expect(getInitialLanguage({ getItem: () => 'th' })).toBe('th');
  });

  it('defaults to Thai if browser storage is blocked', () => {
    expect(getInitialLanguage({ getItem: () => { throw new Error('blocked'); } })).toBe('th');
    expect(getInitialLanguage(null)).toBe('th');
  });
});
