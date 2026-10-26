import { CheckCircle2, AlertCircle } from "lucide-react";

export function AdminAlert({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
        tone === "success"
          ? "border-emerald-600/20 bg-emerald-600/8 text-emerald-700"
          : "border-red-600/20 bg-red-600/8 text-red-700"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {children}
    </div>
  );
}
