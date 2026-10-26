"use client";

import { useState, useTransition } from "react";
import type { Room, RoomsContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveRooms } from "./actions";

function emptyRoom(): Room {
  return {
    id: generateId("chambre"),
    name: "",
    capacity: "",
    bed: "",
    amenities: [],
    description: "",
    image: "",
    imageAlt: "",
  };
}

export function RoomsForm({ initial }: { initial: RoomsContent }) {
  const [rooms, setRooms] = useState<RoomsContent>(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveRooms(rooms);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <ListEditor
        items={rooms}
        onChange={setRooms}
        createItem={emptyRoom}
        addLabel="Ajouter une chambre"
        renderItem={(room, update) => (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Nom</span>
              <input
                value={room.name}
                onChange={(e) => update({ name: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="font-semibold">Capacité</span>
                <input
                  value={room.capacity}
                  onChange={(e) => update({ capacity: e.target.value })}
                  placeholder="ex: 2 pers."
                  className="rounded-lg border border-espresso/20 px-3 py-2"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="font-semibold">Lit</span>
                <input
                  value={room.bed}
                  onChange={(e) => update({ bed: e.target.value })}
                  placeholder="ex: 1 lit double"
                  className="rounded-lg border border-espresso/20 px-3 py-2"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Équipements (un par ligne)</span>
              <textarea
                value={room.amenities.join("\n")}
                onChange={(e) =>
                  update({ amenities: e.target.value.split("\n").filter((line) => line.trim() !== "") })
                }
                rows={3}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Description (optionnelle)</span>
              <textarea
                value={room.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={2}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Texte alternatif (accessibilité)</span>
              <input
                value={room.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <ImageUploadField value={room.image} onChange={(url) => update({ image: url })} label="Photo" />
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
