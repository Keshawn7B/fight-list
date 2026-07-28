import * as cheerio from "cheerio";

const MONTHS = new Map(
  [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ].map((month, index) => [month, index]),
);

const clean = (value = "") => value.replace(/\s+/g, " ").trim();

const titleCase = (value) => clean(value)
  .toLowerCase()
  .replace(/\b\w/g, (letter) => letter.toUpperCase())
  .replace(/\bUfc\b/g, "UFC")
  .replace(/\bBjj\b/g, "BJJ")
  .replace(/\bBkfc\b/g, "BKFC")
  .replace(/\bPfl\b/g, "PFL")
  .replace(/\bRaf\b/g, "RAF");

const slugify = (value) => clean(value)
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 80);

const absoluteUrl = (href, base) => new URL(href, base).href;

const futureEnough = (iso, now) => (
  Date.parse(iso) >= now.getTime() - (36 * 60 * 60 * 1000)
);

function inferYear(month, day, now) {
  const currentYear = now.getUTCFullYear();
  const candidate = Date.UTC(currentYear, month, day, 12);
  return candidate < now.getTime() - (90 * 24 * 60 * 60 * 1000)
    ? currentYear + 1
    : currentYear;
}

function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const desired = Date.UTC(year, month, day, hour, minute, 0);
  let guess = desired;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess))
        .filter(({ type }) => type !== "literal")
        .map(({ type, value }) => [type, Number(value)]),
    );
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess += desired - represented;
  }

  return new Date(guess);
}

export function parseLocalDateTime(dateText, timeText, now = new Date(), timeZone = "America/New_York") {
  const dateMatch = clean(dateText).match(/([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  const timeMatch = clean(timeText).match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)/i);
  if (!dateMatch || !timeMatch) return null;

  const month = MONTHS.get(dateMatch[1].slice(0, 3).toLowerCase());
  if (month === undefined) return null;
  const day = Number(dateMatch[2]);
  const year = dateMatch[3] ? Number(dateMatch[3]) : inferYear(month, day, now);
  let hour = Number(timeMatch[1]) % 12;
  if (timeMatch[3].toLowerCase() === "pm") hour += 12;
  const minute = Number(timeMatch[2] ?? 0);

  return zonedTimeToUtc(year, month, day, hour, minute, timeZone).toISOString();
}

function splitMatchup(value) {
  const withoutPrefix = clean(value).replace(/^(?:UFC BJJ\s+\d+|RAF\d+)\s*:\s*/i, "");
  const match = withoutPrefix.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (!match || /^TBD$/i.test(match[1])) return ["Card", "To be announced"];

  let left = clean(match[1]);
  let right = clean(match[2]).replace(/\s+\d+$/, "");
  if (left.split(" ").length > 4) left = left.split(" ").at(-1);
  if (right.split(" ").length > 4) right = right.split(" ")[0];
  return [titleCase(left), titleCase(right)];
}

function autoId(source, detailsUrl, eventName, startsAt) {
  const path = new URL(detailsUrl).pathname.split("/").filter(Boolean).at(-1);
  const usefulPath = path && !["events", "dwcs", "ufcbjj"].includes(path.toLowerCase());
  const identity = `${usefulPath ? path : eventName}-${startsAt.slice(0, 10)}`;
  return `auto-${slugify(source)}-${slugify(identity)}`;
}

function makeEvent({
  source,
  sport,
  promotion,
  eventName,
  fighters,
  stakes,
  startsAt,
  mainCardAt,
  venue,
  location,
  provider,
  access,
  watchHref,
  watchNote,
  detailsUrl,
  bouts,
}) {
  return {
    id: autoId(source, detailsUrl, eventName, startsAt),
    source,
    sport,
    promotion,
    eventName: clean(eventName),
    fighters,
    stakes,
    startsAt,
    ...(mainCardAt ? { mainCardAt } : {}),
    venue: clean(venue) || "Venue TBA",
    location: clean(location) || "Location TBA",
    watch: {
      provider,
      access,
      href: watchHref,
      note: watchNote,
    },
    detailsUrl,
    bouts,
  };
}

export function parseUfcEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const events = [];

  $(".c-card-event--result").each((_, element) => {
    const card = $(element);
    const title = clean(card.find(".c-card-event--result__headline").first().text());
    const dateText = clean(card.find(".c-card-event--result__date").first().text());
    const dateMatch = dateText.match(/([A-Za-z]{3})\s+(\d{1,2})\s*\/\s*(\d{1,2}(?::\d{2})?\s*[AP]M)/i);
    const href = card.find(".c-card-event--result__headline a[href]").attr("href")
      ?? card.find("a[href*='/event/']").first().attr("href");
    if (!title || !dateMatch || !href) return;

    const startsAt = parseLocalDateTime(`${dateMatch[1]} ${dateMatch[2]}`, dateMatch[3], now);
    if (!startsAt || !futureEnough(startsAt, now)) return;
    const detailsUrl = absoluteUrl(href, "https://www.ufc.com/events");
    const venue = clean(card.find(".field--name-taxonomy-term-title").first().text());
    const address = card.find(".field--name-location").first();
    const locality = clean(address.find(".locality").text());
    const area = clean(address.find(".administrative-area").text());
    const country = clean(address.find(".country").text());
    const location = [locality, area, country].filter(Boolean).join(", ") || clean(address.text());
    const path = new URL(detailsUrl).pathname;
    const number = path.match(/\/event\/ufc-(\d+)(?:-|$)/i)?.[1];
    const eventName = number ? `UFC ${number}: ${title}` : `UFC Fight Night: ${title}`;
    const fighters = splitMatchup(title);

    events.push(makeEvent({
      source: "UFC",
      sport: "MMA",
      promotion: "UFC",
      eventName,
      fighters,
      stakes: "Official UFC event",
      startsAt,
      venue,
      location,
      provider: "Paramount+",
      access: "Subscription",
      watchHref: "https://www.ufc.com/watch/schedule",
      watchNote: "U.S. listing; availability varies by country",
      detailsUrl,
      bouts: fighters[0] === "Card" ? ["Full card pending official announcement"] : [`${fighters[0]} vs ${fighters[1]}`],
    }));
  });

  return events;
}

