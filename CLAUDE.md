@AGENTS.md

# SP-ARCHIVES — Claude Context

`docs/architecture-decisions.md` is the authority on why things are the way
they are. Read it before changing deployment, images, or the contact
endpoint. This file is the map; that file is the reasoning.

## The Project
Photography portfolio for **Skyelar Payne**, brand/tag **sp-archives**. Built
as a free side project by Austin (InnovateAndAmplify). Skyelar shoots out of
**Spokane and Seattle, WA**, and works across the Pacific Northwest, North
Idaho, and on travel.

Design concept: **Archival Index** — editorial, museum/library catalogue
aesthetic. Catalogue numbering (001, 002...), strong typography, full-bleed
imagery, dark mode, refined minimalism with selective bold motion.

## Tech Stack
- **Framework:** Next.js 16, App Router, TypeScript, `src/` directory, `@/*` alias
- **Styles:** Tailwind CSS v4 (CSS-based `@theme`, not a JS config file)
- **Fonts:** Fraunces (serif), Space Grotesk (grotesque), JetBrains Mono (labels) via `next/font`
- **Animation:** GSAP + ScrollTrigger, Motion, Lenis smooth scroll
- **Tests:** Vitest, covering `worker/` only. `npm test`
- **Output:** Static export (`output: "export"`). Nine routes prerender, plus a 404

## Hosting & Deployment
- **GitHub:** https://github.com/AustinH5544/sp-archives (public)
- **Cloudflare account: Skyelar's** (`68fd0549e41d1746b1ddb0ed5ce0f4b6`), not
  Austin's. Austin has borrowed access, currently broader than it should be.
- Live on `sp-archives.com` and `www.sp-archives.com` as custom domains.
- `sp-archives.pages.dev` still answers and is an unused fallback.

**Auto-deploy is wired.** Workers Builds watches GitHub: pushing `master`
builds and deploys to production. Feature branches run `wrangler versions
upload`, which never promotes. So a push to `master` is a production deploy.

```bash
npm run preview   # next build + wrangler dev
npm run deploy    # next build + wrangler deploy (rarely needed; push instead)
npm test          # vitest, worker only
npm run build     # static export to out/
npm run lint      # eslint
```

`wrangler.jsonc` sets `main` for one endpoint, `POST /api/contact`. Static
assets are still served **before** the script runs, so they stay free; only
the form post is a billable invocation. **Do not set
`assets.run_worker_first`** — it would make every request billable.

### Windows gotchas
- A running `wrangler dev` locks `out/`, and the next `next build` dies with
  EBUSY. Kill both `node` (matching `wrangler`) and `workerd.exe` first.
- Bash heredocs in this environment eat backslashes. Write files containing
  regexes or escapes with the editor tool, not `cat <<EOF`.

## Site Structure
```
/               Home — full-bleed hero, kinetic title, three featured series
/work           Work index — numbered catalogue grid (001–004)
/work/[slug]    Collection gallery (white-noise, red-thread, last-summer, first-frost)
/about          About Skyelar — bio, facts table, portrait
/services       Four offerings, all priced "Inquire"
/contact        Inquiry form, posts to /api/contact
```

The journal is **parked**, not deleted: `src/app/_journal` is
underscore-prefixed so Next ignores it. `npm run journal:on` restores it. Its
four entries are still the original fiction — do not publish them as-is.

## Content
`src/lib/data.ts` holds collections, services, and journal entries. It is the
first place to edit for content.

`src/lib/photos.json` holds only `{key, w, h}` for the R2-hosted frames.
**Never add the original filenames** — they contain client names, and this
file ships in the client bundle.

## Images — shipped, not placeholder
- 163 masters in R2 (`sp-archives-photos`), served via `img.sp-archives.com`.
- Resized on the fly by Cloudflare Images transformations through a custom
  Next loader, `src/lib/image-loader.ts`. ImageKit was rejected.
- **quality=85 is a floor.** Skyelar's edits carry film grain that lower
  settings smooth away. Do not "optimize" below it.
- Widths come from a fixed ladder, never the viewport: Cloudflare bills per
  unique transformation.
- Series 001 (`white-noise`) is the exception — 36 local files under
  `public/work/white-noise/`.

## Contact form — LIVE as of 2026-09-26

`worker/index.ts` handles `POST /api/contact`; `worker/contact.ts` holds the
pure validation and email formatting, under test in `worker/*.test.ts`.

The chain: form -> Worker -> Resend (from `inquiries@sp-archives.com`) ->
`studio@sp-archives.com` -> Cloudflare Email Routing -> Skyelar's Gmail.
Reply-to is set to the sender, so replying reaches the client.

Setup that is DONE and must not be re-done: Resend domain verification
(DKIM TXT at `resend._domainkey`, CNAMEs `send` and `rsend`, DMARC at
`_dmarc`), Email Routing (MX on the root plus Cloudflare's own DKIM), and
the `RESEND_API_KEY` secret on the Worker.

**Ordering trap, learned the hard way:** a secret cannot be attached to a
Worker that has only static assets — the dashboard refuses and the API
errors. The script must be deployed FIRST, then the secret added. The plan
doc has this backwards; this file is right.

**wrangler is logged in to Austin's own Cloudflare account**, which cannot
touch Skyelar's Worker: `wrangler secret put` and `wrangler deploy` both
fail with "Authentication error [code: 10000]". Use the Cloudflare dashboard
for secrets, and push to `master` for deploys. To fix properly,
`wrangler logout` then `wrangler login` and tick Skyelar's account in the
consent screen's account picker.

Resend free tier: 100 emails/day, 3,000/month. Receiving stays OFF in Resend
— Email Routing owns inbound, and Resend's inbound MX would fight it.

The API key is a Worker secret. It must never enter the repo, a command
argument, or a transcript.

## Still placeholder
- Years on all four series read 2026; locations are the general "Pacific
  Northwest" rather than the real towns.
- All four services say "Inquire" instead of a starting price.
- `/about` uses a car frame from series 001 in place of a portrait of Skyelar.
- `www` and the apex both return 200, so they are duplicate content.
