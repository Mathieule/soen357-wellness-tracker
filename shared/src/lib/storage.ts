/**
 * LocalStorage wrapper used for prototype persistence (no backend).
 * Each prototype iteration passes its own prefix so Output A and Output B never
 * read or overwrite each other's data. If storage is unavailable (private mode,
 * blocked cookies) values are kept in memory for the session instead.
 */
const memory = new Map<string, string>();

export function createStorage(prefix: string) {
  const key = (k: string) => `${prefix}:${k}`;
  return {
    get<T>(k: string, fallback: T): T {
      try {
        const raw = window.localStorage.getItem(key(k)) ?? memory.get(key(k));
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        const raw = memory.get(key(k));
        return raw ? (JSON.parse(raw) as T) : fallback;
      }
    },
    set<T>(k: string, value: T): void {
      const raw = JSON.stringify(value);
      memory.set(key(k), raw);
      try {
        window.localStorage.setItem(key(k), raw);
      } catch {
        /* storage blocked: memory copy is used */
      }
    },
    remove(k: string): void {
      memory.delete(key(k));
      try {
        window.localStorage.removeItem(key(k));
      } catch {
        /* ignore */
      }
    },
    /** Removes every key of this prototype (used by "Reset prototype data"). */
    clearAll(): void {
      for (const k of [...memory.keys()]) if (k.startsWith(`${prefix}:`)) memory.delete(k);
      try {
        Object.keys(window.localStorage)
          .filter((k) => k.startsWith(`${prefix}:`))
          .forEach((k) => window.localStorage.removeItem(k));
      } catch {
        /* ignore */
      }
    },
  };
}

export type Storage = ReturnType<typeof createStorage>;