export function parseOneEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const eventsByUrl = new Map();

  $(".datetime[data-timestamp]").each((_, element) => {
    const date = $(element);
    const card = date.closest("a[href]");
    const href = card.attr("href");
    const timestamp = Number(date.attr("data-timestamp"));
    if (!href || !Number.isFinite(timestamp)) return;

    const startsAt = new Date(timestamp * 1000).toISOString();
    if (!futureEnough(startsAt, now)) return;
    const detailsUrl = absoluteUrl(href, "https://www.onefc.com/events/");
    if (eventsByUrl.has(detailsUrl)) return;

    const eventName = clean(card.find(".title").first().text());
    const place = clean(card.find(".location").first().text());
    if (!eventName) return;
    const [venue, ...locationParts] = place.split(",").map(clean);
    const location = locationParts.join(", ");
    const fighters = splitMatchup(eventName.includes(":") ? eventName.split(":").slice(1).join(":") : eventName);
    const isFriday = /Friday Fights/i.test(eventName);
    const isSamurai = /SAMURAI/i.test(eventName);

    eventsByUrl.set(detailsUrl, makeEvent({
      source: "ONE",
      sport: isFriday ? "Muay Thai" : isSamurai ? "Kickboxing" : "MMA",
      promotion: "ONE",
      eventName,
      fighters,
      stakes: "Official ONE Championship card",
      startsAt,
      venue,
      location,
      provider: isFriday ? "Live.ONE / ONE YouTube" : isSamurai ? "Live.ONE / U-NEXT" : "Prime Video",
      access: isFriday ? "Free" : isSamurai ? "Subscription" : "Included",
      watchHref: isFriday || isSamurai ? "https://live.onefc.com/" : "https://www.primevideo.com/",
      watchNote: "Official stream; regional availability may vary",
      detailsUrl,
      bouts: fighters[0] === "Card" ? ["Full card pending official announcement"] : [`${fighters[0]} vs ${fighters[1]}`],
    }));
  });

  return [...eventsByUrl.values()];
}

