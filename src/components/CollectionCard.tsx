import Image from "next/image";
import Link from "next/link";
import { type Collection, img } from "@/lib/data";

export default function CollectionCard({
  c,
  priority = false,
}: {
  c: Collection;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/work/${c.slug}`}
      className="reveal group block border-t border-faint/60 pt-4"
    >
      <div className="flex items-baseline justify-between">
        <span className="label text-accent">No. {c.no}</span>
        <span className="label">{c.category}</span>
      </div>

      <div className="relative mt-4 aspect-[4/5] overflow-hidden bg-bg-raised">
        <Image
          src={img(c.slug, 1000, 1250)}
          alt={`${c.title} — ${c.category} series by Skyelar Payne, ${c.location} ${c.year}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl leading-tight transition-colors group-hover:text-accent">
          {c.title}
        </h3>
        <span className="label whitespace-nowrap">{c.count} plates</span>
      </div>
      <p className="label mt-1">
        {c.location} · {c.year}
      </p>
    </Link>
  );
}
