import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Hôtel Résidence Aïcha — Tambacounda",
  description:
    "Chambres confortables, accueil attentionné et emplacement central à Tambacounda. Réservez directement sur WhatsApp.",
};

const hotelJsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "Hôtel Résidence Aïcha",
  url: "https://www.hotelaicha.com",
  image: "https://www.hotelaicha.com/images/facade-principale.jpg",
  telephone: "+221781292929",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Liberté Ouest, Lot 636",
    addressLocality: "Tambacounda",
    addressCountry: "SN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 13.7829886,
    longitude: -13.6765597,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
