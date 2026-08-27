import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description:
    "Inquire about an editorial, portrait, documentary, or print commission with Skyelar Payne / SP-ARCHIVES. Replies within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        index="Contact — Begin an Inquiry"
        title="Inquire"
        lead="Tell me what you want photographed. I reply to every inquiry within 24 hours."
      />

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <div className="border-t border-faint/60 pt-4">
              <p className="label">Direct</p>
              <a
                href="mailto:studio@sp-archives.com"
                className="mt-3 block font-serif text-2xl hover:text-accent"
              >
                studio@sp-archives.com
              </a>
            </div>
            <div className="mt-10 border-t border-faint/60 pt-4">
              <p className="label">Studios</p>
              <p className="mt-3 text-paper">Spokane, WA</p>
              <p className="text-paper">Seattle, WA</p>
              <p className="mt-2 text-muted text-sm">
                Available worldwide on commission.
              </p>
            </div>
            <div className="mt-10 border-t border-faint/60 pt-4">
              <p className="label">Response</p>
              <p className="mt-3 text-paper">Within 24 hours</p>
              <p className="text-muted text-sm">
                Often same day for time-sensitive bookings.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
