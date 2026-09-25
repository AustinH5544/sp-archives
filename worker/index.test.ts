import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { type Env } from "./index";

const valid = {
  name: "Jordan Reyes",
  email: "jordan@example.com",
  date: "",
  location: "",
  type: "Maternity",
  message: "We are expecting in October.",
};

function post(body: unknown, raw?: string) {
  return new Request("https://sp-archives.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

let env: Env;
let assets: ReturnType<typeof vi.fn>;

beforeEach(() => {
  assets = vi.fn(async () => new Response("the 404 page", { status: 404 }));
  env = { ASSETS: { fetch: assets }, RESEND_API_KEY: "re_test_key" } as unknown as Env;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ id: "abc" }), { status: 200 })),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("sends a valid inquiry through Resend and answers ok", async () => {
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.authorization).toBe("Bearer re_test_key");
    const sent = JSON.parse(init.body);
    expect(sent.from).toBe("SP-ARCHIVES <inquiries@sp-archives.com>");
    expect(sent.to).toBe("studio@sp-archives.com");
    expect(sent.reply_to).toBe("jordan@example.com");
    expect(sent.subject).toContain("Jordan Reyes");
  });

  it("never caches the response", async () => {
    const res = await worker.fetch(post(valid), env);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects an invalid submission with 400 and sends nothing", async () => {
    const res = await worker.fetch(post({ ...valid, email: "nope" }), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 400 rather than throwing when the body is not JSON", async () => {
    const res = await worker.fetch(post(null, "not json at all"), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 400 when the body is valid JSON but not an object", async () => {
    const res = await worker.fetch(post(null, '"a string"'), env);
    expect(res.status).toBe(400);
  });

  it("rejects a body over 64 KB", async () => {
    const huge = JSON.stringify({ ...valid, message: "x".repeat(70_000) });
    const res = await worker.fetch(post(null, huge), env);
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("silently drops a honeypot hit but looks successful", async () => {
    const res = await worker.fetch(post({ ...valid, company: "Acme SEO" }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 502 when the key is missing, without naming it", async () => {
    const res = await worker.fetch(post(valid), { ...env, RESEND_API_KEY: undefined });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("RESEND");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 502 when Resend rejects the key, leaking nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("invalid api key re_test_key", { status: 401 })),
    );
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(502);
    const body = await res.text();
    expect(body).not.toContain("re_test_key");
    expect(body).not.toContain("invalid api key");
  });

  it("answers 502 when the request to Resend throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const res = await worker.fetch(post(valid), env);
    expect(res.status).toBe(502);
  });
});

describe("everything else", () => {
  it("hands GET /api/contact to the asset server", async () => {
    const req = new Request("https://sp-archives.com/api/contact");
    const res = await worker.fetch(req, env);
    expect(assets).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
  });

  it("hands an ordinary page request to the asset server", async () => {
    const req = new Request("https://sp-archives.com/work/red-thread");
    await worker.fetch(req, env);
    expect(assets).toHaveBeenCalledOnce();
  });
});
