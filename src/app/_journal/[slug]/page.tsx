import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JOURNAL_ENABLED } from "@/lib/config";
import { journal, getEntry, img } from "@/lib/data";

export function generateStaticParams() {
  return journal.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEntry(slug);
  if (!e) return { title: "Entry Not Found" };
  return { title: e.title, description: e.excerpt };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getEntry(slug);
  if (!JOURNAL_ENABLED || !e) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-16 pb-24 md:pt-28 md:pb-32">
      <div className="flex items-baseline justify-between border-b border-faint/60 pb-4">
        <span className="label text-accent">{e.no}</span>
        <Link href="/journal" className="label hover:text-accent">
          ← Journal
        </Link>
      </div>

      <p className="label mt-8">
        {e.kicker} · {e.date}
      </p>
      <h1 className="mt-4 font-serif font-light leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,4.5rem)]">
        {e.title}
      </h1>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-bg-raised">
        <Image
          src={img(`journal-${e.slug}`, 1400, 788)}
          alt={`${e.title} — journal illustration`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="mt-10 space-y-6 font-serif text-lg leading-relaxed text-paper">
        <p className="text-fg">{e.excerpt}</p>
        <p>
          An archive is a discipline before it is a thing. The number assigned
          to a series is a promise: that the work has been considered, sequenced,
          and committed to. This entry walks through how that discipline shapes
          the way I shoot, edit, and ultimately keep an image.
        </p>
        <p>
          There is a kind of patience that only the catalogue teaches you. You
          stop chasing the single frame and start building a record — one plate
          related to the next, each earning its place in the index.
        </p>
        <p>
          When the work is filed correctly, it lasts. That, more than any single
          photograph, is what SP-ARCHIVES is for.
        </p>
      </div>

      <div className="mt-14 border-t border-faint/60 pt-6">
        <Link href="/contact" className="label hover:text-accent">
          Commission a series →
        </Link>
      </div>
    </article>
  );
}
