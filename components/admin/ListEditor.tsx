"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  renderSummary,
  renderItem,
  createItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderSummary: (item: T) => React.ReactNode;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  createItem: () => T;
  addLabel: string;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    if (expandedId === id) setExpandedId(null);
  }

  function handleAdd() {
    const item = createItem();
    onChange([...items, item]);
    setExpandedId(item.id);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, index) => {
        const expanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-xl border transition-colors ${
              expanded ? "border-terracotta/30 bg-paper" : "border-espresso/10 bg-paper"
            }`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-espresso/35 transition-transform ${expanded ? "rotate-90" : ""}`}
                />
                <div className="min-w-0 flex-1">{renderSummary(item)}</div>
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg p-1.5 text-espresso/40 hover:bg-espresso/5 hover:text-espresso disabled:opacity-25 disabled:hover:bg-transparent"
                  aria-label="Déplacer vers le haut"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-lg p-1.5 text-espresso/40 hover:bg-espresso/5 hover:text-espresso disabled:opacity-25 disabled:hover:bg-transparent"
                  aria-label="Déplacer vers le bas"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {confirmingId === item.id ? (
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="ml-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    Confirmer ?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(item.id)}
                    className="rounded-lg p-1.5 text-espresso/40 hover:bg-red-600/10 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {expanded && (
              <div className="border-t border-espresso/8 px-4 pb-4 pt-3.5">
                {renderItem(item, (patch) => update(item.id, patch))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-espresso/20 py-3 text-sm font-semibold text-espresso/55 transition-colors hover:border-terracotta/40 hover:text-terracotta"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
