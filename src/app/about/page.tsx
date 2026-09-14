import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "About — Skyelar Payne",
  description:
    "Skyelar Payne is a documentary, portrait and automotive photographer based in the Pacific Northwest. The archive, the practice, and how it started.",
};

const facts = [
  ["Based", "Pacific Northwest"],
  ["Working", "PNW · North Idaho · Travel"],
  ["Since", "2020"],
  ["Focus", "Automotive · Portrait · Wild"],
  ["First camera", "Canon Rebel T4"],
  ["Still chasing", "Koi · An owl"],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        index="About — The Archivist"
        title="Skyelar Payne"
        lead="I photograph cars, wild places, and people at good moments. Everything worth keeping gets numbered and filed."
      />

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-bg-raised">
              {/* PLACEHOLDER. Swap for a real portrait of Skyelar when he
                  sends one, and put the caption back to a self-portrait
                  credit. Standing in with a frame from series 001. */}
              <Image
                src="/work/white-noise/12.jpg"
                alt="Subaru WRX STI photographed by Skyelar Payne, North Idaho 2026"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <p className="label mt-3">White Noise · North Idaho · 2026</p>
          </div>

          <div className="md:col-span-5">
            <div className="space-y-6 font-serif text-xl leading-relaxed text-paper">
              <p>
                In 2020 my best friend handed me his old Canon Rebel T4. I had
                just finished a round of mods on my car and wanted pictures of
                it. I shot the whole thing on automatic, every setting the
                camera had, and then I wanted to know why a few of them worked
                and the rest didn&apos;t.
              </p>
              <p className="text-fg">
                The first frame I&apos;d call mine was a 2012 Mazdaspeed 3, tech
                package, liquid silver. After that it stopped being about the
                car.
              </p>
              <p>
                Now I shoot cars, wildlife, landscapes, and people. That&apos;s a
                lot of different subjects, but I don&apos;t pick them to fit a
                niche. I shoot what I like, and what ties it all together is
                that I&apos;d rather capture something than make something.
              </p>
              <p>
                In a session I&apos;ll pose you when a shot needs it, but
                I&apos;d rather give you something to do. I start further back
                than most people expect and work my way in once everyone&apos;s
                forgotten I&apos;m there.
              </p>
            </div>

            <dl className="mt-12 border-t border-faint/60">
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between border-b border-faint/60 py-3"
                >
                  <dt className="label">{k}</dt>
                  <dd className="text-sm text-paper">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
