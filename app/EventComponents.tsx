"use client";

import Link from "next/link";
import type { TimeFormat } from "./appState";
import { hour12For } from "./appState";
import type { FightEvent } from "./events";

const EVENT_WINDOW = 5 * 60 * 60 * 1000;

export function statusFor(event: FightEvent, now: number) {
  if (!now) return null;
  const start = new Date(event.startsAt).getTime();
  const end = start + EVENT_WINDOW;
  if (now >= start && now < end) return "Live";
  if (now >= end) return "Past";
  if (start - now < 24 * 60 * 60 * 1000) return "Next 24h";
  return null;
}

export function chronologicalEvents(events: FightEvent[]) {
  return [...events].sort(
    (first, second) =>
      new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
  );
}

export function upcomingEvents(events: FightEvent[], now: number) {
  if (!now) return chronologicalEvents(events);
  return chronologicalEvents(events).filter(
    (event) => new Date(event.startsAt).getTime() + EVENT_WINDOW > now,
  );
}

function EventTimeBlock({
  iso,
  mounted,
  timeFormat,
}: {
  iso: string;
  mounted: boolean;
  timeFormat: TimeFormat;
}) {
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
    hour12: hour12For(timeFormat),
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

export function EventCard({
  event,
  mounted,
  now,
  timeFormat,
  saved,
  onToggleSaved,
}: {
  event: FightEvent;
  mounted: boolean;
  now: number;
  timeFormat: TimeFormat;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}) {
  const status = statusFor(event, now);

  return (
    <article className="event-card" id={event.id}>
      <Link
        className="event-card-main"
        href={`/events/${event.id}/`}
        aria-label={`Open ${event.eventName}: ${event.fighters.join(" versus ")}`}
      >
        <EventTimeBlock
          iso={event.startsAt}
          mounted={mounted}
          timeFormat={timeFormat}
        />
        <span className="event-summary-copy">
          <span className="summary-labels">
            <span className="sport-label">{event.sport}</span>
            <span className="promotion-label">{event.promotion}</span>
            {status && <span className="status">{status}</span>}
          </span>
          <strong className="event-title">{event.eventName}</strong>
        </span>
        <span className="event-toggle" aria-hidden="true">
          <i>&rarr;</i>
        </span>
      </Link>
      <button
        className={`event-save${saved ? " is-saved" : ""}`}
        type="button"
        onClick={() => onToggleSaved(event.id)}
        aria-label={`${saved ? "Remove" : "Save"} ${event.eventName}`}
        aria-pressed={saved}
      >
        <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      </button>
    </article>
  );
}

export function EventList({
  events,
  mounted,
  now,
  timeFormat,
  savedIds,
  onToggleSaved,
  groupByDay = false,
}: {
  events: FightEvent[];
  mounted: boolean;
  now: number;
  timeFormat: TimeFormat;
  savedIds: string[];
  onToggleSaved: (id: string) => void;
  groupByDay?: boolean;
}) {
  if (!groupByDay) {
    return (
      <div className="event-list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            mounted={mounted}
            now={now}
            timeFormat={timeFormat}
            saved={savedIds.includes(event.id)}
            onToggleSaved={onToggleSaved}
          />
        ))}
      </div>
    );
  }

  const groups = new Map<string, FightEvent[]>();
  for (const event of events) {
    const key = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(event.startsAt));
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  return (
    <div className="event-groups">
      {[...groups.entries()].map(([key, dayEvents]) => (
        <section className="event-day" key={key}>
          <h2>
            {new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date(dayEvents[0].startsAt))}
          </h2>
          <EventList
            events={dayEvents}
            mounted={mounted}
            now={now}
            timeFormat={timeFormat}
            savedIds={savedIds}
            onToggleSaved={onToggleSaved}
          />
        </section>
      ))}
    </div>
  );
}
