// SP-ARCHIVES — catalogue data
// Placeholder imagery served from picsum.photos with stable seeds.
//
// Copy drafted 2026-08-26 from the client interview in
// docs/copy-interview-skyelar.md. Everything here is real information in
// Skyelar's own framing, but the titles, blurbs and counts are DRAFTS and
// need his sign-off before launch.
//
// STILL NEEDED FROM HIM:
//   - real locations and years per series (placeholders below)
//   - real photo counts per series
//   - starting prices (he wants "starting at" + industry standard figures)

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
  /** Real cover image. Falls back to a picsum seed when absent. */
  cover?: string;
  /** Real plate images in display order. Falls back to picsum seeds when absent. */
  plates?: string[];
};

/** 01.jpg … NN.jpg under public/work/<slug>/ */
function localPlates(slug: string, n: number) {
  return Array.from(
    { length: n },
    (_, i) => `/work/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
  );
}

export function coverSrc(c: Collection) {
  return c.cover ?? img(`${c.slug}-cover`, 2000, 2400);
}

export function cardSrc(c: Collection) {
  return c.cover ?? img(c.slug, 1000, 1250);
}

export function plateCount(c: Collection) {
  return c.plates?.length ?? c.count;
}

export function plateSrc(c: Collection, i: number) {
  return c.plates?.[i] ?? img(`${c.slug}-${i + 1}`, 1100, 1375);
}

export const collections: Collection[] = [
  {
    // REAL PHOTOS — 36 frames from the WRX STI shoot, resized to 1800px.
    // Title still needs Skyelar's sign-off: "Liquid Silver" came from his
    // Mazdaspeed origin story, but this set is a white STI on North Idaho plates.
    no: "001",
    slug: "liquid-silver",
    title: "Liquid Silver",
    category: "Automotive",
    year: "2026",
    location: "North Idaho",
    blurb:
      "Where all of this started. One car, one afternoon, working from the brick loading docks out to a tree-lined street until the light gave out.",
    count: 36,
    cover: "/work/liquid-silver/cover.jpg",
    plates: localPlates("liquid-silver", 36),
  },
  {
    no: "002",
    slug: "expecting",
    title: "Expecting",
    category: "Maternity",
    year: "2026",
    location: "Pacific Northwest",
    blurb:
      "Sessions in the last few weeks, when nobody feels quite like themselves yet. Prompts instead of poses, and enough distance that people forget I am there.",
    count: 22,
  },
  {
    no: "003",
    slug: "hold-still",
    title: "Hold Still",
    category: "Family",
    year: "2025",
    location: "Pacific Northwest",
    blurb:
      "Families outdoors, rarely standing still. I shoot through the parts most people would call the outtakes.",
    count: 28,
  },
  {
    no: "004",
    slug: "the-long-day",
    title: "The Long Day",
    category: "Wedding",
    year: "2025",
    location: "Pacific Northwest",
    blurb:
      "Documentary coverage of the whole day, first light through the last dance. It is the hardest thing I shoot and the one I keep the most from.",
    count: 30,
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

// TODO — DECISION NEEDED. These four entries are still the original fiction
// (they reference Lofoten and archival print-making, none of which is real).
// Skyelar was never asked whether he wants to write a journal. Either he
// commits to writing, or /journal and /journal/[slug] should be removed from
// the build and the nav. Do not launch with these.
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

// Prices read "Inquire" deliberately — it is the one value that is safe if this
// ships before he supplies numbers. He wants "starting at" with industry-
// standard figures, so replace each `from` with a real dollar amount.
export const services = [
  {
    no: "S-01",
    title: "Family & Maternity",
    from: "Inquire",
    body: "One to three hours, usually under two. Prompts rather than poses: I start further back than you would expect and work my way in once everyone has forgotten about me. At least 30 edited images, delivered to a private gallery.",
  },
  {
    no: "S-02",
    title: "Graduations & Seniors",
    from: "Inquire",
    body: "One to three hours, wherever you want it across the Pacific Northwest. Same approach as any other portrait session. At least 30 edited images, delivered to a private gallery.",
  },
  {
    no: "S-03",
    title: "Automotive",
    from: "Inquire",
    body: "Owners' cars, builds, and meets, parked or rolling. This is where I started and it is still my favorite thing to point a camera at. Open to commercial and brand work.",
  },
  {
    no: "S-04",
    title: "Engagements",
    from: "Inquire",
    body: "Shot the same way as everything else, with as little direction as I can get away with. Travel available, billed at cost.",
  },
];
