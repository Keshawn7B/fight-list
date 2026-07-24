"use client";

import { useEffect, useMemo, useState } from "react";
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
  "Muay Thai",
  "Bare Knuckle",
];

const statusFor = (event: FightEvent, now: number) => {
  const start = new Date(event.startsAt).getTime();
  const end = start + 5 * 60 * 60 * 1000;

  if (now >= start && now < end) return "LIVE";
  if (now < start && start - now < 24 * 60 * 60 * 1000) return "NEXT 24H";
  return null;
};

const calendarTimestamp = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(".000", "");

const escapeCalendar = (value: string) =>
  value.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll("\n", "\\n");

function downloadCalendar(event: FightEvent) {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const description = `${event.promotion} — ${event.stakes}. Watch on ${event.watch.provider}. ${event.detailsUrl}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fight List//Fight Tracker//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@fightlist`,
    `DTSTAMP:${calendarTimestamp(new Date().toISOString())}`,
    `DTSTART:${calendarTimestamp(start.toISOString())}`,
    `DTEND:${calendarTimestamp(end.toISOString())}`,
    `SUMMARY:${escapeCalendar(`${event.eventName}: ${event.fighters.join(" vs ")}`)}`,
    `DESCRIPTION:${escapeCalendar(description)}`,
    `LOCATION:${escapeCalendar(`${event.venue}, ${event.location}`)}`,
    `URL:${event.detailsUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `${event.id}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function EventTime({
  iso,
  mounted,
  label,
}: {
  iso: string;
  mounted: boolean;
  label: string;
}) {
  if (!mounted) {
    return (
      <span className="time-row">
        <span>{label}</span>
        <strong>Local time loading…</strong>
      </span>
    );
  }

  const date = new Date(iso);
  const dateText = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
  const timeText = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

  return (
    <span className="time-row">
      <span>{label}</span>
      <strong>
        {dateText} · {timeText}
      </strong>
    </span>
  );
}

function Countdown({
  startsAt,
  now,
}: {
  startsAt: string;
  now: number | null;
}) {
  if (now === null) return <span>Calculating bell time…</span>;

  const distance = new Date(startsAt).getTime() - now;
  if (distance <= 0 && distance > -5 * 60 * 60 * 1000) {
    return <span className="live-copy">Live now</span>;
  }
  if (distance <= 0) return <span>Started</span>;

  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance % 86_400_000) / 3_600_000);
  const minutes = Math.floor((distance % 3_600_000) / 60_000);

  if (days > 0) return <span>{days}d {hours}h to go</span>;
  return <span>{hours}h {minutes}m to go</span>;
}

