# State-of-the-Art Animated Photography Portfolio Websites (June 2026)

A research report on the current tools, patterns, and design trends for building cool, modern, animated photo portfolios with React / Next.js. Sourced from 2025–2026 material; sources listed at the end.

---

## TL;DR — The 2026 Recommended Stack

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React 19** | `next/image` (auto AVIF/WebP, blur placeholders), RSC, View Transitions support |
| UI / micro-interactions | **Motion** (formerly Framer Motion) | Declarative, state-driven, layout animations, gestures — covers ~90% of UI motion |
| Scroll choreography / hero | **GSAP + ScrollTrigger + SplitText** (now 100% free, incl. all premium plugins) | The award-winning standard for pinned scroll sequences and kinetic type |
| Smooth scroll | **Lenis** (`darkroomengineering/lenis`) | Lightweight, keeps DOM + WebGL frame-synced |
| WebGL galleries / shaders | **Three.js + React Three Fiber (R3F)** + GLSL/TSL | Image distortion, RGB-shift, pixelation reveals, infinite carousels |
| Page transitions | **View Transitions API** (native, same- + cross-document) | Baseline same-doc since 2025; cross-doc shipped Safari 18.2 |
| Where possible | **CSS scroll-driven animations** (`scroll-timeline` / `view-timeline`) | ~85% support; zero-JS parallax/reveal, offloads to compositor |

**Headline change of the era:** In **April 2025, Webflow made GSAP — including all formerly paid Club plugins (SplitText, MorphSVG, DrawSVG, ScrollTrigger, ScrollSmoother, Flip) — 100% free for everyone, including commercial use.** This removes the single biggest historical reason teams reached for alternatives.

---

## 1. Animation Libraries & Approaches (2026)

### GSAP — now free, still the pro standard
- Acquired by Webflow (Oct 2024); made **100% free in April 2025**, all premium plugins included, commercial use allowed.
- Imperative, **timeline-based** model — you script choreography explicitly (`at t=0 move, at t=1 rotate…`). Ideal for complex, sequenced, award-winning scroll experiences.
- React integration via **`@gsap/react`** and the **`useGSAP()`** hook, which auto-scopes selectors and handles cleanup (kills the old memory-leak problems).
- Bundle ~78KB. Use it for: hero intros, pinned scroll sections, SplitText kinetic typography, parallax tied to scrub.

### Motion (formerly Framer Motion) — the React default
- ~6M weekly downloads; the default for React UI motion in 2026.
- **Declarative, state-driven**: enter/exit (`AnimatePresence`), hover/tap, **layout animations** (auto-animate position/size changes), gestures, drag.
- ~85KB but tree-shakeable; great DX. Use it for: navigation, cards, hover reveals, grid reflow, modal/lightbox transitions.
- **Rule of thumb:** Motion for component/state-driven UI; GSAP for timeline-driven scroll cinema. Many top sites use **both**.

### View Transitions API — native page/element morphing
- **Same-document** transitions went **Baseline in 2025**.
- **Cross-document** (multi-page) transitions shipped in **Safari 18.2**; opt in with `@view-transition { navigation: auto; }` on both documents. A focus area of **Interop 2026**.
- Perfect for photo grids → detail morphs (give the thumbnail and the hero the same `view-transition-name`).
- In React, pair with `document.startViewTransition()` (or framework wrappers) around route/state changes.

