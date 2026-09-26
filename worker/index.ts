import { buildEmail, honeypotFilled, validateInquiry } from "./contact";

export interface Env {
  /**
   * The static export. Requests routed here get html_handling and
   * not_found_handling applied, which is what preserves out/404.html.
   */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Set with `npx wrangler secret put RESEND_API_KEY`. Never in the repo. */
  RESEND_API_KEY?: string;
}

const ENDPOINT = "/api/contact";
const RESEND_URL = "https://api.resend.com/emails";
const FROM = "SP-ARCHIVES <inquiries@sp-archives.com>";
const TO = "studio@sp-archives.com";
const MAX_BODY = 64 * 1024;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Anything that is not the form post belongs to the static site. Note
    // that a browser *navigating* to /api/contact never reaches this code at
    // all: with a compatibility date past 2025-04-01 Cloudflare serves
    // assets for navigation requests, so the address bar shows the 404 page.
    if (url.pathname !== ENDPOINT || request.method !== "POST") {
      return env.ASSETS.fetch(request);
    }

    // Refuse on the declared size before reading anything: this is the only
    // billable path on the Worker, and a large body would otherwise be pulled
    // into memory just to be thrown away. Chunked requests declare nothing,
    // so the check after reading stays as the real cap.
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY) {
      return json(400, { ok: false, error: "That submission is too large." });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY) {
      return json(400, { ok: false, error: "That submission is too large." });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "That submission was malformed." });
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return json(400, { ok: false, error: "That submission was malformed." });
    }
    const data = parsed as Record<string, unknown>;

    // A bot that is told it failed simply tries again. Let it think it won.
    if (honeypotFilled(data)) return json(200, { ok: true });

    const checked = validateInquiry(data);
    if (!checked.ok) return json(400, { ok: false, error: checked.error });

    if (!env.RESEND_API_KEY) {
      console.error("contact: the sending key is not configured on this Worker");
      return json(502, { ok: false });
    }

    const mail = buildEmail(checked.inquiry, new Date());

    try {
      const sent = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: TO,
          reply_to: checked.inquiry.email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
      });

      if (!sent.ok) {
        // Logged to Workers observability, never returned: the upstream body
        // can quote the key back at us.
        console.error(`contact: resend ${sent.status} ${await sent.text()}`);
        return json(502, { ok: false });
      }
    } catch (err) {
      console.error("contact: resend request failed", err);
      return json(502, { ok: false });
    }

    return json(200, { ok: true });
  },
};

export default handler;
