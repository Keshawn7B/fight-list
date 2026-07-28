"use client";

import Image from "next/image";
import Link from "next/link";
import { EventList, upcomingEvents } from "./EventComponents";
import { useClientClock, usePreferences, useSavedEvents } from "./appState";
import { fightEvents } from "./events";

export function HomeScreen() {
  const { mounted, now, timezone } = useClientClock();
  const { savedIds, toggleSaved } = useSavedEvents();
  const { preferences } = usePreferences();
  const upcoming = upcomingEvents(fightEvents, now);
  const nextFive = upcoming.slice(0, 5);

  return (
    <main className="page-shell app-main home-page" id="main-content">
      <section className="home-hero">
        <Image
          className="home-hero-image"
          src="/home-hero.jpg"
          alt="A striker and a grappler facing off in a dark red arena"
          width={1840}
          height={856}
          priority
        />
        <div className="home-actions" aria-label="Quick actions">
          <Link className="primary-action" href="/schedule/">
            Browse schedule
          </Link>
          <Link className="secondary-action" href="/saved/">
            Saved fights{savedIds.length ? ` (${savedIds.length})` : ""}
          </Link>
        </div>
      </section>

      <section className="home-section" aria-labelledby="next-five-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Your time zone</p>
            <h2 id="next-five-heading">Next 5 fights</h2>
          </div>
          <div className="section-heading-links">
            <span>{timezone.replaceAll("_", " ")}</span>
            <Link href="/schedule/">Full schedule &rarr;</Link>
          </div>
        </div>
        <EventList
          events={nextFive}
          mounted={mounted}
          now={now}
          timeFormat={preferences.timeFormat}
          savedIds={savedIds}
          onToggleSaved={toggleSaved}
        />
      </section>

    </main>
  );
}
