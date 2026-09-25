# Contact Form → Resend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/contact` form deliver a real email to Skyelar's inbox, with a visible failure path when it cannot.

**Architecture:** The existing static-asset Worker gains a script that handles exactly one route, `POST /api/contact`, and hands every other request back to the asset server. The handler validates the submission, drops honeypot hits, and calls Resend's REST API with a key stored as a Worker secret. All parsing and formatting lives in a pure module so it can be tested without a network or a Cloudflare runtime.

**Tech Stack:** Cloudflare Workers (static assets + script), Resend REST API, Next.js 16 static export, React 19 client component, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-24-contact-form-resend-design.md`

## Global Constraints

- `next.config.ts` keeps `output: "export"`. Next route handlers are impossible; the endpoint exists only in the Worker.
- `run_worker_first` stays unset. Setting it makes every static asset request billable.
- Unmatched requests return through `env.ASSETS.fetch(request)`, never a hand-written 404, so `not_found_handling: "404-page"` keeps working.
- The Resend API key is set only via `npx wrangler secret put RESEND_API_KEY`. It must never appear in a file, a commit, a command argument, or a chat transcript.
- No client names, personal email addresses, or phone numbers enter the repo. The only addresses committed are `inquiries@sp-archives.com` and `studio@sp-archives.com`.
- `from` is `SP-ARCHIVES <inquiries@sp-archives.com>`; `to` is `studio@sp-archives.com`; `reply_to` is the submitter's address.
- Field caps, exactly: name 100, email 200, date 100, location 100, message 5000, whole body 64 KB.
- Project type, when present, must be one of: `Family`, `Maternity`, `Graduation / Senior`, `Automotive`, `Engagement`, `Other`.
- Every commit message ends with:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`
- Do not deploy, touch DNS, or run `wrangler secret put` on the user's behalf. Those are Task 6, which the user performs.

## Review Focus

- **A body that is not JSON** (a bare string, `null`, or truncated text) must answer 400, not crash into a 500. Covered in Task 4.
- **Carriage returns or newlines inside `name` or `type`** must not reach the subject line, or a sender can inject their own mail headers. Covered in Task 3.
- **HTML or `<script>` inside `message`** must arrive escaped in the HTML part, so his mail client renders text rather than a forged link. Covered in Task 3.
- **A missing or rejected `RESEND_API_KEY`** must answer 502 with no detail, and the key must never appear in a response body. Covered in Task 4.
- **`GET /api/contact`, or any other path**, must fall through to the asset server so the custom 404 page still renders. Covered in Task 4.

---

### Task 1: Vitest harness

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts, devDependencies)
- Test: `worker/contact.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest once over `worker/**/*.test.ts` in the Node environment.

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest@^3
```

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