### CSS Scroll-Driven Animations — JS-free parallax/reveal
- `animation-timeline: scroll()` and `view()` let you drive `@keyframes` by scroll position instead of time. Runs off the main thread (compositor) — smooth and cheap.
- **~85% support** (all major browsers except Firefox, where it's implemented behind a flag / on by default in Nightly).
- **New for 2026:** *scroll-triggered* animations (time-based animations that fire when crossing a scroll offset) landing in **Chrome 145**.
- Strategy: use CSS scroll-driven animations for the 70% of simple reveals/parallax; reserve GSAP ScrollTrigger for complex, pinned, multi-element choreography. Always provide a static fallback for Firefox.

### Lenis — smooth scroll glue
- `darkroomengineering/lenis` — lightweight, performant smooth scroll.
- Critical for WebGL galleries: it keeps **DOM and WebGL in sync, frame for frame**. Feed Lenis's scroll value into your render loop / `gsap.ticker` rather than reading `window.scrollY`.
- (GSAP's own **ScrollSmoother** is an alternative that integrates natively with ScrollTrigger and is now free — pick one, not both.)

### Three.js + React Three Fiber — WebGL galleries & shaders
- R3F is the React renderer for Three.js; pairs with **drei** helpers and **`@react-three/postprocessing`**.
- 2026 trend: **WebGPU pipelines** with Three's **TSL (Three Shading Language)** for seamless scene transitions (see Codrops' Shader.se case study, May 2026).
- Common pattern: each DOM image gets a matching textured plane; a `ShaderMaterial` with a `uProgress` uniform animates the reveal/distortion.

### Shader-based image effects (the "award-winning" look)
- RGB-shift / chromatic aberration on scroll velocity, image deformation/displacement maps, pixelation and dithering transitions, wavy infinite carousels (GLSL distortion along an axis), on-scroll mesh reveals.
- Drive shader uniforms from scroll velocity (Lenis) and from GSAP `ScrollTrigger` scrub for the polished, momentum-aware feel.

---

## 2. Image-Heavy Gallery Patterns

| Pattern | 2026 implementation notes |
|---|---|
| **Masonry** | CSS `columns` or native CSS Masonry (Interop track); JS libs only if you need precise ordering. Animate reflow with Motion `layout`. |
| **Lightbox** | Use `AnimatePresence` + shared `layoutId` (Motion) or **View Transitions** with matching `view-transition-name` for a true morph from thumbnail → full image. |
| **Infinite scroll** | `IntersectionObserver` + RSC streaming / paginated fetch; virtualize long grids. For WebGL: infinite carousels looping planes by wheel velocity (R3F + GLSL). |
| **Parallax** | Prefer **CSS `view-timeline`** for simple layered parallax (no JS); GSAP ScrollTrigger `scrub` for multi-element, pinned parallax. |
| **Hover reveal** | Motion `whileHover` for scale/opacity; WebGL displacement on hover for editorial flair. |
| **Pixelation / distortion transitions** | Shader `uProgress` uniform animated via GSAP between gallery states; dithering/pixelation reveals are a signature 2026 look. |
| **Cursor-following effects** | Custom cursor + lerped follower (magnetic buttons, image trails); drive a WebGL displacement around the pointer for the "liquid" hover. |

---

## 3. Performance for Photo-Heavy Sites

Performance is the make-or-break for image sites. Targets: **LCP < 2.0s (ideally < 1.2s)**, **CLS < 0.1**, **INP < 200ms**.

- **Formats:** Serve **AVIF** first, **WebP** fallback. AVIF is ~20% smaller than WebP (encodes ~50% slower, so pre-generate). `next/image` negotiates this from one `<Image>` tag — it can cut a 1.2MB JPEG hero to ~45KB.
- **LCP hero:** Set `priority` (→ `loading="eager"` + `fetchPriority="high"`) on the above-the-fold hero image. Preload it. Don't lazy-load the LCP element.
- **Lazy loading:** Everything off-screen lazy-loads by default in `next/image`; combine with `IntersectionObserver`-driven reveals.
- **Blur placeholders:** `placeholder="blur"`. With static imports, `next/image` generates `blurDataURL` automatically (except animated images). For dynamic/CMS images, generate a tiny base64 LQIP (e.g., via `plaiceholder`) or use your CMS's built-in LQIP.
- **Prevent CLS:** Always provide width/height or `fill` + a sized container so layout doesn't shift as images load.
- **CDN:** Put a CDN in front; if self-hosting Next image optimization behind a proxy, **forward the `Accept` header** so format negotiation works. Image CDNs (Cloudinary, imgix, Vercel, Cloudflare Images) handle on-the-fly resizing/format/quality.
- **WebGL budget:** Compress textures, cap device pixel ratio (`dpr={[1, 2]}`), pause the render loop when the canvas is off-screen, and lazy-init heavy 3D below the fold.
- **Respect `prefers-reduced-motion`** — disable parallax/heavy motion for accessibility and to avoid INP/jank complaints.

---

## 4. Design Trends for Photographer Portfolios (2026)

- **Motion-first / immersive UX:** Hover effects, micro-interactions, and 3D imagery are now baseline expectations, not extras.
- **Editorial layouts + big type:** Magazine-style asymmetry, generous whitespace, oversized headings, full-bleed imagery, no awkward cropping. Typography "levels up brand perception."
- **Kinetic typography:** Animated character/word/line reveals (GSAP SplitText) — staggered, wave, scramble effects that feel intentional.
- **Minimalism:** Still the timeless winner — uncluttered grids, whitespace that lets each photo breathe.
- **Dark mode & jewel tones:** Midnight blue, deep purple, racing green backgrounds for a rich, gallery-like frame around photography.
- **Storytelling over showing:** 2026 portfolios narrate (sequence, captions, scrollytelling) rather than dump a grid. They also convert — clear CTAs to book/inquire.
- **Custom, flexible layouts** that reflect the photographer's personal aesthetic over cookie-cutter templates.

---

## 5. Concrete Code-Level Recommendations

### Install

```bash
# Core
npm i next react react-dom

# Motion (UI / micro-interactions)
npm i motion            # import from "motion/react"

# GSAP (now fully free, incl. all plugins) + React hook
npm i gsap @gsap/react

# Smooth scroll
npm i lenis

# WebGL gallery (optional, heavy hitters)
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing

# Dynamic blur placeholders for CMS images
npm i plaiceholder sharp
```

### Example: award-winning-style pinned hero with kinetic type + parallax

GSAP SplitText reveal, pinned scroll section, and a parallax layer tied to the scrollbar — wired with the `useGSAP` hook and Lenis for smooth scroll.

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";     // now free
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1) Smooth scroll, frame-synced with GSAP's ticker
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // 2) Kinetic headline reveal (respect reduced motion)
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(".hero-title", { type: "chars" });
      gsap.from(split.chars, {
        yPercent: 120, opacity: 0, stagger: 0.02,
        duration: 0.9, ease: "power4.out",
      });
      return () => split.revert();
    });

    // 3) Pinned section with scrubbed parallax image
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 1,            // ties motion to the scrollbar
      },
    })
      .to(".hero-img", { yPercent: -18, scale: 1.08, ease: "none" }, 0)
      .to(".hero-title", { yPercent: -40, ease: "none" }, 0);
  }, { scope: root });

  return (
    <div ref={root}>
      <section className="hero">
        <img className="hero-img" src="/hero.avif" alt="" />
        <h1 className="hero-title">SELECTED&nbsp;WORK</h1>
      </section>
    </div>
  );
}
```

### Lightbox morph with the View Transitions API (zero extra libs)

```tsx
function openPhoto(href: string) {
  if (!document.startViewTransition) { location.assign(href); return; }
  document.startViewTransition(() => location.assign(href));
}
```

```css
/* Give thumbnail and detail image the same name to morph between them */
.thumb-7  { view-transition-name: photo-7; }
.detail-7 { view-transition-name: photo-7; }
@view-transition { navigation: auto; }  /* enables cross-document transitions */
```

### CSS scroll-driven reveal (no JS — use for the simple 70%)

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(40px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.photo {
  animation: reveal linear both;
  animation-timeline: view();        /* drive by element's scroll progress */
  animation-range: entry 0% cover 35%;
}
@media (prefers-reduced-motion: reduce) { .photo { animation: none; } }
@supports not (animation-timeline: view()) { .photo { opacity: 1; } } /* Firefox fallback */
```

