import { getContent } from "@/lib/content/store";
import { HomeContentSchema } from "@/lib/content/schemas";
import { DEFAULT_HOME_CONTENT } from "@/lib/content/defaults";
import { HomeForm } from "./HomeForm";

export const instant = false;

export default async function AdminAccueilPage() {
  const home = await getContent("home", HomeContentSchema, DEFAULT_HOME_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Accueil</h1>
      <HomeForm initial={home} />
    </div>
  );
}
