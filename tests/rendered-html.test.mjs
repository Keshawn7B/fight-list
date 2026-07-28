import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const fetchPage = (url) => worker.fetch(
    new Request(url, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  let response = await fetchPage(`http://localhost${pathname}`);
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) response = await fetchPage(new URL(location, "http://localhost").href);
  }
  return response;
}

test("server-renders the multi-page Fight List home", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Fight List — Upcoming fights<\/title>/i);
  assert.match(html, /home-hero\.jpg/i);
  assert.match(html, /src="\/home-hero\.jpg"/i);
  assert.match(html, /A striker and a grappler facing off/i);
  assert.doesNotMatch(html, /_next\/image/i);
  assert.match(html, /Next 5 fights/i);
  assert.equal((html.match(/class="event-card"/g) ?? []).length, 5);
  assert.match(html, /Browse schedule/i);
  assert.match(html, /href="\/schedule\/?"/i);
  assert.match(html, /href="\/saved\/?"/i);
  assert.match(html, /href="\/settings\/?"/i);
  assert.match(html, /href="\/events\/ufc-ankalaev-guskov\/?"/i);
  assert.match(html, /Fight List/);
  assert.match(html, /rel="manifest"/i);
  assert.match(html, /manifest\.webmanifest/i);
  assert.match(html, /mobile-web-app-capable/i);
  assert.doesNotMatch(html, /Combat sports, in one place|Know what.+fighting next|Local start times, announced cards|Make fight night easier|After that|Coming soon|filter-panel|hero-stats|100%|codex-preview|react-loading-skeleton/i);
});

test("server-renders the full searchable schedule on its own page", async () => {
  const response = await render("/schedule/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Full event calendar/i);
  assert.match(html, /Fighter, event, city, or promotion/i);
  assert.match(html, /Free to watch/i);
  assert.match(html, /Jiu-Jitsu/i);
  assert.match(html, /Wrestling/i);
  assert.match(html, /Karate/i);
  assert.match(html, /BJJ Stars 19/i);
  assert.match(html, /U17 World Championships/i);
  assert.match(html, /Dana White.+Contender Series/i);
  assert.match(html, /Season 10, Week 10/i);
  assert.match(html, /UFC BJJ 10/i);
  assert.match(html, /RAF12.+Dvalishvili vs Cejudo 2/i);
  assert.match(html, /ONE Friday Fights 165/i);
  assert.match(html, /ONE SAMURAI 2/i);
  assert.match(html, /BKFC Belgrade/i);
  assert.match(html, /BKFC 95 Newark/i);
  assert.match(html, /aria-label="Save /i);
});

test("tracks DWCS and UFC BJJ with official event details", async () => {
  const dwcsResponse = await render("/events/dwcs-season-10-week-1/");
  assert.equal(dwcsResponse.status, 200);
  const dwcsHtml = await dwcsResponse.text();
  assert.match(dwcsHtml, /Dana White.+Contender Series/i);
  assert.match(dwcsHtml, /Season 10/i);
  assert.match(dwcsHtml, /Five bouts scheduled/i);
  assert.match(dwcsHtml, /Paramount\+/i);

  const weekTwoResponse = await render("/events/auto-dwcs-dana-whites-contender-series-debuts-paramount-historic-10th-season-2026-08-19/");
  assert.equal(weekTwoResponse.status, 200);
  assert.match(await weekTwoResponse.text(), /Season 10, Week 2/i);

  const bjjResponse = await render("/events/ufc-bjj-10/");
  assert.equal(bjjResponse.status, 200);
  const bjjHtml = await bjjResponse.text();
  assert.match(bjjHtml, /UFC BJJ 10/i);
  assert.match(bjjHtml, /Andrew Tackett/i);
  assert.match(bjjHtml, /Jonnatas Gracie/i);
  assert.match(bjjHtml, /Rebeca Lima vs Brianna Ste-Marie/i);
  assert.match(bjjHtml, /UFC BJJ YouTube/i);
  assert.match(bjjHtml, />Free</i);
});

test("tracks Real American Freestyle with its official RAF12 card", async () => {
  const response = await render("/events/raf12-dvalishvili-cejudo/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /RAF12/i);
  assert.match(html, /Merab Dvalishvili/i);
  assert.match(html, /Henry Cejudo/i);
  assert.match(html, /Jordan Burroughs vs Sean Brady/i);
  assert.match(html, /Gable Steveson vs Anthony Cassioppi/i);
  assert.match(html, /FOX Nation/i);
  assert.match(html, /Wrestling/i);
});

test("server-renders dedicated saved and settings pages", async () => {
  const savedResponse = await render("/saved/");
  assert.equal(savedResponse.status, 200);
  const savedHtml = await savedResponse.text();
  assert.match(savedHtml, /Saved fights/i);
  assert.match(savedHtml, /No saved fights yet/i);

  const settingsResponse = await render("/settings/");
  assert.equal(settingsResponse.status, 200);
  const settingsHtml = await settingsResponse.text();
  assert.match(settingsHtml, /Time display/i);
  assert.match(settingsHtml, /Schedule defaults/i);
  assert.match(settingsHtml, /Android app/i);
  assert.match(settingsHtml, /Schedule updates/i);
  assert.match(settingsHtml, /every six hours/i);
  assert.match(settingsHtml, /<option[^>]*>Karate<\/option>/i);
  assert.match(settingsHtml, /12-hour/i);
  assert.match(settingsHtml, /24-hour/i);
});

test("server-renders a dedicated event screen and straightforward fight card", async () => {
  const response = await render("/events/ufc-ankalaev-guskov/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /UFC Fight Night/i);
  assert.match(html, /Magomed Ankalaev/i);
  assert.match(html, /Bogdan Guskov/i);
  assert.match(html, /Announced fight list/i);
  assert.match(html, /Sport photography/i);
  assert.match(html, /Watch on/i);
  assert.match(html, /Paramount\+/i);
  assert.match(html, /Add to calendar/i);
  assert.match(html, /Share event/i);
  assert.match(html, /Back to schedule/i);
  assert.match(html, /Verify full card on the official page/i);
  assert.doesNotMatch(html, /bout-photo|visual-fight-list|fact-number|listed bouts/i);
});

test("ships an installable Android web app manifest", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  );

  assert.equal(manifest.short_name, "Fight List");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.deepEqual(
    manifest.icons.map(({ sizes }) => sizes),
    ["192x192", "512x512"],
  );
  assert.deepEqual(
    manifest.shortcuts.map(({ short_name }) => short_name),
    ["Schedule", "Saved"],
  );
});

test("keeps mobile event cards readable", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

  assert.match(css, /grid-template-columns:\s*72px minmax\(0, 1fr\)/);
  assert.match(css, /max-width:\s*72px/);
  assert.match(css, /font-size:\s*clamp\(18px, 5\.2vw, 22px\)/);
  assert.match(css, /word-break:\s*normal/);
  assert.match(serviceWorker, /fight-list-v4/);
  assert.match(serviceWorker, /home-hero\.jpg/);
});
