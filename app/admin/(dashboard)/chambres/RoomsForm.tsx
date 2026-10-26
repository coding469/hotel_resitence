"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import type { Room, RoomsContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TextField } from "@/components/admin/TextField";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { SaveButton } from "@/components/admin/SaveButton";
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
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setStatus(null);
    startSave(async () => {
      const result = await saveRooms(rooms);
      setStatus(result?.error ? { tone: "error", message: result.error } : { tone: "success", message: "Chambres enregistrées." });
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <ListEditor
        items={rooms}
        onChange={setRooms}
        createItem={emptyRoom}
        addLabel="Ajouter une chambre"
        renderSummary={(room) => (
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-espresso/5">
              {room.image && <Image src={room.image} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{room.name || "Nouvelle chambre"}</p>
              {room.capacity && (
                <p className="flex items-center gap-1 text-xs text-espresso/50">
                  <Users className="h-3 w-3" /> {room.capacity}
                </p>
              )}
            </div>
          </div>
        )}
        renderItem={(room, update) => (
          <div className="flex flex-col gap-3.5">
            <TextField label="Nom" value={room.name} onChange={(v) => update({ name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Capacité"
                value={room.capacity}
                onChange={(v) => update({ capacity: v })}
                placeholder="ex: 2 pers."
              />
              <TextField label="Lit" value={room.bed} onChange={(v) => update({ bed: v })} placeholder="ex: 1 lit double" />
            </div>
            <TextField
              label="Équipements (un par ligne)"
              multiline
              rows={3}
              value={room.amenities.join("\n")}
              onChange={(v) => update({ amenities: v.split("\n").filter((line) => line.trim() !== "") })}
            />
            <TextField
              label="Description (optionnelle)"
              multiline
              rows={2}
              value={room.description}
              onChange={(v) => update({ description: v })}
            />
            <TextField
              label="Texte alternatif (accessibilité)"
              value={room.imageAlt}
              onChange={(v) => update({ imageAlt: v })}
            />
            <ImageUploadField value={room.image} onChange={(url) => update({ image: url })} label="Photo" />
          </div>
        )}
      />
      {status && <AdminAlert tone={status.tone}>{status.message}</AdminAlert>}
      <SaveButton pending={pending} onClick={handleSave} />
    </div>
  );
}
