"use client";

import { useState, useTransition } from "react";
import type { ChambresPageContent } from "@/lib/content/schemas";
import { MoreRoomPhotoSchema } from "@/lib/content/schemas";
import type { z } from "zod";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveChambresPage } from "./actions";

type MoreRoomPhoto = z.infer<typeof MoreRoomPhotoSchema>;

function emptyMoreRoom(): MoreRoomPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function ChambresPageForm({ initial }: { initial: ChambresPageContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveChambresPage(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-10 flex flex-col gap-6 border-t border-espresso/10 pt-8">
      <h2 className="font-serif text-xl font-semibold">Page Chambres — en-tête et sections</h2>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Survol de l&apos;en-tête</span>
        <input
          value={content.heroEyebrow}
          onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Titre de l&apos;en-tête</span>
        <input
          value={content.heroTitle}
          onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Texte de l&apos;en-tête</span>
        <textarea
          value={content.heroText}
          onChange={(e) => setContent({ ...content, heroText: e.target.value })}
          rows={2}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>

      <h3 className="font-serif text-lg font-semibold">Et aussi — autres photos</h3>
      <ListEditor
        items={content.moreRooms}
        onChange={(moreRooms) => setContent({ ...content, moreRooms })}
        createItem={emptyMoreRoom}
        addLabel="Ajouter une photo"
        renderItem={(photo, update) => (
          <div className="flex flex-col gap-3">
            <ImageUploadField value={photo.image} onChange={(url) => update({ image: url })} label="Photo" />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Légende</span>
              <input
                value={photo.caption}
                onChange={(e) => update({ caption: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
          </div>
        )}
      />

      <h3 className="font-serif text-lg font-semibold">Salles de bain</h3>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Survol</span>
        <input
          value={content.bathroomEyebrow}
          onChange={(e) => setContent({ ...content, bathroomEyebrow: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Titre</span>
        <input
          value={content.bathroomTitle}
          onChange={(e) => setContent({ ...content, bathroomTitle: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <div className="flex gap-4">
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

      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
