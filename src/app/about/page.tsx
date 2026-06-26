import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { img } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — Skyelar Payne",
  description:
    "Skyelar Payne is an editorial and portrait photographer working between Portland and New York. The archive, the philosophy, and the practice behind SP-ARCHIVES.",
};

const facts = [
  ["Based", "Portland · New York"],
  ["Working", "Worldwide"],
  ["Since", "2014"],
  ["Focus", "Editorial · Portrait · Place"],
  ["Clients", "Aperture, Kinfolk, Monocle*"],
  ["Recognition", "PPA, Communication Arts*"],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        index="About — The Archivist"
        title="Skyelar Payne"
        lead="I keep a photographic archive the way a librarian keeps a collection — deliberately, in sequence, and for the long term."
      />

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-bg-raised">
              <Image
                src={img("portrait-skyelar", 1200, 1500)}
                alt="Portrait of photographer Skyelar Payne"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <p className="label mt-3">Self-portrait · Studio · 2026</p>
          </div>

          <div className="md:col-span-5">
            <div className="space-y-6 font-serif text-xl leading-relaxed text-paper">
              <p>
                I came to photography through archives — boxes of slides,
                contact sheets, and the quiet authority of a thing that has been
                kept. That sensibility runs through everything I make.
              </p>
              <p className="text-fg">
                Each commission becomes a numbered series. I shoot with
                restraint, edit ruthlessly, and present the work as a catalogue:
                titled, dated, located. The goal is not to show everything, but
                to keep the right things.
              </p>
              <p>
                My practice spans editorial features, studio portraiture, and
                long-form documentary projects. I work slowly where I can and
                fast where I must, but I always file the result properly.
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
            <p className="label mt-3">* Representative / illustrative</p>
          </div>
        </div>
      </section>
    </>
  );
}
