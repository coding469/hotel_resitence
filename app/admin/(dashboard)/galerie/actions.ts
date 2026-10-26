"use server";

import { setContent } from "@/lib/content/store";
import { GalleryContentSchema, type GalleryContent } from "@/lib/content/schemas";

export type SaveGalleryState = { error?: string; success?: boolean } | undefined;

export async function saveGallery(content: GalleryContent): Promise<SaveGalleryState> {
  const result = await setContent("gallery", GalleryContentSchema, content, ["/", "/galerie"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
