# Fight List

A free, open-source combat sports tracker for upcoming MMA, boxing, Muay Thai,
and bare-knuckle events.

Fight List puts three things in one clean schedule:

- the local start time
- useful card details
- the official place to watch

The app does not require an account, a paid API, or a database. Broadcasts are
clearly labeled as free, included, subscription, or pay-per-view.

## Features

- Automatic browser-local time conversion
- Sport, search, saved-card, and free-to-watch filters
- Device-local saved events
- Downloadable `.ics` calendar events
- Responsive, keyboard-friendly interface
- Official promotion and broadcaster links only
- Share preview metadata

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
