import Link from "next/link";
import { Phone } from "lucide-react";
import { Wrap } from "./Wrap";
import { WHATSAPP_DISPLAY, CONTACT_EMAIL, buildWaLink } from "@/lib/whatsapp";

const DEVELOPER_WA_LINK = "https://wa.me/221710338061";

export function Footer({ simple = false }: { simple?: boolean }) {
  if (simple) {
    return (
      <footer className="w-full bg-espresso-dark px-5 md:px-8 py-10">
        <Wrap className="flex flex-wrap items-center justify-between gap-4 !px-0">
          <span className="font-serif text-base font-semibold text-paper">
            Hôtel Résidence Aïcha
          </span>
          <span className="text-xs text-paper/40">
            © 2026 — Site réalisé par{" "}
            <a href={DEVELOPER_WA_LINK} className="hover:text-paper/70">
              Kanoute Digital Agency
            </a>
          </span>
        </Wrap>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-espresso-dark px-5 md:px-8 pt-14 pb-8">
      <Wrap className="flex flex-wrap justify-between gap-12 !px-0">
        <div className="flex flex-1 min-w-[260px] flex-col gap-3">
          <span className="font-serif text-lg font-semibold text-paper">
            Hôtel Résidence Aïcha
          </span>
          <p className="max-w-[280px] text-[13.5px] leading-relaxed text-paper/55">
            Liberté Ouest, Lot 636
            <br />
            Tambacounda 26000, Sénégal
          </p>
        </div>
        <div className="flex flex-1 min-w-[160px] flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-paper/40">
            Navigation
          </span>
          <Link href="/" className="text-[13.5px] text-paper/75">
            Accueil
          </Link>
          <Link href="/chambres" className="text-[13.5px] text-paper/75">
            Chambres
          </Link>
          <Link href="/galerie" className="text-[13.5px] text-paper/75">
            Galerie
          </Link>
          <Link href="/contact" className="text-[13.5px] text-paper/75">
            Contact
          </Link>
        </div>
        <div className="flex flex-1 min-w-[220px] flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-paper/40">
            Contact
          </span>
          <a
            href={buildWaLink(
              "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda."
            )}
            className="flex items-center gap-1.5 text-[13.5px] text-paper/75"
          >
            <Phone className="h-3.5 w-3.5" />
            {WHATSAPP_DISPLAY}
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[13.5px] text-paper/75"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </Wrap>
      <Wrap className="mt-10 border-t border-paper/10 pt-6 !px-0">
        <span className="text-xs text-paper/40">
          © 2026 Hôtel Résidence Aïcha — Site réalisé par{" "}
          <a href={DEVELOPER_WA_LINK} className="hover:text-paper/70">
            Kanoute Digital Agency
          </a>
        </span>
      </Wrap>
    </footer>
  );
}
