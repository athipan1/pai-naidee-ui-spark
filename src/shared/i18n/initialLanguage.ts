export type SiteLanguage = 'th' | 'en';

// Thai is the default for new visitors. An explicit saved English selection
// always wins, including when the browser's preferred locale is Thai.
export function getInitialLanguage(storage?: Pick<Storage, 'getItem'> | null): SiteLanguage {
  try {
    return storage?.getItem('painaidee.language') === 'en' ? 'en' : 'th';
  } catch {
    // Private browsing or disabled storage must not force English.
    return 'th';
  }
}