### WebGL gallery sketch (R3F) — for the high-end, shader-reveal tier

Each photo → a textured plane sized to match its DOM rect; a `uProgress` uniform animates the reveal/distortion, driven by GSAP ScrollTrigger and Lenis scroll velocity. Keep it lazy-loaded below the fold, cap `dpr`, and pause the loop when off-screen.

---

## Recommended Architecture by Ambition Level

1. **Fast, clean, accessible (most photographers):** Next.js + `next/image` + Motion + CSS scroll-driven reveals + View Transitions for the lightbox. No WebGL. Excellent LCP, minimal JS.
2. **Editorial / agency feel:** Add GSAP + ScrollTrigger + SplitText (kinetic type, pinned sections) and Lenis smooth scroll.
3. **Award-winning / FWA-tier:** Add Three.js / R3F WebGL galleries with GLSL/TSL shader reveals, RGB-shift/pixelation transitions, and cursor-following displacement — lazy-loaded and perf-budgeted.

---

## Sources

- [Webflow makes GSAP 100% free](https://webflow.com/blog/gsap-becomes-free) · [GSAP Pricing](https://gsap.com/pricing/) · [GSAP: Free Web Animation Library in 2026](https://www.noqode.fr/en/outils/gsap)
- [Web Animation in 2026: CSS vs GSAP](https://artofstyleframe.com/blog/web-animation-css-vs-gsap-2026/)
- [Comparing the best React animation libraries for 2026 — LogRocket](https://blog.logrocket.com/best-react-animation-libraries/) · [GSAP vs. Motion (2026)](https://satishkumar.xyz/blogs/gsap-vs-motion-guide-2026) · [GSAP vs Framer Motion vs React Spring](https://lab.good-fella.com/blog/gsap-vs-framer-motion-vs-react-spring)
- [View Transition API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) · [Interop 2026 — CSS-Tricks](https://css-tricks.com/interop-2026/) · [Announcing Interop 2026 — WebKit](https://webkit.org/blog/17818/announcing-interop-2026/)
- [CSS scroll-driven animations — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [CSS scroll-triggered animations are coming! — Chrome](https://developer.chrome.com/blog/scroll-triggered-animations) · [Scroll-Driven Animations — Josh W. Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/)
- [Lenis — GitHub](https://github.com/darkroomengineering/lenis) · [Lenis — site](https://www.lenis.dev/)
- [Building a Scroll-Revealed WebGL Gallery with GSAP, Three.js, Astro and Barba.js — Codrops](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) · [Wavy Infinite Carousels in R3F with GLSL — Codrops](https://tympanus.net/codrops/2025/11/26/creating-wavy-infinite-carousels-in-react-three-fiber-with-glsl-shaders/) · [Shader.se WebGPU pipeline — Codrops](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)
- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image) · [Next.js Image Optimization — DebugBear](https://www.debugbear.com/blog/nextjs-image-optimization) · [Next.js Image Optimization Guide 2026 — UsamaSoft](https://usamasoft.com/blog/nextjs-image-optimization-guide)
- [Portfolio design trends for 2026 — Envato](https://elements.envato.com/learn/portfolio-trends) · [9 Best Photography Portfolio Websites 2026 — DesignRush](https://www.designrush.com/best-designs/websites/trends/best-photography-portfolio-websites) · [What a Photographer's Website Should Include 2026 — Format](https://www.format.com/magazine/resources/photography/photography-website-checklist)
- [GSAP ScrollTrigger Complete Guide — GSAPify](https://gsapify.com/gsap-scrolltrigger/) · [GSAP SplitText examples — FreeFrontend](https://freefrontend.com/split-text-js/)

*Compiled June 2026.*
