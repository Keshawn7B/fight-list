import type { FightEvent, FightSport } from "./events";

export type EventVisual = {
  src: string;
  alt: string;
  credit: string;
  source: string;
};

const visuals: Record<FightSport, EventVisual> = {
  MMA: {
    src: "https://images.unsplash.com/photo-1680022548963-1d8e630a272b?auto=format&fit=crop&q=88&w=1800",
    alt: "Two combat athletes competing inside a ring",
    credit: "Redd Francisco",
    source: "https://unsplash.com/photos/a-couple-of-men-standing-on-top-of-a-wrestling-ring-P2pMvhoiW10",
  },
  Boxing: {
    src: "https://images.unsplash.com/photo-1542459629-519887d476da?auto=format&fit=crop&q=88&w=1800",
    alt: "Two boxers facing each other inside a boxing ring",
    credit: "Dan Burton",
    source: "https://unsplash.com/s/photos/boxing-match",
  },
  "Muay Thai": {
    src: "https://images.unsplash.com/photo-1525680996651-0222228be6f0?auto=format&fit=crop&q=88&w=1800",
    alt: "Muay Thai athletes competing in a ring",
    credit: "Pablo Rebolledo",
    source: "https://unsplash.com/s/photos/muay-thai",
  },
  "Bare Knuckle": {
    src: "https://images.unsplash.com/photo-1486215397028-cb4f31efea3e?auto=format&fit=crop&q=88&w=1800",
    alt: "Combat athletes exchanging strikes inside a ring",
    credit: "Solal Ohayon",
    source: "https://unsplash.com/s/photos/boxing-match",
  },
};

export function getEventVisual(event: FightEvent) {
  return visuals[event.sport];
}
