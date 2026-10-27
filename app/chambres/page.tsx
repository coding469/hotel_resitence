import Image from "next/image";
import { Users, BedDouble, Check, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { CTABand } from "@/components/CTABand";
import { buildWaLink } from "@/lib/whatsapp";
import { getContent } from "@/lib/content/store";
import { ContactContentSchema, RoomsContentSchema, ChambresPageContentSchema } from "@/lib/content/schemas";
import {
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_ROOMS_CONTENT,
  DEFAULT_CHAMBRES_PAGE_CONTENT,
} from "@/lib/content/defaults";

export const instant = false;

export default async function ChambresPage() {
  const [contact, rooms, chambresPage] = await Promise.all([
    getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT),
    getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT),
    getContent("chambresPage", ChambresPageContentSchema, DEFAULT_CHAMBRES_PAGE_CONTENT),
  ]);
  return (
    <>
      <Header current="chambres" waNumber={contact.whatsappNumber} />

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
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/82 via-espresso/60 to-espresso/25" />
        <Wrap className="relative">
          <Eyebrow light>{chambresPage.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {chambresPage.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{chambresPage.heroText}</p>
        </Wrap>
      </section>

      {/* Rooms grid */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="grid gap-6 md:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col overflow-hidden rounded-[18px] border border-espresso/8 bg-paper"
              >
                <div className="relative h-[210px]">
                  <Image
                    src={room.image}
                    alt={room.imageAlt}
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
                  {room.description && (
                    <p className="text-[13px] leading-[1.6] text-espresso/65">{room.description}</p>
                  )}
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
                  <div className="mt-auto pt-4">
                    <a
                      href={buildWaLink(
                        `Bonjour, je souhaite réserver une ${room.name} à l'Hôtel Résidence Aïcha.`,
                        contact.whatsappNumber
                      )}
                      className="block w-full rounded-full bg-terracotta px-5 py-2.5 text-center text-[13.5px] font-semibold text-paper"
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
            {chambresPage.moreRooms.map((room) => (
              <figure
                key={room.id}
                className="overflow-hidden rounded-[18px] border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]"
              >
                <div className="relative h-[190px]">
                  <Image
                    src={room.image}
                    alt={room.imageAlt}
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
                "Bonjour, je souhaite connaître les disponibilités et tarifs des chambres de l'Hôtel Résidence Aïcha.",
                contact.whatsappNumber
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
            <Eyebrow>{chambresPage.bathroomEyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              {chambresPage.bathroomTitle}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative h-60 md:h-[340px] overflow-hidden rounded-[18px]">
              <Image
                src={chambresPage.bathroomImage1}
                alt={chambresPage.bathroomImage1Alt}
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-60 md:h-[340px] overflow-hidden rounded-[18px]">
              <Image
                src={chambresPage.bathroomImage2}
                alt={chambresPage.bathroomImage2Alt}
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
        waNumber={contact.whatsappNumber}
        greenButton
      />

      <Footer simple />
    </>
  );
}
