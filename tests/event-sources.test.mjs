import assert from "node:assert/strict";
import test from "node:test";
import {
  parseBkfcEvents,
  parseDwcsEvents,
  parseKarateCombatEvents,
  parseLocalDateTime,
  parseMatchroomEvents,
  parseOneEvents,
  parsePflEvents,
  parseRafEvents,
  parseUfcBjjEvents,
  parseUfcEvents,
} from "../scripts/event-sources.mjs";

const now = new Date("2026-07-28T12:00:00.000Z");

test("converts official Eastern times across daylight saving time", () => {
  assert.equal(
    parseLocalDateTime("August 22, 2026", "8:00 PM", now),
    "2026-08-23T00:00:00.000Z",
  );
  assert.equal(
    parseLocalDateTime("November 7, 2026", "2:00 PM", now),
    "2026-11-07T19:00:00.000Z",
  );
});

test("parses UFC event cards from the official schedule markup", () => {
  const events = parseUfcEvents(`
    <article class="c-card-event--result">
      <h3 class="c-card-event--result__headline"><a href="/event/ufc-330">Makhachev vs Machado Garry</a></h3>
      <a class="c-card-event--result__date">Sat, Aug 15 / 9:00 PM EDT / Main Card</a>
      <div class="field--name-taxonomy-term-title">Xfinity Mobile Arena</div>
      <div class="field--name-location"><span class="locality">Philadelphia</span><span class="administrative-area">PA</span><span class="country">United States</span></div>
    </article>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "UFC 330: Makhachev vs Machado Garry");
  assert.equal(events[0].startsAt, "2026-08-16T01:00:00.000Z");
  assert.equal(events[0].venue, "Xfinity Mobile Arena");
});

test("parses ONE event timestamps without guessing a timezone", () => {
  const events = parseOneEvents(`
    <a href="https://www.onefc.com/events/one-friday-fights-165/">
      <div><div class="desc"><div class="datetime" data-timestamp="1786102200"></div><div class="location">Lumpinee Stadium, Bangkok</div></div><span class="title">ONE Friday Fights 165 &amp; The Inner Circle 25</span></div>
    </a>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].startsAt, "2026-08-07T11:30:00.000Z");
  assert.equal(events[0].watch.access, "Free");
});

test("parses ONE's full upcoming-card markup outside the featured link", () => {
  const events = parseOneEvents(`
    <div class="simple-post-card is-event">
      <a class="title" href="https://www.onefc.com/events/one-friday-fights-169/" title="ONE Friday Fights 169 &amp; The Inner Circle 29"><h3>ONE Friday Fights 169 &amp; The Inner Circle 29</h3></a>
      <div class="datetime" data-timestamp="1788521400"></div>
      <div class="location">Lumpinee Stadium, Bangkok</div>
    </div>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "ONE Friday Fights 169 & The Inner Circle 29");
  assert.equal(events[0].startsAt, "2026-09-04T11:30:00.000Z");
});

test("parses BKFC cards and ignores non-BKFC ticket links", () => {
  const events = parseBkfcEvents(`
    <div class="hero-slider_slide">
      <div data-event-date-est>August 8, 2026 9:00 PM</div>
      <a data-event-context="BKFC FIGHT NIGHT STURGIS ACHESON vs JONES" href="https://tickets.example/events/sturgis">Tickets</a>
      <a data-event-context="BKFC FIGHT NIGHT STURGIS ACHESON vs JONES" href="/events/bkfc-fight-night-sturgis">More Info</a>
    </div>
  `, now);

  assert.equal(events.length, 1);
  assert.deepEqual(events[0].fighters, ["Acheson", "Jones"]);
  assert.equal(events[0].startsAt, "2026-08-09T01:00:00.000Z");
});

test("parses early and main PFL card times", () => {
  const url = "https://pflmma.com/event/pfl-ny-2026";
  const events = parsePflEvents(`
    <div class="event-hub"><div class="event-card-info">
      <div class="mb-1 text-uppercase">Fri, Jul 31</div>
      <div class="mb-2 text-uppercase">4pm ET Early Card | 7pm ET Main Card</div>
      <div class="mb-2">PFL NEW YORK</div>
      <div class="mb-4">UBS Arena, Belmont Park, New York</div>
      <a href="${url}">MATCHUPS</a>
    </div></div>
  `, now, new Map([[url, `<script type="application/ld+json">${JSON.stringify({
    performer: [
      { name: "Prelim Red vs Prelim Blue" },
      { name: "Main Red vs Main Blue" },
    ],
  })}</script>`]]));

  assert.equal(events.length, 1);
  assert.equal(events[0].startsAt, "2026-07-31T20:00:00.000Z");
  assert.equal(events[0].mainCardAt, "2026-07-31T23:00:00.000Z");
  assert.deepEqual(events[0].fighters, ["Main Red", "Main Blue"]);
  assert.deepEqual(events[0].bouts, ["Prelim Red vs Prelim Blue", "Main Red vs Main Blue"]);
});

test("keeps PFL cards whose official start time is still TBA", () => {
  const events = parsePflEvents(`
    <div class="event-hub"><div class="event-card-info">
      <div class="mb-1 text-uppercase">Fri, Oct 2</div>
      <div class="mb-2">PFL MENA 11</div>
      <div class="mb-4">Riyadh, KSA</div>
      <a href="https://pflmma.com/event/pfl-mena-11">MATCHUPS</a>
    </div></div>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].startsAt, "2026-10-02T12:00:00.000Z");
  assert.equal(events[0].timeTba, true);
});