function EventCard({
  event,
  mounted,
  now,
  saved,
  onToggleSaved,
}: {
  event: FightEvent;
  mounted: boolean;
  now: number;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}) {
  const date = new Date(event.startsAt);
  const status = statusFor(event, now);

  return (
    <article className="event-card" id={event.id}>
      <div className="date-block" aria-label={date.toISOString()}>
        <span>
          {new Intl.DateTimeFormat("en-US", { month: "short" })
            .format(date)
            .toUpperCase()}
        </span>
        <strong>{date.getUTCDate().toString().padStart(2, "0")}</strong>
        <small>
          {new Intl.DateTimeFormat("en-US", { weekday: "short" })
            .format(date)
            .toUpperCase()}
        </small>
      </div>

      <div className="event-body">
        <div className="event-meta">
          <div>
            <span className={`promotion promotion-${event.promotion.toLowerCase()}`}>
              {event.promotion}
            </span>
            <span className="sport-label">{event.sport}</span>
            {status && <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>}
          </div>
          <button
            className={`save-button ${saved ? "is-saved" : ""}`}
            type="button"
            onClick={() => onToggleSaved(event.id)}
            aria-pressed={saved}
            aria-label={`${saved ? "Remove" : "Add"} ${event.eventName} ${saved ? "from" : "to"} saved fights`}
          >
            <span aria-hidden="true">{saved ? "★" : "☆"}</span>
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <p className="event-name">{event.eventName}</p>
        <h3 className="matchup">
          <span>{event.fighters[0]}</span>
          <em>vs</em>
          <span>{event.fighters[1]}</span>
        </h3>
        <p className="stakes">{event.stakes}</p>

        <div className="event-grid">
          <div className="time-stack">
            <EventTime
              iso={event.startsAt}
              mounted={mounted}
              label={event.mainCardAt ? "Prelims / opening bell" : "Event starts"}
            />
            {event.mainCardAt && (
              <EventTime
                iso={event.mainCardAt}
                mounted={mounted}
                label="Main card"
              />
            )}
          </div>

          <div className="location-block">
            <span>Where</span>
            <strong>{event.venue}</strong>
            <small>{event.location}</small>
          </div>

          <div className="watch-block">
            <span>Watch on</span>
            <a href={event.watch.href} target="_blank" rel="noreferrer">
              {event.watch.provider}
              <span aria-hidden="true"> ↗</span>
            </a>
            <small>{event.watch.note}</small>
          </div>
        </div>

        <div className="event-actions">
          <span className={`access-badge access-${event.watch.access.toLowerCase()}`}>
            {event.watch.access}
          </span>
          <button type="button" onClick={() => downloadCalendar(event)}>
            <span aria-hidden="true">＋</span> Add to calendar
          </button>
          <details>
            <summary>Card details</summary>
            <div className="bout-list">
              <p>Also on the card</p>
              <ul>
                {event.bouts.map((bout) => (
                  <li key={bout}>{bout}</li>
                ))}
              </ul>
              <a href={event.detailsUrl} target="_blank" rel="noreferrer">
                Verify on official event page <span aria-hidden="true">↗</span>
              </a>
            </div>
          </details>
        </div>
      </div>
    </article>
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

    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const upcoming = useMemo(() => {
    const current = now ?? new Date("2026-07-24T12:00:00.000Z").getTime();
    return fightEvents.filter(
      (event) =>
        new Date(event.startsAt).getTime() + 5 * 60 * 60 * 1000 > current,
    );
  }, [now]);

  const nextEvent = upcoming[0] ?? fightEvents[0];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return upcoming.filter((event) => {
      const matchesSport = sport === ALL_SPORTS || event.sport === sport;
      const matchesFree = !freeOnly || event.watch.access === "Free";
      const matchesSaved = !savedOnly || savedIds.includes(event.id);
      const haystack = [
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

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id];
      window.localStorage.setItem("fight-list-saved", JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      <a className="skip-link" href="#schedule">
        Skip to fight schedule
      </a>

      <header className="site-header">
        <a className="brand" href="#" aria-label="Fight List home">
          <span className="brand-mark" aria-hidden="true">FL</span>
          <span>
            <strong>Fight List</strong>
            <small>Combat schedule</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#schedule">Schedule</a>
          <button
            className={savedOnly ? "nav-active" : ""}
            type="button"
            onClick={() => {
              setSavedOnly((value) => !value);
              document.querySelector("#schedule")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Saved <span>{savedIds.length}</span>
          </button>
          <a
            className="source-link"
            href="https://github.com/Keshawn7B/fight-list"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true" />
              Combat sports, one clean list
            </p>
            <h1>
              Never miss
              <br />
              <em>the bell.</em>
            </h1>
            <p className="hero-description">
              Upcoming MMA, boxing, Muay Thai, and bare-knuckle cards—with local
              start times and the official place to watch.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#schedule">
                See the fight list <span aria-hidden="true">↓</span>
              </a>
              <p>
                <strong>$0 app.</strong>
                <span>Some broadcasts cost extra.</span>
              </p>
            </div>
          </div>

          <aside className="next-card" aria-label="Next upcoming event">
            <div className="next-card-top">
              <span className="pulse-dot" aria-hidden="true" />
              Next on the clock
              <span className={`access-badge access-${nextEvent.watch.access.toLowerCase()}`}>
                {nextEvent.watch.access}
              </span>
            </div>
            <p>{nextEvent.promotion}</p>
            <h2>
              {nextEvent.fighters[0]}
              <span>vs</span>
              {nextEvent.fighters[1]}
            </h2>
            <div className="countdown">
              <Countdown startsAt={nextEvent.startsAt} now={now} />
            </div>
            <div className="next-card-footer">
              <EventTime
                iso={nextEvent.startsAt}
                mounted={mounted}
                label="Opening bell"
              />
              <a href={`#${nextEvent.id}`}>Jump to card →</a>
            </div>
          </aside>

          <div className="hero-stats" aria-label="Tracker summary">
            <div>
              <strong>{upcoming.length.toString().padStart(2, "0")}</strong>
              <span>Upcoming cards</span>
            </div>
            <div>
              <strong>04</strong>
              <span>Combat sports</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Official watch links</span>
            </div>
          </div>
        </section>

        <section className="schedule-section" id="schedule">
          <div className="schedule-heading">
            <div>
              <p className="section-kicker">Upcoming schedule</p>
              <h2>Find your next fight night.</h2>
            </div>
            <p>
              Times shown in <strong>{timezone.replaceAll("_", " ")}</strong>.
              Schedule verified {verifiedDate}.
            </p>
          </div>

          <div className="filter-panel" aria-label="Fight schedule filters">
            <label className="search-field">
              <span className="sr-only">Search fights</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search fighter, city, promotion…"
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
              <span aria-hidden="true" />
              Free to watch
            </label>
          </div>

          <div className="results-bar">
            <p>
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "event" : "events"}
            </p>
            {(sport !== ALL_SPORTS || query || freeOnly || savedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSport(ALL_SPORTS);
                  setQuery("");
                  setFreeOnly(false);
                  setSavedOnly(false);
                }}
              >
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
                saved={savedIds.includes(event.id)}
                onToggleSaved={toggleSaved}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <span aria-hidden="true">0–0</span>
              <h3>No cards match those filters.</h3>
              <p>Try another sport or turn off “Free to watch.”</p>
              <button
                type="button"
                onClick={() => {
                  setSport(ALL_SPORTS);
                  setQuery("");
                  setFreeOnly(false);
                  setSavedOnly(false);
                }}
              >
                Show every event
              </button>
            </div>
          )}
        </section>

        <section className="free-section" id="about">
          <div>
            <p className="section-kicker">Built to stay free</p>
            <h2>No paid API. No account. No clutter.</h2>
          </div>
          <div className="free-points">
            <article>
              <span>01</span>
              <h3>Open schedule</h3>
              <p>
                The event list is a plain code file, so anyone can correct or
                add a card through GitHub.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Your time zone</h3>
              <p>
                Every start time converts in your browser. No profile or
                location tracking required.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Legal links only</h3>
              <p>
                Watch buttons go to the promotion or licensed broadcaster—never
                sketchy stream mirrors.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">FL</span>
          <span>
            <strong>Fight List</strong>
            <small>Built for fight fans</small>
          </span>
        </div>
        <p>
          Times and cards can change. Confirm with the official event page
          before the opening bell.
        </p>
        <a
          href="https://github.com/Keshawn7B/fight-list"
          target="_blank"
          rel="noreferrer"
        >
          View source on GitHub ↗
        </a>
      </footer>
    </>
  );
}
