interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const caches = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000;

export function getCache<T>(key: string): T | null {
	const entry = caches.get(key);
	if (!entry) {
		return null;
	}

	const now = Date.now();
	if (now - entry.timestamp > DEFAULT_TTL) {
		caches.delete(key);
		return null;
	}

	return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
	caches.set(key, {
		data,
		timestamp: Date.now(),
	});
}

export function invalidateCache(key: string): void {
	caches.delete(key);
}

export function invalidateAllCache(): void {
	caches.clear();
}

export function hasCache(key: string): boolean {
	const entry = caches.get(key);
	if (!entry) {
		return false;
	}

	const now = Date.now();
	if (now - entry.timestamp > DEFAULT_TTL) {
		caches.delete(key);
		return false;
	}

	return true;
}

export function getCacheSize(): number {
	return caches.size;
}

export function clearExpiredCache(): void {
	const now = Date.now();
	for (const [key, entry] of caches.entries()) {
		if (now - entry.timestamp > DEFAULT_TTL) {
			caches.delete(key);
		}
	}
}