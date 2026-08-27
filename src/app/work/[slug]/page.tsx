import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  collections,
  coverSrc,
  getCollection,
  plateCount,
  plateSrc,
} from "@/lib/data";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Series Not Found" };
  return {
    title: `${c.title} — Series No. ${c.no}`,
    description: c.blurb,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();

  const idx = collections.findIndex((x) => x.slug === c.slug);
  const next = collections[(idx + 1) % collections.length];

  // Build a varied editorial layout: spans cycle across the grid.
  const total = plateCount(c);
  const plates = Array.from({ length: total }, (_, i) => i + 1);
  const spanFor = (i: number) =>
    i % 5 === 0 ? "md:col-span-8" : i % 3 === 0 ? "md:col-span-7" : "md:col-span-5";

  return (
    <article className="bg-bg">
      {/* Full-bleed series header */}
      <header className="relative h-svh w-full overflow-hidden">
        <Image
          src={coverSrc(c)}
          alt={`${c.title} — cover plate by Skyelar Payne`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/50 via-transparent to-bg" />
        <div className="absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-14">
          <div className="flex items-start justify-between">
            <Link href="/work" className="label hover:text-accent">
              ← Index
            </Link>
            <span className="label text-right">
              Series No. {c.no}
              <br />
              {total} plates
            </span>
          </div>
          <div>
            <p className="label text-accent">{c.category}</p>
            <h1 className="mt-3 font-serif font-light leading-[0.9] tracking-tight text-[clamp(3rem,11vw,9rem)]">
              {c.title}
            </h1>
            <p className="mt-4 max-w-xl font-serif text-lg text-paper md:text-xl">
              {c.blurb}
            </p>
            <p className="label mt-4">
              {c.location} · {c.year}
            </p>
          </div>
        </div>
      </header>

      {/* Plate grid */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-6 md:grid-cols-12">
          {plates.map((p, i) => (
            <figure
              key={p}
              className={`reveal ${spanFor(i)} ${i % 2 === 0 ? "" : "md:mt-16"}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-bg-raised">
                <Image
                  src={plateSrc(c, i)}
                  alt={`${c.title}, plate ${String(p).padStart(2, "0")} — ${c.location} ${c.year}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="label mt-3 flex justify-between">
                <span>
                  {c.no}.{String(p).padStart(2, "0")}
                </span>
                <span>
                  {c.title} · {c.year}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Next series */}
      <section className="border-t border-faint/60">
        <Link
          href={`/work/${next.slug}`}
          className="group mx-auto flex max-w-[1600px] items-center justify-between px-5 py-16 md:px-10 md:py-24"
        >
          <div>
            <p className="label">Next Series — No. {next.no}</p>
            <p className="mt-3 font-serif text-4xl font-light transition-colors group-hover:text-accent md:text-6xl">
              {next.title}
            </p>
          </div>
          <span className="label">→</span>
        </Link>
      </section>
    </article>
  );
}
