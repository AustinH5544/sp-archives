/**
 * Pure helpers for the contact endpoint: no network, no bindings, no
 * Cloudflare globals, so every branch is reachable from a plain unit test.
 */

/** The options rendered by the select in ContactForm. Anything else is a forgery. */
export const PROJECT_TYPES = [
  "Family",
  "Maternity",
  "Graduation / Senior",
  "Automotive",
  "Engagement",
  "Other",
] as const;
