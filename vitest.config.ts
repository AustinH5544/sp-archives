import { defineConfig } from "vitest/config";

// The Worker code under test uses only web-standard globals (Request,
// Response, fetch, URL), all of which Node 18+ provides. A workerd-backed
// pool would be heavier and buys nothing here: no bindings are exercised
// except a hand-written ASSETS stub.
export default defineConfig({
  test: {
    environment: "node",
    include: ["worker/**/*.test.ts"],
  },
});
