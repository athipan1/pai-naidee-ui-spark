import { QueryClient } from '@tanstack/react-query';
import { expect, it } from 'vitest';
import { announcePlacePublication, listenForPlacePublications } from '@/shared/utils/placePublication';

it('refreshes affected queries locally and across tabs while keeping unrelated detail entries', async () => {
  const publishing = new QueryClient();
  const browsing = new QueryClient();
  const keys = [
    ['attractions', 'detail', 'updated'],
    ['attractions', 'detail', 'unrelated'],
    ['attractions', 'list'],
    ['attractions', 'nearby'],
    ['places', 'search-alternatives', 'beach'],
  ];
  for (const client of [publishing, browsing]) {
    for (const key of keys) client.setQueryData(key, key);
  }
  const stop = listenForPlacePublications(browsing);
  try {
    announcePlacePublication(publishing, 'updated');
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'painaidee.place-publication', newValue: 'updated',
    }));
    for (const client of [publishing, browsing]) {
      expect(keys.map(key => client.getQueryState(key)?.isInvalidated))
        .toEqual([true, false, true, true, true]);
    }
  } finally {
    stop();
    publishing.clear();
    browsing.clear();
  }
});
