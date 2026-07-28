"use client";

import Link from "next/link";
import { chronologicalEvents, EventList } from "./EventComponents";
import { useClientClock, usePreferences, useSavedEvents } from "./appState";
import { fightEvents } from "./events";

export function SavedScreen() {
  const { mounted, now } = useClientClock();
  const { savedIds, toggleSaved, clearSaved } = useSavedEvents();
  const { preferences } = usePreferences();
  const savedEvents = chronologicalEvents(
    fightEvents.filter((event) => savedIds.includes(event.id)),
  );

  return (
    <main className="page-shell app-main saved-page" id="main-content">
      <section className="simple-page-heading">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1>Saved fights</h1>
          <p>Everything you starred, kept on this device.</p>
        </div>
        {savedEvents.length > 0 && (
          <button
            className="text-action"
            type="button"
            onClick={() => {
              if (window.confirm("Remove every saved fight from this device?")) {
                clearSaved();
              }
            }}
          >
            Clear all
          </button>
        )}
      </section>

      {savedEvents.length > 0 ? (
        <>
          <div className="results-bar">
            <p>{savedEvents.length} saved {savedEvents.length === 1 ? "event" : "events"}</p>
          </div>
          <EventList
            events={savedEvents}
            mounted={mounted}
            now={now}
            timeFormat={preferences.timeFormat}
            savedIds={savedIds}
            onToggleSaved={toggleSaved}
            groupByDay
          />
        </>
      ) : (
        <div className="empty-state empty-state-card">
          <span aria-hidden="true">☆</span>
          <h2>No saved fights yet</h2>
          <p>Tap the star beside an event and it will show up here.</p>
          <Link className="primary-action" href="/schedule/">
            Browse schedule
          </Link>
        </div>
      )}
    </main>
  );
}
