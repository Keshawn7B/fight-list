import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetail } from "./EventDetail";
import { fightEvents } from "../../events";
import { getEventVisual } from "../../eventVisuals";

export const dynamicParams = false;

export function generateStaticParams() {
  return fightEvents.map((event) => ({ id: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = fightEvents.find((candidate) => candidate.id === id);
  if (!event) return {};
  const visual = getEventVisual(event);

  return {
    title: `${event.eventName}: ${event.fighters.join(" vs ")} — Fight List`,
    description: `${event.stakes}. Local start time, venue, official watch link, and announced fight card.`,
    openGraph: {
      title: `${event.eventName}: ${event.fighters.join(" vs ")}`,
      description: event.stakes,
      images: [{ url: visual.src, alt: visual.alt }],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventIndex = fightEvents.findIndex((event) => event.id === id);
  if (eventIndex === -1) notFound();

  return (
    <EventDetail
      event={fightEvents[eventIndex]}
      previousEvent={fightEvents[eventIndex - 1] ?? null}
      nextEvent={fightEvents[eventIndex + 1] ?? null}
    />
  );
}
