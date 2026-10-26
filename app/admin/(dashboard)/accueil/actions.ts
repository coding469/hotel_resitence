"use server";

import { setContent } from "@/lib/content/store";
import { HomeContentSchema, type HomeContent } from "@/lib/content/schemas";

export type SaveHomeState = { error?: string; success?: boolean } | undefined;

export async function saveHome(content: HomeContent): Promise<SaveHomeState> {
  const result = await setContent("home", HomeContentSchema, content, ["/"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