test("ignores old PFL cards when the page includes its past tab", () => {
  const eventCard = (name, href, date) => `<div class="event-hub"><div class="event-card-info">
    <div class="mb-1 text-uppercase">${date}</div><div class="mb-2">${name}</div>
    <div class="mb-4">Arena, City</div><a href="${href}">MATCHUPS</a>
  </div></div>`;
  const events = parsePflEvents(`
    <div id="nav-upcoming">${eventCard("PFL MENA 11", "/event/pfl-mena-11", "Fri, Oct 2")}</div>
    <div id="nav-past">${eventCard("BCS 3", "/event/2024-cs-3", "Fri, Jun 22")}</div>
  `, now);

  assert.deepEqual(events.map((event) => event.eventName), ["PFL Mena 11"]);
});

test("parses Matchroom dates, full names, and undercards", () => {
  const url = "https://www.matchroomboxing.com/events/jones-vs-sanchez/";
  const schedule = `
    <section class="events-upcoming"><div class="fight-card">
      <a class="button--wide" href="${url}" title="Jones vs Sanchez">See event</a>
      <p class="date"><span class="day">02 Oct</span></p>
      <p class="boxers"><span class="location">Caribe Royale, Orlando, USA</span></p>
    </div></section>
  `;
  const detail = `
    <title>Jones vs Sanchez - Matchroom Boxing</title>
    <section class="single-event-hero"><p class="date">Friday 02 October 2026</p>
      <div class="boxer-1"><h2><span class="first-name">Omari</span><span class="last-name">Jones</span></h2></div>
      <div class="boxer-2"><h2><span class="first-name">Alan</span><span class="last-name">Sanchez</span></h2></div>
    </section>
    <section class="undercard"><div class="fight">
      <div class="boxer-1"><h2><span class="first-name">Jordan</span><span class="last-name">Orozco</span></h2></div>
      <div class="boxer-2"><h2><span class="first-name">Yusniel</span><span class="last-name">Abrahante</span></h2></div>
    </div></section>
  `;
  const events = parseMatchroomEvents(schedule, new Map([[url, detail]]), now);

  assert.equal(events.length, 1);
  assert.deepEqual(events[0].fighters, ["Omari Jones", "Alan Sanchez"]);
  assert.deepEqual(events[0].bouts, [
    "Omari Jones vs Alan Sanchez",
    "Jordan Orozco vs Yusniel Abrahante",
  ]);
  assert.equal(events[0].timeTba, true);
});

test("parses the timed RAF card from the official home page", () => {
  const url = "https://www.realamericanfreestyle.com/events/raf12";
  const events = parseRafEvents(`
    <div class="w-dyn-item"><div class="text-block-28">RAF12</div><div class="text-block-28-copy">Dvalishvili vs Cejudo 2</div><div class="event-card_date small">August 22, 2026</div><div class="event-card_location">Cleveland, OH</div></div>
    <div>watch on FOX Nation live streamAug 22, 2026 8:00 PMest</div>
  `, now, new Map([[url, `
    <div id="matchups"><div class="w-dyn-item">
      <div class="awthlete-name">Merab Dvalishvili</div><div class="awthlete-name">vs</div>
      <div class="aathlete-name">Henry Cejudo</div>
    </div></div>
  `]]));

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "RAF12: Dvalishvili vs Cejudo 2");
  assert.equal(events[0].startsAt, "2026-08-23T00:00:00.000Z");
  assert.deepEqual(events[0].fighters, ["Merab Dvalishvili", "Henry Cejudo"]);
  assert.deepEqual(events[0].bouts, ["Merab Dvalishvili vs Henry Cejudo"]);
});

test("keeps later RAF cards with unannounced start times", () => {
  const events = parseRafEvents(`
    <div class="w-dyn-item"><div class="text-block-28">RAF14</div><div class="text-block-28-copy">Tsarukyan vs Danis</div><div class="event-card_date small">October 23, 2026</div><div class="event-card_location">Las Vegas, NV</div></div>
    <div class="w-dyn-item"><div class="text-block-28">RAF15</div><div class="text-block-28-copy">RAF15</div><div class="event-card_date small">November 28, 2026</div><div class="event-card_location">Chicago, IL</div></div>
    <div>watch on FOX Nation live streamOct 23, 2026 9:00 PMest</div>
  `, now);

  assert.equal(events.length, 2);
  assert.equal(events[0].timeTba, undefined);
  assert.equal(events[1].timeTba, true);
  assert.equal(events[1].startsAt, "2026-11-28T12:00:00.000Z");
});

