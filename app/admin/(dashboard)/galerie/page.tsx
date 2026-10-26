import { getContent } from "@/lib/content/store";
import { GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";
import { GalleryForm } from "./GalleryForm";

export const instant = false;

export default async function AdminGaleriePage() {
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Galerie</h1>
      <p className="mt-2 text-sm text-espresso/60">
        L&apos;accueil affiche automatiquement les 5 premières photos ci-dessous dans la section « En images ».
      </p>
      <GalleryForm initial={gallery} />
    </div>
  );
}
