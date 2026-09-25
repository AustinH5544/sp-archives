import { describe, expect, it } from "vitest";
import { PROJECT_TYPES, honeypotFilled, validateInquiry } from "./contact";

describe("contact module", () => {
  it("exposes the six project types offered by the form", () => {
    expect(PROJECT_TYPES).toEqual([
      "Family",
      "Maternity",
      "Graduation / Senior",
      "Automotive",
      "Engagement",
      "Other",
    ]);
  });
});

const good = {
  name: "  Jordan Reyes ",
  email: "jordan@example.com",
  date: "Autumn 2026",
  location: "Spokane",
  type: "Maternity",
  message: "We are expecting in October.",
};

describe("validateInquiry", () => {
  it("trims and returns a complete submission", () => {
    const result = validateInquiry(good);
    expect(result).toEqual({
      ok: true,
      inquiry: { ...good, name: "Jordan Reyes" },
    });
  });

  it("treats date, location and type as optional", () => {
    const result = validateInquiry({
      name: "Jordan",
      email: "jordan@example.com",
      message: "Hello",
    });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["name", { ...good, name: "   " }],
    ["email", { ...good, email: "" }],
    ["message", { ...good, message: "" }],
  ])("rejects a missing %s", (_field, payload) => {
    expect(validateInquiry(payload).ok).toBe(false);
  });

  it("rejects an address with no @", () => {
    expect(validateInquiry({ ...good, email: "jordan.example.com" }).ok).toBe(false);
  });

  it("rejects an over-long message", () => {
    const result = validateInquiry({ ...good, message: "x".repeat(5001) });
    expect(result).toEqual({ ok: false, error: "That message is too long." });
  });

  it("rejects an over-long name", () => {
    expect(validateInquiry({ ...good, name: "x".repeat(101) }).ok).toBe(false);
  });

  it("rejects a project type that is not on the menu", () => {
    expect(validateInquiry({ ...good, type: "Boudoir" }).ok).toBe(false);
  });

  it("ignores non-string fields rather than throwing", () => {
    expect(validateInquiry({ name: 42, email: null, message: [] }).ok).toBe(false);
  });
});

describe("honeypotFilled", () => {
  it("is false when the hidden field is absent or blank", () => {
    expect(honeypotFilled({})).toBe(false);
    expect(honeypotFilled({ company: "   " })).toBe(false);
  });

  it("is true when something filled the hidden field", () => {
    expect(honeypotFilled({ company: "Acme SEO" })).toBe(true);
  });
});