test("parses Karate Combat's exact timestamp and full official card", () => {
  const tickets = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps: { event: {
      name: "KC 63 - Miami",
      slug: "kc-63-miami",
      date: "2026-08-28T19:00:00.000-04:00",
      mainFighters: "Raymond Daniels vs Rafael Aghayev",
      coMainFighters: "Fighter Three vs Fighter Four",
      description: "Karate Combat returns in Miami, FL.",
    } } },
  })}</script>`;
  const detail = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps: { fightEvent: {
      id: "kc-63-miami",
      mainFighters: "Raymond Daniels vs Rafael Aghayev",
      description: "Karate Combat returns in Miami, FL.",
      fightsCollection: { items: [
        { redFighter: { fullName: "Raymond Daniels" }, blueFighter: { fullName: "Rafael Aghayev" } },
        { redFighter: { fullName: "Fighter Three" }, blueFighter: { fullName: "Fighter Four" } },
      ] },
    } } },
  })}</script>`;
  const events = parseKarateCombatEvents(tickets, detail, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].sport, "Karate");
  assert.equal(events[0].startsAt, "2026-08-28T23:00:00.000Z");
  assert.equal(events[0].location, "Miami, FL");
  assert.deepEqual(events[0].bouts, [
    "Raymond Daniels vs Rafael Aghayev",
    "Fighter Three vs Fighter Four",
  ]);
  assert.equal(events[0].watch.access, "Free");
});

test("parses the current UFC BJJ hub event", () => {
  const events = parseUfcBjjEvents(`
    <article><h1>UFC BJJ 10</h1><p>UFC BJJ 10: Tackett vs Gracie Is Live Thursday, August 20 At 8pm ET/5pm PT</p><a href="/news/ufc-bjj-10-tackett-vs-gracie-fight-card">Fight Card</a></article>
  `, now, `
    <h3>Main Event: Welterweight - Andrew Tackett vs Kron Gracie</h3>
    <h3>Lightweight - Athlete Three vs Athlete Four</h3>
  `);

  assert.equal(events.length, 1);
  assert.equal(events[0].watch.provider, "UFC Fight Pass");
  assert.equal(events[0].watch.access, "Subscription");
  assert.equal(events[0].startsAt, "2026-08-21T00:00:00.000Z");
  assert.deepEqual(events[0].fighters, ["Andrew Tackett", "Kron Gracie"]);
  assert.deepEqual(events[0].bouts, [
    "Andrew Tackett vs Kron Gracie",
    "Athlete Three vs Athlete Four",
  ]);
});

test("creates all ten weekly DWCS episodes from the official season announcement", () => {
  const hub = `<article><p>Dana White's Contender Series returns for its 10th season. 100 Fighters, 10 Weeks.</p><a href="/news/dwcs-season-10">Contender Series Debuts Season 10 To Debut</a></article>`;
  const announcement = `<article><p>Season 10 is scheduled for 10 Tuesday night episodes, with the first taking place on Tuesday, August 11 at 8 pm ET.</p></article>`;
  const events = parseDwcsEvents(hub, announcement, now);

  assert.equal(events.length, 10);
  assert.equal(events[0].startsAt, "2026-08-12T00:00:00.000Z");
  assert.match(events[9].eventName, /Week 10/);
});

test("keeps DWCS current when the hub replaces its launch announcement", () => {
  const hub = `<main><h3>The Tuesday Night Showcase Returns For Its 10th Season On August 11</h3><p>100 Fighters, 10 Weeks</p></main>`;
  const episode = `
    <main><h1>DWCS Season 10 Episode 2 Preview: Athletes, Bouts, Start Times, Streaming</h1>
      <p>The DWCS Season 10 will feature 10 weekly episodes every Tuesday night on Paramount+, beginning at 8:00 p.m. ET.</p>
      <h2>DWCS S10 E2 Fight Card</h2>
      <ul><li>Namo Fazil vs Kaik Brito</li><li>Douglas Rodrigues vs Trent Miller</li></ul>
    </main>`;
  const url = "https://www.ufc.com/news/dwcs-season-10-episode-2-preview-athletes-bouts-start-times-streaming";
  const events = parseDwcsEvents(hub, episode, now, url);

  assert.equal(events.length, 10);
  assert.deepEqual(events[1].fighters, ["Namo Fazil", "Kaik Brito"]);
  assert.deepEqual(events[1].bouts, ["Namo Fazil vs Kaik Brito", "Douglas Rodrigues vs Trent Miller"]);
  assert.equal(events[1].detailsUrl, url);
});
