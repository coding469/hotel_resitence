import { describe, it, expect, beforeEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, ADMIN_PASSWORD: "correct-horse", ADMIN_SECRET: "test-secret" };
  vi.resetModules();
});

describe("checkPassword", () => {
  it("accepts the configured password", async () => {
    const { checkPassword } = await import("./auth");
    expect(checkPassword("correct-horse")).toBe(true);
  });
  it("rejects any other password", async () => {
    const { checkPassword } = await import("./auth");
    expect(checkPassword("wrong")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a freshly created token", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    expect(verifySessionToken(createSessionToken())).toBe(true);
  });
  it("rejects an undefined token", async () => {
    const { verifySessionToken } = await import("./auth");
    expect(verifySessionToken(undefined)).toBe(false);
  });
  it("rejects a tampered token", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    const token = createSessionToken();
    const [issuedAt] = token.split(".");
    expect(verifySessionToken(`${issuedAt}.deadbeef`)).toBe(false);
  });
  it("rejects a token signed with a different secret", async () => {
    const { createSessionToken } = await import("./auth");
    const token = createSessionToken();
    process.env.ADMIN_SECRET = "a-different-secret";
    vi.resetModules();
    const { verifySessionToken } = await import("./auth");
    expect(verifySessionToken(token)).toBe(false);
  });
});
