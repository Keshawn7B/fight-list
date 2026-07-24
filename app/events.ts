export type FightSport =
  | "MMA"
  | "Boxing"
  | "Muay Thai"
  | "Bare Knuckle";

export type WatchAccess = "Free" | "Included" | "Subscription" | "PPV";

export type FightEvent = {
  id: string;
  sport: FightSport;
  promotion: string;
  eventName: string;
  fighters: [string, string];
  stakes: string;
  startsAt: string;
  mainCardAt?: string;
  venue: string;
  location: string;
  watch: {
    provider: string;
    access: WatchAccess;
    href: string;
    note: string;
  };
  detailsUrl: string;
  bouts: string[];
};

export const verifiedDate = "July 24, 2026";

export const fightEvents: FightEvent[] = [
  {
    id: "one-friday-fights-163",
    sport: "Muay Thai",
    promotion: "ONE",
    eventName: "ONE Friday Fights 163",
    fighters: ["Pompet Pongsuphan PK", "Nat Khat Min"],
    stakes: "Flyweight Muay Thai main event",
    startsAt: "2026-07-24T13:30:00.000Z",
    venue: "Lumpinee Stadium",
    location: "Bangkok, Thailand",
    watch: {
      provider: "Watch.ONE / Prime Video",
      access: "Free",
      href: "https://watch.onefc.com/",
      note: "Free availability varies by region",
    },
    detailsUrl:
      "https://www.onefc.com/news/full-card-revealed-for-one-friday-fights-163-on-july-24/",
    bouts: [
      "Mongkoldetlek Por Pim-on vs Utkirzhon Khamidov",
      "Brazil Aekmuangnon vs Grippen Rachanon",
      "O’Neal Thompson vs Jason Chen",
    ],
  },
  {
    id: "ufc-ankalaev-guskov",
    sport: "MMA",
    promotion: "UFC",
    eventName: "UFC Fight Night",
    fighters: ["Magomed Ankalaev", "Bogdan Guskov"],
    stakes: "Light heavyweight main event",
    startsAt: "2026-07-25T13:00:00.000Z",
    mainCardAt: "2026-07-25T16:00:00.000Z",
    venue: "Etihad Arena",
    location: "Abu Dhabi, United Arab Emirates",
    watch: {
      provider: "Paramount+",
      access: "Subscription",
      href: "https://www.ufc.com/watch/schedule",
      note: "U.S. listing; availability varies by country",
    },
    detailsUrl: "https://www.ufc.com/events",
    bouts: [
      "Magomed Ankalaev vs Bogdan Guskov",
      "Full card and bout order on UFC.com",
    ],
  },
  {
    id: "joshua-prenga",
    sport: "Boxing",
    promotion: "Matchroom",
    eventName: "The Comeback",
    fighters: ["Anthony Joshua", "Kristian Prenga"],
    stakes: "Heavyweight main event",
    startsAt: "2026-07-25T16:00:00.000Z",
    mainCardAt: "2026-07-25T20:00:00.000Z",
    venue: "Jeddah Season",
    location: "Jeddah, Saudi Arabia",
    watch: {
      provider: "DAZN",
      access: "PPV",
      href: "https://www.dazn.com/",
      note: "Worldwide DAZN pay-per-view",
    },
    detailsUrl:
      "https://www.matchroomboxing.com/news/two-world-title-fights-added-to-the-comeback-undercard-on-july-25-in-jeddah-with-hamzah-sheeraz-vs-simon-zachenhuber-and-josh-kelly-vs-caomhin-agyarko-live-worldwide-on-dazn/",
    bouts: [
      "Hamzah Sheeraz vs Simon Zachenhuber",
      "Josh Kelly vs Caoimhin Agyarko",
      "Reito Tsutsumi vs Alvino Herrera",
    ],
  },
  {
    id: "pfl-washington-dc",
    sport: "MMA",
    promotion: "PFL",
    eventName: "PFL Washington D.C.",
    fighters: ["Thad Jean", "Shamil Musaev"],
    stakes: "PFL welterweight world title",
    startsAt: "2026-07-25T23:00:00.000Z",
    mainCardAt: "2026-07-26T02:00:00.000Z",
    venue: "CareFirst Arena",
    location: "Washington, D.C.",
    watch: {
      provider: "ESPN App / ESPN",
      access: "Subscription",
      href: "https://www.espn.com/watch/",
      note: "Prelims on ESPN App; main card on ESPN in the U.S.",
    },
    detailsUrl:
      "https://pflmma.com/news/pfl-washington-dc-full-card-confirmed-for-july-31-at-carefirst-arena",
    bouts: [
      "Magomed Umalatov vs Ernesto Rodriguez",
      "Bryce Meredith vs Jack Cartwright",
      "Sullivan Cauley vs Rasul Magomedov",
    ],
  },
  {
    id: "bkfc-uruguay",
    sport: "Bare Knuckle",
    promotion: "BKFC",
    eventName: "BKFC Fight Night Uruguay",
    fighters: ["Gaston Reyno", "Josh Krejci"],
    stakes: "Bare-knuckle main event",
    startsAt: "2026-07-25T23:00:00.000Z",
    venue: "Antel Arena",
    location: "Montevideo, Uruguay",
    watch: {
      provider: "BKFC+ / Fubo Sports",
      access: "Subscription",
      href: "https://watch.bkfc.com/",
      note: "Official BKFC stream; regional options may vary",
    },
    detailsUrl: "https://www.bkfc.com/events",
    bouts: ["Gaston “Tonga” Reyno vs Josh Krejci"],
  },
  {
    id: "one-friday-fights-164",
    sport: "Muay Thai",
    promotion: "ONE",
    eventName: "ONE Friday Fights 164",
    fighters: ["Card", "To be announced"],
    stakes: "Muay Thai and MMA from Lumpinee",
    startsAt: "2026-07-31T13:30:00.000Z",
    venue: "Lumpinee Stadium",
    location: "Bangkok, Thailand",
    watch: {
      provider: "Watch.ONE / Prime Video",
      access: "Free",
      href: "https://watch.onefc.com/",
      note: "Free availability varies by region",
    },
    detailsUrl: "https://www.onefc.com/events/",
    bouts: ["Full card pending official announcement"],
  },
  {
    id: "pfl-new-york",
    sport: "MMA",
    promotion: "PFL",
    eventName: "PFL New York",
    fighters: ["Usman Nurmagomedov", "Archie Colgan"],
    stakes: "PFL lightweight world title",
    startsAt: "2026-07-31T20:00:00.000Z",
    mainCardAt: "2026-07-31T23:00:00.000Z",
    venue: "UBS Arena",
    location: "Belmont Park, New York",
    watch: {
      provider: "ESPN App / ESPN",
      access: "Subscription",
      href: "https://www.espn.com/watch/",
      note: "Prelims on ESPN App; main card on ESPN in the U.S.",
    },
    detailsUrl: "https://pflmma.com/event/pfl-ny-2026",
    bouts: [
      "Dakota Ditcheva vs Denise Kielholtz",
      "More bouts on the official PFL card",
    ],
  },
  {
    id: "ufc-medic-rodriguez",
    sport: "MMA",
    promotion: "UFC",
    eventName: "UFC Fight Night Belgrade",
    fighters: ["Uroš Medić", "Daniel Rodriguez"],
    stakes: "Welterweight main event",
    startsAt: "2026-08-01T14:00:00.000Z",
    mainCardAt: "2026-08-01T17:00:00.000Z",
    venue: "Belgrade Arena",
    location: "Belgrade, Serbia",
    watch: {
      provider: "Paramount+",
      access: "Subscription",
      href: "https://www.ufc.com/watch/schedule",
      note: "U.S. listing; availability varies by country",
    },
    detailsUrl:
      "https://www.ufc.com/event/ufc-fight-night-august-01-2026",
    bouts: [
      "Jan Błachowicz vs Navajo Stirling",
      "Aleksandar Rakić vs Marcin Tybura",
      "Ludovit Klein vs Tofiq Musayev",
    ],
  },
  {
    id: "bkfc-newcastle",
    sport: "Bare Knuckle",
    promotion: "BKFC",
    eventName: "BKFC Fight Night Newcastle",
    fighters: ["Lewis Garside", "Bradley Taylor"],
    stakes: "Bare-knuckle main event",
    startsAt: "2026-08-01T18:00:00.000Z",
    venue: "Walker Activity Dome",
    location: "Newcastle, United Kingdom",
    watch: {
      provider: "BKFC+ / Fubo Sports",
      access: "Subscription",
      href: "https://watch.bkfc.com/",
      note: "Official BKFC stream; regional options may vary",
    },
    detailsUrl: "https://www.bkfc.com/events",
    bouts: ["Lewis Garside vs Bradley Taylor"],
  },
  {
    id: "pfl-charlotte",
    sport: "MMA",
    promotion: "PFL",
    eventName: "PFL Charlotte",
    fighters: ["Bryan Battle", "Dalton Rosta"],
    stakes: "Middleweight main event",
    startsAt: "2026-08-07T23:00:00.000Z",
    mainCardAt: "2026-08-08T02:00:00.000Z",
    venue: "Bojangles Coliseum",
    location: "Charlotte, North Carolina",
    watch: {
      provider: "ESPN App / ESPN",
      access: "Subscription",
      href: "https://www.espn.com/watch/",
      note: "Main card on ESPN in the U.S.",
    },
    detailsUrl:
      "https://pflmma.com/index.php/news/middleweight-matchups-headline-pfls-return-to-charlotte-on-august-7",
    bouts: [
      "Josh Silveira vs Aaron Jeffery",
      "More bouts on the official PFL card",
    ],
  },
  {
    id: "ufc-gamrot-salkilld",
    sport: "MMA",
    promotion: "UFC",
    eventName: "UFC Fight Night",
    fighters: ["Mateusz Gamrot", "Quillan Salkilld"],
    stakes: "Lightweight main event",
    startsAt: "2026-08-08T18:00:00.000Z",
    mainCardAt: "2026-08-08T21:00:00.000Z",
    venue: "Meta APEX",
    location: "Las Vegas, Nevada",
    watch: {
      provider: "Paramount+",
      access: "Subscription",
      href: "https://www.ufc.com/watch/schedule",
      note: "U.S. listing; availability varies by country",
    },
    detailsUrl: "https://www.ufc.com/events",
    bouts: ["Full card and bout order on UFC.com"],
  },
  {
    id: "bkfc-sturgis",
    sport: "Bare Knuckle",
    promotion: "BKFC",
    eventName: "BKFC Fight Night Sturgis",
    fighters: ["Bryant Acheson", "Mike Jones"],
    stakes: "Bare-knuckle main event",
    startsAt: "2026-08-09T01:00:00.000Z",
    venue: "The Buffalo Chip",
    location: "Sturgis, South Dakota",
    watch: {
      provider: "BKFC+ / Fubo Sports",
      access: "Subscription",
      href: "https://watch.bkfc.com/",
      note: "Official BKFC stream; regional options may vary",
    },
    detailsUrl: "https://www.bkfc.com/events",
    bouts: ["Bryant Acheson vs Mike Jones"],
  },
  {
    id: "one-fight-night-46",
    sport: "Muay Thai",
    promotion: "ONE",
    eventName: "ONE Fight Night 46",
    fighters: ["Stella Hemetsberger", "Natalia Diachkova"],
    stakes: "ONE strawweight Muay Thai world title",
    startsAt: "2026-08-15T01:00:00.000Z",
    venue: "Lumpinee Stadium",
    location: "Bangkok, Thailand",
    watch: {
      provider: "Prime Video",
      access: "Included",
      href: "https://www.primevideo.com/",
      note: "Included with Prime in the U.S. and Canada",
    },
    detailsUrl: "https://www.onefc.com/events/onefightnight46/",
    bouts: [
      "Stella Hemetsberger vs Natalia Diachkova",
      "Nico Carrillo makes his kickboxing debut",
    ],
  },
  {
    id: "ufc-330",
    sport: "MMA",
    promotion: "UFC",
    eventName: "UFC 330",
    fighters: ["Islam Makhachev", "Ian Machado Garry"],
    stakes: "UFC championship main event",
    startsAt: "2026-08-15T21:00:00.000Z",
    mainCardAt: "2026-08-16T01:00:00.000Z",
    venue: "Xfinity Mobile Arena",
    location: "Philadelphia, Pennsylvania",
    watch: {
      provider: "Paramount+",
      access: "Subscription",
      href: "https://www.ufc.com/watch/schedule",
      note: "Early prelims and prelims precede the main card",
    },
    detailsUrl: "https://www.ufc.com/events",
    bouts: ["Full card and bout order on UFC.com"],
  },
  {
    id: "bkfc-mohegan-sun",
    sport: "Bare Knuckle",
    promotion: "BKFC",
    eventName: "BKFC Fight Night Mohegan Sun",
    fighters: ["Bryce Henry", "Carlos Trinidad"],
    stakes: "Bare-knuckle main event",
    startsAt: "2026-08-21T22:00:00.000Z",
    venue: "Mohegan Sun",
    location: "Uncasville, Connecticut",
    watch: {
      provider: "BKFC+ / Fubo Sports",
      access: "Subscription",
      href: "https://watch.bkfc.com/",
      note: "Official BKFC stream; regional options may vary",
    },
    detailsUrl: "https://www.bkfc.com/events",
    bouts: ["Bryce Henry vs Carlos Trinidad"],
  },
  {
    id: "ufc-hernandez-rodrigues",
    sport: "MMA",
    promotion: "UFC",
    eventName: "UFC Fight Night Sacramento",
    fighters: ["Anthony Hernandez", "Gregory Rodrigues"],
    stakes: "Middleweight main event",
    startsAt: "2026-08-22T21:00:00.000Z",
    mainCardAt: "2026-08-23T00:00:00.000Z",
    venue: "Golden 1 Center",
    location: "Sacramento, California",
    watch: {
      provider: "Paramount+",
      access: "Subscription",
      href: "https://www.ufc.com/watch/schedule",
      note: "U.S. listing; availability varies by country",
    },
    detailsUrl: "https://www.ufc.com/events",
    bouts: ["Full card and bout order on UFC.com"],
  },
];
