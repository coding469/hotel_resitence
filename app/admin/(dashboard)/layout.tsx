import Link from "next/link";
import { logout } from "./login/actions";

const sections = [
  { href: "/admin/general", label: "Général" },
  { href: "/admin/accueil", label: "Accueil" },
  { href: "/admin/chambres", label: "Chambres" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/contact", label: "Contact" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-56 shrink-0 border-r border-espresso/10 bg-paper p-6">
        <span className="font-serif text-lg font-semibold">Admin</span>
        <nav className="mt-6 flex flex-col gap-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="text-sm font-medium text-espresso/80 hover:text-terracotta"
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-8">
          <button type="submit" className="text-sm font-semibold text-espresso/50 hover:text-terracotta">
            Déconnexion
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
