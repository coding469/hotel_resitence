"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, Images, Phone, type LucideIcon } from "lucide-react";

const sections: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/chambres", label: "Chambres", icon: BedDouble },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
  { href: "/admin/contact", label: "Contact", icon: Phone },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {sections.map((section) => {
        const active = pathname === section.href;
        const Icon = section.icon;
        return (
          <Link
            key={section.href}
            href={section.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-terracotta/10 text-terracotta" : "text-espresso/65 hover:bg-espresso/5 hover:text-espresso"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
