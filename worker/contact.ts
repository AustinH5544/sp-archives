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

export type Inquiry = {
  name: string;
  email: string;
  date: string;
  location: string;
  type: string;
  message: string;
};

export type Validation =
  | { ok: true; inquiry: Inquiry }
  | { ok: false; error: string };

const LIMITS = {
  name: 100,
  email: 200,
  date: 100,
  location: 100,
  message: 5000,
} as const;

/** Anything that is not a string becomes "", so a hostile payload cannot throw. */
function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * A field named "company" sits off-screen in the form. People never see it;
 * form-filling bots populate every input they find.
 */
export function honeypotFilled(data: Record<string, unknown>): boolean {
  return str(data.company).length > 0;
}

export function validateInquiry(data: Record<string, unknown>): Validation {
  const name = str(data.name);
  const email = str(data.email);
  const message = str(data.message);
  const date = str(data.date);
  const location = str(data.location);
  const type = str(data.type);

  if (!name) return { ok: false, error: "Please include your name." };
  if (name.length > LIMITS.name) return { ok: false, error: "That name is too long." };

  if (!email) return { ok: false, error: "Please include an email address." };
  if (email.length > LIMITS.email) return { ok: false, error: "That email is too long." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That email address does not look right." };
  }

  if (!message) return { ok: false, error: "Please tell me a little about the shoot." };
  if (message.length > LIMITS.message) return { ok: false, error: "That message is too long." };

  if (date.length > LIMITS.date) return { ok: false, error: "That date is too long." };
  if (location.length > LIMITS.location) return { ok: false, error: "That location is too long." };

  if (type && !(PROJECT_TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: "Please choose a project type from the list." };
  }

  return { ok: true, inquiry: { name, email, date, location, type, message } };
}