function closestDatedContainer($, element, dateSelector) {
  let node = $(element);
  for (let depth = 0; depth < 8 && node.length; depth += 1, node = node.parent()) {
    if (node.find(dateSelector).length || node.is(dateSelector)) return node;
  }
  return null;
}

export function parseBkfcEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const eventsByUrl = new Map();

  $("a[data-event-context][href*='/events/']").each((_, element) => {
    const link = $(element);
    const href = link.attr("href");
    const rawTitle = clean(link.attr("data-event-context"));
    const container = closestDatedContainer($, element, "[data-event-date-est]");
    const dateText = clean(container?.find("[data-event-date-est]").first().text());
    if (!href || !rawTitle || !dateText) return;

    const dateMatch = dateText.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})\s+(\d{1,2}(?::\d{2})?\s*[AP]M)/i);
    const startsAt = dateMatch ? parseLocalDateTime(dateMatch[1], dateMatch[2], now) : null;
    if (!startsAt || !futureEnough(startsAt, now)) return;
    const detailsUrl = absoluteUrl(href, "https://www.bkfc.com/events");
    if (!/^(?:www\.)?bkfc\.com$/i.test(new URL(detailsUrl).hostname)) return;
    if (eventsByUrl.has(detailsUrl)) return;

    const eventName = titleCase(rawTitle);
    const shortMatchup = rawTitle.match(/([^\s]+)\s+vs\.?\s+([^\s]+)$/i);
    const fighters = splitMatchup(shortMatchup ? `${shortMatchup[1]} vs ${shortMatchup[2]}` : rawTitle);
    const locationText = clean(
      container?.find("[class*='event_location'], [class*='event-location'], [class*='venue']").first().text(),
    );
    const [venue, ...locationParts] = locationText.split("-").map(clean);

    eventsByUrl.set(detailsUrl, makeEvent({
      source: "BKFC",
      sport: "Bare Knuckle",
      promotion: "BKFC",
      eventName,
      fighters,
      stakes: "Official BKFC card",
      startsAt,
      venue,
      location: locationParts.join(", "),
      provider: "BKFC+ / Fubo Sports",
      access: "Subscription",
      watchHref: "https://watch.bkfc.com/",
      watchNote: "Official BKFC stream; regional options may vary",
      detailsUrl,
      bouts: fighters[0] === "Card" ? ["Fights to be announced by BKFC"] : [`${fighters[0]} vs ${fighters[1]}`],
    }));
  });

  return [...eventsByUrl.values()];
}

export function parsePflEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const events = [];

  $(".event-hub").each((_, element) => {
    const card = $(element);
    const dateText = clean(card.find(".event-card-info > .mb-1").first().text());
    const timesText = clean(card.find(".event-card-info > .mb-2.text-uppercase").first().text());
    const eventName = titleCase(card.find(".event-card-info > .mb-2:not(.text-uppercase)").first().text());
    const place = clean(card.find(".event-card-info > .mb-4").first().text());
    const href = card.find("a[href]").filter((_, link) => /matchups/i.test($(link).text())).first().attr("href");
    const early = timesText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*ET\s*Early/i)?.[1];
    const main = timesText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*ET\s*Main/i)?.[1];
    if (!dateText || !eventName || !href || (!early && !main)) return;

    const startsAt = parseLocalDateTime(dateText, early ?? main, now);
    const mainCardAt = main ? parseLocalDateTime(dateText, main, now) : null;
    if (!startsAt || !futureEnough(startsAt, now)) return;
    const detailsUrl = absoluteUrl(href, "https://pflmma.com/events");
    const [venue, ...locationParts] = place.split(",").map(clean);

    events.push(makeEvent({
      source: "PFL",
      sport: "MMA",
      promotion: "PFL",
      eventName,
      fighters: ["Card", "To be announced"],
      stakes: "Official PFL card",
      startsAt,
      mainCardAt,
      venue,
      location: locationParts.join(", "),
      provider: "ESPN App / ESPN",
      access: "Subscription",
      watchHref: "https://www.espn.com/watch/",
      watchNote: "U.S. listing; regional availability may vary",
      detailsUrl,
      bouts: ["Full matchups on the official PFL card"],
    }));
  });

  return events;
}

