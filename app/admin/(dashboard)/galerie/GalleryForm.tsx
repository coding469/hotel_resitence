"use client";

import { useState, useTransition } from "react";
import type { GalleryContent, GalleryPhoto } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveGallery } from "./actions";

function emptyPhoto(): GalleryPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function GalleryForm({ initial }: { initial: GalleryContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveGallery(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
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

      <ListEditor
        items={content.photos}
        onChange={(photos) => setContent({ ...content, photos })}
        createItem={emptyPhoto}
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
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Texte alternatif (accessibilité)</span>
              <input
                value={photo.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
          </div>
        )}
      />
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
