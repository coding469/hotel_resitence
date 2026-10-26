import { describe, it, expect } from "vitest";
import { generateId } from "./ids";

describe("generateId", () => {
  it("slugifies the seed and appends a random suffix", () => {
    const id = generateId("Chambre Deluxe");
    expect(id).toMatch(/^chambre-deluxe-[a-z0-9]{5}$/);
  });
  it("falls back to 'item' for an empty seed", () => {
    expect(generateId("")).toMatch(/^item-[a-z0-9]{5}$/);
  });
  it("produces different ids on successive calls", () => {
    expect(generateId("Room")).not.toBe(generateId("Room"));
  });
});
