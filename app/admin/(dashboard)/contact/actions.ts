"use server";

import { setContent } from "@/lib/content/store";
import { ContactContentSchema, type ContactContent } from "@/lib/content/schemas";

export type SaveContactState = { error?: string; success?: boolean } | undefined;

export async function saveContact(content: ContactContent): Promise<SaveContactState> {
  const result = await setContent("contact", ContactContentSchema, content, ["/", "/chambres", "/galerie", "/contact"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
