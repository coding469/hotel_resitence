const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format non supporté. Utilisez JPEG, PNG ou WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Image trop volumineuse (5 Mo maximum).";
  }
  return null;
}
