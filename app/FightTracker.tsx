"use client";

import { useMemo, useState } from "react";
import { EventList, upcomingEvents } from "./EventComponents";
import { useClientClock, usePreferences, useSavedEvents } from "./appState";
import {
  fightEvents,
  type FightSport,
  verifiedDate,
} from "./events";

const ALL_SPORTS = "All";
const sportFilters: Array<typeof ALL_SPORTS | FightSport> = [
  ALL_SPORTS,
  "MMA",
  "Boxing",
  "Kickboxing",
  "Muay Thai",
  "Bare Knuckle",
  "Jiu-Jitsu",
  "Wrestling",
  "Karate",
];

export function FightTracker() {
  const { mounted, now, timezone } = useClientClock();
  const { savedIds, toggleSaved } = useSavedEvents();
  const { preferences } = usePreferences();
  const [sportOverride, setSportOverride] = useState<
    (typeof sportFilters)[number] | null
  >(null);
  const [query, setQuery] = useState("");
  const [freeOverride, setFreeOverride] = useState<boolean | null>(null);

  const sport = sportOverride ?? preferences.defaultSport;
  const freeOnly = freeOverride ?? preferences.freeOnly;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return upcomingEvents(fightEvents, now).filter((event) => {
      const matchesSport = sport === ALL_SPORTS || event.sport === sport;
      const matchesFree = !freeOnly || event.watch.access === "Free";
      const haystack = [
        event.sport,
        event.sport === "Jiu-Jitsu" ? "jiujitsu jujitsu bjj grappling" : "",
        event.sport === "Karate" ? "karate combat kc full contact karate" : "",
        event.promotion,
        event.eventName,
        ...event.fighters,
        event.venue,
        event.location,
        event.watch.provider,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesSport && matchesFree && matchesQuery;
    });
  }, [freeOnly, now, query, sport]);

  const clearFilters = () => {
    setSportOverride(ALL_SPORTS);
    setQuery("");
    setFreeOverride(false);
  };

  const filtersActive = sport !== ALL_SPORTS || Boolean(query) || freeOnly;

  return (
    <main className="page-shell app-main" id="main-content">
      <section className="schedule-section" id="schedule">
        <div className="schedule-heading">
          <div>
            <p className="eyebrow">Full event calendar</p>
            <h1>Schedule</h1>
            <p className="schedule-intro">
              Search every upcoming card, then open an event for the watch link
              and announced fights.
            </p>
          </div>
          <p className="schedule-meta">
            <strong>{timezone.replaceAll("_", " ")}</strong>
            <span>Updated {verifiedDate}</span>
          </p>
        </div>

        <div className="filter-panel" aria-label="Fight schedule filters">
          <label className="search-field">
            <span>Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Fighter, event, city, or promotion"
            />
          </label>

          <div className="sport-filters" aria-label="Filter by sport">
            {sportFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={sport === filter ? "is-active" : ""}
                onClick={() => setSportOverride(filter)}
                aria-pressed={sport === filter}
              >
                {filter}
              </button>
            ))}
          </div>

          <label className="free-toggle">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(event) => setFreeOverride(event.target.checked)}
            />
            Free to watch
          </label>
        </div>

        <div className="results-bar">
          <p>{filtered.length} {filtered.length === 1 ? "event" : "events"}</p>
          {filtersActive && (
            <button type="button" onClick={clearFilters}>
              Reset filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <EventList
            events={filtered}
            mounted={mounted}
            now={now}
            timeFormat={preferences.timeFormat}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            groupByDay
          />
        ) : (
          <div className="empty-state">
            <h2>No events found</h2>
            <p>Try another search or reset your filters.</p>
            <button type="button" onClick={clearFilters}>
              Reset filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
