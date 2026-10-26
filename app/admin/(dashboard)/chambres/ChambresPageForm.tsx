"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { ChambresPageContent } from "@/lib/content/schemas";
import { MoreRoomPhotoSchema } from "@/lib/content/schemas";
import type { z } from "zod";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TextField } from "@/components/admin/TextField";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { SaveButton } from "@/components/admin/SaveButton";
import { generateId } from "@/lib/content/ids";
import { saveChambresPage } from "./actions";

type MoreRoomPhoto = z.infer<typeof MoreRoomPhotoSchema>;

function emptyMoreRoom(): MoreRoomPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function ChambresPageForm({ initial }: { initial: ChambresPageContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const result = await saveChambresPage(content);
      setStatus(
        result?.error ? { tone: "error", message: result.error } : { tone: "success", message: "Page Chambres enregistrée." }
      );
    });
  }

  return (
    <div className="mt-10 flex flex-col gap-6 border-t border-espresso/10 pt-8">
      <h2 className="font-serif text-lg font-semibold">En-tête &amp; sections de la page Chambres</h2>

      <div className="flex flex-col gap-3.5 rounded-xl border border-espresso/10 bg-paper p-4">
        <TextField label="Survol" value={content.heroEyebrow} onChange={(v) => setContent({ ...content, heroEyebrow: v })} />
        <TextField label="Titre" value={content.heroTitle} onChange={(v) => setContent({ ...content, heroTitle: v })} />
        <TextField
          label="Texte"
          multiline
          rows={2}
          value={content.heroText}
          onChange={(v) => setContent({ ...content, heroText: v })}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-espresso/70">Et aussi — autres photos</h3>
        <ListEditor
          items={content.moreRooms}
          onChange={(moreRooms) => setContent({ ...content, moreRooms })}
          createItem={emptyMoreRoom}
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
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-3.5 rounded-xl border border-espresso/10 bg-paper p-4">
        <h3 className="text-sm font-semibold text-espresso/70">Salles de bain</h3>
        <TextField
          label="Survol"
          value={content.bathroomEyebrow}
          onChange={(v) => setContent({ ...content, bathroomEyebrow: v })}
        />
        <TextField label="Titre" value={content.bathroomTitle} onChange={(v) => setContent({ ...content, bathroomTitle: v })} />
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField
            value={content.bathroomImage1}
            onChange={(url) => setContent({ ...content, bathroomImage1: url })}
            label="Photo 1"
          />
          <ImageUploadField
            value={content.bathroomImage2}
            onChange={(url) => setContent({ ...content, bathroomImage2: url })}
            label="Photo 2"
          />
        </div>
      </div>

      {status && <AdminAlert tone={status.tone}>{status.message}</AdminAlert>}
      <SaveButton pending={pending} onClick={handleSave} />
    </div>
  );
}
