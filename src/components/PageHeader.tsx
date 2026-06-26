export default function PageHeader({
  index,
  title,
  lead,
}: {
  index: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="mx-auto max-w-[1600px] px-5 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
      <div className="flex items-baseline justify-between border-b border-faint/60 pb-4">
        <span className="label text-accent">{index}</span>
        <span className="label">SP-ARCHIVES</span>
      </div>
      <h1 className="mt-8 font-serif font-light leading-[0.9] tracking-tight text-[clamp(2.5rem,8vw,7rem)]">
        {title}
      </h1>
      {lead && (
        <p className="mt-6 max-w-2xl font-serif text-xl leading-snug text-paper md:text-2xl">
          {lead}
        </p>
      )}
    </header>
  );
}
