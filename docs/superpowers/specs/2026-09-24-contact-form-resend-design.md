# Contact form → Resend — design

Written 2026-09-24. Status: approved design, not yet implemented.

## Problem

`/contact` renders a six-field form that goes nowhere. `ContactForm.tsx`
calls `preventDefault()` and flips to a thank-you message. Every inquiry a
visitor has ever typed has been discarded, and the page promises a reply
within 24 hours.

Worse, the aside on that page offers `studio@sp-archives.com` as the direct
route. `sp-archives.com` has no MX records, so mail to that address bounces.
Both halves of the contact page are currently fiction.

## Goals

- A submitted inquiry arrives in Skyelar's real inbox within seconds.
- He can hit Reply and reach the client.
- `studio@sp-archives.com` receives mail.
- A failure is visible to the sender, never silently swallowed.
- No new recurring cost.

## Non-goals

- Storing inquiries anywhere (no database, no KV). Email is the record.
- An autoresponder to the client. Can be added later; he replies by hand today.
- Replacing Pixieset or anything to do with client delivery.
- Moving the `www` to apex redirect into the Worker, though this change makes
  that possible. Still an open item, still out of scope here.

## Decisions

### The Worker gains a script, reversing a recorded decision

`wrangler.jsonc` has carried a comment since launch saying there is
deliberately no `main` key, because asset requests are then free and
unbilled. That reasoning is recorded in `docs/architecture-decisions.md`.

Adding `main` does **not** change asset billing. Cloudflare serves a matching
static asset *before* invoking a Worker script, and the Workers pricing page
states: "Requests to static assets are free and unlimited." Only requests
that match no asset, here `POST /api/contact`, invoke the script. The Workers
free plan allows 100,000 invocations a day.

So the original decision stands on its reasoning; only its conclusion
changes. Both the config comment and the architecture doc must be updated to
say so, or a later session will read the comment and undo this.

Rejected: a second Worker on `api.sp-archives.com` (a second deploy target,
CORS, another DNS record, no benefit at this scale) and a third-party form
service such as Formspree (another account, tighter limits, their branding,
client data in a third party).

### `run_worker_first` stays unset

The default routing, assets first and script only when nothing matches, is
precisely the desired behavior. Setting `run_worker_first` would route every
request through the script and make asset requests billable.

Consequence to remember: with a compatibility date at or after 2025-04-01,
*navigation* requests (`Sec-Fetch-Mode: navigate`) prefer asset serving. So
opening `/api/contact` in a browser address bar returns the 404 page, not the
endpoint. A `fetch()` from the form is not a navigation request and reaches
the Worker normally. This looks like a broken deploy and is not one.

### Unmatched requests go back through the assets binding

`env.ASSETS.fetch(request)` applies the configured `html_handling` and
`not_found_handling`, so the custom `out/404.html` keeps working. A Worker
that returned its own 404 would regress it.

### Mail flows through two independent features

- **Sending:** Resend, verified on `sp-archives.com`. Its MX and SPF records
  live on the `send.` subdomain; DKIM at `resend._domainkey`.
- **Receiving:** Cloudflare Email Routing, forwarding
  `studio@sp-archives.com` to Skyelar's personal inbox. Its MX and SPF
  records live on the root domain.

They do not collide. A hostname may carry only one SPF record, which is the
usual way this pairing breaks; here the two SPF records sit on different
hostnames. Do not "tidy" them onto one name.

### Addressing

- `from`: `SP-ARCHIVES <inquiries@sp-archives.com>`, a send-only address.
- `to`: `studio@sp-archives.com`, forwarded to his inbox.
- `reply_to`: the client's address, so Reply reaches the client.

Sending from the same address that receives would loop mail through Email
Routing for no reason.

## Architecture