export function parseRafEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const pageText = clean($.root().text());
  const timedEvent = pageText.match(/((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4})\s+(\d{1,2}:\d{2}\s*[AP]M)\s*(?:EST|ET)/i);
  if (!timedEvent) return [];
  const startsAt = parseLocalDateTime(timedEvent[1], timedEvent[2], now);
  if (!startsAt || !futureEnough(startsAt, now)) return [];

  const matchingCard = $(".w-dyn-item").filter((_, element) => (
    $(element).find(".text-block-28").length > 0
  )).first();
  if (!matchingCard.length) return [];

  const code = clean(matchingCard.find(".text-block-28").first().text());
  const subtitle = clean(matchingCard.find(".text-block-28-copy").first().text()) || code;
  const location = clean(matchingCard.find(".event-card_location").first().text());
  const eventName = subtitle === code ? code : `${code}: ${subtitle}`;
  const detailsUrl = /^RAF\d+$/i.test(code)
    ? `https://www.realamericanfreestyle.com/events/${code.toLowerCase()}`
    : "https://www.realamericanfreestyle.com/";
  const fighters = splitMatchup(subtitle);

  return [makeEvent({
    source: "RAF",
    sport: "Wrestling",
    promotion: "RAF",
    eventName,
    fighters,
    stakes: "Official Real American Freestyle card",
    startsAt,
    venue: "Venue TBA",
    location,
    provider: "FOX Nation",
    access: "Subscription",
    watchHref: "https://nation.foxnews.com/real-american-freestyle-nation/",
    watchNote: "Streams live exclusively on FOX Nation",
    detailsUrl,
    bouts: fighters[0] === "Card" ? ["Matchups pending official announcement"] : [`${fighters[0]} vs ${fighters[1]}`],
  })];
}

export function parseUfcBjjEvents(html, now = new Date()) {
  const $ = cheerio.load(html);
  const article = $("article").first();
  const text = clean(article.text());
  const number = text.match(/UFC BJJ\s+(\d+)/i)?.[1];
  if (!number) return [];
  const subtitle = text.match(new RegExp(`UFC BJJ\\s+${number}:\\s*(.+?)\\s+Is Live`, "i"))?.[1];
  const dateTime = text.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?,?\s*([A-Za-z]+\s+\d{1,2})(?:,\s*\d{4})?\s+(?:At|Starting At)\s+(\d{1,2}(?::\d{2})?\s*[AP]M)\s*ET/i);
  const startsAt = dateTime ? parseLocalDateTime(dateTime[1], dateTime[2], now) : null;
  if (!subtitle || !startsAt || !futureEnough(startsAt, now)) return [];

  const detailsHref = article.find("a[href]").filter((_, link) => /fight card/i.test($(link).text())).first().attr("href");
  const detailsUrl = detailsHref
    ? absoluteUrl(detailsHref, "https://www.ufc.com/ufcbjj")
    : "https://www.ufc.com/ufcbjj";
  const fighters = splitMatchup(subtitle);

  return [makeEvent({
    source: "UFC BJJ",
    sport: "Jiu-Jitsu",
    promotion: "UFC BJJ",
    eventName: `UFC BJJ ${number}: ${subtitle}`,
    fighters,
    stakes: "Official UFC BJJ card",
    startsAt,
    venue: "Meta APEX",
    location: "Las Vegas, Nevada",
    provider: "UFC BJJ YouTube",
    access: "Free",
    watchHref: "https://www.youtube.com/@ufcbjj",
    watchNote: "Live and free on the official UFC BJJ YouTube channel",
    detailsUrl,
    bouts: fighters[0] === "Card" ? ["Full card pending official announcement"] : [`${fighters[0]} vs ${fighters[1]}`],
  })];
}

