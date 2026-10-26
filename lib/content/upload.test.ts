import { describe, it, expect } from "vitest";
import { validateImageFile } from "./imageValidation";

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "photo", { type });
}

describe("validateImageFile", () => {
  it("accepts a small jpeg", () => {
    expect(validateImageFile(makeFile("image/jpeg", 1024))).toBeNull();
  });
  it("rejects an unsupported type", () => {
    expect(validateImageFile(makeFile("application/pdf", 1024))).not.toBeNull();
  });
  it("rejects a file over 5 MB", () => {
    expect(validateImageFile(makeFile("image/png", 6 * 1024 * 1024))).not.toBeNull();
  });
});
