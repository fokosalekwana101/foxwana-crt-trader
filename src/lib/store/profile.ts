import { useSyncExternalStore } from "react";

/**
 * PROFILES / WORKSPACES.
 *
 * Every user-owned store (settings, watchlist, journal, saved analysis) is
 * namespaced by the active profile id via `profileKey()`, so data never mixes
 * between profiles.
 */
export type Profile = { id: string; name: string; createdAt: string };
type ProfileState = { profiles: Profile[]; activeId: string };

const KEY = "foxwana.profiles.v1";
const DEFAULT: ProfileState = {
  profiles: [{ id: "fokosa", name: "Fokosa", createdAt: "2026-01-01" }],
  activeId: "fokosa",
};

let state: ProfileState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProfileState;
      if (parsed.profiles?.length) {
        state = {
          profiles: parsed.profiles,
          activeId: parsed.profiles.some((p) => p.id === parsed.activeId) ? parsed.activeId : parsed.profiles[0]!.id,
        };
      }
    }
  } catch {
    /* ignore */
  }
}

function commit(next: ProfileState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  // notify once after hydration so the persisted profile is picked up
  queueMicrotask(l);
  return () => listeners.delete(l);
}

export function useProfiles() {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT,
  );
  const active = s.profiles.find((p) => p.id === s.activeId) ?? s.profiles[0]!;
  return {
    profiles: s.profiles,
    active,
    switchTo: (id: string) => commit({ ...state, activeId: id }),
    add: (name: string) => {
      const id = `p-${Date.now().toString(36)}`;
      commit({
        profiles: [...state.profiles, { id, name: name.trim() || "New profile", createdAt: new Date().toISOString().slice(0, 10) }],
        activeId: id,
      });
    },
    rename: (id: string, name: string) =>
      commit({ ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)) }),
    remove: (id: string) => {
      if (state.profiles.length <= 1) return;
      const profiles = state.profiles.filter((p) => p.id !== id);
      for (const suffix of ["settings.v1", "journal.v1", "analyses.v1"]) {
        try {
          window.localStorage.removeItem(`foxwana.${id}.${suffix}`);
        } catch {
          /* ignore */
        }
      }
      commit({ profiles, activeId: state.activeId === id ? profiles[0]!.id : state.activeId });
    },
  };
}

/** Storage key scoped to the active profile. */
export function useProfileKey(suffix: string) {
  const { active } = useProfiles();
  return `foxwana.${active.id}.${suffix}`;
}
