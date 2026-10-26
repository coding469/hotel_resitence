import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("./redis", () => ({
  redis: { get: vi.fn(), set: vi.fn() },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { redis } from "./redis";
import { revalidatePath } from "next/cache";
import { getContent, setContent } from "./store";

const Schema = z.object({ title: z.string().min(1) });
const fallback = { title: "default" };

beforeEach(() => {
  vi.mocked(redis.get).mockReset();
  vi.mocked(redis.set).mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe("getContent", () => {
  it("returns the fallback when the key is missing", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns the fallback when stored data fails validation", async () => {
    vi.mocked(redis.get).mockResolvedValue({ title: "" });
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns the fallback when the read throws", async () => {
    vi.mocked(redis.get).mockRejectedValue(new Error("network"));
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns stored data when it is valid", async () => {
    vi.mocked(redis.get).mockResolvedValue({ title: "Stored title" });
    expect(await getContent("k", Schema, fallback)).toEqual({ title: "Stored title" });
  });
});

describe("setContent", () => {
  it("rejects invalid data without writing", async () => {
    const result = await setContent("k", Schema, { title: "" } as never);
    expect(result).toEqual({ ok: false, error: expect.any(String) });
    expect(redis.set).not.toHaveBeenCalled();
  });

  it("writes valid data and revalidates the given paths", async () => {
    const result = await setContent("k", Schema, { title: "New" }, ["/"]);
    expect(result).toEqual({ ok: true });
    expect(redis.set).toHaveBeenCalledWith("k", { title: "New" });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
