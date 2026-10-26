"use client";

import { useState, useTransition } from "react";
import type { ContactContent, IconKey } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ICON_OPTIONS } from "@/lib/content/icons";
import { generateId } from "@/lib/content/ids";
import { saveContact } from "./actions";

type WithId<T> = T & { id: string };
type IconTitleText = { icon: IconKey; title: string; text: string };

export function ContactForm({ initial }: { initial: ContactContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // id is the array index (not the title) so two blank "just added" items never collide — see the
  // same note in app/admin/accueil/HomeForm.tsx.
  const servicesWithId: WithId<IconTitleText>[] = content.services.map((s, index) => ({ ...s, id: String(index) }));
  const stepsWithId: WithId<IconTitleText>[] = content.steps.map((s, index) => ({ ...s, id: String(index) }));

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveContact(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  function renderIconTitleText(item: WithId<IconTitleText>, update: (patch: Partial<WithId<IconTitleText>>) => void) {
    return (
      <div className="flex flex-col gap-2">
        <select
          value={item.icon}
          onChange={(e) => update({ icon: e.target.value as IconKey })}
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
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">En-tête</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Survol</span>
          <input
            value={content.heroEyebrow}
            onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Titre</span>
          <input
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Texte</span>
          <textarea
            value={content.heroText}
            onChange={(e) => setContent({ ...content, heroText: e.target.value })}
            rows={2}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Services & équipements</h2>
        <ListEditor
          items={servicesWithId}
          onChange={(items) => setContent({ ...content, services: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={(): WithId<IconTitleText> => ({ id: generateId("service"), icon: "sparkles", title: "", text: "" })}
          addLabel="Ajouter un service"
          renderItem={renderIconTitleText}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Étapes de réservation</h2>
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
          renderItem={renderIconTitleText}
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
