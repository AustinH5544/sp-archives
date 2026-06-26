import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-[1600px] flex-col justify-center px-5 py-24 md:px-10">
      <p className="label text-accent">Error 404 — Not Catalogued</p>
      <h1 className="mt-4 font-serif font-light leading-[0.9] tracking-tight text-[clamp(3rem,12vw,9rem)]">
        Off the Index
      </h1>
      <p className="mt-6 max-w-md font-serif text-xl text-paper">
        This entry isn&rsquo;t in the archive. It may have been re-filed, or
        never existed.
      </p>
      <Link
        href="/"
        className="label mt-10 inline-flex w-fit items-center gap-2 border border-faint/80 px-6 py-3.5 hover:border-accent hover:text-fg"
      >
        ← Return to the cover
      </Link>
    </section>
  );
}
