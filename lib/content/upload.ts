"use server";

import { put } from "@vercel/blob";
import { validateImageFile } from "./imageValidation";

export async function uploadContentImage(file: File): Promise<{ url: string } | { error: string }> {
  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const blob = await put(`content/${Date.now()}-${file.name}`, file, { access: "public" });
  return { url: blob.url };
}
