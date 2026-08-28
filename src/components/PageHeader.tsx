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
      {/* Stacked below sm: the longer index strings ("Index — Vol. I /
          Series 001–004") wrap to two lines under ~400px, and justify-between
          then pushes the last line flush against the wordmark with no gap.
          Above sm there is room for the catalogue row, with a gap so the two
          never touch even as index strings change. */}
      <div className="flex flex-col gap-1 border-b border-faint/60 pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
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