// The Worker code under test uses only web-standard globals (Request,
// Response, fetch, URL), all of which Node 18+ provides. A workerd-backed
// pool would be heavier and buys nothing here: no bindings are exercised
// except a hand-written ASSETS stub.
export default defineConfig({
  test: {
    environment: "node",
    include: ["worker/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add the test script**

In `package.json`, add to `"scripts"`:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Write a failing placeholder test**

Create `worker/contact.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PROJECT_TYPES } from "./contact";

describe("contact module", () => {
  it("exposes the six project types offered by the form", () => {
    expect(PROJECT_TYPES).toEqual([
      "Family",
      "Maternity",
      "Graduation / Senior",
      "Automotive",
      "Engagement",
      "Other",
    ]);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./contact`.

- [ ] **Step 6: Create the module with just the constant**

Create `worker/contact.ts`:

```ts
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
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts worker/contact.ts worker/contact.test.ts
git commit -m "test: add vitest for the worker module

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Submission validation

**Files:**
- Modify: `worker/contact.ts`
- Test: `worker/contact.test.ts`

**Interfaces:**
- Consumes: `PROJECT_TYPES` from Task 1.
- Produces:
  - `type Inquiry = { name: string; email: string; date: string; location: string; type: string; message: string }`
  - `function honeypotFilled(data: Record<string, unknown>): boolean`
  - `function validateInquiry(data: Record<string, unknown>): { ok: true; inquiry: Inquiry } | { ok: false; error: string }`

- [ ] **Step 1: Write the failing tests**

Widen the existing import at the top of `worker/contact.test.ts` to
`import { PROJECT_TYPES, honeypotFilled, validateInquiry } from "./contact";`
— keep one import statement, since a second one mid-file trips lint rules.
Then append:

```ts
const good = {
  name: "  Jordan Reyes ",
  email: "jordan@example.com",
  date: "Autumn 2026",
  location: "Spokane",
  type: "Maternity",
  message: "We are expecting in October.",
};

describe("validateInquiry", () => {
  it("trims and returns a complete submission", () => {
    const result = validateInquiry(good);
    expect(result).toEqual({
      ok: true,
      inquiry: { ...good, name: "Jordan Reyes" },
    });
  });

  it("treats date, location and type as optional", () => {
    const result = validateInquiry({
      name: "Jordan",
      email: "jordan@example.com",
      message: "Hello",
    });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["name", { ...good, name: "   " }],
    ["email", { ...good, email: "" }],
    ["message", { ...good, message: "" }],
  ])("rejects a missing %s", (_field, payload) => {
    expect(validateInquiry(payload).ok).toBe(false);
  });

  it("rejects an address with no @", () => {
    expect(validateInquiry({ ...good, email: "jordan.example.com" }).ok).toBe(false);
  });

  it("rejects an over-long message", () => {
    const result = validateInquiry({ ...good, message: "x".repeat(5001) });
    expect(result).toEqual({ ok: false, error: "That message is too long." });
  });

  it("rejects an over-long name", () => {
    expect(validateInquiry({ ...good, name: "x".repeat(101) }).ok).toBe(false);
  });

  it("rejects a project type that is not on the menu", () => {
    expect(validateInquiry({ ...good, type: "Boudoir" }).ok).toBe(false);
  });

  it("ignores non-string fields rather than throwing", () => {
    expect(validateInquiry({ name: 42, email: null, message: [] }).ok).toBe(false);
  });
});

describe("honeypotFilled", () => {
  it("is false when the hidden field is absent or blank", () => {
    expect(honeypotFilled({})).toBe(false);
    expect(honeypotFilled({ company: "   " })).toBe(false);
  });

  it("is true when something filled the hidden field", () => {
    expect(honeypotFilled({ company: "Acme SEO" })).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `validateInquiry` and `honeypotFilled` are not exported.

- [ ] **Step 3: Implement validation**

Append to `worker/contact.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all validation tests green.

- [ ] **Step 5: Commit**

```bash
git add worker/contact.ts worker/contact.test.ts
git commit -m "feat: validate contact submissions

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Email formatting

**Files:**
- Modify: `worker/contact.ts`
- Test: `worker/contact.test.ts`

**Interfaces:**
- Consumes: `Inquiry` from Task 2.
- Produces: `function buildEmail(inquiry: Inquiry, now: Date): { subject: string; text: string; html: string }`

- [ ] **Step 1: Write the failing tests**

Add `buildEmail` to the existing `./contact` import at the top of
`worker/contact.test.ts`, then append:

```ts
const when = new Date("2026-09-25T17:04:00.000Z");

const inquiry = {
  name: "Jordan Reyes",
  email: "jordan@example.com",
  date: "Autumn 2026",
  location: "Spokane",
  type: "Maternity",
  message: "We are expecting in October.",
};

describe("buildEmail", () => {
  it("puts the type and the sender in the subject", () => {
    expect(buildEmail(inquiry, when).subject).toBe("Inquiry — Maternity — Jordan Reyes");
  });

  it("says General when no type was chosen", () => {
    expect(buildEmail({ ...inquiry, type: "" }, when).subject).toBe(
      "Inquiry — General — Jordan Reyes",
    );
  });

  it("keeps the subject on one line even if the name carries newlines", () => {
    const forged = { ...inquiry, name: "Jordan\r\nBcc: victim@example.com" };
    const { subject } = buildEmail(forged, when);
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toBe("Inquiry — Maternity — Jordan Bcc: victim@example.com");
  });

  it("includes every field and the message in the text part", () => {
    const { text } = buildEmail(inquiry, when);
    expect(text).toContain("Email: jordan@example.com");
    expect(text).toContain("Date / Season: Autumn 2026");
    expect(text).toContain("Location: Spokane");
    expect(text).toContain("2026-09-25T17:04:00.000Z");
    expect(text).toContain("We are expecting in October.");
  });

  it("shows a dash for fields left blank", () => {
    const { text } = buildEmail({ ...inquiry, location: "" }, when);
    expect(text).toContain("Location: —");
  });

  it("escapes markup in the html part", () => {
    const hostile = { ...inquiry, message: '<script>alert("x")</script> & more' };
    const { html } = buildEmail(hostile, when);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp; more");
  });

  it("leaves the message untouched in the text part", () => {
    const hostile = { ...inquiry, message: "<b>hi</b>" };
    expect(buildEmail(hostile, when).text).toContain("<b>hi</b>");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `buildEmail` is not exported.

- [ ] **Step 3: Implement the formatter**

Append to `worker/contact.ts`:

```ts
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
    "<table cellpadding=\"4\" style=\"border-collapse:collapse\">",
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/contact.ts worker/contact.test.ts
git commit -m "feat: format inquiry emails

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: The Worker endpoint

**Files:**
- Create: `worker/index.ts`
- Create: `worker/index.test.ts`
- Modify: `wrangler.jsonc`
- Modify: `docs/architecture-decisions.md`

**Interfaces:**
- Consumes: `buildEmail`, `honeypotFilled`, `validateInquiry` from Tasks 2 and 3.
- Produces: a default export with `fetch(request: Request, env: Env): Promise<Response>`, and `interface Env { ASSETS: { fetch(request: Request): Promise<Response> }; RESEND_API_KEY?: string }`.

- [ ] **Step 1: Write the failing tests**

Create `worker/index.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "./index";

const valid = {
  name: "Jordan Reyes",
  email: "jordan@example.com",
  date: "",
  location: "",
  type: "Maternity",
  message: "We are expecting in October.",
};

function post(body: unknown, raw?: string) {
  return new Request("https://sp-archives.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

let env: Env;
let assets: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assets = vi.fn(async () => new Response("the 404 page", { status: 404 }));
  env = { ASSETS: { fetch: assets }, RESEND_API_KEY: "re_test_key" } as Env;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ id: "abc" }), { status: 200 })),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("sends a valid inquiry through Resend and answers ok", async () => {
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.authorization).toBe("Bearer re_test_key");
    const sent = JSON.parse(init.body);
    expect(sent.from).toBe("SP-ARCHIVES <inquiries@sp-archives.com>");
    expect(sent.to).toBe("studio@sp-archives.com");
    expect(sent.reply_to).toBe("jordan@example.com");
    expect(sent.subject).toContain("Jordan Reyes");
  });

  it("never caches the response", async () => {
    const res = await worker.fetch(post(valid), env);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects an invalid submission with 400 and sends nothing", async () => {
    const res = await worker.fetch(post({ ...valid, email: "nope" }), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 400 rather than throwing when the body is not JSON", async () => {
    const res = await worker.fetch(post(null, "not json at all"), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 400 when the body is valid JSON but not an object", async () => {
    const res = await worker.fetch(post(null, '"a string"'), env);
    expect(res.status).toBe(400);
  });

  it("rejects a body over 64 KB", async () => {
    const huge = JSON.stringify({ ...valid, message: "x".repeat(70_000) });
    const res = await worker.fetch(post(null, huge), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("silently drops a honeypot hit but looks successful", async () => {
    const res = await worker.fetch(post({ ...valid, company: "Acme SEO" }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 502 when the key is missing, without naming it", async () => {
    const res = await worker.fetch(post(valid), { ...env, RESEND_API_KEY: undefined });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("RESEND");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 502 when Resend rejects the key, leaking nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("invalid api key re_test_key", { status: 401 })),
    );
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(502);
    const body = await res.text();
    expect(body).not.toContain("re_test_key");
    expect(body).not.toContain("invalid api key");
  });

  it("answers 502 when the request to Resend throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(502);
  });
});

describe("everything else", () => {
  it("hands GET /api/contact to the asset server", async () => {
    const req = new Request("https://sp-archives.com/api/contact");
    const res = await worker.fetch(req, env);
    expect(assets).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
  });

  it("hands an ordinary page request to the asset server", async () => {
    const req = new Request("https://sp-archives.com/work/red-thread");
    await worker.fetch(req, env);
    expect(assets).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Implement the handler**

Create `worker/index.ts`:

```ts
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Anything that is not the form post belongs to the static site. Note
    // that a browser *navigating* to /api/contact never reaches this code at
    // all: with a compatibility date past 2025-04-01 Cloudflare serves
    // assets for navigation requests, so the address bar shows the 404 page.
    if (url.pathname !== ENDPOINT || request.method !== "POST") {
      return env.ASSETS.fetch(request);
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all endpoint tests green.

- [ ] **Step 5: Point the Worker config at the script**

In `wrangler.jsonc`, replace the comment block at the top that begins "There is deliberately no \"main\" key" with:

```jsonc
  // This Worker serves the Next.js static export from out/ AND runs one
  // endpoint, POST /api/contact, which emails an inquiry through Resend.
  //
  // Adding "main" does not make asset serving billable: Cloudflare serves a
  // matching static asset before invoking the script, and requests to static
  // assets are free and unlimited. Only the form post invokes this Worker.
  //
  // Do NOT set assets.run_worker_first — that would route every request
  // through the script and make all of them billable. See
  // docs/superpowers/specs/2026-09-24-contact-form-resend-design.md
  "main": "worker/index.ts",
```

And inside `"assets"`, add the binding, which the script needs in order to
hand unmatched requests back to the asset server:

```jsonc
    "binding": "ASSETS",
```

- [ ] **Step 6: Verify the build and the endpoint locally**

Stop any running `wrangler dev` first — it holds a lock on `out/` and the
Next build will fail with EBUSY. On Windows:

```bash
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'wrangler' -or $_.Name -eq 'workerd.exe' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
```

Then:

```bash
npm run build
npx wrangler dev --port 8810
```

In another shell, confirm the three behaviors:

```bash
curl -s -X POST http://localhost:8810/api/contact -H "content-type: application/json" -d "{\"name\":\"Test\",\"email\":\"t@example.com\",\"message\":\"hello\"}"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8810/nope
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8810/work/red-thread
```

Expected: the first returns `{"ok":false}` with status 502 (no key is set
locally — this proves routing and validation work), the second `404` from the
custom page, the third `200`. Stop `wrangler dev` when done.

- [ ] **Step 7: Record the reversal in the architecture doc**

In `docs/architecture-decisions.md`, under "## Hosting", replace the
paragraph beginning "`wrangler.jsonc` deliberately has **no `main` key**"
with:

```markdown
`wrangler.jsonc` now sets `main` and runs one endpoint, `POST /api/contact`,
for the contact form. This reverses the original no-script rule but not its
reasoning: Cloudflare serves a matching static asset **before** invoking a
Worker script, and requests to static assets are free and unlimited. Only
the form post is a billable invocation, against 100,000/day on the free
plan. `run_worker_first` stays unset — setting it would route every request
through the script and make all of them billable.

Mail: Resend sends from `inquiries@sp-archives.com` (DNS records on the
`send.` subdomain); Cloudflare Email Routing delivers `studio@sp-archives.com`
to Skyelar's inbox (records on the root). Two SPF records on two different
hostnames — do not merge them. Design:
`docs/superpowers/specs/2026-09-24-contact-form-resend-design.md`
```

Also update the last line of "## Open items" from
`- [ ] Contact form is UI-only; needs a backend (would require adding main)`
to:

```markdown
- [ ] Contact form: DNS, Email Routing and the RESEND_API_KEY secret still need to be set up by hand
```

- [ ] **Step 8: Lint and type-check**

Run: `npx tsc --noEmit -p . && npm run lint`
Expected: both clean. Delete `tsconfig.tsbuildinfo` afterwards if it appears.

- [ ] **Step 9: Commit**

```bash
git add worker/index.ts worker/index.test.ts wrangler.jsonc docs/architecture-decisions.md
git commit -m "feat: add the contact endpoint to the worker

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Wire up the form

**Files:**
- Modify: `src/components/ContactForm.tsx`

**Interfaces:**
- Consumes: `POST /api/contact` from Task 4, which answers `{ ok: true }` or `{ ok: false, error?: string }`.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Replace the component**

Rewrite `src/components/ContactForm.tsx` as:

```tsx
"use client";

import { useState } from "react";

const field =
  "w-full border-b border-faint/60 bg-transparent py-3 text-fg placeholder:text-faint focus:border-accent focus:outline-none";

type Status = "idle" | "sending" | "error";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        // The form keeps everything typed, so nothing is lost on failure.
        setError(body.error || "");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("idle");
      setSent(true);
    } catch {
      setError("");
      setStatus("error");
    }
  }

  if (sent) {
    return (
      <div className="border-t border-faint/60 pt-8">
        <p className="label text-accent">Inquiry Received</p>
        <p className="mt-4 font-serif text-3xl font-light leading-tight">
          Thank you. Your inquiry has been logged to the archive and I&rsquo;ll
          be in touch within 24 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="label mt-8 border border-faint/80 px-4 py-2.5 hover:border-accent hover:text-fg"
        >
          ← Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className="label">01 — Name</span>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Your name"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">02 — Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="you@email.com"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">03 — Date / Season</span>
          <input
            name="date"
            maxLength={100}
            placeholder="e.g. Autumn 2026"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">04 — Location / City</span>
          <input
            name="location"
            maxLength={100}
            placeholder="City or venue"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="label">05 — Project Type</span>
        <select name="type" className={`${field} appearance-none`} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          <option className="bg-bg">Family</option>
          <option className="bg-bg">Maternity</option>
          <option className="bg-bg">Graduation / Senior</option>
          <option className="bg-bg">Automotive</option>
          <option className="bg-bg">Engagement</option>
          <option className="bg-bg">Other</option>
        </select>
      </label>

      <label className="block">
        <span className="label">06 — Notes</span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={5000}
          placeholder="Tell me about the series you have in mind…"
          className={`${field} resize-none`}
        />
      </label>

      {/* Honeypot: off-screen, unfocusable, hidden from screen readers.
          People never fill this; form-filling bots fill every input. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="border-l-2 border-accent pl-4 text-paper">
          {error ||
            "Something went wrong sending that. Nothing was lost — your words are still here."}{" "}
          You can also email{" "}
          <a href="mailto:studio@sp-archives.com" className="underline hover:text-accent">
            studio@sp-archives.com
          </a>{" "}
          directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="label inline-flex items-center gap-2 border border-faint/80 px-6 py-3.5 transition-colors hover:border-accent hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit Inquiry →"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Build and type-check**

Run: `npx tsc --noEmit -p . && npm run lint && npm run build`
Expected: all clean, 19 routes exported.

- [ ] **Step 3: Verify the failure path in a browser**

With no `RESEND_API_KEY` set locally, every submission should fail — which is
exactly the path that has never been testable before.

```bash
npx wrangler dev --port 8810
```

Open `http://localhost:8810/contact`, fill the form, submit. Confirm: the
button reads "Sending…" and is disabled while in flight; the red-bordered
error appears with a working mailto link; every field still holds what was
typed. Then confirm the browser console shows a 502, not a crash. Stop
`wrangler dev`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactForm.tsx
git commit -m "feat: submit the contact form to the api

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Accounts, DNS and the live test

**Files:** none. This task is performed by the user in dashboards and a
terminal; the agent's job is to hand over the steps and verify the result.

**Interfaces:**
- Consumes: the deployed Worker from Tasks 4 and 5.
- Produces: a working inquiry path.

- [ ] **Step 1: Verify the sending domain in Resend**

In Skyelar's Resend account: **Domains → Add Domain → `sp-archives.com`**,
region US East. Resend then shows three records. In Cloudflare DNS for
`sp-archives.com`, add all three with the proxy **off (grey cloud)**:

| Type | Name | Value |
|---|---|---|
| MX | `send` | the `feedback-smtp.*.amazonses.com` host Resend shows, priority 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey` | the long `p=…` key Resend shows |

Paste only the short name (`send`), not `send.sp-archives.com` — Cloudflare
appends the domain itself. Then click **Verify** in Resend.

- [ ] **Step 2: Turn on Email Routing**

Cloudflare dashboard → `sp-archives.com` → **Email → Email Routing → Enable**.
Create a custom address: `studio@sp-archives.com` → forward to Skyelar's
personal inbox. **He must click the confirmation link** Cloudflare sends to
that inbox; nothing is delivered until he does.

This adds MX and SPF records on the root domain. They do not conflict with
the `send.` records from Step 1.

- [ ] **Step 3: Create the API key and store it as a secret**

Resend → **API Keys → Create**, permission **Sending access**, restricted to
`sp-archives.com` if the option is offered. Copy it, then:

```bash
npx wrangler secret put RESEND_API_KEY
```

Paste the key at the prompt. It goes straight to Cloudflare — never into a
file, a command argument, or a chat window. Confirm with:

```bash
npx wrangler secret list
```

Expected: `RESEND_API_KEY` listed. The value is never shown again.

- [ ] **Step 4: Deploy**

```bash
git push origin master
```

Workers Builds deploys `master` automatically. Watch it finish in the
dashboard, or run `npm run deploy` directly.

- [ ] **Step 5: Verify live**

Submit a real inquiry at `https://sp-archives.com/contact` using an address
you control. Confirm all four:

1. The thank-you message appears.
2. The email reaches Skyelar's inbox within a minute (check spam the first time).
3. Hitting Reply addresses the client, not `studio@`.
4. The subject reads `Inquiry — <type> — <name>`.

If the email does not arrive, check in this order: Resend's **Logs** tab
(shows whether the send was accepted and what bounced), then Email Routing's
own activity log (shows whether forwarding fired), then the Worker's logs in
the Cloudflare dashboard (shows a 502 and its cause). Each rules out one hop.

- [ ] **Step 6: Tick the open item**

In `docs/architecture-decisions.md`, remove the contact-form line from
"## Open items" and commit:

```bash
git add docs/architecture-decisions.md
git commit -m "docs: contact form is live

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push origin master
```
