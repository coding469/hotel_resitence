import { getContent } from "@/lib/content/store";
import { GlobalContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT } from "@/lib/content/defaults";
import { GeneralForm } from "./GeneralForm";

export const instant = false;

export default async function AdminGeneralPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold">Général</h1>
      <GeneralForm initial={global} />
    </div>
  );
}
