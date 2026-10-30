// API rows are distinct by their stable ID. Never merge two different IDs just
// because their names look similar (e.g. two temples with the same name).
export function uniqueAttractionsById<T extends { id: string }>(places: T[]): T[] {
  const seen = new Set<string>();
  return places.filter(place => {
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

// The home page shows a small featured row above its regular cards. Keep the
// two sections disjoint so visitors do not see the same destination twice.
export function splitHomeAttractions<T extends { id: string }>(
  places: T[],
  showFeatured: boolean,
): { featured: T[]; recommended: T[] } {
  const unique = uniqueAttractionsById(places);
  const featured = showFeatured ? unique.slice(0, 2) : [];
  const featuredIds = new Set(featured.map(place => place.id));
  return {
    featured,
    recommended: unique.filter(place => !featuredIds.has(place.id)).slice(0, 8),
  };
}
