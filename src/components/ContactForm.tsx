"use client";

import { useState } from "react";

const field =
  "w-full border-b border-faint/60 bg-transparent py-3 text-fg placeholder:text-faint focus:border-accent focus:outline-none";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Non-functional demo: acknowledge locally.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border-t border-faint/60 pt-8">
        <p className="label text-accent">Inquiry Received</p>
        <p className="mt-4 font-serif text-3xl font-light leading-tight">
          Thank you — your inquiry has been logged to the archive. I&rsquo;ll be
          in touch within 24 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="label mt-8 border border-faint/80 px-4 py-2.5 hover:border-accent hover:text-fg"
        >
          ← Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className="label">01 — Name</span>
          <input
            name="name"
            required
            placeholder="Your name"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">02 — Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">03 — Date / Season</span>
          <input
            name="date"
            placeholder="e.g. Autumn 2026"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">04 — Location / City</span>
          <input name="location" placeholder="City or venue" className={field} />
        </label>
      </div>

      <label className="block">
        <span className="label">05 — Project Type</span>
        <select name="type" className={`${field} appearance-none`} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          <option className="bg-bg">Portrait Session</option>
          <option className="bg-bg">Editorial / Commercial</option>
          <option className="bg-bg">Events / Documentary</option>
          <option className="bg-bg">Archival Prints</option>
          <option className="bg-bg">Other</option>
        </select>
      </label>

      <label className="block">
        <span className="label">06 — Notes</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell me about the series you have in mind…"
          className={`${field} resize-none`}
        />
      </label>

      <button
        type="submit"
        className="label inline-flex items-center gap-2 border border-faint/80 px-6 py-3.5 transition-colors hover:border-accent hover:text-fg"
      >
        Submit Inquiry →
      </button>
    </form>
  );
}
