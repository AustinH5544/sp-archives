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

/** CR and LF inside a header value would let a sender append their own headers. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

export function buildEmail(inquiry: Inquiry, now: Date) {
  const type = inquiry.type || "General";
  const subject = oneLine(`Inquiry — ${type} — ${inquiry.name}`);

  const rows: [string, string][] = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Date / Season", inquiry.date || "—"],
    ["Location", inquiry.location || "—"],
    ["Project type", type],
    ["Submitted", now.toISOString()],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    inquiry.message,
  ].join("\n");

  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">',
    '<table cellpadding="4" style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#666">${esc(label)}</td><td>${esc(value)}</td></tr>`,
    ),
    "</table>",
    `<p style="white-space:pre-wrap;margin-top:16px">${esc(inquiry.message)}</p>`,
    "</div>",
  ].join("");

  return { subject, text, html };
}
