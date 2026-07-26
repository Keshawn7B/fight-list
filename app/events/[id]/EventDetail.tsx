"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "../../BrandMark";
import type { FightEvent } from "../../events";
import { getEventVisual } from "../../eventVisuals";

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

function LocalTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState("Converting to your time…");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLabel(
        new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(new Date(iso)),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [iso]);

  return <>{label}</>;
}

function splitBout(bout: string): [string, string | null] {
  const sides = bout.split(/\s+vs\.?\s+/i);
  return sides.length > 1 ? [sides[0], sides.slice(1).join(" vs ")] : [bout, null];
}

function initials(name: string) {
  return name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function EventDetail({
  event,
  previousEvent,
  nextEvent,
}: {
  event: FightEvent;
  previousEvent: FightEvent | null;
  nextEvent: FightEvent | null;
}) {
  const visual = getEventVisual(event);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const ids = JSON.parse(
          window.localStorage.getItem("fight-list-saved") ?? "[]",
        ) as string[];
        setSaved(ids.includes(event.id));
      } catch {
        window.localStorage.removeItem("fight-list-saved");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [event.id]);

  const fullCard = useMemo(() => {
    const mainEvent = `${event.fighters[0]} vs ${event.fighters[1]}`;
    return [
      mainEvent,
      ...event.bouts.filter(
        (bout) => bout.toLowerCase() !== mainEvent.toLowerCase(),
      ),
    ];
  }, [event]);

  const toggleSaved = () => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(
        window.localStorage.getItem("fight-list-saved") ?? "[]",
      ) as string[];
    } catch {
      ids = [];
    }
    const next = ids.includes(event.id)
      ? ids.filter((id) => id !== event.id)
      : [...ids, event.id];
    window.localStorage.setItem("fight-list-saved", JSON.stringify(next));
    setSaved(next.includes(event.id));
  };

  return (
    <div className="detail-page">
      <header className="detail-header">
        <Link className="brand" href="/" aria-label="Fight List home">
          <BrandMark />
          <strong>Fight List</strong>
        </Link>
        <Link className="detail-back" href="/#schedule">
          &larr; All events
        </Link>
      </header>

      <main className="detail-main">
        <section className="detail-hero">
          <div className="detail-hero-photo">
            <img src={visual.src} alt={visual.alt} />
            <a href={visual.source} target="_blank" rel="noreferrer">
              Sport photography: {visual.credit} / Unsplash
            </a>
          </div>

          <div className="detail-hero-copy">
            <div className="detail-labels">
              <span className="sport-label">{event.sport}</span>
              <span className="promotion-label">{event.promotion}</span>
              <span className={`access-badge access-${event.watch.access.toLowerCase()}`}>
                {event.watch.access}
              </span>
            </div>
            <h1>{event.eventName}</h1>
            <div className="detail-matchup">
              <strong>{event.fighters[0]}</strong>
              <span>vs</span>
              <strong>{event.fighters[1]}</strong>
            </div>
            <p className="detail-stakes">{event.stakes}</p>
          </div>
        </section>

        <section className="detail-facts" aria-label="Event details">
          <article>
            <small>{event.mainCardAt ? "Opening bell" : "Event starts"}</small>
            <strong><LocalTime iso={event.startsAt} /></strong>
            {event.mainCardAt && <p>Main card: <LocalTime iso={event.mainCardAt} /></p>}
          </article>
          <article>
            <small>Venue</small>
            <strong>{event.venue}</strong>
            <p>{event.location}</p>
          </article>
          <article>
            <small>Watch</small>
            <strong>{event.watch.provider}</strong>
            <p>{event.watch.note}</p>
          </article>
        </section>

        <section className="detail-actions" aria-label="Event actions">
          <a className="watch-action" href={event.watch.href} target="_blank" rel="noreferrer">
            Watch on {event.watch.provider}
          </a>
          <button type="button" onClick={() => downloadCalendar(event)}>
            Add to calendar
          </button>
          <button
            className={saved ? "is-saved" : ""}
            type="button"
            onClick={toggleSaved}
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save event"}
          </button>
        </section>

        <section className="fight-card-section">
          <div className="fight-card-heading">
            <div>
              <p className="eyebrow">Announced fight list</p>
              <h2>Fight card</h2>
            </div>
            <p>Card order can change before fight night.</p>
          </div>

          <ol className="fight-list">
            {fullCard.map((bout, index) => {
              const [redCorner, blueCorner] = splitBout(bout);
              return (
                <li className={index === 0 ? "main-bout" : ""} key={`${bout}-${index}`}>
                  <span className="bout-order">
                    {index === 0 ? "Main" : String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="bout-copy">
                    <small>{index === 0 ? event.stakes : "Announced bout"}</small>
                    {blueCorner ? (
                      <div className="bout-names">
                        <strong><i>{initials(redCorner)}</i>{redCorner}</strong>
                        <em>vs</em>
                        <strong><i>{initials(blueCorner)}</i>{blueCorner}</strong>
                      </div>
                    ) : (
                      <div className="bout-update">
                        <strong>{redCorner}</strong>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="card-source">
            <p>Fight card details come from the official event listing.</p>
            <a href={event.detailsUrl} target="_blank" rel="noreferrer">
              Verify full card on the official page
            </a>
          </div>
        </section>

        <nav className="event-pagination" aria-label="Browse events">
          {previousEvent ? (
            <Link href={`/events/${previousEvent.id}/`}>
              <span>&larr; Previous</span>
              <strong>{previousEvent.eventName}</strong>
            </Link>
          ) : <span />}
          {nextEvent ? (
            <Link href={`/events/${nextEvent.id}/`}>
              <span>Next &rarr;</span>
              <strong>{nextEvent.eventName}</strong>
            </Link>
          ) : <span />}
        </nav>
      </main>

      <footer className="detail-footer">
        <p>The header uses illustrative sport photography, not photos of the named fighters.</p>
        <Link href="/#schedule">All events</Link>
      </footer>
    </div>
  );
}