export function parseDwcsEvents(hubHtml, announcementHtml, now = new Date()) {
  const $ = cheerio.load(hubHtml);
  const combined = clean(`${$("article").first().text()} ${cheerio.load(announcementHtml).root().text()}`);
  const season = combined.match(/(?:historic\s+)?(\d+)(?:st|nd|rd|th)\s+season/i)?.[1]
    ?? combined.match(/SEASON\s+(\d+)/i)?.[1];
  const dateTime = combined.match(/([A-Za-z]+\s+\d{1,2})(?:,?\s+(\d{4}))?\s+at\s+(\d{1,2}(?::\d{2})?\s*[AP]M)\s*ET/i);
  if (!season || !dateTime) return [];
  const firstStart = parseLocalDateTime(
    `${dateTime[1]}${dateTime[2] ? `, ${dateTime[2]}` : ""}`,
    dateTime[3],
    now,
  );
  if (!firstStart) return [];

  const announcementHref = $("article a[href]").filter((_, link) => /contender series debuts|season\s+\d+\s+to debut/i.test($(link).text())).first().attr("href");
  const detailsUrl = announcementHref
    ? absoluteUrl(announcementHref, "https://www.ufc.com/dwcs")
    : "https://www.ufc.com/dwcs";
  const episodes = Number(combined.match(/(\d+)\s+Weeks/i)?.[1] ?? 10);
  const events = [];

  for (let index = 0; index < episodes; index += 1) {
    const startsAt = new Date(Date.parse(firstStart) + (index * 7 * 24 * 60 * 60 * 1000)).toISOString();
    if (!futureEnough(startsAt, now)) continue;
    events.push(makeEvent({
      source: "DWCS",
      sport: "MMA",
      promotion: "DWCS",
      eventName: `Dana White's Contender Series: Season ${season}, Week ${index + 1}`,
      fighters: ["Card", "To be announced"],
      stakes: "Five UFC contract fights",
      startsAt,
      venue: "Meta APEX",
      location: "Las Vegas, Nevada",
      provider: "Paramount+",
      access: "Subscription",
      watchHref: "https://www.paramountplus.com/",
      watchNote: `Season ${season} streams exclusively on Paramount+`,
      detailsUrl,
      bouts: ["Five bouts scheduled; official matchups to be announced"],
    }));
  }

  return events;
}

export async function fetchOfficialHtml(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "Fight List automatic schedule updater/1.0",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

export const sourceAdapters = [
  {
    name: "UFC",
    run: async (now) => parseUfcEvents(await fetchOfficialHtml("https://www.ufc.com/events"), now),
  },
  {
    name: "DWCS",
    run: async (now) => {
      const hubHtml = await fetchOfficialHtml("https://www.ufc.com/dwcs");
      const $ = cheerio.load(hubHtml);
      const href = $("article a[href]").filter((_, link) => /contender series debuts|season\s+\d+\s+to debut/i.test($(link).text())).first().attr("href");
      const announcementHtml = href ? await fetchOfficialHtml(absoluteUrl(href, "https://www.ufc.com/dwcs")) : hubHtml;
      return parseDwcsEvents(hubHtml, announcementHtml, now);
    },
  },
  {
    name: "UFC BJJ",
    run: async (now) => parseUfcBjjEvents(await fetchOfficialHtml("https://www.ufc.com/ufcbjj"), now),
  },
  {
    name: "ONE",
    run: async (now) => parseOneEvents(await fetchOfficialHtml("https://www.onefc.com/events/"), now),
  },
  {
    name: "PFL",
    run: async (now) => parsePflEvents(await fetchOfficialHtml("https://pflmma.com/events"), now),
  },
  {
    name: "BKFC",
    run: async (now) => parseBkfcEvents(await fetchOfficialHtml("https://www.bkfc.com/events"), now),
  },
  {
    name: "RAF",
    run: async (now) => parseRafEvents(await fetchOfficialHtml("https://www.realamericanfreestyle.com/?direct=true"), now),
  },
];
