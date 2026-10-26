import { getContent } from "@/lib/content/store";
import { RoomsContentSchema, ChambresPageContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT, DEFAULT_CHAMBRES_PAGE_CONTENT } from "@/lib/content/defaults";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RoomsForm } from "./RoomsForm";
import { ChambresPageForm } from "./ChambresPageForm";

export const instant = false;

export default async function AdminChambresPage() {
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const chambresPage = await getContent("chambresPage", ChambresPageContentSchema, DEFAULT_CHAMBRES_PAGE_CONTENT);
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Chambres"
        description="L'accueil affiche automatiquement les 3 premières chambres ci-dessous ; la page Chambres les affiche toutes, dans cet ordre."
        viewHref="/chambres"
      />
      <RoomsForm initial={rooms} />
      <ChambresPageForm initial={chambresPage} />
    </div>
  );
}
