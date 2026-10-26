import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content/store";
import { GlobalContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT } from "@/lib/content/defaults";

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

export async function generateMetadata(): Promise<Metadata> {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  return {
    metadataBase: new URL("https://www.hotelaicha.com"),
    title: global.seoTitle,
    description: global.seoDescription,
    verification: { google: "PXQHZWp-NKDno6S0G8x8dnzCDQoBGpMK7iXVQcOfRBs" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Hôtel Résidence Aïcha",
    url: "https://www.hotelaicha.com",
    image: "https://www.hotelaicha.com/images/facade-principale.jpg",
    telephone: `+${global.phoneNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: global.addressLine1,
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
