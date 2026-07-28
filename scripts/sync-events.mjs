import { readFile, writeFile } from "node:fs/promises";
import { sourceAdapters } from "./event-sources.mjs";

const outputUrl = new URL("../app/generated-events.json", import.meta.url);
const now = process.env.SYNC_NOW ? new Date(process.env.SYNC_NOW) : new Date();
const dryRun = process.argv.includes("--dry-run");

let previous = { events: [] };
try {
  previous = JSON.parse(await readFile(outputUrl, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const previousBySource = Map.groupBy(previous.events ?? [], (event) => event.source);
const nextEvents = [];
const failures = [];

for (const adapter of sourceAdapters) {
  const previousEvents = previousBySource.get(adapter.name) ?? [];
  try {
    const events = await adapter.run(now);
    const previousFutureCount = previousEvents.filter(
      (event) => Date.parse(event.startsAt) >= now.getTime() - (36 * 60 * 60 * 1000),
    ).length;
    if (!events.length) throw new Error("no upcoming events were recognized");
    if (previousFutureCount >= 4 && events.length < Math.ceil(previousFutureCount / 3)) {
      throw new Error(`recognized only ${events.length} of ${previousFutureCount} previous upcoming events`);
    }
    nextEvents.push(...events);
    console.log(`${adapter.name}: ${events.length} upcoming event${events.length === 1 ? "" : "s"}`);
  } catch (error) {
    failures.push(`${adapter.name}: ${error.message}`);
    nextEvents.push(...previousEvents);
    console.warn(`${adapter.name}: keeping ${previousEvents.length} previous event${previousEvents.length === 1 ? "" : "s"} (${error.message})`);
  }
}

const requiredKeys = ["id", "source", "sport", "promotion", "eventName", "startsAt", "venue", "location", "detailsUrl"];
const validEvents = nextEvents.filter((event) => (
  requiredKeys.every((key) => typeof event[key] === "string" && event[key].trim())
  && Number.isFinite(Date.parse(event.startsAt))
  && /^https:\/\//.test(event.detailsUrl)
  && Array.isArray(event.fighters)
  && event.fighters.length === 2
  && Array.isArray(event.bouts)
  && event.bouts.length > 0
));

if (validEvents.length !== nextEvents.length) {
  throw new Error(`${nextEvents.length - validEvents.length} generated events failed validation`);
}

const deduped = [...new Map(
  validEvents.map((event) => [`${event.source}|${event.detailsUrl}|${event.startsAt}`, event]),
).values()].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));

const verifiedDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(now);

const output = `${JSON.stringify({
  verifiedDate,
  events: deduped,
}, null, 2)}\n`;

if (dryRun) {
  console.log(`Dry run complete: ${deduped.length} events (${failures.length} source warnings)`);
} else {
  await writeFile(outputUrl, output, "utf8");
  console.log(`Saved ${deduped.length} automatically tracked events.`);
}

if (failures.length) {
  console.warn(`Source warnings:\n- ${failures.join("\n- ")}`);
}
