"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle } from "lucide-react";
import { Wrap } from "./Wrap";
import { Button } from "./Button";
import { buildWaLink } from "@/lib/whatsapp";

export type NavKey = "accueil" | "chambres" | "galerie" | "contact";

const navLinks: { key: NavKey; href: string; label: string }[] = [
  { key: "accueil", href: "/", label: "Accueil" },
  { key: "chambres", href: "/chambres", label: "Chambres" },
  { key: "galerie", href: "/galerie", label: "Galerie" },
  { key: "contact", href: "/contact", label: "Contact" },
];

export function Header({ current }: { current: NavKey }) {
  const [open, setOpen] = useState(false);
  const avisHref = current === "accueil" ? "#avis" : "/#avis";

  return (
    <header className="relative w-full border-b border-espresso/10">
      <Wrap className="flex items-center justify-between gap-6 py-5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-xl font-semibold">
            Hôtel Résidence Aïcha
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-espresso/45">
            Tambacounda
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-wrap items-center gap-6">
          {navLinks.map((link, i) => (
            <span key={link.key} className="contents">
              <Link
                href={link.href}
                className={`text-[14.5px] ${
                  current === link.key
                    ? "font-bold text-terracotta"
                    : "font-medium"
                }`}
              >
                {link.label}
              </Link>
              {i === 2 && (
                <Link href={avisHref} className="text-[14.5px] font-medium">
                  Avis
                </Link>
              )}
            </span>
          ))}
          <Button
            href={buildWaLink(
              "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda."
            )}
            small
          >
            <MessageCircle className="h-[15px] w-[15px]" />
            Réserver
          </Button>
        </nav>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-espresso md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Wrap>

      {/* Mobile dropdown panel */}
      {open && (
        <nav className="md:hidden border-t border-espresso/10 bg-cream">
          <Wrap className="flex flex-col gap-1 py-4">
            {navLinks.map((link, i) => (
              <span key={link.key} className="contents">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-[15px] ${
                    current === link.key
                      ? "font-bold text-terracotta"
                      : "font-medium"
                  }`}
                >
                  {link.label}
                </Link>
                {i === 2 && (
                  <Link
                    href={avisHref}
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-[15px] font-medium"
                  >
                    Avis
                  </Link>
                )}
              </span>
            ))}
            <Button
              href={buildWaLink(
                "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda."
              )}
              small
              className="mt-3 justify-center"
            >
              <MessageCircle className="h-[15px] w-[15px]" />
              Réserver
            </Button>
          </Wrap>
        </nav>
      )}
    </header>
  );
}
