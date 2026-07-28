"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { FightSport } from "./events";

const SAVED_KEY = "fight-list-saved";
const SAVED_CHANGE_EVENT = "fight-list:saved-change";
const PREFERENCES_KEY = "fight-list-preferences";
const PREFERENCES_CHANGE_EVENT = "fight-list:preferences-change";

export type TimeFormat = "auto" | "12" | "24";

export type AppPreferences = {
  timeFormat: TimeFormat;
  defaultSport: "All" | FightSport;
  freeOnly: boolean;
};

export const defaultPreferences: AppPreferences = {
  timeFormat: "auto",
  defaultSport: "All",
  freeOnly: false,
};

const defaultPreferencesRaw = JSON.stringify(defaultPreferences);

function subscribeToStorage(key: string, eventName: string, listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, listener);
  };
}

function readSavedRaw() {
  return window.localStorage.getItem(SAVED_KEY) ?? "[]";
}

function readPreferencesRaw() {
  return window.localStorage.getItem(PREFERENCES_KEY) ?? defaultPreferencesRaw;
}

export function useSavedEvents() {
  const raw = useSyncExternalStore(
    (listener) => subscribeToStorage(SAVED_KEY, SAVED_CHANGE_EVENT, listener),
    readSavedRaw,
    () => "[]",
  );

  const savedIds = useMemo(() => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  }, [raw]);

  const writeSaved = (next: string[]) => {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_CHANGE_EVENT));
  };

  return {
    savedIds,
    toggleSaved(id: string) {
      writeSaved(
        savedIds.includes(id)
          ? savedIds.filter((savedId) => savedId !== id)
          : [...savedIds, id],
      );
    },
    clearSaved() {
      writeSaved([]);
    },
  };
}

export function usePreferences() {
  const raw = useSyncExternalStore(
    (listener) =>
      subscribeToStorage(PREFERENCES_KEY, PREFERENCES_CHANGE_EVENT, listener),
    readPreferencesRaw,
    () => defaultPreferencesRaw,
  );

  const preferences = useMemo(() => {
    try {
      return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<AppPreferences>) };
    } catch {
      return defaultPreferences;
    }
  }, [raw]);

  return {
    preferences,
    updatePreferences(next: Partial<AppPreferences>) {
      window.localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({ ...preferences, ...next }),
      );
      window.dispatchEvent(new Event(PREFERENCES_CHANGE_EVENT));
    },
    resetPreferences() {
      window.localStorage.setItem(PREFERENCES_KEY, defaultPreferencesRaw);
      window.dispatchEvent(new Event(PREFERENCES_CHANGE_EVENT));
    },
  };
}

export function useClientClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [timezone, setTimezone] = useState("your local time");

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      setMounted(true);
      setNow(Date.now());
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialize);
      window.clearInterval(timer);
    };
  }, []);

  return { mounted, now, timezone };
}

export function hour12For(format: TimeFormat) {
  if (format === "12") return true;
  if (format === "24") return false;
  return undefined;
}
