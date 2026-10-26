import { LogOut } from "lucide-react";
import { logout } from "../login/actions";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-espresso/10 bg-paper px-5 py-6">
        <div>
          <div className="px-1">
            <span className="font-serif text-[17px] font-semibold leading-tight">Hôtel Résidence Aïcha</span>
            <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-espresso/40">
              Administration
            </span>
          </div>
          <div className="mt-7">
            <AdminNav />
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-espresso/50 transition-colors hover:bg-espresso/5 hover:text-espresso"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            Déconnexion
          </button>
        </form>
      </aside>
      <main className="flex-1 px-10 py-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
