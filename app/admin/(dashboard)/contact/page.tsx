import { getContent } from "@/lib/content/store";
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";
import { ContactForm } from "./ContactForm";

export const instant = false;

export default async function AdminContactPage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-espresso/60">
        Les coordonnées (téléphone, WhatsApp, email, adresse) se modifient dans la section Général.
      </p>
      <ContactForm initial={contact} />
    </div>
  );
}
