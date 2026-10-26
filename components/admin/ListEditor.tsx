"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  renderItem,
  createItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  createItem: () => T;
  addLabel: string;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function update(id: string, patch: Partial<T>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
    setConfirmingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-espresso/15 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded p-1 disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="rounded p-1 disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {confirmingId === item.id ? (
              <button type="button" onClick={() => remove(item.id)} className="text-sm font-semibold text-red-600">
                Confirmer la suppression ?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(item.id)}
                className="rounded p-1 text-espresso/50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {renderItem(item, (patch) => update(item.id, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-espresso/25 py-3 text-sm font-semibold text-espresso/60 hover:border-terracotta hover:text-terracotta"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
