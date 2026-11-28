import type { DiscoveryEntry } from "@/services/railway-api.service";

export const PREFERENCE_KEY = "painaidee.discovery.preferences.v1";
type Scores = Record<string, number>;
export interface Preferences { enabled: boolean; scores: Scores; updatedAt: number }
const empty = (): Preferences => ({ enabled: false, scores: {}, updatedAt: 0 });
const validKey = (key: string) => /^(category|province):.{1,100}$/u.test(key);
export function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCE_KEY) || "null");
    if (value?.enabled !== true) return empty();
    const scores: Scores = Object.create(null);
    const decay = Math.pow(0.5, Math.max(0, Date.now() - (Number(value.updatedAt) || 0)) / (30 * 86400000));
    for (const [key, score] of Object.entries(value.scores || {}).slice(0, 100)) {
      if (validKey(key) && typeof score === "number" && Number.isFinite(score) && score > 0)
        scores[key] = Math.min(100, score) * decay;
    }
    return { enabled: true, scores, updatedAt: Date.now() };
  } catch { return empty(); }
}
function write(profile: Preferences) {
  try {
    if (profile.enabled) localStorage.setItem(PREFERENCE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PREFERENCE_KEY);
  } catch { /* Storage is optional; do not transmit preferences. */ }
}
export function setPersonalization(enabled: boolean) {
  const profile = enabled ? { enabled: true, scores: {}, updatedAt: Date.now() } : empty();
  write(profile);
  return profile;
}
type Signals = { category?: string; categories?: string[]; province?: string };
export function recordInterest(place: Signals, weight: number) {
  const profile = readPreferences();
  if (!profile.enabled) return;
  const keys = new Set([
    ...[place.category, ...(place.categories || [])].filter(Boolean).map(x => "category:" + x),
    ...(place.province ? ["province:" + place.province] : []),
  ]);
  for (const key of keys) {
    if (!validKey(key)) continue;
    profile.scores[key] = Math.max(0, Math.min(100, (profile.scores[key] || 0) + weight));
  }
  profile.scores = Object.fromEntries(Object.entries(profile.scores).filter(([, v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0,100));
  write(profile);
}
export function recordSearchInterest(query: string, categories: string[], provinces: string[]) {
  if (!readPreferences().enabled) return;
  const value = query.trim().toLowerCase();
  if (!value) return;
  // Only known catalogue categories/provinces, not raw user search strings.
  for (const category of categories) if (value === category.toLowerCase()) recordInterest({category}, 2);
  for (const province of provinces) if (value === province.toLowerCase()) recordInterest({province}, 2);
}
export const isNewPlace = (place: DiscoveryEntry, now: number) => {
  const age = now - Date.parse(place.publishedAt);
  return Number.isFinite(age) && age >= 0 && age <= 14 * 86400000;
};
function interest(entry: DiscoveryEntry, scores: Scores) {
  const categories = [...new Set([entry.category, ...entry.categories])];
  return Math.max(0, ...categories.map(c => scores["category:" + c] || 0)) + (scores["province:" + entry.province] || 0);
}
// The entire metadata catalogue is ranked locally, never user profile data sent to Railway.
export function rankDiscovery(entries: DiscoveryEntry[], profile: Preferences, recent: ReadonlySet<string>, now: number, random = Math.random) {
  const pool = [...new Map(entries.map(entry => [entry.id, entry])).values()].map(entry => ({
    entry, score: profile.enabled ? interest(entry, profile.scores) : 0, random: random(),
    seen: recent.has(entry.id) ? 1 : 0, fresh: isNewPlace(entry, now),
  }));
  const remaining = new Set(pool.map(x => x.entry.id));
  const result: DiscoveryEntry[] = [];
  const ordered = (compare: (a: typeof pool[number], b: typeof pool[number]) => number) =>
    [...pool].sort((a,b) => a.seen-b.seen || compare(a,b) || a.random-b.random || a.entry.id.localeCompare(b.entry.id));
  const latest = ordered((a,b) => (Date.parse(b.entry.publishedAt)||0)-(Date.parse(a.entry.publishedAt)||0)).filter(x=>x.fresh);
  const relevant = ordered((a,b) => b.score-a.score).filter(x=>x.score>0);
  const varied = ordered(() => 0);
  let latestCursor = 0, relevantCursor = 0, variedCursor = 0;
  const take = (list: typeof pool, cursor: number, predicate: (x: typeof pool[number]) => boolean, provinces: Set<string>) => {
    let selected = -1;
    // Prefer a different province within the current unseen/seen tier.
    let considered=0;
    for (let i=cursor;i<list.length;i++) {
      const x=list[i];
      if (!remaining.has(x.entry.id) || !predicate(x)) continue;
      if (selected < 0) selected=i;
      if (x.seen !== list[selected].seen || ++considered > 32) break;
      if (!provinces.has(x.entry.province)) { selected=i; break; }
    }
    if(selected<0)return cursor;
    const x=list[selected];
    remaining.delete(x.entry.id); result.push(x.entry); provinces.add(x.entry.province);
    while(cursor<list.length && !remaining.has(list[cursor].entry.id))cursor++;
    return cursor;
  };
  while (remaining.size) {
    const before=result.length;
    const provinces=new Set<string>();
    // 5 newest, 12 interests, 3 discovery; fill unused slots from the whole catalogue.
    for(let i=0;i<5;i++)latestCursor=take(latest,latestCursor,x=>x.fresh,provinces);
    for(let i=0;i<12;i++)relevantCursor=take(relevant,relevantCursor,x=>x.score>0,provinces);
    while(result.length-before<20 && remaining.size) variedCursor=take(varied,variedCursor,()=>true,provinces);
    if(result.length===before)break;
    // Interleave recommendations and new places without moving rendered cards later.
    const batch=result.splice(before);
    const fresh=batch.filter(x=>isNewPlace(x,now));
    const other=batch.filter(x=>!isNewPlace(x,now));
    while(fresh.length||other.length){ if(fresh.length)result.push(fresh.shift()!); for(let i=0;i<3&&other.length;i++)result.push(other.shift()!); }
  }
  return result;
}
