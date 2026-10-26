"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { GalleryContent, GalleryPhoto } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TextField } from "@/components/admin/TextField";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { SaveButton } from "@/components/admin/SaveButton";
import { generateId } from "@/lib/content/ids";
import { saveGallery } from "./actions";

function emptyPhoto(): GalleryPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function GalleryForm({ initial }: { initial: GalleryContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const result = await saveGallery(content);
      setStatus(result?.error ? { tone: "error", message: result.error } : { tone: "success", message: "Galerie enregistrée." });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3.5 rounded-xl border border-espresso/10 bg-paper p-4">
        <TextField label="Survol de l'en-tête" value={content.heroEyebrow} onChange={(v) => setContent({ ...content, heroEyebrow: v })} />
        <TextField label="Titre de l'en-tête" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
        <TextField
          label="Texte de l'en-tête"
          multiline
          rows={2}
          value={content.heroText}
          onChange={(v) => setContent({ ...content, heroText: v })}
        />
      </div>

      <ListEditor
        items={content.photos}
        onChange={(photos) => setContent({ ...content, photos })}
        createItem={emptyPhoto}
        addLabel="Ajouter une photo"
        renderSummary={(photo) => (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-espresso/5">
              {photo.image && <Image src={photo.image} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <p className="truncate text-sm font-semibold">{photo.caption || "Nouvelle photo"}</p>
          </div>
        )}
        renderItem={(photo, update) => (
          <div className="flex flex-col gap-3.5">
            <ImageUploadField value={photo.image} onChange={(url) => update({ image: url })} label="Photo" />
            <TextField label="Légende" value={photo.caption} onChange={(v) => update({ caption: v })} />
            <TextField label="Texte alternatif (accessibilité)" value={photo.imageAlt} onChange={(v) => update({ imageAlt: v })} />
          </div>
        )}
      />
      {status && <AdminAlert tone={status.tone}>{status.message}</AdminAlert>}
      <SaveButton pending={pending} onClick={handleSave} />
    </div>
  );
}
