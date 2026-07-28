"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "./BrandMark";
import { InstallAppButton } from "./InstallAppButton";
import {
  fightEvents,
  type FightEvent,
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
];

const statusFor = (event: FightEvent, now: number) => {
  const start = new Date(event.startsAt).getTime();
  const end = start + 5 * 60 * 60 * 1000;

  if (now >= start && now < end) return "Live";
  if (now < start && start - now < 24 * 60 * 60 * 1000) return "Next 24h";
  return null;
};

function EventTimeBlock({ iso, mounted }: { iso: string; mounted: boolean }) {
  if (!mounted) {
    return (
      <span className="time-block" aria-label="Local start time loading">
        <span>Local time</span>
        <strong>--:--</strong>
        <small>Loading</small>
      </span>
    );
  }

  const date = new Date(iso);
  const dateText = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
  const timeText = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  const weekdayText = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);

  return (
    <span
      className="time-block"
      aria-label={`${weekdayText}, ${dateText} at ${timeText}`}
    >
      <span>{dateText}</span>
      <strong>{timeText}</strong>
      <small>{weekdayText}</small>
    </span>
  );
}

function EventCard({
  event,
  mounted,
  now,
}: {
  event: FightEvent;
  mounted: boolean;
  now: number;
}) {
  const status = statusFor(event, now);

  return (
    <Link
      className="event-card"
      href={`/events/${event.id}/`}
      id={event.id}
      aria-label={`Open ${event.eventName}: ${event.fighters.join(" versus ")}`}
    >
      <EventTimeBlock iso={event.startsAt} mounted={mounted} />
      <span className="event-summary-copy">
        <span className="summary-labels">
          <span className="sport-label">{event.sport}</span>
          <span className="promotion-label">{event.promotion}</span>
          {status && <span className="status">{status}</span>}
        </span>
        <strong className="event-title">{event.eventName}</strong>
      </span>
      <span className="event-toggle">
        <span>Details</span>
        <i aria-hidden="true">&rarr;</i>
      </span>
    </Link>
  );
}

export function FightTracker() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [sport, setSport] = useState<(typeof sportFilters)[number]>(ALL_SPORTS);
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("your local time");

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      setMounted(true);
      setNow(Date.now());
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

      const stored = window.localStorage.getItem("fight-list-saved");
      if (stored) {
        try {
          setSavedIds(JSON.parse(stored) as string[]);
        } catch {
          window.localStorage.removeItem("fight-list-saved");
        }
      }
    }, 0);

    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialize);
      window.clearInterval(timer);
    };
  }, []);

  const upcoming = useMemo(() => {
    const current = now ?? new Date("2026-07-24T12:00:00.000Z").getTime();
    return fightEvents
      .filter(
        (event) =>
          new Date(event.startsAt).getTime() + 5 * 60 * 60 * 1000 > current,
      )
      .sort(
        (first, second) =>
          new Date(first.startsAt).getTime() -
          new Date(second.startsAt).getTime(),
      );
  }, [now]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return upcoming.filter((event) => {
      const matchesSport = sport === ALL_SPORTS || event.sport === sport;
      const matchesFree = !freeOnly || event.watch.access === "Free";
      const matchesSaved = !savedOnly || savedIds.includes(event.id);
      const haystack = [
        event.sport,
        event.sport === "Jiu-Jitsu" ? "jiujitsu jujitsu bjj grappling" : "",
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

      return matchesSport && matchesFree && matchesSaved && matchesQuery;
    });
  }, [freeOnly, query, savedIds, savedOnly, sport, upcoming]);

  const clearFilters = () => {
    setSport(ALL_SPORTS);
    setQuery("");
    setFreeOnly(false);
    setSavedOnly(false);
  };

  return (
    <>
      <a className="skip-link" href="#schedule">
        Skip to fight schedule
      </a>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Fight List home">
          <BrandMark />
          <strong>Fight List</strong>
        </Link>
        <nav aria-label="Primary navigation">
          <InstallAppButton />
          <button
            className={savedOnly ? "nav-active" : ""}
            type="button"
            onClick={() => {
              setSavedOnly((value) => !value);
              document.querySelector("#schedule")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Saved ({savedIds.length})
          </button>
          <a
            href="https://github.com/Keshawn7B/fight-list"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </header>

      <main className="page-shell">
        <section className="schedule-section" id="schedule">
          <div className="schedule-heading">
            <div>
              <p className="eyebrow">Combat sports schedule</p>
              <h1>Upcoming fights</h1>
              <p className="schedule-intro">
                Event times in your time zone, official watch links, and announced fight cards.
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
                  onClick={() => setSport(filter)}
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
                onChange={(event) => setFreeOnly(event.target.checked)}
              />
              Free to watch
            </label>
          </div>

          <div className="results-bar">
            <p>{filtered.length} {filtered.length === 1 ? "event" : "events"}</p>
            {(sport !== ALL_SPORTS || query || freeOnly || savedOnly) && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          <div className="event-list" aria-live="polite">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                mounted={mounted}
                now={now ?? 0}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <h2>No events found</h2>
              <p>Try a different search or remove a filter.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <strong>Fight List</strong>
        <p>Times and cards can change. Check the official event page before the event starts.</p>
        <a
          href="https://github.com/Keshawn7B/fight-list"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
      </footer>
    </>
  );
}
