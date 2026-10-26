import { redis } from "./redis";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

export async function getContent<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let raw: unknown;
  try {
    raw = await redis.get(key);
  } catch (error) {
    console.error(`content:${key} read failed`, error);
    return fallback;
  }
  if (raw == null) return fallback;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`content:${key} failed validation`, parsed.error.message);
    return fallback;
  }
  return parsed.data;
}

export async function setContent<T>(
  key: string,
  schema: z.ZodType<T>,
  value: T,
  revalidatePaths: string[] = []
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }
  try {
    await redis.set(key, parsed.data);
  } catch (error) {
    console.error(`content:${key} write failed`, error);
    return { ok: false, error: "Échec de l'enregistrement. Réessayez dans un instant." };
  }
  for (const path of revalidatePaths) revalidatePath(path);
  return { ok: true };
}