```
browser  --POST /api/contact-->  Worker (worker/index.ts)
                                   |  validate + spam check (worker/contact.ts)
                                   |  POST https://api.resend.com/emails
                                   v
                                 Resend --> studio@sp-archives.com
                                              --> Email Routing --> his inbox

any other path  -->  static asset, served before the Worker runs (free)
```

### Files

| File | Change |
|---|---|
| `worker/index.ts` | New. Routes `POST /api/contact`; everything else to `env.ASSETS.fetch`. Holds the Resend call. |
| `worker/contact.ts` | New. Pure functions: parse and validate a submission, build subject and body. No I/O, so it is directly testable. |
| `wrangler.jsonc` | Add `main`; add `"binding": "ASSETS"`; rewrite the no-`main` comment. |
| `src/components/ContactForm.tsx` | Real submission: sending state, error state, honeypot field. |
| `docs/architecture-decisions.md` | Record the reversal and the mail setup. |
| `package.json` | `vitest` dev dependency and a `test` script. |

## Request contract

`POST /api/contact`, `Content-Type: application/json`.

```jsonc
{
  "name": "string, required, 1-100 chars",
  "email": "string, required, must contain @, 3-200 chars",
  "date": "string, optional, max 100",
  "location": "string, optional, max 100",
  "type": "string, optional, must match one of the six select options",
  "message": "string, required, 1-5000 chars",
  "company": "string, honeypot, must be empty"
}
```

Responses: `200 {"ok":true}` on success; `400 {"ok":false,"error":"..."}` for
a malformed submission; `502 {"ok":false}` when Resend fails. The body cap is
64 KB; anything larger is rejected before parsing.

`message` becomes required, which it is not today. An empty inquiry wastes
both people's time.

### Honeypot

A field named `company`, hidden from sight and from screen readers, never
focusable. If it arrives non-empty, the Worker returns `200 {"ok":true}` and
sends nothing. Telling a bot it failed teaches it to retry.

## Failure handling

Resend non-2xx or a thrown error: log the status and Resend's message to
Workers observability (already enabled), return `502` with no detail. The
form then shows a failure notice **containing the mailto link** and keeps
every field the visitor typed.

A missing `RESEND_API_KEY` behaves the same way: the endpoint fails, the rest
of the site is untouched.

Resend's response body and the API key never reach the browser.

## Testing

Vitest, covering `worker/contact.ts` and the handler's branches with `fetch`
stubbed:

- a valid submission produces the expected subject, body, and `reply_to`
- missing `name`, `email`, or `message` gives 400
- an over-length field and an over-size body give 400
- a filled honeypot gives 200 and **no** Resend call
- Resend returning 401 or 500 gives 502, and the key never appears in the response
- a non-POST method falls through to assets

Then a live check after deploy: one real inquiry, confirmed received, with
Reply resolving to the sender's address.

## Setup, in order

1. Resend account (Skyelar's; Austin is admin). Add domain `sp-archives.com`.
2. Add Resend's three DNS records in Cloudflare, **DNS only, grey cloud**,
   then Verify.
3. Email Routing: enable, create `studio@sp-archives.com` forwarding to his
   personal inbox. **Needs Skyelar** to click the confirmation link.
4. `npx wrangler secret put RESEND_API_KEY`, pasted at the prompt so the key
   never enters a transcript or the repo.
5. Merge and deploy; send a real test inquiry.

Order matters: the secret can be set before or after the deploy, but the
domain must verify before any mail will send.

## Risks

- **Skyelar must confirm the forwarding address.** Until he clicks, nothing
  is delivered. This is the only step that blocks on him.
- **Free tier caps** at 100 emails a day, 3,000 a month. Far above expected
  volume; a spam flood is the only realistic way to approach it, which is
  what the honeypot and size limits are for.
- **DNS lives in Skyelar's zone.** Records get added by hand in the
  dashboard, so a typo is possible; Resend's Verify button is the check.
- **A later session reading the old comment** could remove `main` again. The
  mitigation is documentation, in both places.
