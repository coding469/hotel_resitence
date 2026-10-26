import { getContent } from "@/lib/content/store";
import { RoomsContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT } from "@/lib/content/defaults";
import { RoomsForm } from "./RoomsForm";

export const instant = false;

export default async function AdminChambresPage() {
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Chambres</h1>
      <p className="mt-2 text-sm text-espresso/60">
        L&apos;accueil affiche automatiquement les 3 premières chambres ci-dessous ; la page Chambres les affiche
        toutes, dans cet ordre.
      </p>
      <RoomsForm initial={rooms} />
    </div>
  );
}
