"use client";

import { useState, useTransition } from "react";
import type { ContactContent, IconKey } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { TextField, SelectField } from "@/components/admin/TextField";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { SaveButton } from "@/components/admin/SaveButton";
import { ICON_OPTIONS, ICONS } from "@/lib/content/icons";
import { generateId } from "@/lib/content/ids";
import { saveContact } from "./actions";

type WithId<T> = T & { id: string };
type IconTitleText = { icon: IconKey; title: string; text: string };

export function ContactForm({ initial }: { initial: ContactContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  // id is the array index (not the title) so two blank "just added" items never collide.
  const servicesWithId: WithId<IconTitleText>[] = content.services.map((s, index) => ({ ...s, id: String(index) }));
  const stepsWithId: WithId<IconTitleText>[] = content.steps.map((s, index) => ({ ...s, id: String(index) }));

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const result = await saveContact(content);
      setStatus(result?.error ? { tone: "error", message: result.error } : { tone: "success", message: "Contact enregistré." });
    });
  }

  function renderIconTitleText(item: WithId<IconTitleText>, update: (patch: Partial<WithId<IconTitleText>>) => void) {
    return (
      <div className="flex flex-col gap-3">
        <SelectField
          label="Icône"
          value={item.icon}
          onChange={(v) => update({ icon: v as IconKey })}
          options={ICON_OPTIONS}
        />
        <TextField label="Titre" value={item.title} onChange={(v) => update({ title: v })} />
        <TextField label="Texte" multiline rows={2} value={item.text} onChange={(v) => update({ text: v })} />
      </div>
    );
  }

  function renderIconTitleTextSummary(item: WithId<IconTitleText>) {
    const Icon = ICONS[item.icon];
    return (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
          <Icon className="h-4 w-4" />
        </span>
        <p className="truncate text-sm font-semibold">{item.title || "Nouvel élément"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3.5 rounded-xl border border-espresso/10 bg-paper p-4">
        <h2 className="text-sm font-semibold text-espresso/70">Coordonnées</h2>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Téléphone (chiffres, ex: 221781292929)"
            value={content.phoneNumber}
            onChange={(v) => setContent({ ...content, phoneNumber: v })}
          />
          <TextField
            label="Téléphone affiché"
            value={content.phoneDisplay}
            onChange={(v) => setContent({ ...content, phoneDisplay: v })}
          />
          <TextField
            label="WhatsApp (chiffres)"
            value={content.whatsappNumber}
            onChange={(v) => setContent({ ...content, whatsappNumber: v })}
          />
          <TextField
            label="WhatsApp affiché"
            value={content.whatsappDisplay}
            onChange={(v) => setContent({ ...content, whatsappDisplay: v })}
          />
        </div>
        <TextField label="Email" type="email" value={content.email} onChange={(v) => setContent({ ...content, email: v })} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Adresse — ligne 1"
            value={content.addressLine1}
            onChange={(v) => setContent({ ...content, addressLine1: v })}
          />
          <TextField
            label="Adresse — ligne 2"
            value={content.addressLine2}
            onChange={(v) => setContent({ ...content, addressLine2: v })}
          />
        </div>
        <TextField
          label="Lien Google Maps (itinéraire)"
          value={content.mapsSearchUrl}
          onChange={(v) => setContent({ ...content, mapsSearchUrl: v })}
        />
        <TextField
          label="Lien Google Maps (carte intégrée)"
          value={content.mapsEmbedUrl}
          onChange={(v) => setContent({ ...content, mapsEmbedUrl: v })}
        />
      </section>

      <section className="flex flex-col gap-3.5 rounded-xl border border-espresso/10 bg-paper p-4">
        <h2 className="text-sm font-semibold text-espresso/70">En-tête de la page</h2>
        <TextField label="Survol" value={content.heroEyebrow} onChange={(v) => setContent({ ...content, heroEyebrow: v })} />
        <TextField label="Titre" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
        <TextField
          label="Texte"
          multiline
          rows={2}
          value={content.heroText}
          onChange={(v) => setContent({ ...content, heroText: v })}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-espresso/70">Services &amp; équipements</h2>
        <ListEditor
          items={servicesWithId}
          onChange={(items) => setContent({ ...content, services: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={(): WithId<IconTitleText> => ({ id: generateId("service"), icon: "sparkles", title: "", text: "" })}
          addLabel="Ajouter un service"
          renderSummary={renderIconTitleTextSummary}
          renderItem={renderIconTitleText}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-espresso/70">Étapes de réservation</h2>
        <ListEditor
          items={stepsWithId}
          onChange={(items) => setContent({ ...content, steps: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={(): WithId<IconTitleText> => ({
            id: generateId("etape"),
            icon: "messageCircle",
            title: "",
            text: "",
          })}
          addLabel="Ajouter une étape"
          renderSummary={renderIconTitleTextSummary}
          renderItem={renderIconTitleText}
        />
      </section>

      {status && <AdminAlert tone={status.tone}>{status.message}</AdminAlert>}
      <SaveButton pending={pending} onClick={handleSave} />
    </div>
  );
}
