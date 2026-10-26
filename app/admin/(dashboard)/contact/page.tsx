import { getContent } from "@/lib/content/store";
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContactForm } from "./ContactForm";

export const instant = false;

export default async function AdminContactPage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Contact"
        description="Coordonnées, services et étapes de réservation affichés sur la page Contact — et utilisés par les boutons WhatsApp de tout le site."
        viewHref="/contact"
      />
      <ContactForm initial={contact} />
    </div>
  );
}
