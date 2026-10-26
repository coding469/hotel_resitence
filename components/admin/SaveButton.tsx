import { Loader2, Check } from "lucide-react";

export function SaveButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex w-fit items-center gap-2 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {pending ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}
