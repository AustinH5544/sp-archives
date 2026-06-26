import Link from "next/link";
import Hero from "@/components/Hero";
import CollectionCard from "@/components/CollectionCard";
import { collections } from "@/lib/data";

export default function Home() {
  const featured = collections.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Positioning statement */}
      <section className="border-t border-faint/60 bg-bg">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-3">
            <p className="label">Statement</p>
          </div>
          <div className="md:col-span-9">
            <p className="font-serif text-3xl font-light leading-tight tracking-tight md:text-5xl">
              I photograph people and places as if assembling a permanent
              collection — each series numbered, catalogued, and kept.
            </p>
            <p className="mt-8 max-w-2xl text-muted">
              Based between Portland and New York, working worldwide on
              editorial, portrait, and documentary commissions. Every project
              enters the archive as a discrete index — titled, dated, and
              located.
            </p>
          </div>
        </div>
      </section>

      {/* Featured series — archival index */}
      <section className="bg-bg">
        <div className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
          <div className="flex items-end justify-between border-b border-faint/60 pb-4">
            <h2 className="font-serif text-2xl md:text-4xl">Selected Series</h2>
            <Link href="/work" className="label hover:text-accent">
              View full index →
            </Link>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {featured.map((c, i) => (
              <CollectionCard key={c.slug} c={c} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-faint/60 bg-bg-raised">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-8 px-5 py-20 md:flex-row md:items-end md:px-10 md:py-28">
          <div>
            <p className="label text-accent">Commissions Open — 2026</p>
            <p className="mt-4 max-w-xl font-serif text-3xl font-light leading-tight md:text-5xl">
              Have a series in mind? Let&rsquo;s catalogue it together.
            </p>
          </div>
          <Link
            href="/contact"
            className="label inline-flex items-center gap-2 border border-faint/80 px-6 py-3.5 transition-colors hover:border-accent hover:text-fg"
          >
            Begin an Inquiry →
          </Link>
        </div>
      </section>
    </>
  );
}
