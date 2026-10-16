import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { CTABand } from "@/components/CTABand";

const photos = [
  {
    image: "/images/facade-principale.jpg",
    alt: "Façade de l'Hôtel Résidence Aïcha",
    caption: "Façade de l'hôtel",
  },
  {
    image: "/images/reception.jpg",
    alt: "Accueil et réception de l'Hôtel Résidence Aïcha",
    caption: "Accueil et réception",
  },
  {
    image: "/images/facade-soir.jpg",
    alt: "Façade de l'hôtel illuminée en soirée",
    caption: "Façade de l'hôtel — en soirée",
  },
  {
    image: "/images/facade-jour.jpg",
    alt: "Façade de l'hôtel en journée",
    caption: "Façade de l'hôtel — en journée",
  },
  {
    image: "/images/chambre-standard.jpg",
    alt: "Chambre Standard avec salle de bain ouverte attenante",
    caption: "Chambre Standard — ambiance épurée",
  },
  {
    image: "/images/chambre-confort.jpg",
    alt: "Chambre Confort — tête de lit capitonnée gris-bleu",
    caption: "Chambre Confort — tête de lit capitonnée",
  },
  {
    image: "/images/chambre-deluxe.jpg",
    alt: "Chambre Deluxe aux tons chaleureux avec tableau décoratif",
    caption: "Chambre Deluxe — ambiance chaleureuse",
  },
  {
    image: "/images/chambre-deluxe-2.jpg",
    alt: "Chambre Deluxe — autre vue",
    caption: "Chambre Deluxe — autre chambre",
  },
  {
    image: "/images/chambre-rose.jpg",
    alt: "Chambre aux tons rosés avec fauteuil doré",
    caption: "Chambre — tons rosés et touches dorées",
  },
  {
    image: "/images/chambre-jaune.jpg",
    alt: "Chambre avec coin bureau et téléviseur",
    caption: "Chambre — coin bureau et TV",
  },
  {
    image: "/images/chambre-corail.jpg",
    alt: "Chambre avec coin salon et rideaux cuivrés",
    caption: "Chambre — coin salon privatif",
  },
  {
    image: "/images/chambre-cosy.jpg",
    alt: "Chambre cosy aux tons chauds",
    caption: "Chambre — ambiance cosy",
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
  {
    image: "/images/salle-bain-noire.jpg",
    alt: "Salle de bain avec vasque suspendue",
    caption: "Salle de bain — vasque suspendue",
  },
  {
    image: "/images/salle-bain-marbre.jpg",
    alt: "Salle de bain en marbre clair avec douche pluie",
    caption: "Salle de bain — finitions en marbre clair",
  },
  {
    image: "/images/salle-bain-beige.jpg",
    alt: "Salle de bain aux tons beiges",
    caption: "Salle de bain — tons beiges",
  },
  {
    image: "/images/salle-bain-pluie.jpg",
    alt: "Salle de bain avec douche pluie et finitions en marbre",
    caption: "Salle de bain — douche à l'italienne",
  },
  {
    image: "/images/salon-cuisine.jpg",
    alt: "Espace salon avec canapés en cuir noir",
    caption: "Espace salon commun",
  },
  {
    image: "/images/salon-cuisine-2.jpg",
    alt: "Espace salon et cuisine commune",
    caption: "Espace salon et cuisine",
  },
  {
    image: "/images/couloir.jpg",
    alt: "Couloir et accès aux chambres",
    caption: "Couloir et accès aux chambres",
  },
];

export default function GaleriePage() {
  return (
    <>
      <Header current="galerie" />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        <Image
          src="/images/couloir.jpg"
          alt="Couloir et accès aux chambres de l'Hôtel Résidence Aïcha"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/75 via-espresso/50 to-espresso/10" />
        <Wrap className="relative">
          <Eyebrow light>Galerie photos</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            Un aperçu en images de l&apos;hôtel
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">
            Chambres, salles de bain, espaces communs et façade — toutes les
            photos ci-dessous sont celles du bâtiment, prises sur place à
            Tambacounda.
          </p>
        </Wrap>
      </section>

      {/* Masonry gallery */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {photos.map((photo) => (
              <figure
                key={photo.image + photo.caption}
                className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]"
              >
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1120px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <figcaption className="px-4 py-3 text-[12.5px] font-medium text-espresso/62">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </Wrap>
      </section>

      <CTABand
        heading="Ces photos vous donnent envie de réserver ?"
        buttonLabel="Écrivez-nous sur WhatsApp"
        waMessage="Bonjour, j'ai vu la galerie de l'Hôtel Résidence Aïcha et je souhaite réserver."
        greenButton
      />

      <Footer simple />
    </>
  );
}
