import assert from "node:assert/strict";
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

test("server-renders the Fight List product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Fight List — Upcoming Combat Sports<\/title>/i);
  assert.match(html, /Fight night/);
  assert.match(html, /Upcoming events/i);
  assert.match(html, /Open event/i);
  assert.match(html, /Local start/i);
  assert.match(html, /official broadcast/i);
  assert.match(html, /href="\/events\/ufc-ankalaev-guskov\/?"/i);
  assert.match(html, /Fight List/);
  assert.doesNotMatch(html, /hero-stats|Upcoming cards|100%|codex-preview|react-loading-skeleton/i);
});

test("server-renders a dedicated event screen and visual fight card", async () => {
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
  assert.match(html, /Verify full card on the official page/i);
  assert.doesNotMatch(html, /fact-number|listed bouts/i);
});
