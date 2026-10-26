"use server";

import { setContent } from "@/lib/content/store";
import { GlobalContentSchema, type GlobalContent } from "@/lib/content/schemas";

export type SaveGlobalState = { error?: string; success?: boolean } | undefined;

export async function saveGlobal(_prevState: SaveGlobalState, formData: FormData): Promise<SaveGlobalState> {
  const value: GlobalContent = {
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    phoneDisplay: String(formData.get("phoneDisplay") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    whatsappDisplay: String(formData.get("whatsappDisplay") ?? ""),
    email: String(formData.get("email") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    addressLine2: String(formData.get("addressLine2") ?? ""),
    mapsSearchUrl: String(formData.get("mapsSearchUrl") ?? ""),
    mapsEmbedUrl: String(formData.get("mapsEmbedUrl") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };

  const result = await setContent("global", GlobalContentSchema, value, ["/", "/chambres", "/galerie", "/contact"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
