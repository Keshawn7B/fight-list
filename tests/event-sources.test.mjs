import assert from "node:assert/strict";
import test from "node:test";
import {
  parseBkfcEvents,
  parseDwcsEvents,
  parseLocalDateTime,
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
  const events = parsePflEvents(`
    <div class="event-hub"><div class="event-card-info">
      <div class="mb-1 text-uppercase">Fri, Jul 31</div>
      <div class="mb-2 text-uppercase">4pm ET Early Card | 7pm ET Main Card</div>
      <div class="mb-2">PFL NEW YORK</div>
      <div class="mb-4">UBS Arena, Belmont Park, New York</div>
      <a href="https://pflmma.com/event/pfl-ny-2026">MATCHUPS</a>
    </div></div>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].startsAt, "2026-07-31T20:00:00.000Z");
  assert.equal(events[0].mainCardAt, "2026-07-31T23:00:00.000Z");
});

test("parses the timed RAF card from the official home page", () => {
  const events = parseRafEvents(`
    <div class="w-dyn-item"><div class="text-block-28">RAF12</div><div class="text-block-28-copy">Dvalishvili vs Cejudo 2</div><div class="event-card_date small">August 22, 2026</div><div class="event-card_location">Cleveland, OH</div></div>
    <div>watch on FOX Nation live streamAug 22, 2026 8:00 PMest</div>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "RAF12: Dvalishvili vs Cejudo 2");
  assert.equal(events[0].startsAt, "2026-08-23T00:00:00.000Z");
});

test("parses the current UFC BJJ hub event", () => {
  const events = parseUfcBjjEvents(`
    <article><h1>UFC BJJ 10</h1><p>UFC BJJ 10: Tackett vs Gracie Is Live Thursday, August 20 At 8pm ET/5pm PT</p><a href="/news/ufc-bjj-10-tackett-vs-gracie-fight-card">Fight Card</a></article>
  `, now);

  assert.equal(events.length, 1);
  assert.equal(events[0].watch.access, "Free");
  assert.equal(events[0].startsAt, "2026-08-21T00:00:00.000Z");
});

test("creates all ten weekly DWCS episodes from the official season announcement", () => {
  const hub = `<article><p>Dana White's Contender Series returns for its 10th season. 100 Fighters, 10 Weeks.</p><a href="/news/dwcs-season-10">Contender Series Debuts Season 10 To Debut</a></article>`;
  const announcement = `<article><p>Season 10 is scheduled for 10 Tuesday night episodes, with the first taking place on Tuesday, August 11 at 8 pm ET.</p></article>`;
  const events = parseDwcsEvents(hub, announcement, now);

  assert.equal(events.length, 10);
  assert.equal(events[0].startsAt, "2026-08-12T00:00:00.000Z");
  assert.match(events[9].eventName, /Week 10/);
});
