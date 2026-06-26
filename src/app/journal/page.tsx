import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { journal } from "@/lib/data";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field notes, process essays, and location stories from the SP-ARCHIVES — by Skyelar Payne.",
};

export default function JournalPage() {
  return (
    <>
      <PageHeader
        index="Journal — Notes & Essays"
        title="Journal"
        lead="An ongoing record of process, place, and craft from behind the archive."
      />

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="border-t border-faint/60">
          {journal.map((e) => (
            <Link
              key={e.slug}
              href={`/journal/${e.slug}`}
              className="group grid gap-4 border-b border-faint/60 py-8 md:grid-cols-12 md:py-10"
            >
              <div className="md:col-span-2">
                <span className="label text-accent">{e.no}</span>
              </div>
              <div className="md:col-span-2">
                <span className="label">{e.kicker}</span>
              </div>
              <div className="md:col-span-6">
                <h2 className="font-serif text-2xl transition-colors group-hover:text-accent md:text-3xl">
                  {e.title}
                </h2>
                <p className="mt-2 max-w-xl text-muted">{e.excerpt}</p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <time className="label">{e.date}</time>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
