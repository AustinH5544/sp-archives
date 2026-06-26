"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { img } from "@/lib/data";

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
            src={img("hero-northern", 2000, 2400)}
            alt="Skyelar Payne — archival photograph, Northern Light series"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-overlay absolute inset-0 -z-10 bg-gradient-to-b from-bg/70 via-bg/30 to-bg/90" />

        <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-8 md:px-10 md:py-12">
          <div className="hero-meta flex items-start justify-between">
            <p className="label">Vol. I — Index of Series</p>
            <p className="label hidden text-right sm:block">
              48.13°N / 16.21°E
              <br />
              Catalogue 001—006
            </p>
          </div>

          <div>
            <h1
              className="kinetic hero-title font-serif font-light leading-[0.84] tracking-tight"
              style={{ fontSize: "var(--text-display)", perspective: "600px" }}
              aria-label={TITLE}
            >
              <span aria-hidden className="block overflow-hidden pb-2">
                {TITLE.split("").map((c, i) => (
                  <span key={i} className="char">
                    {c === "-" ? "–" : c}
                  </span>
                ))}
              </span>
            </h1>

            <div className="hero-meta mt-6 flex max-w-3xl flex-col gap-6 border-t border-faint/60 pt-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md font-serif text-lg leading-snug text-paper md:text-xl">
                An editorial photography archive by{" "}
                <span className="italic">Skyelar Payne</span> — portrait,
                editorial, and place, catalogued and numbered.
              </p>
              <a
                href="/contact"
                className="label inline-flex items-center gap-2 border border-faint/80 px-4 py-2.5 transition-colors hover:border-accent hover:text-fg"
              >
                Inquire / Check Availability →
              </a>
            </div>
          </div>
        </div>

        <div className="hero-meta label absolute bottom-6 left-1/2 -translate-x-1/2">
          ↓ Scroll to browse the index
        </div>
      </section>
    </div>
  );
}
