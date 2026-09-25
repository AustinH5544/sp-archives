"use client";

import { useState } from "react";

const field =
  "w-full border-b border-faint/60 bg-transparent py-3 text-fg placeholder:text-faint focus:border-accent focus:outline-none";

type Status = "idle" | "sending" | "error";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        // The form keeps everything typed, so nothing is lost on failure.
        setError(body.error || "");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("idle");
      setSent(true);
    } catch {
      setError("");
      setStatus("error");
    }
  }

  if (sent) {
    return (
      <div className="border-t border-faint/60 pt-8">
        <p className="label text-accent">Inquiry Received</p>
        <p className="mt-4 font-serif text-3xl font-light leading-tight">
          Thank you. Your inquiry has been logged to the archive and I&rsquo;ll
          be in touch within 24 hours.
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
            maxLength={100}
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
            maxLength={200}
            placeholder="you@email.com"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">03 — Date / Season</span>
          <input
            name="date"
            maxLength={100}
            placeholder="e.g. Autumn 2026"
            className={field}
          />
        </label>
        <label className="block">
          <span className="label">04 — Location / City</span>
          <input
            name="location"
            maxLength={100}
            placeholder="City or venue"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="label">05 — Project Type</span>
        <select name="type" className={`${field} appearance-none`} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          <option className="bg-bg">Family</option>
          <option className="bg-bg">Maternity</option>
          <option className="bg-bg">Graduation / Senior</option>
          <option className="bg-bg">Automotive</option>
          <option className="bg-bg">Engagement</option>
          <option className="bg-bg">Other</option>
        </select>
      </label>

      <label className="block">
        <span className="label">06 — Notes</span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={5000}
          placeholder="Tell me about the series you have in mind…"
          className={`${field} resize-none`}
        />
      </label>

      {/* Honeypot: off-screen, unfocusable, hidden from screen readers.
          People never fill this; form-filling bots fill every input. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="border-l-2 border-accent pl-4 text-paper">
          {error ||
            "Something went wrong sending that. Nothing was lost — your words are still here."}{" "}
          You can also email{" "}
          <a
            href="mailto:studio@sp-archives.com"
            className="underline hover:text-accent"
          >
            studio@sp-archives.com
          </a>{" "}
          directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="label inline-flex items-center gap-2 border border-faint/80 px-6 py-3.5 transition-colors hover:border-accent hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit Inquiry →"}
      </button>
    </form>
  );
}
