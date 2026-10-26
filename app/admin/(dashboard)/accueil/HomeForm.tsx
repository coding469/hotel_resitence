"use client";

import { useState, useTransition } from "react";
import type { HomeContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ICON_OPTIONS } from "@/lib/content/icons";
import { generateId } from "@/lib/content/ids";
import { saveHome } from "./actions";

type WithId<T> = T & { id: string };

export function HomeForm({ initial }: { initial: HomeContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // id is the array index, not the text — two newly-added (still-blank) items can share the
  // same label/title/author while being edited, and index is always unique.
  const trustItemsWithId: WithId<HomeContent["trustItems"][number]>[] = content.trustItems.map((item, index) => ({
    ...item,
    id: String(index),
  }));
  const reasonsWithId: WithId<HomeContent["reasons"][number]>[] = content.reasons.map((item, index) => ({
    ...item,
    id: String(index),
  }));
  const testimonialsWithId: WithId<HomeContent["testimonials"][number]>[] = content.testimonials.map(
    (item, index) => ({ ...item, id: String(index) })
  );

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveHome(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  function field(key: keyof HomeContent, label: string, multiline = false) {
    const value = content[key] as string;
    return (
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{label}</span>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
            rows={3}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        )}
      </label>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">En-tête (hero)</h2>
        {field("heroEyebrow", "Survol")}
        {field("heroTitle", "Titre")}
        {field("heroText", "Texte", true)}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Introduction</h2>
        {field("introEyebrow", "Survol")}
        {field("introTitle", "Titre")}
        {field("introText", "Texte", true)}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Points de confiance</h2>
        <ListEditor
          items={trustItemsWithId}
          onChange={(items) => setContent({ ...content, trustItems: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={(): WithId<HomeContent["trustItems"][number]> => ({
            id: generateId("point"),
            icon: "sparkles",
            label: "",
          })}
          addLabel="Ajouter un point"
          renderItem={(item, update) => (
            <div className="flex gap-3">
              <select
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value as HomeContent["trustItems"][number]["icon"] })}
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
                className="flex-1 rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Pourquoi nous choisir</h2>
        <ListEditor
          items={reasonsWithId}
          onChange={(items) => setContent({ ...content, reasons: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={(): WithId<HomeContent["reasons"][number]> => ({
            id: generateId("raison"),
            icon: "sparkles",
            title: "",
            text: "",
          })}
          addLabel="Ajouter une raison"
          renderItem={(item, update) => (
            <div className="flex flex-col gap-2">
              <select
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value as HomeContent["reasons"][number]["icon"] })}
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Titre"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
              <textarea
                value={item.text}
                onChange={(e) => update({ text: e.target.value })}
                rows={2}
                placeholder="Texte"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Avis clients</h2>
        <ListEditor
          items={testimonialsWithId}
          onChange={(items) => setContent({ ...content, testimonials: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("avis"), quote: "", author: "" })}
          addLabel="Ajouter un avis"
          renderItem={(item, update) => (
            <div className="flex flex-col gap-2">
              <textarea
                value={item.quote}
                onChange={(e) => update({ quote: e.target.value })}
                rows={2}
                placeholder="Citation"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
              <input
                value={item.author}
                onChange={(e) => update({ author: e.target.value })}
                placeholder="Auteur"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

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
