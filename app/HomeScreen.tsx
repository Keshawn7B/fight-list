"use client";

import Link from "next/link";
import { EventList, upcomingEvents } from "./EventComponents";
import { useClientClock, usePreferences, useSavedEvents } from "./appState";
import { fightEvents } from "./events";

export function HomeScreen() {
  const { mounted, now, timezone } = useClientClock();
  const { savedIds, toggleSaved } = useSavedEvents();
  const { preferences } = usePreferences();
  const upcoming = upcomingEvents(fightEvents, now);
  const nextEvent = upcoming.slice(0, 1);
  const afterNext = upcoming.slice(1, 4);

  return (
    <main className="page-shell app-main home-page" id="main-content">
      <section className="home-hero">
        <div>
          <p className="eyebrow">Combat sports, in one place</p>
          <h1>Know what&apos;s fighting next.</h1>
          <p>
            Local start times, announced cards, and the official place to watch.
          </p>
        </div>
        <div className="home-actions" aria-label="Quick actions">
          <Link className="primary-action" href="/schedule/">
            Browse schedule
          </Link>
          <Link className="secondary-action" href="/saved/">
            Saved fights{savedIds.length ? ` (${savedIds.length})` : ""}
          </Link>
        </div>
      </section>

      <section className="home-section" aria-labelledby="next-up-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Your time zone</p>
            <h2 id="next-up-heading">Next up</h2>
          </div>
          <span>{timezone.replaceAll("_", " ")}</span>
        </div>
        <EventList
          events={nextEvent}
          mounted={mounted}
          now={now}
          timeFormat={preferences.timeFormat}
          savedIds={savedIds}
          onToggleSaved={toggleSaved}
        />
      </section>

      <section className="home-section" aria-labelledby="coming-soon-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">After that</p>
            <h2 id="coming-soon-heading">Coming soon</h2>
          </div>
          <Link href="/schedule/">See full schedule &rarr;</Link>
        </div>
        <EventList
          events={afterNext}
          mounted={mounted}
          now={now}
          timeFormat={preferences.timeFormat}
          savedIds={savedIds}
          onToggleSaved={toggleSaved}
        />
      </section>

      <section className="home-help">
        <div>
          <p className="eyebrow">Useful shortcut</p>
          <h2>Make fight night easier.</h2>
          <p>
            Save any event with the star, then add it to your calendar from the
            event page for a reminder.
          </p>
        </div>
        <Link className="secondary-action" href="/settings/">
          App settings
        </Link>
      </section>
    </main>
  );
}
