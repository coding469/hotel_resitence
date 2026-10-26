"use server";

import { setContent } from "@/lib/content/store";
import { RoomsContentSchema, type RoomsContent } from "@/lib/content/schemas";

export type SaveRoomsState = { error?: string; success?: boolean } | undefined;

export async function saveRooms(rooms: RoomsContent): Promise<SaveRoomsState> {
  const result = await setContent("rooms", RoomsContentSchema, rooms, ["/", "/chambres"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
