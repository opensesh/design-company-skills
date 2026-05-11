import NodeCache from 'node-cache';

// Default TTL: 5 minutes
const DEFAULT_TTL = 300;

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 60,
  useClones: false,
});

export interface CacheOptions {
  ttl?: number; // seconds
}

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const existing = cache.get<T>(key);
  if (existing !== undefined) {
    return existing;
  }

  const result = await fetcher();
  cache.set(key, result, options?.ttl || DEFAULT_TTL);
  return result;
}

export function invalidate(key: string): void {
  cache.del(key);
}

export function invalidatePrefix(prefix: string): void {
  const keys = cache.keys().filter(k => k.startsWith(prefix));
  cache.del(keys);
}

export function clearAll(): void {
  cache.flushAll();
}

export function getStats() {
  return cache.getStats();
}
