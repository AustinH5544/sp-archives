"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TITLE = "SP-ARCHIVES";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1) Kinetic headline — staggered char reveal
        gsap.from(".char", {
          yPercent: 120,
          opacity: 0,
          rotateX: -40,
          stagger: 0.035,
          duration: 1,
          ease: "power4.out",
          delay: 0.15,
        });

        gsap.from(".hero-meta", {
          opacity: 0,
          y: 16,
          duration: 0.8,
          delay: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        });

        // 2) Pinned hero with scrubbed parallax tied to the scrollbar
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 1,
          },
        });
        tl.to(".hero-img", { yPercent: -16, scale: 1.12, ease: "none" }, 0)
          .to(".hero-title", { yPercent: -34, ease: "none" }, 0)
          .to(".hero-overlay", { opacity: 0.85, ease: "none" }, 0)
          .to(".hero-meta", { opacity: 0, y: -20, ease: "none" }, 0);
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <section className="hero relative h-svh w-full overflow-hidden">
        <div className="hero-img absolute inset-0 -z-10">
          <Image
            src="/work/liquid-silver/cover.jpg"
            alt="Skyelar Payne — Liquid Silver series, North Idaho 2026"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-overlay absolute inset-0 -z-10 bg-gradient-to-b from-bg/70 via-bg/30 to-bg/90" />

        {/* Bottom padding reserves a lane for the scroll cue, which is
            positioned against the section rather than this column. Without
            it the content runs straight into the cue on short screens. */}
        <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pt-8 pb-16 md:px-10 md:pt-12 md:pb-20">
          <div className="hero-meta flex items-start justify-between">
            <p className="label">Vol. I — Index of Series</p>
            <p className="label hidden text-right sm:block">
              47.68°N / 116.78°W
              <br />
              Catalogue 001–004
            </p>
          </div>

          <div>
            <h1
              className="kinetic hero-title font-serif font-light leading-[0.84] tracking-tight"
              style={{ fontSize: "var(--text-display)", perspective: "600px" }}
              aria-label={TITLE}
            >
              <span aria-hidden className="block overflow-hidden whitespace-nowrap pb-2">
                {TITLE.split("").map((c, i) => (
                  <span key={i} className="char">
                    {c === "-" ? "–" : c}
                  </span>
                ))}
              </span>
            </h1>

            <div className="hero-meta mt-6 flex max-w-3xl flex-col gap-6 border-t border-faint/60 pt-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md font-serif text-lg leading-snug text-paper md:text-xl">
                A photography archive by{" "}
                <span className="italic">Skyelar Payne</span>. Cars, wild
                places, and people, catalogued and numbered.
              </p>
              <a
                href="/contact"
                className="label inline-flex self-start items-center gap-2 border border-faint/80 px-4 py-2.5 transition-colors hover:border-accent hover:text-fg md:self-auto"
              >
                Inquire / Check Availability →
              </a>
            </div>
          </div>
        </div>

        {/* inset-x-0 + text-center rather than left-1/2 + translate: with
            left:50% the shrink-to-fit width is capped at the remaining half
            of the section, which wrapped this to two lines on phones. */}
        <div className="hero-meta label absolute inset-x-0 bottom-6 px-5 text-center [@media(max-height:500px)]:hidden">
          ↓ Scroll to browse the index
        </div>
      </section>
    </div>
  );
}
