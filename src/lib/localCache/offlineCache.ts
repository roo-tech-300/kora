type CacheEnvelope<T> = {
  value: T;
  updatedAt: string;
};

const prefix = 'kora-cache:';

const isStorageAvailable = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const keyFor = (key: string) => `${prefix}${key}`;

export const readCache = <T>(key: string): CacheEnvelope<T> | null => {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(keyFor(key));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    return null;
  }
};

export const writeCache = <T>(key: string, value: T) => {
  if (!isStorageAvailable()) return;

  try {
    const payload: CacheEnvelope<T> = {
      value,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(keyFor(key), JSON.stringify(payload));
  } catch {
    // Ignore storage quota and serialization issues.
  }
};

export const clearCache = (key: string) => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(keyFor(key));
  } catch {
    // ignore
  }
};

export const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;
