// SP-ARCHIVES — catalogue data
// Placeholder imagery served from picsum.photos with stable seeds.

export function img(seed: string, w = 1200, h = 1500) {
  return `https://picsum.photos/seed/sp-${seed}/${w}/${h}`;
}

export type Collection = {
  no: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  location: string;
  blurb: string;
  count: number;
};

export const collections: Collection[] = [
  {
    no: "001",
    slug: "northern-light",
    title: "Northern Light",
    category: "Place",
    year: "2026",
    location: "Lofoten, NO",
    blurb:
      "A study of latitude and luminance — long blue hours catalogued across the Arctic shelf.",
    count: 18,
  },
  {
    no: "002",
    slug: "paper-faces",
    title: "Paper Faces",
    category: "Portrait",
    year: "2025",
    location: "Portland, US",
    blurb:
      "Studio portraiture rendered as archival plates. Skin, grain, and the weight of looking.",
    count: 24,
  },
  {
    no: "003",
    slug: "after-hours",
    title: "After Hours",
    category: "Editorial",
    year: "2025",
    location: "New York, US",
    blurb:
      "An editorial sequence shot between midnight and the first delivery trucks.",
    count: 16,
  },
  {
    no: "004",
    slug: "field-notes",
    title: "Field Notes",
    category: "Place",
    year: "2024",
    location: "Atacama, CL",
    blurb: "Desert geometry and the index of erosion. A logbook in silver and dust.",
    count: 21,
  },
  {
    no: "005",
    slug: "the-gathering",
    title: "The Gathering",
    category: "Events",
    year: "2024",
    location: "Lisbon, PT",
    blurb: "Documentary coverage of a three-day festival, catalogued by hour.",
    count: 30,
  },
  {
    no: "006",
    slug: "still-objects",
    title: "Still Objects",
    category: "Commercial",
    year: "2023",
    location: "Studio, US",
    blurb: "Product and still life as museum specimen — lit, labelled, archived.",
    count: 14,
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export type JournalEntry = {
  no: string;
  slug: string;
  title: string;
  date: string;
  kicker: string;
  excerpt: string;
};

export const journal: JournalEntry[] = [
  {
    no: "J-012",
    slug: "on-cataloguing-light",
    title: "On Cataloguing Light",
    date: "2026-06-10",
    kicker: "Process",
    excerpt:
      "Why I number every series, and what an archive teaches you about looking twice.",
  },
  {
    no: "J-011",
    slug: "lofoten-blue-hour",
    title: "Three Weeks of Blue Hour",
    date: "2026-04-22",
    kicker: "Location",
    excerpt:
      "Notes from the field on shooting Northern Light — gear, latitude, and patience.",
  },
  {
    no: "J-010",
    slug: "the-archival-print",
    title: "What Makes a Print Archival",
    date: "2026-02-03",
    kicker: "Craft",
    excerpt:
      "Cotton rag, pigment inks, and why a numbered edition outlives the screen.",
  },
  {
    no: "J-009",
    slug: "portrait-as-document",
    title: "The Portrait as Document",
    date: "2025-11-18",
    kicker: "Essay",
    excerpt: "On treating a face as a record rather than a performance.",
  },
];

export function getEntry(slug: string) {
  return journal.find((e) => e.slug === slug);
}

export const services = [
  {
    no: "S-01",
    title: "Portrait Sessions",
    from: "$650",
    body: "Studio or location portraiture, catalogued and delivered as a numbered series. Includes editing and a private archive gallery.",
  },
  {
    no: "S-02",
    title: "Editorial & Commercial",
    from: "$1,800 / day",
    body: "Concept-led editorial and brand work for publications and studios. Art direction, crew coordination, and licensing available.",
  },
  {
    no: "S-03",
    title: "Events & Documentary",
    from: "$2,400",
    body: "Full-day documentary coverage, sequenced and archived by the hour. Same-week selects, full gallery within two weeks.",
  },
  {
    no: "S-04",
    title: "Archival Prints",
    from: "$120",
    body: "Limited, numbered, and signed editions on cotton rag with pigment inks. Lab-fulfilled and shipped worldwide.",
  },
];
