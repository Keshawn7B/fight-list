# Fight List

A free, open-source combat sports tracker for upcoming MMA, boxing, Muay Thai,
and bare-knuckle events.

[Open the public Fight List app](https://keshawn7b.github.io/fight-list/)

Fight List puts three things in one clean schedule:

- the local start time
- useful card details
- the official place to watch

The app does not require an account, a paid API, or a database. Broadcasts are
clearly labeled as free, included, subscription, or pay-per-view.

## Features

- Separate Home, Schedule, Saved, and Settings screens
- Automatic browser-local time conversion
- Sport, search, and free-to-watch schedule filters
- Device-local saved events
- Persistent time-format, favorite-sport, and free-event preferences
- Quick-save controls, day grouping, and event sharing
- Downloadable `.ics` calendar events
- Responsive, keyboard-friendly interface
- Installable Android app with offline access to previously opened pages
- Official promotion and broadcaster links only
- Share preview metadata

## Install on Android

Open the public app in Chrome. Tap **Install app** when it appears, or open the
Chrome menu and choose **Add to Home screen**. Fight List then opens from its
own icon in a standalone app window.

## Update the schedule

Events live in [`app/events.ts`](app/events.ts). Each record includes:

- promotion and sport
- headline matchup and supporting bouts
- UTC start and main-card times
- venue and location
- broadcaster, access type, and official links

Use ISO 8601 UTC timestamps so every visitor gets the right local time. Confirm
changes against the official UFC, PFL, ONE, Matchroom, or BKFC event page before
opening a pull request.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, the starter scripts use Unix-style environment
assignments. Run Vinext directly if needed:

```powershell
$env:WRANGLER_LOG_PATH=".wrangler/wrangler.log"
npx vinext dev
```

## Check a change

```bash
npm run test
npx tsc --noEmit
```

## Cost

The source is MIT licensed and the app itself is free. It uses no paid data
service. Some licensed fight broadcasts still require a subscription or PPV;
those costs belong to the broadcaster, not Fight List.

## License

[MIT](LICENSE)
