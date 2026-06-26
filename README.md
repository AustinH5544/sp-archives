# SP-ARCHIVES

The editorial photography archive of **Skyelar Payne** — a Next.js 16 portfolio
built around the 2026 **"Archival Index"** design concept (museum/library
catalogue aesthetics: catalogue numbering, strong typography, full-bleed
imagery, dark archival palette).

## Stack

- **Next.js 16** (App Router, TypeScript, `src/`, `@/*` alias)
- **Tailwind CSS v4** (CSS-based theme in `src/app/globals.css`)
- **GSAP + ScrollTrigger + @gsap/react** — kinetic hero title + pinned scroll parallax
- **Lenis** — smooth scroll, frame-synced with GSAP's ticker
- **motion** — installed for UI micro-interactions
- **next/font** — Fraunces (serif) · Space Grotesk (grotesque) · JetBrains Mono (labels)
- Placeholder imagery from `picsum.photos` via `next/image`

All motion respects `prefers-reduced-motion` (Lenis disabled, GSAP gated via
`matchMedia`, CSS reveals suppressed).

## Pages

- `/` — full-bleed animated hero ("SP-ARCHIVES" kinetic title) + featured series
- `/work` — catalogue index of collections (numbered 001–006)
- `/work/[slug]` — full-bleed series gallery (e.g. `/work/northern-light`)
- `/about` — Skyelar Payne bio + facts table
- `/services` — offerings, starting prices, process
- `/journal` + `/journal/[slug]` — editorial entries
- `/contact` — short inquiry form (client-side acknowledgement)
- `not-found` — archival 404

## Develop

```bash
npm run dev     # http://localhost:3000
npm run build   # production build (verified passing)
npm run start   # serve the production build
npm run lint
```
