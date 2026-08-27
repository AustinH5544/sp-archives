"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOURNAL_ENABLED } from "@/lib/config";

// Catalogue numbers are assigned after filtering so they stay contiguous
// whichever way the Journal switch is set.
const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  ...(JOURNAL_ENABLED ? [{ href: "/journal", label: "Journal" }] : []),
  { href: "/contact", label: "Contact" },
].map((l, i) => ({ ...l, no: String(i + 1).padStart(2, "0") }));

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-faint/60 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-xl tracking-tight md:text-2xl">
            SP&#8202;-&#8202;ARCHIVES
          </span>
          <span className="label hidden md:inline">Est. MMXXIV</span>
        </Link>

        <ul className="flex items-center gap-1 md:gap-2">
          {links.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`group flex items-baseline gap-1.5 px-2.5 py-1.5 text-sm transition-colors md:px-3 ${
                    active ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <span className="label hidden text-[0.6rem] sm:inline">
                    {l.no}
                  </span>
                  <span
                    className={`border-b pb-0.5 transition-colors ${
                      active
                        ? "border-accent"
                        : "border-transparent group-hover:border-faint"
                    }`}
                  >
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
