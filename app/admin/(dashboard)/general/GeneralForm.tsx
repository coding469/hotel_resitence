"use client";

import { useActionState } from "react";
import type { GlobalContent } from "@/lib/content/schemas";
import { saveGlobal } from "./actions";

const FIELDS: { name: keyof GlobalContent; label: string }[] = [
  { name: "phoneNumber", label: "Téléphone (chiffres uniquement, ex: 221781292929)" },
  { name: "phoneDisplay", label: "Téléphone affiché" },
  { name: "whatsappNumber", label: "WhatsApp (chiffres uniquement)" },
  { name: "whatsappDisplay", label: "WhatsApp affiché" },
  { name: "email", label: "Email" },
  { name: "addressLine1", label: "Adresse — ligne 1" },
  { name: "addressLine2", label: "Adresse — ligne 2" },
  { name: "mapsSearchUrl", label: "Lien Google Maps (itinéraire)" },
  { name: "mapsEmbedUrl", label: "Lien Google Maps (carte intégrée)" },
  { name: "seoTitle", label: "Titre SEO" },
  { name: "seoDescription", label: "Description SEO" },
];

export function GeneralForm({ initial }: { initial: GlobalContent }) {
  const [state, formAction, pending] = useActionState(saveGlobal, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {FIELDS.map((field) => (
        <label key={field.name} className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">{field.label}</span>
          <input
            name={field.name}
            defaultValue={initial[field.name]}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
      ))}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Enregistré.</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
