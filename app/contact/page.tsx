import Image from "next/image";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Wrap } from "@/components/Wrap";
import { Eyebrow } from "@/components/Eyebrow";
import { Button } from "@/components/Button";
import { CTABand } from "@/components/CTABand";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { buildWaLink } from "@/lib/whatsapp";
import { getContent } from "@/lib/content/store";
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";
import { ICONS } from "@/lib/content/icons";

export const instant = false;

export default async function ContactPage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  return (
    <>
      <Header current="contact" waNumber={contact.whatsappNumber} />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        <Image
          src="/images/facade-jour.jpg"
          alt="Façade de l'Hôtel Résidence Aïcha en journée"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/65 via-espresso/40 to-espresso/8" />
        <Wrap className="relative">
          <Eyebrow light>{contact.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[640px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {contact.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{contact.heroText}</p>
        </Wrap>
      </section>

      {/* Services */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="mb-8 max-w-xl">
            <Eyebrow>Services &amp; équipements</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              Pensés pour un séjour sans souci
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {contact.services.map(({ icon, title, text }) => {
              const Icon = ICONS[icon];
              return (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-2xl border border-espresso/8 bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(36,27,18,0.1)]"
              >
                <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.6} />
                <span className="text-[15px] font-semibold">{title}</span>
                <p className="text-[13.5px] leading-[1.6] text-espresso/62">
                  {text}
                </p>
              </div>
              );
            })}
          </div>
          <p className="mt-6 max-w-[720px] text-[13px] text-espresso/50">
            D&apos;autres services (parking, blanchisserie) peuvent être
            disponibles selon la chambre — n&apos;hésitez pas à nous le
            demander directement sur WhatsApp.
          </p>
        </Wrap>
      </section>

      {/* Localisation */}
      <section className="w-full bg-panel py-16 md:py-20">
        <Wrap>
          <div className="mx-auto mb-10 max-w-xl text-center">
            <div className="mb-3.5 flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-espresso/25" />
              <Eyebrow>Localisation</Eyebrow>
              <span className="h-px w-10 bg-espresso/25" />
            </div>
            <h2 className="font-serif text-[30px] md:text-[38px] font-medium leading-[1.2]">
              Nous trouver
            </h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-espresso/65">
              L&apos;Hôtel Résidence Aïcha est idéalement situé à
              Tambacounda, facilement accessible en voiture et en transport.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-espresso/10 bg-paper md:grid md:grid-cols-2">
            {/* Info card */}
            <div className="flex flex-col gap-6 p-8 md:p-10">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-paper">
                  <MapPin className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="font-serif text-[20px] font-semibold">
                    Hôtel Résidence Aïcha
                  </span>
                  <span className="text-[14px] leading-[1.5] text-espresso/65">
                    {contact.addressLine1}
                    <br />
                    {contact.addressLine2}
                  </span>
                </div>
              </div>

              <div className="border-t border-espresso/10" />

              <div className="flex flex-col gap-5">
                <a
                  href={`tel:${contact.phoneDisplay.replace(/\s/g, "")}`}
                  className="flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/12 text-terracotta">
                    <Phone className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[13px] font-semibold text-espresso/50">
                      Téléphone
                    </span>
                    <span className="text-[15px] font-medium">
                      {contact.phoneDisplay}
                    </span>
                  </span>
                </a>

                <a
                  href={buildWaLink(
                    "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
                    contact.whatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
                    <WhatsappIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[13px] font-semibold text-espresso/50">
                      WhatsApp
                    </span>
                    <span className="text-[15px] font-medium">
                      {contact.whatsappDisplay}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/12 text-terracotta">
                    <Mail className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[13px] font-semibold text-espresso/50">
                      Email
                    </span>
                    <span className="text-[15px] font-medium">
                      {contact.email}
                    </span>
                  </span>
                </a>
              </div>

              <a
                href={contact.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2.5 rounded-full bg-espresso px-6 py-4 text-[14.5px] font-bold text-paper transition-opacity duration-200 hover:opacity-85"
              >
                <MapPin className="h-[18px] w-[18px]" />
                Itinéraire sur Google Maps
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Map embed */}
            <div className="relative min-h-[320px] md:min-h-full">
              <iframe
                src={contact.mapsEmbedUrl}
                title="Localisation de l'Hôtel Résidence Aïcha sur Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </Wrap>
      </section>

      {/* Réservation */}
      <section className="w-full">
        <Wrap className="py-16 md:py-[76px]">
          <div className="mb-9 max-w-xl">
            <Eyebrow>Comment réserver</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              Trois étapes, aucune complication
            </h2>
          </div>
          <div className="flex flex-wrap gap-8">
            {contact.steps.map(({ icon, title, text }, i) => {
              const Icon = ICONS[icon];
              return (
                <div key={title} className="flex flex-[1_1_220px] flex-col gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta font-serif text-[17px] font-semibold text-paper">
                    {i + 1}
                  </span>
                  <span className="flex items-center gap-2 font-serif text-[17px] font-semibold">
                    <Icon className="h-[18px] w-[18px] text-terracotta" />
                    {title}
                  </span>
                  <p className="text-sm leading-[1.65] text-espresso/65">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </Wrap>
      </section>

      {/* CTA band with phone number */}
      <section className="w-full bg-terracotta px-5 md:px-8 py-16">
        <Wrap className="flex flex-wrap items-center justify-between gap-6 !px-0">
          <h2 className="max-w-xl font-serif text-[26px] font-medium text-paper">
            Parlons de votre séjour à Tambacounda
          </h2>
          <Button
            href={buildWaLink(
              "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
              contact.whatsappNumber
            )}
            variant="whatsapp"
          >
            <WhatsappIcon className="h-[18px] w-[18px]" />
            {contact.whatsappDisplay}
          </Button>
        </Wrap>
      </section>

      <Footer phoneDisplay={contact.phoneDisplay} email={contact.email} />
    </>
  );
}
