"use client";

import Link from "next/link";
import { InstallAppButton } from "./InstallAppButton";
import {
  type TimeFormat,
  usePreferences,
  useSavedEvents,
} from "./appState";
import type { FightSport } from "./events";

const sports: Array<"All" | FightSport> = [
  "All",
  "MMA",
  "Boxing",
  "Kickboxing",
  "Muay Thai",
  "Bare Knuckle",
  "Jiu-Jitsu",
  "Wrestling",
];

const timeOptions: Array<{ value: TimeFormat; label: string }> = [
  { value: "auto", label: "Device default" },
  { value: "12", label: "12-hour" },
  { value: "24", label: "24-hour" },
];

export function SettingsScreen() {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const { savedIds, clearSaved } = useSavedEvents();

  return (
    <main className="page-shell app-main settings-page" id="main-content">
      <section className="simple-page-heading">
        <div>
          <p className="eyebrow">Set it your way</p>
          <h1>Settings</h1>
          <p>Changes save automatically on this device.</p>
        </div>
      </section>

      <section className="settings-group" aria-labelledby="time-setting">
        <div className="settings-copy">
          <h2 id="time-setting">Time display</h2>
          <p>Choose how start times appear throughout the app.</p>
        </div>
        <div className="preference-buttons" role="group" aria-label="Time format">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              className={preferences.timeFormat === option.value ? "is-active" : ""}
              type="button"
              onClick={() => updatePreferences({ timeFormat: option.value })}
              aria-pressed={preferences.timeFormat === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-group" aria-labelledby="schedule-setting">
        <div className="settings-copy">
          <h2 id="schedule-setting">Schedule defaults</h2>
          <p>These filters are applied when you open the Schedule page.</p>
        </div>
        <label className="setting-field">
          <span>Favorite sport</span>
          <select
            value={preferences.defaultSport}
            onChange={(event) =>
              updatePreferences({
                defaultSport: event.target.value as "All" | FightSport,
              })
            }
          >
            {sports.map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </label>
        <label className="setting-toggle">
          <input
            type="checkbox"
            checked={preferences.freeOnly}
            onChange={(event) =>
              updatePreferences({ freeOnly: event.target.checked })
            }
          />
          <span>
            <strong>Start with free events only</strong>
            <small>You can still change this from the Schedule page.</small>
          </span>
        </label>
      </section>

      <section className="settings-group" aria-labelledby="install-setting">
        <div className="settings-copy">
          <h2 id="install-setting">Android app</h2>
          <p>
            Install Fight List for a home-screen icon and a standalone app window.
            Previously opened pages remain available offline.
          </p>
        </div>
        <div className="settings-actions">
          <InstallAppButton />
          <p>If the button is hidden, use Chrome&apos;s menu and choose Add to Home screen.</p>
        </div>
      </section>

      <section className="settings-group" aria-labelledby="data-setting">
        <div className="settings-copy">
          <h2 id="data-setting">Saved data</h2>
          <p>{savedIds.length} {savedIds.length === 1 ? "fight is" : "fights are"} saved on this device.</p>
        </div>
        <div className="settings-actions">
          <Link className="secondary-action" href="/saved/">View saved fights</Link>
          <button
            className="danger-action"
            type="button"
            disabled={savedIds.length === 0}
            onClick={() => {
              if (window.confirm("Remove every saved fight from this device?")) {
                clearSaved();
              }
            }}
          >
            Clear saved fights
          </button>
        </div>
      </section>

      <div className="settings-footer-actions">
        <button className="text-action" type="button" onClick={resetPreferences}>
          Reset app preferences
        </button>
        <a
          href="https://github.com/Keshawn7B/fight-list"
          target="_blank"
          rel="noreferrer"
        >
          View source
        </a>
      </div>
    </main>
  );
}
