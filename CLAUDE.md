@AGENTS.md

# SP-ARCHIVES — Claude Context

## The Project
Photography portfolio for **Skyelar Payne**, brand/tag **sp-archives**. Built as a free side project by Austin (InnovateAndAmplify). Skyelar is based in **Spokane and Seattle, WA**.

Design concept: **Archival Index** — editorial, museum/library catalogue aesthetic. Catalogue numbering (001, 002...), strong typography, full-bleed imagery, dark mode, refined minimalism with selective bold motion.

## Tech Stack
- **Framework:** Next.js 16, App Router, TypeScript, `src/` directory, `@/*` alias
- **Styles:** Tailwind CSS v4 (CSS-based `@theme`, not a JS config file)
- **Fonts:** Fraunces (serif), Space Grotesk (grotesque), JetBrains Mono (labels) via `next/font`
- **Animation:** GSAP + ScrollTrigger, Motion (formerly Framer Motion), Lenis smooth scroll
- **Output:** Static export (`output: "export"` in next.config.ts) — all 19 routes are prerendered SSG
- **Images:** `next/image` with `unoptimized: true` (required for static export). Placeholder images from picsum.photos

## Hosting & Deployment
- **GitHub:** https://github.com/AustinH5544/sp-archives (public)
- **Cloudflare account:** `Innovateandamplify@gmail.com` (`4970804939d7f4e5d20795a9ae8047ab`)
- **Migrating Pages → Workers Static Assets.** Cloudflare's Pages docs now say "Start new projects with Workers." This is a steer, not a deprecation — Pages has no announced end-of-life.

### Workers (new path)
Config lives in `wrangler.jsonc`. Static-assets only — there is deliberately no `main` key, so no Worker script runs and asset requests are free/unbilled.

```bash
npm run preview   # next build + wrangler dev (works offline, no auth needed)
npm run deploy    # next build + wrangler deploy
```

Verified locally: all 19 routes resolve, `/about` → `about.html`, `/about.html` 307s → `/about`, unknown paths serve the custom `out/404.html`.

`html_handling: "auto-trailing-slash"` matters — `next.config.ts` leaves `trailingSlash` false, so the export emits `about.html`, not `about/index.html`. Do **not** use `not_found_handling: "single-page-application"`; every route is prerendered.

### Pages (old path, still live as fallback)
- https://sp-archives.pages.dev
- `npm run build` then `CLOUDFLARE_ACCOUNT_ID=4970804939d7f4e5d20795a9ae8047ab npx wrangler pages deploy out/ --project-name=sp-archives --branch=master --commit-dirty=true`

GitHub auto-deploy is **not wired up** on either path — manual redeploy for now.

## Site Structure
```
/               Home — full-bleed hero, kinetic title animation, featured series
/work           Work index — numbered catalogue grid (001–006)
/work/[slug]    Individual collection gallery (6 collections prerendered)
/about          About Skyelar — bio, facts table, portrait
/services       Services + pricing (4 offerings)
/journal        Journal list (4 entries)
/journal/[slug] Individual journal entry (4 prerendered)
/contact        Contact/inquiry form (non-functional UI only)
```

## Key Data File
All content (collections, journal entries, services, pricing) lives in `src/lib/data.ts`. This is the first place to update when adding real content.

## What's Placeholder Right Now
- All images are picsum.photos seeds — need to be replaced with Skyelar's real photos
- Contact form is UI-only, no backend wired up
- Service pricing is set to `$1,000,000` (joke placeholder — needs real prices)
- About page credentials marked "* Representative / illustrative"
- Collection locations and details are fictional

## Storage Plan (not yet implemented)
See `docs/storage-options.md` for full research. Decided direction:
- **Cloudflare R2** for photo storage (10 GB free, $0 egress always)
- **ImageKit** as a transformation proxy in front of R2 (free tier: 20 GB bandwidth/month, unlimited transforms, resize/WebP/AVIF/watermarking)
- R2 stores originals; ImageKit handles on-the-fly delivery — two free tiers stacked
- Storage limit on free tier: **10 GB** (~200–500 photos depending on file size)

## Build
```bash
npm run dev       # local dev at localhost:3000
npm run build     # builds static export to out/
npm run lint      # ESLint
```
Build must pass before deploying. The `out/` folder is what gets deployed.
