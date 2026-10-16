import Image from "next/image";
import { Users, BedDouble, Check, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { CTABand } from "@/components/CTABand";
import { buildWaLink } from "@/lib/whatsapp";

const rooms = [
  {
    name: "Chambre Standard",
    capacity: "2 pers.",
    bed: "1 lit double",
    image: "/images/chambre-standard.jpg",
    alt: "Chambre Standard — lit double, tête de lit en bois sombre, literie blanche",
    amenities: ["Climatisation", "Salle de bain privée", "Rangement et miroir"],
    price: "27 000",
  },
  {
    name: "Chambre Confort",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    image: "/images/chambre-confort.jpg",
    alt: "Chambre Confort — tête de lit capitonnée gris-bleu, liseuses intégrées, tableau décoratif",
    amenities: ["Climatisation", "Liseuses de chevet", "Salle de bain privée"],
    price: "35 000",
  },
  {
    name: "Chambre Deluxe",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    image: "/images/chambre-deluxe.jpg",
    alt: "Chambre Deluxe — ambiance chaleureuse, tons chauds, armoire miroir",
    amenities: ["Climatisation", "Armoire avec miroir", "Salle de bain privée"],
    price: "45 000",
  },
  {
    name: "Chambre Cosy",
    capacity: "2 pers.",
    bed: "1 lit double",
    image: "/images/chambre-cosy.jpg",
    alt: "Chambre Cosy — ambiance chaleureuse aux tons chauds, coin salon",
    amenities: ["Climatisation", "Coin salon", "Salle de bain privée"],
    price: "30 000",
  },
  {
    name: "Chambre Rosée",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    image: "/images/chambre-rose.jpg",
    alt: "Chambre Rosée — tons rosés, fauteuil doré, décoration soignée",
    amenities: ["Climatisation", "Décoration soignée", "Salle de bain privée"],
    price: "38 000",
  },
  {
    name: "Chambre Prestige",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    image: "/images/chambre-deluxe-2.jpg",
    alt: "Chambre Prestige — tête de lit capitonnée, ambiance chaleureuse",
    amenities: ["Climatisation", "Tête de lit capitonnée", "Salle de bain privée"],
    price: "42 000",
  },
];

const moreRooms = [
  {
    image: "/images/chambre-corail.jpg",
    alt: "Chambre avec coin salon privatif et rideaux cuivrés",
    caption: "Chambre avec coin salon privatif",
  },
  {
    image: "/images/chambre-jaune.jpg",
    alt: "Chambre avec coin bureau et téléviseur",
    caption: "Chambre avec coin bureau",
  },
  {
    image: "/images/salon-cuisine.jpg",
    alt: "Espace salon commun avec canapés en cuir noir",
    caption: "Espace salon commun",
  },
  {
    image: "/images/couloir.jpg",
    alt: "Couloir et accès aux chambres",
    caption: "Couloir et accès aux chambres",
  },
  {
    image: "/images/chambre-placard.jpg",
    alt: "Rangement intégré avec penderie et bureau",
    caption: "Rangement intégré et coin bureau",
  },
  {
    image: "/images/chambre-rangement.jpg",
    alt: "Armoire intégrée avec mini-réfrigérateur",
    caption: "Armoire intégrée et mini-bar",
  },
];

export default function ChambresPage() {
  return (
    <>
      <Header current="chambres" />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        <Image
          src="/images/salon-cuisine.jpg"
          alt="Espace salon commun de l'Hôtel Résidence Aïcha"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/92 via-espresso/75 to-espresso/40" />
        <Wrap className="relative">
          <Eyebrow light>Nos chambres</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            Un espace confortable pour chaque type de séjour
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">
            Toutes nos chambres sont climatisées et disposent d&apos;une
            salle de bain privée. Nos tarifs vont de 27 000 à 45 000 F CFA
            la nuit selon la chambre — le prix exact vous est confirmé
            directement sur WhatsApp selon la durée du séjour.
          </p>
        </Wrap>
      </section>

      {/* Rooms grid */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="grid gap-6 md:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="flex flex-col overflow-hidden rounded-[18px] border border-espresso/8 bg-paper"
              >
                <div className="relative h-[210px]">
                  <Image
                    src={room.image}
                    alt={room.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="font-serif text-xl font-semibold">
                    {room.name}
                  </span>
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-1.5 text-[13px] text-espresso/60">
                      <Users className="h-3.5 w-3.5" /> {room.capacity}
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px] text-espresso/60">
                      <BedDouble className="h-3.5 w-3.5" /> {room.bed}
                    </span>
                  </div>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {room.amenities.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[13px] text-espresso/70"
                      >
                        <Check className="h-3.5 w-3.5 text-terracotta" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-2.5 pt-4">
                    <span className="text-base font-bold text-terracotta">
                      {room.price} F CFA
                    </span>
                    <a
                      href={buildWaLink(
                        `Bonjour, je souhaite réserver une ${room.name} à l'Hôtel Résidence Aïcha.`
                      )}
                      className="rounded-full bg-terracotta px-5 py-2.5 text-[13.5px] font-semibold text-paper"
                    >
                      Réserver
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-[720px] text-[13px] text-espresso/50">
            Les noms de catégories sont indicatifs — chaque chambre a son
            propre agencement et sa propre décoration. Photos supplémentaires
            dans la{" "}
            <a href="/galerie" className="text-terracotta underline underline-offset-4">
              galerie
            </a>
            .
          </p>
        </Wrap>
      </section>

      {/* Autres chambres */}
      <section className="w-full">
        <Wrap className="pb-14 md:pb-[70px]">
          <div className="mb-8 max-w-xl">
            <Eyebrow>Et aussi</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              D&apos;autres chambres et espaces de l&apos;hôtel
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {moreRooms.map((room) => (
              <figure
                key={room.image}
                className="overflow-hidden rounded-[18px] border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]"
              >
                <div className="relative h-[190px]">
                  <Image
                    src={room.image}
                    alt={room.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-5 py-4 text-[14px] font-medium text-espresso/75">
                  {room.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={buildWaLink(
                "Bonjour, je souhaite connaître les disponibilités et tarifs des chambres de l'Hôtel Résidence Aïcha."
              )}
              className="flex items-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-[14px] font-semibold text-paper"
            >
              <MessageCircle className="h-4 w-4" />
              Demander les disponibilités
            </a>
            <a
              href="/galerie"
              className="text-[14px] font-semibold text-terracotta underline underline-offset-4"
            >
              Voir toute la galerie →
            </a>
          </div>
        </Wrap>
      </section>

      {/* Salles de bain */}
      <section className="w-full bg-panel py-16 md:py-[76px]">
        <Wrap>
          <div className="mb-8 max-w-xl">
            <Eyebrow>Salles de bain privées</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              Douche à l&apos;italienne et finitions en marbre
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative h-60 md:h-[340px] overflow-hidden rounded-[18px]">
              <Image
                src="/images/salle-bain-noire.jpg"
                alt="Salle de bain avec vasque suspendue et miroir"
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-60 md:h-[340px] overflow-hidden rounded-[18px]">
              <Image
                src="/images/salle-bain-marbre.jpg"
                alt="Salle de bain avec vasque, douche et finitions carrelées"
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </Wrap>
      </section>

      <CTABand
        heading="Une question sur une chambre ou une disponibilité ?"
        buttonLabel="Écrivez-nous sur WhatsApp"
        waMessage="Bonjour, j'ai une question sur les chambres de l'Hôtel Résidence Aïcha."
        greenButton
      />

      <Footer simple />
    </>
  );
}
