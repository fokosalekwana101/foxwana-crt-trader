import { useCallback, useEffect, useState } from "react";

/**
 * Local persistence layer. Everything user-owned (settings, journal) goes
 * through this single module so it can later be swapped for an authenticated
 * server-backed store without touching feature code.
 */
export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next = fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        next = Array.isArray(parsed) ? parsed : { ...(fallback as object), ...parsed };
      }
    } catch {
      /* ignore corrupt storage */
    }
    // Always reset when the key changes so profiles never leak into each other.
    setValue(next);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage unavailable */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
