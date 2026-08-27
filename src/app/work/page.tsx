import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CollectionCard from "@/components/CollectionCard";
import { collections } from "@/lib/data";

export const metadata: Metadata = {
  title: "Work — Index of Series",
  description:
    "The full catalogue of SP-ARCHIVES: automotive, portrait, and documentary series by Skyelar Payne, numbered and indexed.",
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        index="Index — Vol. I / Series 001–004"
        title="The Index"
        lead="Every series, numbered and dated. Select any entry to open the full sequence."
      />

      {/* Catalogue table header */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="label hidden grid-cols-12 gap-4 border-b border-faint/60 pb-3 md:grid">
          <span className="col-span-1">No.</span>
          <span className="col-span-4">Title</span>
          <span className="col-span-3">Category</span>
          <span className="col-span-2">Location</span>
          <span className="col-span-2 text-right">Year</span>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pt-12 pb-24 md:px-10 md:pb-32">
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => (
            <CollectionCard key={c.slug} c={c} priority={i < 2} />
          ))}
        </div>
      </section>
    </>
  );
}
