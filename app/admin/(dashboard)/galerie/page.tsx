import { getContent } from "@/lib/content/store";
import { GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GalleryForm } from "./GalleryForm";

export const instant = false;

export default async function AdminGaleriePage() {
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Galerie"
        description="L'accueil affiche automatiquement les 5 premières photos ci-dessous dans la section « En images »."
        viewHref="/galerie"
      />
      <GalleryForm initial={gallery} />
    </div>
  );
}
