import Image from "next/image";
import Link from "next/link";
import { MapPin, Camera, Sparkles, Zap, Users, Star, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { Button } from "@/components/Button";
import { CTABand } from "@/components/CTABand";
import { buildWaLink } from "@/lib/whatsapp";
import { getContent } from "@/lib/content/store";
import { ContactContentSchema, RoomsContentSchema, GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT, DEFAULT_ROOMS_CONTENT, DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";

export const instant = false;

const trustItems = [
  { icon: MapPin, label: "Liberté Ouest, Tambacounda" },
  { icon: Camera, label: "Immeuble sous vidéosurveillance" },
  { icon: Sparkles, label: "Chambres climatisées et soignées" },
  { icon: Zap, label: "Réponse rapide sur WhatsApp" },
];

const testimonials = [
  {
    quote:
      "Une expérience mémorable au cœur de Tambacounda. La sérénité du lieu et la gentillesse de l'équipe en font le point de chute idéal pour explorer la région, avec un confort optimal.",
    author: "Avis vérifié",
  },
  {
    quote: "Meilleur hôtel de Tambacounda avec un accueil chaleureux et agréable.",
    author: "Avis Google",
  },
  {
    quote: "Belle surprise. Bon accueil, chambre propre, bon petit déjeuner.",
    author: "Avis Google",
  },
];

const reasons = [
  {
    icon: MapPin,
    title: "Emplacement pratique",
    text: "Situé à Liberté Ouest, à proximité des axes principaux de Tambacounda — facile à trouver, facile à rejoindre.",
  },
  {
    icon: Camera,
    title: "Sécurité et sérénité",
    text: "Couloirs et accès sous vidéosurveillance, pour un séjour l'esprit tranquille, seul, en famille ou entre collègues.",
  },
  {
    icon: Zap,
    title: "Réservation simple",
    text: "Un message sur WhatsApp suffit : nous confirmons votre disponibilité et votre chambre rapidement.",
  },
];

export default async function HomePage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  const featuredRooms = rooms.slice(0, 3);
  const previewPhotos = gallery.photos.slice(0, 5);
  return (
    <>
      <Header current="accueil" waNumber={contact.whatsappNumber} />

      {/* Hero */}
      <section className="relative w-full min-h-[480px] md:min-h-[620px] flex items-center overflow-hidden">
        <Image
          src="/images/facade-principale.jpg"
          alt="Façade de l'Hôtel Résidence Aïcha, Tambacounda"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/58 to-espresso/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/38 via-transparent to-transparent" />
        <Wrap className="relative w-full py-16 md:py-0">
          <div className="flex max-w-[560px] flex-col gap-6">
            <Eyebrow light>Bienvenue à Tambacounda</Eyebrow>
            <h1 className="font-serif text-[32px] md:text-[48px] font-medium leading-[1.1] text-paper">
              Un séjour chaleureux, au cœur de la ville
            </h1>
            <p className="max-w-[480px] text-[16.5px] leading-[1.7] text-paper/85">
              Chambres confortables, accueil attentionné et emplacement
              central — l&apos;Hôtel Résidence Aïcha vous reçoit comme chez
              vous, pour une nuit ou un long séjour.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-3.5">
              <Button
                href={buildWaLink(
                  "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
                  contact.whatsappNumber
                )}
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                Réserver ma chambre
              </Button>
              <Button href="/chambres" variant="ghost">
                Voir les chambres
              </Button>
            </div>
          </div>
        </Wrap>
      </section>

      {/* Intro strip */}
      <section className="w-full">
        <Wrap className="flex flex-wrap gap-14 py-14 md:py-[72px]">
          <div className="flex-[1_1_320px]">
            <Eyebrow>Notre hôtel</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              Un accueil sénégalais, pensé dans les moindres détails
            </h2>
          </div>
          <p className="mt-1.5 flex-[1_1_380px] text-base leading-[1.75] text-espresso/72">
            Situé dans le quartier Liberté Ouest à Tambacounda, l&apos;Hôtel
            Résidence Aïcha propose des chambres climatisées avec salle de
            bain privée, un immeuble sécurisé sous vidéosurveillance et une
            équipe joignable directement sur WhatsApp. Que vous soyez de
            passage pour affaires ou en famille, vous trouverez ici calme,
            propreté et un service attentif.
          </p>
        </Wrap>
      </section>

      {/* Trust strip */}
      <section className="w-full">
        <Wrap className="pb-14 md:pb-[72px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-espresso/10 bg-espresso/10">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col gap-2.5 bg-paper p-6 md:p-7">
                <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.6} />
                <span className="text-[14.5px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Rooms preview */}
      <section className="w-full">
        <Wrap className="pb-16 md:pb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow>Nos chambres</Eyebrow>
              <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
                Choisissez votre espace
              </h2>
            </div>
            <Link
              href="/chambres"
              className="text-[14.5px] font-semibold text-terracotta underline underline-offset-4"
            >
              Voir toutes les chambres →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredRooms.map((room) => (
              <Link
                key={room.id}
                href="/chambres"
                className="group flex flex-col overflow-hidden rounded-[18px] border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(36,27,18,0.14)]"
              >
                <div className="relative h-[210px] overflow-hidden">
                  <Image
                    src={room.image}
                    alt={room.imageAlt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2.5 p-5">
                  <span className="font-serif text-[19px] font-semibold">
                    {room.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13.5px] text-espresso/60">
                    <Users className="h-[15px] w-[15px]" /> {room.capacity}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Aperçu en images */}
      <section className="w-full">
        <Wrap className="pb-16 md:pb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow>En images</Eyebrow>
              <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
                Un aperçu de l&apos;hôtel
              </h2>
            </div>
            <Link
              href="/galerie"
              className="text-[14.5px] font-semibold text-terracotta underline underline-offset-4"
            >
              Voir toute la galerie →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:h-[520px] md:grid-cols-4 md:grid-rows-2 md:[&>*:first-child]:col-span-2 md:[&>*:first-child]:row-span-2">
            {previewPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={
                  index === 0
                    ? "relative h-56 overflow-hidden rounded-2xl md:h-full"
                    : "relative h-40 overflow-hidden rounded-2xl md:h-full"
                }
              >
                <Image
                  src={photo.image}
                  alt={photo.imageAlt}
                  fill
                  sizes={index === 0 ? "(max-width: 860px) 50vw, 50vw" : "(max-width: 860px) 50vw, 25vw"}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="w-full bg-panel py-16 md:py-20">
        <Wrap>
          <div className="mb-9 max-w-xl">
            <Eyebrow>Pourquoi choisir l&apos;Hôtel Résidence Aïcha</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              Un établissement pensé pour votre tranquillité
            </h2>
          </div>
          <div className="grid gap-9 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col gap-3">
                <Icon className="h-[26px] w-[26px] text-terracotta" strokeWidth={1.6} />
                <span className="font-serif text-[17.5px] font-semibold">
                  {title}
                </span>
                <p className="text-sm leading-[1.65] text-espresso/68">{text}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* Testimonials */}
      <section
        id="avis"
        className="w-full scroll-mt-6 bg-espresso py-16 md:py-20"
      >
        <Wrap>
          <div className="mb-9">
            <Eyebrow light>Avis clients</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium text-paper leading-[1.2]">
              Ce que disent nos voyageurs
            </h2>
            <p className="mt-3 max-w-[520px] text-sm text-paper/50">
              Noté 4,2/5 sur Google (45 avis) — extraits parmi les
              retours de nos clients.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex flex-col gap-3.5 rounded-2xl border border-paper/12 bg-paper/6 p-6"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-[14.5px] italic leading-[1.65] text-paper/55">« {t.quote} »</p>
                <span className="text-[13px] font-semibold text-paper/40">— {t.author}</span>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      <CTABand
        heading="Prêt à réserver votre séjour à l'Hôtel Résidence Aïcha ?"
        buttonLabel="Contactez-nous sur WhatsApp"
        waMessage="Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda."
        waNumber={contact.whatsappNumber}
        size="large"
        greenButton
      />

      <Footer phoneDisplay={contact.phoneDisplay} email={contact.email} />
    </>
  );
}
