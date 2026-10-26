import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { CTABand } from "@/components/CTABand";
import { getContent } from "@/lib/content/store";
import { ContactContentSchema, GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT, DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";

export const instant = false;

export default async function GaleriePage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  return (
    <>
      <Header current="galerie" waNumber={contact.whatsappNumber} />

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
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/65 via-espresso/40 to-espresso/8" />
        <Wrap className="relative">
          <Eyebrow light>{gallery.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {gallery.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{gallery.heroText}</p>
        </Wrap>
      </section>

      {/* Masonry gallery */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {gallery.photos.map((photo) => (
              <figure
                key={photo.id}
                className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]"
              >
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={photo.image}
                    alt={photo.imageAlt}
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
        waNumber={contact.whatsappNumber}
        greenButton
      />

      <Footer simple />
    </>
  );
}
