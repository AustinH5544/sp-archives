import { describe, expect, it } from "vitest";
import { PROJECT_TYPES } from "./contact";

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
