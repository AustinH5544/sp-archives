import Link from "next/link";
import { JOURNAL_ENABLED } from "@/lib/config";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-faint/60 bg-bg-raised">
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label">Colophon</p>
            <p className="mt-4 max-w-sm font-serif text-2xl leading-snug">
              SP-ARCHIVES, the photography archive of Skyelar Payne.
            </p>
            <p className="mt-4 max-w-sm text-sm text-muted">
              A catalogued index of automotive, portrait, and wild places.
              Booking across the Pacific Northwest.
            </p>
          </div>

          <nav className="md:col-span-3">
            <p className="label">Index</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {[
                ["/work", "Work"],
                ["/about", "About"],
                ["/services", "Services"],
                ...(JOURNAL_ENABLED
                  ? [["/journal", "Journal"] as [string, string]]
                  : []),
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-muted hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="label">Contact</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>
                <a
                  href="mailto:studio@sp-archives.com"
                  className="text-muted hover:text-fg"
                >
                  studio@sp-archives.com
                </a>
              </li>
              <li className="text-muted">Pacific Northwest · North Idaho · Travel</li>
              <li className="flex gap-4 pt-2">
                <a href="#" className="text-muted hover:text-fg">
                  Instagram
                </a>
                <a href="#" className="text-muted hover:text-fg">
                  Newsletter
                </a>
                <a href="#" className="text-muted hover:text-fg">
                  Client Access
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-faint/60 pt-6 text-xs text-muted md:flex-row">
          <span className="label">
            &copy; {year} Skyelar Payne — All rights reserved
          </span>
          <span className="label">SP-ARCHIVES / Vol. I</span>
        </div>
      </div>
    </footer>
  );
}
