"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOURNAL_ENABLED } from "@/lib/config";
import { startLenis, stopLenis } from "@/lib/lenis";

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
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Drawer links close it on click. This covers the other way a route can
  // change while it is open: the browser back and forward buttons.
  useEffect(() => {
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Escape, focus trap, and freezing the page behind the panel.
  useEffect(() => {
    if (!open) {
      // Only pull focus back if we are actually closing, not on first render.
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;

    stopLenis();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(
      () => panelRef.current?.querySelector<HTMLElement>("a, button")?.focus(),
      80,
    );

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      startLenis();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-faint/60 bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="whitespace-nowrap font-serif text-lg tracking-tight sm:text-xl md:text-2xl">
              SP&#8202;-&#8202;ARCHIVES
            </span>
            <span className="label hidden md:inline">Est. MMXXIV</span>
          </Link>

          {/* Desktop index */}
          <ul className="hidden items-center gap-1 md:flex md:gap-2">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-baseline gap-1.5 px-2.5 py-1.5 text-sm transition-colors md:px-3 ${
                      active ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    <span className="label text-[0.6rem]">{l.no}</span>
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

          {/* Drawer trigger. Two rules rather than a hamburger, to match the
              hairline motif used through the catalogue. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-index-drawer"
            className="label -mr-2 flex min-h-11 items-center gap-2.5 px-2 text-fg md:hidden"
          >
            <span aria-hidden className="flex w-5 flex-col gap-[5px]">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
            Index
          </button>
        </nav>
      </header>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          open ? "" : "pointer-events-none"
        }`}
        inert={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close index"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 h-full w-full cursor-default bg-bg/70 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          id="site-index-drawer"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
          className={`absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col border-l border-faint/60 bg-bg transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-faint/60 px-5 py-4">
            <span className="label">Index</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="label -mr-2 flex min-h-11 min-w-11 items-center justify-center text-fg"
            >
              <span aria-hidden className="text-base leading-none">
                &#10005;
              </span>
              <span className="sr-only">Close index</span>
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto px-5">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href} className="border-b border-faint/60">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-4 py-5"
                  >
                    <span
                      className={`font-serif text-3xl font-light leading-none tracking-tight ${
                        active ? "text-accent" : "text-fg"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span className="label">{l.no}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-faint/60 px-5 py-5">
            <p className="label">Pacific Northwest · North Idaho</p>
            <p className="label mt-1">Est. MMXXIV</p>
          </div>
        </div>
      </div>
    </>
  );
}
