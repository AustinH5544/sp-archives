// SP-ARCHIVES — feature switches
//
// Flip a value here and rebuild. Nothing else needs touching.

/**
 * The Journal.
 *
 * `false` (current): no nav link, no footer link, and no /journal routes in
 * the static export at all. Nothing is reachable or indexable.
 * `true`: restores /journal and /journal/[slug] and both links.
 *
 * Entries live in `journal` in src/lib/data.ts. They are still the original
 * placeholder fiction (Lofoten, archival print-making) and must be replaced
 * with real writing before this is switched on.
 */
export const JOURNAL_ENABLED = false;
