import type { QueryClient } from '@tanstack/react-query';

const publicationKey = 'painaidee.place-publication';

export function refreshPublishedPlace(client: QueryClient, placeId: string) {
  return client.invalidateQueries({
    predicate: ({ queryKey: [namespace, kind, id] }) =>
      (namespace === 'attractions' && (kind !== 'detail' || id === placeId)) ||
      (namespace === 'places' && (kind === 'facets' || kind === 'search-alternatives')),
  });
}

export function announcePlacePublication(client: QueryClient, placeId: string) {
  void refreshPublishedPlace(client, placeId);
  try {
    // Storage events are delivered to other tabs of this origin. Only the
    // public place ID is shared. Removing the key allows repeat publications.
    localStorage.setItem(publicationKey, placeId);
    localStorage.removeItem(publicationKey);
  } catch {
    // The publishing tab still invalidates its own queries.
  }
}

export function listenForPlacePublications(client: QueryClient) {
  const refresh = (event: StorageEvent) => {
    if (event.key === publicationKey && event.newValue) {
      void refreshPublishedPlace(client, event.newValue);
    }
  };
  window.addEventListener('storage', refresh);
  return () => window.removeEventListener('storage', refresh);
}
