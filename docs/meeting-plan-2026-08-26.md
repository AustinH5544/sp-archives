# SP-ARCHIVES — Client Meeting Plan (Skyelar Payne)

**Date:** 2026-08-26 · **Length:** ~90 min (45-min compression noted at the end)
**Goal:** Leave with real content committed, a client-delivery decision made, and a clear owner for every open item.

---

## The framing to open with

Three separate problems get conflated constantly. Say this out loud in the first two minutes:

| # | Problem | Status |
|---|---------|--------|
| 1 | **Public portfolio** — the marketing site | Built. Needs real content. |
| 2 | **Portfolio image hosting** — where the site's images live | Decided on paper: R2 + ImageKit (`docs/storage-options.md`) |
| 3 | **Client photo delivery** — how paying clients receive their files | **Unsolved. Main topic tonight.** |

The storage research solves #2. It does *not* solve #3 — different problem, different tools.

---

## Pre-flight (Austin, before the meeting)

- [ ] `sp-archives.pages.dev` open on a laptop; `npm run dev` running if you want to change things live
- [ ] This plan open on your phone
- [ ] Send Skyelar the ★ **homework** questions ahead of time (Block 2 + Block 4) — he needs to look up photo counts and file sizes
- [ ] Decide your own ceiling *before* you walk in: how many hours/month you'll give this after launch. Don't negotiate that live.
- [ ] Know your default answers (bottom of this doc) so a shrug doesn't become a blocker

**Legend:** ★ = must be answered tonight · ☆ = can go async

---

## Block 1 — Reaction & direction (0:00–0:10)

**Goal:** Confirm the "Archival Index" concept survives contact with the client. Everything downstream assumes it.

Show the site. Say nothing for the first 30 seconds. Watch where he scrolls.

1. ★ First five seconds — gut reaction, no diplomacy?
2. ★ "Archival Index" = museum catalogue, numbered series, dark, typographic. Does that feel like *you*, or too cold/austere?
3. ★ What's the one thing you'd change first?
4. ☆ Three photographers whose *website* you'd want to be at — and what specifically about each?
5. ☆ Is `sp-archives` the brand, or is **Skyelar Payne** the brand and sp-archives just the project name?

**If he shrugs:** keep Archival Index. It's built, it's good, and it's differentiated.

---

## Block 2 — Content & assets (0:10–0:25) ← the actual blocker

**Goal:** A committed list of what he sends and by when. The site cannot launch without this, and no technical decision unblocks it.

Everything on the site is placeholder right now: picsum.photos images, fictional locations, `$1,000,000` prices, credentials marked "* Representative / illustrative."

6. ★ How many finished, portfolio-grade images do you have *right now*?
7. ★ Can you pick 6 series and give each a title, year, location, one-sentence description, and 12–25 selects?
8. ★ What are your export dimensions, and roughly what MB per file? (Needed to sanity-check the 10 GB free tier.)
9. ★ Total library size in GB — originals vs. web exports?
10. ★ Do you have a portrait of yourself for the About page?
11. ★ Real credentials: awards, publications, actual clients, year you started. What's true vs. aspirational?
12. ★ Bio — do you want to write it, or answer questions and let me draft it?
13. ★ Any testimonials from past clients we can pull?
14. ★ Do you want a Journal/blog — and will you *actually* write it? (A dead blog is worse than no blog. Four placeholder entries exist now.)
15. ☆ Captions: minimal (title / location / year), or include EXIF and gear?
16. ☆ What's the delivery date for the first batch of real photos?

**Default if undecided:** cut the Journal from V1, ship 4 collections instead of 6, minimal captions.

---

## Block 3 — Brand, domain, hosting (0:25–0:35)

**Goal:** Lock the domain and settle account ownership. Ownership is the one that bites later.

17. ★ Do you own a domain? Which name do you want?
18. ★ Who pays for the domain — you or me? (~$10–12/yr at Cloudflare Registrar, sold at cost.)
19. ★ Do you want a professional email (`hello@yourdomain`) or keep Gmail? (Cloudflare Email Routing forwards to Gmail free.)
20. ★ **Ownership:** everything currently lives in my Cloudflare account. Do you want your own account with me as a collaborator? Push for yes — it means you're never blocked on my availability.
21. ☆ Logo/wordmark, or should the type be the logo?
22. ☆ Analytics? (Cloudflare Web Analytics: free, no cookie banner, no consent needed.)
23. ☆ Where should inquiries land — email, spreadsheet, or a CRM?
24. ☆ Mailing list capture, or not yet?

### Hosting recommendation

Cloudflare, as preferred. One optional change to the current setup:

- The site is on **Cloudflare Pages**. Cloudflare's Pages docs now open with a banner — *"Are you sure you want to use Pages? Workers supports most Pages use cases and offers a broader feature set. It is Cloudflare's primary platform for building applications. Start new projects with Workers."*
- **This is a steer, not a deprecation.** Cloudflare has announced no end-of-life, no migration deadline, and does not call Pages deprecated or sunset anywhere in its docs. If Skyelar asks whether the site is about to break: no.
- The reason to move is capability, not urgency: **Workers Static Assets** gives one deployment that serves the static site *and* the contact-form endpoint *and* binds directly to R2 — instead of Pages plus a separate Worker.
- Static asset requests are free on Workers, same as Pages. No cost change.
- **Trigger for doing it:** whenever the contact form gets built. You're touching the deployment anyway. Until then it's safe to defer.
- GitHub → Cloudflare auto-deploy is still not wired up. Do it at the same time; manual `wrangler` deploys are a trap for a project someone else may inherit.

**Contact form** (currently UI-only, no backend): Worker endpoint + Cloudflare Turnstile for spam + Resend for delivery. Free at this volume.

**Running cost at launch: ~$12/year** — the domain. Everything else sits inside free tiers.

---

## Block 4 — Client photo delivery (0:35–0:55) ← main event

**Goal:** Pick a route tonight. This decision determines how much unpaid ongoing work Austin signs up for.

Start with discovery, not options. Let him describe the pain before you name a product.

25. ★ Walk me through the last client delivery, start to finish. What did you actually do?
26. ★ What do you hate about it?
27. ★ How many client galleries per year? How many photos in a typical one?
28. ★ How long do clients need access — 30 days, a year, forever?
29. ★ Do clients pick favorites (proofing) *before* you finish editing, or is it deliver-and-done?
30. ★ Full-res originals, web-size, or both?
31. ★ Do you need per-gallery passwords or PINs?
32. ★ Do you want to sell prints *from inside* the gallery?
33. ★ Must galleries look like the portfolio, or is a clean third-party gallery fine?
34. ★ **Budget ceiling for monthly tooling — $0, ~$10, ~$25, ~$50?** This single answer picks the route.
35. ☆ Are you already paying for Pixieset / Pic-Time / Dropbox / anything? What?
36. ☆ Do clients come back asking for a file from two years ago?
37. ☆ Do you ever deliver to a magazine or brand with licensing terms attached, vs. a consumer client?

### The three routes

| | **A. Off-the-shelf SaaS** | **B. Cloudflare DIY** | **C. Dumb pipe** |
|---|---|---|---|
| **What** | Pixieset / Pic-Time / CloudSpot / ShootProof | R2 + Worker + presigned URLs | Dropbox / Drive / WeTransfer |
| **Cost** | $0–26/mo | ~$0 marginal | $0–12/mo |
| **Build effort** | None | 2–4 weekends, then ongoing | None |
| **Branded** | Partly (subdomain unless paid) | Fully — `yourdomain.com/archive/…` | Not at all |
| **Proofing / favorites** | Yes | Would have to be built | No |
| **Print sales + lab fulfillment** | Built in | No | No |
| **PIN / expiry / download limits** | Built in | Buildable | Weak |
| **Skyelar uploads without Austin** | Yes | Needs an admin UI built | Yes |
| **Who maintains it** | Vendor | **Austin, forever** | Vendor |

**Pricing detail (2026):** Pixieset free = 3 GB, unlimited galleries, download PINs, storefront at 15% commission; paid from $10/mo. CloudSpot has a free plan, $19/mo paid. ShootProof prices by *photo count* — $10.99/mo for 1,500 photos, which an event shooter burns through fast. Pic-Time ~$26/mo, the most design-forward.

**Recommendation — hybrid:**

- Public portfolio + brand → Cloudflare Workers Static Assets
- Portfolio images → R2 + ImageKit (already decided)
- **Client delivery → Pixieset free tier**, linked from a "Client Access" nav item

This decouples delivery from the site build. The portfolio ships on its own timeline, Skyelar gets professional delivery immediately, and nobody waits on custom code.

**Build Route B only if all three are true:** delivery volume is low, he doesn't need proofing or print sales, and Austin genuinely wants the project. Otherwise it converts a free favor into permanent unpaid ops — Austin becomes the support desk every time a client can't download a zip.

---

## Block 5 — Money: pricing, prints, deposits (0:55–1:05)

**Goal:** Replace the `$1,000,000` joke placeholders with real numbers.

