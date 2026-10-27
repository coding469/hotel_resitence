import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content/store";
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hotelaicha.com"),
  title: "Hôtel Résidence Aïcha — Chambres type appartement à Tambacounda",
  description:
    "Chambres indépendantes avec salle de bain privée et climatisation, un confort proche de l'appartement meublé, au cœur de Tambacounda. Réservez directement sur WhatsApp.",
  verification: {
    google: ["PXQHZWp-NKDno6S0G8x8dnzCDQoBGpMK7iXVQcOfRBs", "yCWOePPmGycDLBkh0i3kO9fM4W8cvmMdsy8yvPry_DE"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Hôtel Résidence Aïcha",
    url: "https://www.hotelaicha.com",
    image: "https://www.hotelaicha.com/images/facade-principale.jpg",
    telephone: `+${contact.phoneNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.addressLine1,
      addressLocality: "Tambacounda",
      addressCountry: "SN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 13.7829886, longitude: -13.6765597 },
  };

  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${workSans.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-cream text-espresso font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
