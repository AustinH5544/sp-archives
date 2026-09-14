"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll, frame-synced with GSAP's ticker so ScrollTrigger
 * stays in lockstep. Disabled entirely under prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // content MUST be <body>, not Lenis's default <html>.
    //
    // Lenis caps wheel scrolling at a height it measures from `content`, and
    // re-measures only when a ResizeObserver on that element fires. The root
    // layout gives <html> `h-full`, which pins its box to the viewport, so
    // the observer on <html> never fires however tall the page gets. After a
    // client-side navigation from a short page to a long gallery, the wheel
    // stopped dead at the previous page's height (measured: stuck at
    // y=3991, the home page's limit, on a 35,860px gallery) while dragging
    // the native scrollbar still worked. <body> is the box that actually
    // grows, so observing it keeps the limit current.
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      content: document.body,
    });
    registerLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