38. ★ Real starting price for each of the four services?
39. ★ Public prices, "starting at," or "inquire"? (Public prices pre-qualify leads and cut back-and-forth — research shows ~40% more inquiry clicks.)
40. ★ Are those four services right — Portrait / Editorial & Commercial / Events & Documentary / Archival Prints? Add, cut, or rename?
41. ★ Do you sell prints today? Do you want to?
42. ☆ If yes — which lab (WHCC, Bay Photo, Miller's)? Limited numbered editions or open?
43. ☆ Do you take deposits online, or invoice separately?
44. ☆ Do you have contracts and invoicing today, or is that a gap too?

**Note:** the Services copy already promises "a private archive gallery." Block 4 has to make that true.

---

## Block 6 — Design & motion options (1:05–1:20)

**Goal:** Set the ambition level for motion and image protection. Both carry real maintenance cost.

45. ★ Dark, light, or both? (Dark is the current default.)
46. ★ How much motion: subtle fades / the current kinetic hero / full WebGL shader transitions? More motion = slower, more fragile, harder for anyone else to maintain.
47. ★ Full-bleed edge-to-edge photos, or matted with white space like a gallery wall?
48. ★ How worried are you about image theft?
49. ★ Watermarks on the public portfolio — none, subtle, or visible?
50. ☆ Grid: uniform catalogue, or editorial mixed-size?
51. ☆ Horizontal-scroll galleries — love or hate?
52. ☆ Lightbox / fullscreen viewer with keyboard nav?
53. ☆ Filterable by category and year, or fixed curated order?
54. ☆ Homepage: single hero image, kinetic type, or slideshow?
55. ☆ Embed the Instagram feed, or just link it?

### Image protection — what actually works (2026)

- **Resolution limiting is the real defense.** Serve ~1200px display images. Fine on screen, useless for printing. Do this regardless of what he says about watermarks.
- **Small corner watermarks are now the weakest option** — AI removal tools strip them cleanly. If watermarking at all, use a **tiled diagonal pattern**: 25–35% opacity for portfolio, 40–55% for client proofs.
- **Keep IPTC/EXIF copyright metadata embedded** in exports — it travels with the file, supports licensing claims and Google Images attribution.
- Right-click protection: available, annoys people, stops nobody determined. His call.

**Default if undecided:** dark mode, current motion level, no visible watermark, 1200px cap, EXIF copyright embedded.

---

## Block 7 — Ownership, launch, next steps (1:20–1:30)

**Goal:** Nobody leaves assuming the other person owns something.

56. ★ Is there a deadline — a season, a pitch, a show?
57. ★ What's the minimum that has to be true before you'd share the link publicly?
58. ★ Do you want to add photos yourself without me? (→ do we need a CMS, or is "send Austin a Dropbox link" fine?)
59. ★ If yes, how technical do you want to get — drag-and-drop admin panel, or a Git-based CMS?
60. ★ Who maintains this in six months? What happens when I'm busy?
61. ★ How often will you realistically update it — weekly, monthly, twice a year?
62. ☆ Okay with a small "built by InnovateAndAmplify" credit in the footer?

**Close by writing down, out loud:**

- What Skyelar sends, and by when
- What Austin builds next, and by when
- The client-delivery route chosen
- Next meeting date

---

## Compressing to 45 minutes

Drop Blocks 1 and 6 to five minutes each, cut every ☆ question, and send Blocks 2 and 5 as homework. Protect Block 4 — it's the only one that can't be done over text.

---

## Austin's pre-decided defaults

Use these when he has no opinion, so no block stalls:

| Decision | Default |
|---|---|
| Design direction | Keep Archival Index |
| Hosting | Stay on Cloudflare; move Pages → Workers Static Assets when the contact form gets built |
| Portfolio images | R2 + ImageKit |
| Client delivery | Pixieset free tier, linked as "Client Access" |
| Contact form | Worker + Turnstile + Resend |
| Domain | Cloudflare Registrar, in *his* account, at cost |
| Journal | Cut from V1 |
| Collections at launch | 4, not 6 |
| Image protection | 1200px cap, no visible watermark, EXIF copyright embedded |
| Analytics | Cloudflare Web Analytics |
| CMS | None for V1; revisit after he's updated content twice |

---

## Sources

- [Best Photography Client Gallery Software (2026)](https://unscriptedphotographers.com/blog/photography-client-gallery-software)
- [Pixieset vs ShootProof — pricing & features 2026](https://picflow.com/compare/pixieset-vs-shootproof)
- [Pic-Time vs Pixieset 2026](https://picflow.com/compare/pic-time-vs-pixieset)
- [Pixieset Client Gallery pricing](https://pixieset.com/pricing/)
- [Pixieset — limiting free downloads and PINs](https://help.pixieset.com/hc/en-us/articles/115003008091-Limiting-free-downloads-and-other-restrictions)
- [Pixieset vs CloudSpot vs ShootProof (2026)](https://www.aimadefor.com/blog/pixieset-vs-cloudspot-vs-shootproof/)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Pre-signed URL upload architecture — R2 + Hono Workers](https://lirantal.com/blog/pre-signed-url-upload-architecture-cloudflare-r2-hono-workers)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Pages vs Workers — which to use in 2026](https://mecanik.dev/en/posts/cloudflare-pages-vs-workers-which-to-use-in-2026/)
- [Send emails with Resend — Cloudflare Workers](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)
- Internal: `docs/storage-options.md`, `docs/portfolio-research-2026.md`, `docs/animation-research-2026.md`
