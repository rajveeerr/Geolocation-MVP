// Simple in-memory cache for leaderboard top lists.
// Keyed only by period + limit (not user specific) so we can reuse for different callers.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

export function makeKey(parts: Record<string, any>): string {
  return Object.entries(parts).sort().map(([k,v]) => `${k}=${v}`).join('&');
}

export function getCache<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { store.delete(key); return null; }
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateLeaderboardCache(granularity?: string) {
  if (!granularity) { store.clear(); return; }
  for (const k of Array.from(store.keys())) {
    if (k.includes(`granularity=${granularity}`)) store.delete(k);
  }
}

export function cacheTtlForGranularity(granularity: string): number {
  const envOverride = process.env.LEADERBOARD_CACHE_TTL_SECONDS;
  if (envOverride) {
    const s = parseInt(envOverride, 10); if (s>0) return s*1000;
  }
  switch (granularity) {
    case 'day': return 30_000;        // 30s
    case 'week': return 120_000;      // 2m
    case 'month': return 300_000;     // 5m
    case 'all-time': return 900_000;  // 15m
    default: return 60_000;           // custom
  }
}
