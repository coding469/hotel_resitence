import { describe, it, expect } from "vitest";
import {
  GlobalContentSchema,
  RoomsContentSchema,
  GalleryContentSchema,
  HomeContentSchema,
  ChambresPageContentSchema,
  ContactContentSchema,
} from "./schemas";
import {
  DEFAULT_GLOBAL_CONTENT,
  DEFAULT_ROOMS_CONTENT,
  DEFAULT_GALLERY_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_CHAMBRES_PAGE_CONTENT,
  DEFAULT_CONTACT_CONTENT,
} from "./defaults";

describe("content defaults match their schemas", () => {
  it("validates global content", () => {
    expect(GlobalContentSchema.safeParse(DEFAULT_GLOBAL_CONTENT).success).toBe(true);
  });
  it("validates rooms content and requires 6 default rooms", () => {
    const result = RoomsContentSchema.safeParse(DEFAULT_ROOMS_CONTENT);
    expect(result.success).toBe(true);
    expect(DEFAULT_ROOMS_CONTENT).toHaveLength(6);
  });
  it("validates gallery content", () => {
    expect(GalleryContentSchema.safeParse(DEFAULT_GALLERY_CONTENT).success).toBe(true);
  });
  it("validates home content", () => {
    expect(HomeContentSchema.safeParse(DEFAULT_HOME_CONTENT).success).toBe(true);
  });
  it("validates chambres page content", () => {
    expect(ChambresPageContentSchema.safeParse(DEFAULT_CHAMBRES_PAGE_CONTENT).success).toBe(true);
  });
  it("validates contact content", () => {
    expect(ContactContentSchema.safeParse(DEFAULT_CONTACT_CONTENT).success).toBe(true);
  });
  it("rejects a room missing a required field", () => {
    const bad = [{ ...DEFAULT_ROOMS_CONTENT[0], name: "" }];
    expect(RoomsContentSchema.safeParse(bad).success).toBe(false);
  });
});
