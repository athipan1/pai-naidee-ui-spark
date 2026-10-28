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
