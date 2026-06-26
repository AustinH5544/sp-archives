import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services & Investment",
  description:
    "Portrait sessions, editorial and commercial commissions, documentary coverage, and archival prints by Skyelar Payne. Starting investment and process.",
};

const process = [
  ["01", "Inquiry", "Share your project, dates, and references via the contact form."],
  ["02", "Proposal", "I return a tailored scope, treatment, and quote within 24 hours."],
  ["03", "Commission", "We shoot. Selects are catalogued and numbered into a private archive."],
  ["04", "Delivery", "Edited series delivered as web galleries, files, and optional prints."],
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        index="Services — Investment & Process"
        title="Services"
        lead="Four ways to commission the archive. Pricing is a starting point — every project is scoped individually."
      />

      {/* Services catalogue */}
      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="border-t border-faint/60">
          {services.map((s) => (
            <div
              key={s.no}
              className="grid gap-4 border-b border-faint/60 py-8 md:grid-cols-12 md:py-12"
            >
              <div className="md:col-span-1">
                <span className="label text-accent">{s.no}</span>
              </div>
              <div className="md:col-span-4">
                <h2 className="font-serif text-2xl md:text-3xl">{s.title}</h2>
              </div>
              <div className="md:col-span-5">
                <p className="text-muted">{s.body}</p>
              </div>
              <div className="md:col-span-2 md:text-right">
                <span className="label">From</span>
                <p className="font-serif text-2xl">{s.from}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <h2 className="font-serif text-2xl md:text-4xl">The Process</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {process.map(([no, t, body]) => (
            <div key={no} className="border-t border-faint/60 pt-4">
              <span className="label text-accent">{no}</span>
              <h3 className="mt-3 font-serif text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-faint/60 bg-bg-raised">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-6 px-5 py-16 md:flex-row md:items-center md:px-10 md:py-20">
          <p className="max-w-xl font-serif text-3xl font-light md:text-4xl">
            Ready to start? Request a consultation.
          </p>
          <Link
            href="/contact"
            className="label inline-flex items-center gap-2 border border-faint/80 px-6 py-3.5 transition-colors hover:border-accent hover:text-fg"
          >
            Request a Consultation →
          </Link>
        </div>
      </section>
    </>
  );
}
