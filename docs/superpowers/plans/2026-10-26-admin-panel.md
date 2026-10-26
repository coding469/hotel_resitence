# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the client full self-service control over the site's text and images via a password-protected `/admin` section, backed by Upstash Redis (text) and Vercel Blob (images), per `docs/superpowers/specs/2026-10-26-admin-panel-design.md`.

**Architecture:** Every public page reads its content from a typed, Zod-validated key-value store with hardcoded fallbacks (so the site never breaks), instead of local hardcoded arrays. A single-password-protected `/admin` area, gated by `middleware.ts` + a signed cookie, provides one form per content key, writing back through the same validated store and calling `revalidatePath` for instant updates.

**Tech Stack:** Next.js 16 App Router (existing), `@upstash/redis`, `@vercel/blob`, `zod`, `vitest` (new).

> **Note:** The spec (written 2026-10-26) names "Vercel KV" throughout, following Vercel's naming at the time. Vercel KV was deprecated during Task 1 of this implementation in favor of Upstash Redis — the same underlying service, reachable via the Vercel Marketplace integration, with a near-identical `get`/`set` API. This plan uses `@upstash/redis`; treat every "KV" reference below as the same architecture, just with that package.

## Global Constraints

- No third-party CMS — custom Redis/Blob only (spec §Approach).
- Single shared admin password via `ADMIN_PASSWORD` env var; session cookie signed with `ADMIN_SECRET` (spec §2).
- Icons stay fixed in code; only text is editable (spec §1).
- One shared `content:rooms` list; homepage shows the first 3, `/chambres` shows all (spec §1, §3).
- Image MIME allowlist: jpeg/png/webp; max 5 MB (spec §4).
- Deletes in admin UI require a two-click "Confirm?" state, never `window.confirm()` (spec §3).
- No per-user accounts, no automated E2E tests, no automatic cleanup of replaced Blob images (spec §Out of Scope).

---

## Task 1: Dependencies & Test Tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `lib/content/__smoke__.test.ts` (deleted again at the end of this task — only proves the runner works)

**Interfaces:**
- Produces: `npm run test` command that later tasks rely on.

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install @upstash/redis @vercel/blob zod
npm install -D vitest
```

- [ ] **Step 2: Add test script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 4: Write a throwaway smoke test**

`lib/content/__smoke__.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it and confirm it passes, then delete the file**

Run: `npm run test`
Expected: 1 test passes.

Then delete `lib/content/__smoke__.test.ts` — it was only there to prove the runner works; Task 2 adds the real tests.

- [ ] **Step 6: Document required env vars**

Create `.env.example` at the repo root:
```
ADMIN_PASSWORD=change-me
ADMIN_SECRET=change-me-too-a-long-random-string
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BLOB_READ_WRITE_TOKEN=
```
(`.env*` is already gitignored — this example file documents the shape without real secrets. `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`/`BLOB_READ_WRITE_TOKEN` are populated automatically by Vercel when the Upstash Redis integration and a Blob store are linked to the project; `ADMIN_PASSWORD`/`ADMIN_SECRET` must be set manually in the Vercel dashboard and locally.)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .env.example
git commit -m "Add zod, Upstash Redis, Vercel Blob, and Vitest for the admin panel"
```

---

## Task 2: Content Schemas & Defaults

**Files:**
- Create: `lib/content/schemas.ts`
- Create: `lib/content/defaults.ts`
- Test: `lib/content/schemas.test.ts`

**Interfaces:**
- Produces: `IconKey`, `GlobalContentSchema`/`GlobalContent`, `RoomSchema`/`Room`, `RoomsContentSchema`/`RoomsContent`, `GalleryContentSchema`/`GalleryContent`, `HomeContentSchema`/`HomeContent`, `ChambresPageContentSchema`/`ChambresPageContent`, `ContactContentSchema`/`ContactContent` — every later task imports these exact names from `lib/content/schemas.ts`. `DEFAULT_GLOBAL_CONTENT`, `DEFAULT_ROOMS_CONTENT`, `DEFAULT_GALLERY_CONTENT`, `DEFAULT_HOME_CONTENT`, `DEFAULT_CHAMBRES_PAGE_CONTENT`, `DEFAULT_CONTACT_CONTENT` from `lib/content/defaults.ts`.

- [ ] **Step 1: Write the failing test**

`lib/content/schemas.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  GlobalContentSchema,
  RoomsContentSchema,
  GalleryContentSchema,
  HomeContentSchema,
  ChambresPageContentSchema,
  ContactContentSchema,
} from "./schemas";
import {
  DEFAULT_GLOBAL_CONTENT,
  DEFAULT_ROOMS_CONTENT,
  DEFAULT_GALLERY_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_CHAMBRES_PAGE_CONTENT,
  DEFAULT_CONTACT_CONTENT,
} from "./defaults";

describe("content defaults match their schemas", () => {
  it("validates global content", () => {
    expect(GlobalContentSchema.safeParse(DEFAULT_GLOBAL_CONTENT).success).toBe(true);
  });
  it("validates rooms content and requires 6 default rooms", () => {
    const result = RoomsContentSchema.safeParse(DEFAULT_ROOMS_CONTENT);
    expect(result.success).toBe(true);
    expect(DEFAULT_ROOMS_CONTENT).toHaveLength(6);
  });
  it("validates gallery content", () => {
    expect(GalleryContentSchema.safeParse(DEFAULT_GALLERY_CONTENT).success).toBe(true);
  });
  it("validates home content", () => {
    expect(HomeContentSchema.safeParse(DEFAULT_HOME_CONTENT).success).toBe(true);
  });
  it("validates chambres page content", () => {
    expect(ChambresPageContentSchema.safeParse(DEFAULT_CHAMBRES_PAGE_CONTENT).success).toBe(true);
  });
  it("validates contact content", () => {
    expect(ContactContentSchema.safeParse(DEFAULT_CONTACT_CONTENT).success).toBe(true);
  });
  it("rejects a room missing a required field", () => {
    const bad = [{ ...DEFAULT_ROOMS_CONTENT[0], name: "" }];
    expect(RoomsContentSchema.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- schemas`
Expected: FAIL — `./schemas` and `./defaults` don't exist yet.

- [ ] **Step 3: Write `lib/content/schemas.ts`**

```ts
import { z } from "zod";

export const IconKey = z.enum([
  "mapPin",
  "camera",
  "sparkles",
  "zap",
  "snowflake",
  "wifi",
  "coffee",
  "showerHead",
  "shieldCheck",
  "sofa",
  "heartHandshake",
  "messageCircle",
  "calendarCheck",
  "keyRound",
]);
export type IconKey = z.infer<typeof IconKey>;

export const GlobalContentSchema = z.object({
  phoneNumber: z.string().min(6),
  phoneDisplay: z.string().min(6),
  whatsappNumber: z.string().min(6),
  whatsappDisplay: z.string().min(6),
  email: z.string().email(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().min(1),
  mapsSearchUrl: z.string().url(),
  mapsEmbedUrl: z.string().url(),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
});
export type GlobalContent = z.infer<typeof GlobalContentSchema>;

export const RoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capacity: z.string().min(1),
  bed: z.string().min(1),
  amenities: z.array(z.string().min(1)),
  description: z.string(),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
});
export type Room = z.infer<typeof RoomSchema>;
export const RoomsContentSchema = z.array(RoomSchema);
export type RoomsContent = z.infer<typeof RoomsContentSchema>;

export const GalleryPhotoSchema = z.object({
  id: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  caption: z.string().min(1),
});
export type GalleryPhoto = z.infer<typeof GalleryPhotoSchema>;
export const GalleryContentSchema = z.object({
  heroEyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroText: z.string().min(1),
  photos: z.array(GalleryPhotoSchema),
});
export type GalleryContent = z.infer<typeof GalleryContentSchema>;

export const TrustItemSchema = z.object({ icon: IconKey, label: z.string().min(1) });
export const ReasonSchema = z.object({
  icon: IconKey,
  title: z.string().min(1),
  text: z.string().min(1),
});
export const TestimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
});

export const HomeContentSchema = z.object({
  heroEyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroText: z.string().min(1),
  introEyebrow: z.string().min(1),
  introTitle: z.string().min(1),
  introText: z.string().min(1),
  trustItems: z.array(TrustItemSchema),
  reasons: z.array(ReasonSchema),
  testimonials: z.array(TestimonialSchema),
});
export type HomeContent = z.infer<typeof HomeContentSchema>;

export const MoreRoomPhotoSchema = z.object({
  id: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  caption: z.string().min(1),
});
export const ChambresPageContentSchema = z.object({
  heroEyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroText: z.string().min(1),
  moreRooms: z.array(MoreRoomPhotoSchema),
  bathroomEyebrow: z.string().min(1),
  bathroomTitle: z.string().min(1),
  bathroomImage1: z.string().min(1),
  bathroomImage1Alt: z.string().min(1),
  bathroomImage2: z.string().min(1),
  bathroomImage2Alt: z.string().min(1),
});
export type ChambresPageContent = z.infer<typeof ChambresPageContentSchema>;

export const ServiceSchema = z.object({
  icon: IconKey,
  title: z.string().min(1),
  text: z.string().min(1),
});
export const StepSchema = z.object({
  icon: IconKey,
  title: z.string().min(1),
  text: z.string().min(1),
});
export const ContactContentSchema = z.object({
  heroEyebrow: z.string().min(1),
  heroTitle: z.string().min(1),
  heroText: z.string().min(1),
  services: z.array(ServiceSchema),
  steps: z.array(StepSchema),
});
export type ContactContent = z.infer<typeof ContactContentSchema>;
```

- [ ] **Step 4: Write `lib/content/defaults.ts`**

```ts
import type {
  GlobalContent,
  RoomsContent,
  GalleryContent,
  HomeContent,
  ChambresPageContent,
  ContactContent,
} from "./schemas";

export const DEFAULT_GLOBAL_CONTENT: GlobalContent = {
  phoneNumber: "221781292929",
  phoneDisplay: "+221 78 129 29 29",
  whatsappNumber: "221781608275",
  whatsappDisplay: "+221 78 160 82 75",
  email: "hotelaicha.tamba@gmail.com",
  addressLine1: "Liberté Ouest, Lot 636",
  addressLine2: "Tambacounda 26000, Sénégal",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=H%C3%B4tel%20R%C3%A9sidence%20A%C3%AFcha%2C%20Libert%C3%A9%20Ouest%2C%20Lot%20636%2C%20Tambacounda%2C%20S%C3%A9n%C3%A9gal",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=H%C3%B4tel%20R%C3%A9sidence%20A%C3%AFcha%2C%20Libert%C3%A9%20Ouest%2C%20Lot%20636%2C%20Tambacounda%2C%20S%C3%A9n%C3%A9gal&output=embed",
  seoTitle: "Hôtel Résidence Aïcha — Tambacounda",
  seoDescription:
    "Chambres confortables, accueil attentionné et emplacement central à Tambacounda. Réservez directement sur WhatsApp.",
};

export const DEFAULT_ROOMS_CONTENT: RoomsContent = [
  {
    id: "standard",
    name: "Chambre Standard",
    capacity: "2 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Salle de bain privée", "Rangement et miroir"],
    description: "",
    image: "/images/chambre-standard.jpg",
    imageAlt: "Chambre Standard — lit double, tête de lit en bois sombre, literie blanche",
  },
  {
    id: "confort",
    name: "Chambre Confort",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Liseuses de chevet", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-confort.jpg",
    imageAlt: "Chambre Confort — tête de lit capitonnée gris-bleu, liseuses intégrées, tableau décoratif",
  },
  {
    id: "deluxe",
    name: "Chambre Deluxe",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Armoire avec miroir", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-deluxe.jpg",
    imageAlt: "Chambre Deluxe — ambiance chaleureuse, tons chauds, armoire miroir",
  },
  {
    id: "cosy",
    name: "Chambre Cosy",
    capacity: "2 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Coin salon", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-cosy.jpg",
    imageAlt: "Chambre Cosy — ambiance chaleureuse aux tons chauds, coin salon",
  },
  {
    id: "rosee",
    name: "Chambre Rosée",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Décoration soignée", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-rose.jpg",
    imageAlt: "Chambre Rosée — tons rosés, fauteuil doré, décoration soignée",
  },
  {
    id: "prestige",
    name: "Chambre Prestige",
    capacity: "2–3 pers.",
    bed: "1 lit double",
    amenities: ["Climatisation", "Tête de lit capitonnée", "Salle de bain privée"],
    description: "",
    image: "/images/chambre-deluxe-2.jpg",
    imageAlt: "Chambre Prestige — tête de lit capitonnée, ambiance chaleureuse",
  },
];

export const DEFAULT_GALLERY_CONTENT: GalleryContent = {
  heroEyebrow: "Galerie photos",
  heroTitle: "Un aperçu en images de l'hôtel",
  heroText:
    "Chambres, salles de bain, espaces communs et façade — toutes les photos ci-dessous sont celles du bâtiment, prises sur place à Tambacounda.",
  photos: [
    { id: "facade-principale", image: "/images/facade-principale.jpg", imageAlt: "Façade de l'Hôtel Résidence Aïcha", caption: "Façade de l'hôtel" },
    { id: "reception", image: "/images/reception.jpg", imageAlt: "Accueil et réception de l'Hôtel Résidence Aïcha", caption: "Accueil et réception" },
    { id: "facade-soir", image: "/images/facade-soir.jpg", imageAlt: "Façade de l'hôtel illuminée en soirée", caption: "Façade de l'hôtel — en soirée" },
    { id: "facade-jour", image: "/images/facade-jour.jpg", imageAlt: "Façade de l'hôtel en journée", caption: "Façade de l'hôtel — en journée" },
    { id: "chambre-standard", image: "/images/chambre-standard.jpg", imageAlt: "Chambre Standard avec salle de bain ouverte attenante", caption: "Chambre Standard — ambiance épurée" },
    { id: "chambre-confort", image: "/images/chambre-confort.jpg", imageAlt: "Chambre Confort — tête de lit capitonnée gris-bleu", caption: "Chambre Confort — tête de lit capitonnée" },
    { id: "chambre-deluxe", image: "/images/chambre-deluxe.jpg", imageAlt: "Chambre Deluxe aux tons chaleureux avec tableau décoratif", caption: "Chambre Deluxe — ambiance chaleureuse" },
    { id: "chambre-deluxe-2", image: "/images/chambre-deluxe-2.jpg", imageAlt: "Chambre Deluxe — autre vue", caption: "Chambre Deluxe — autre chambre" },
    { id: "chambre-rose", image: "/images/chambre-rose.jpg", imageAlt: "Chambre aux tons rosés avec fauteuil doré", caption: "Chambre — tons rosés et touches dorées" },
    { id: "chambre-jaune", image: "/images/chambre-jaune.jpg", imageAlt: "Chambre avec coin bureau et téléviseur", caption: "Chambre — coin bureau et TV" },
    { id: "chambre-corail", image: "/images/chambre-corail.jpg", imageAlt: "Chambre avec coin salon et rideaux cuivrés", caption: "Chambre — coin salon privatif" },
    { id: "chambre-cosy", image: "/images/chambre-cosy.jpg", imageAlt: "Chambre cosy aux tons chauds", caption: "Chambre — ambiance cosy" },
    { id: "chambre-placard", image: "/images/chambre-placard.jpg", imageAlt: "Rangement intégré avec penderie et bureau", caption: "Rangement intégré et coin bureau" },
    { id: "chambre-rangement", image: "/images/chambre-rangement.jpg", imageAlt: "Armoire intégrée avec mini-réfrigérateur", caption: "Armoire intégrée et mini-bar" },
    { id: "salle-bain-noire", image: "/images/salle-bain-noire.jpg", imageAlt: "Salle de bain avec vasque suspendue", caption: "Salle de bain — vasque suspendue" },
    { id: "salle-bain-marbre", image: "/images/salle-bain-marbre.jpg", imageAlt: "Salle de bain en marbre clair avec douche pluie", caption: "Salle de bain — finitions en marbre clair" },
    { id: "salle-bain-beige", image: "/images/salle-bain-beige.jpg", imageAlt: "Salle de bain aux tons beiges", caption: "Salle de bain — tons beiges" },
    { id: "salle-bain-pluie", image: "/images/salle-bain-pluie.jpg", imageAlt: "Salle de bain avec douche pluie et finitions en marbre", caption: "Salle de bain — douche à l'italienne" },
    { id: "salon-cuisine", image: "/images/salon-cuisine.jpg", imageAlt: "Espace salon avec canapés en cuir noir", caption: "Espace salon commun" },
    { id: "salon-cuisine-2", image: "/images/salon-cuisine-2.jpg", imageAlt: "Espace salon et cuisine commune", caption: "Espace salon et cuisine" },
    { id: "couloir", image: "/images/couloir.jpg", imageAlt: "Couloir et accès aux chambres", caption: "Couloir et accès aux chambres" },
  ],
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow: "Bienvenue à Tambacounda",
  heroTitle: "Un séjour chaleureux, au cœur de la ville",
  heroText:
    "Chambres confortables, accueil attentionné et emplacement central — l'Hôtel Résidence Aïcha vous reçoit comme chez vous, pour une nuit ou un long séjour.",
  introEyebrow: "Notre hôtel",
  introTitle: "Un accueil sénégalais, pensé dans les moindres détails",
  introText:
    "Situé dans le quartier Liberté Ouest à Tambacounda, l'Hôtel Résidence Aïcha propose des chambres climatisées avec salle de bain privée, un immeuble sécurisé sous vidéosurveillance et une équipe joignable directement sur WhatsApp. Que vous soyez de passage pour affaires ou en famille, vous trouverez ici calme, propreté et un service attentif.",
  trustItems: [
    { icon: "mapPin", label: "Liberté Ouest, Tambacounda" },
    { icon: "camera", label: "Immeuble sous vidéosurveillance" },
    { icon: "sparkles", label: "Chambres climatisées et soignées" },
    { icon: "zap", label: "Réponse rapide sur WhatsApp" },
  ],
  reasons: [
    {
      icon: "mapPin",
      title: "Emplacement pratique",
      text: "Situé à Liberté Ouest, à proximité des axes principaux de Tambacounda — facile à trouver, facile à rejoindre.",
    },
    {
      icon: "camera",
      title: "Sécurité et sérénité",
      text: "Couloirs et accès sous vidéosurveillance, pour un séjour l'esprit tranquille, seul, en famille ou entre collègues.",
    },
    {
      icon: "zap",
      title: "Réservation simple",
      text: "Un message sur WhatsApp suffit : nous confirmons votre disponibilité et votre chambre rapidement.",
    },
  ],
  testimonials: [
    {
      quote:
        "Une expérience mémorable au cœur de Tambacounda. La sérénité du lieu et la gentillesse de l'équipe en font le point de chute idéal pour explorer la région, avec un confort optimal.",
      author: "Avis vérifié",
    },
    { quote: "Meilleur hôtel de Tambacounda avec un accueil chaleureux et agréable.", author: "Avis Google" },
    { quote: "Belle surprise. Bon accueil, chambre propre, bon petit déjeuner.", author: "Avis Google" },
  ],
};

export const DEFAULT_CHAMBRES_PAGE_CONTENT: ChambresPageContent = {
  heroEyebrow: "Nos chambres",
  heroTitle: "Un espace confortable pour chaque type de séjour",
  heroText:
    "Toutes nos chambres sont climatisées et disposent d'une salle de bain privée. Les tarifs vous sont confirmés directement sur WhatsApp selon la durée du séjour.",
  moreRooms: [
    { id: "coin-salon", image: "/images/chambre-corail.jpg", imageAlt: "Chambre avec coin salon privatif et rideaux cuivrés", caption: "Chambre avec coin salon privatif" },
    { id: "coin-bureau", image: "/images/chambre-jaune.jpg", imageAlt: "Chambre avec coin bureau et téléviseur", caption: "Chambre avec coin bureau" },
    { id: "espace-salon", image: "/images/salon-cuisine.jpg", imageAlt: "Espace salon commun avec canapés en cuir noir", caption: "Espace salon commun" },
    { id: "couloir", image: "/images/couloir.jpg", imageAlt: "Couloir et accès aux chambres", caption: "Couloir et accès aux chambres" },
    { id: "rangement", image: "/images/chambre-placard.jpg", imageAlt: "Rangement intégré avec penderie et bureau", caption: "Rangement intégré et coin bureau" },
    { id: "mini-bar", image: "/images/chambre-rangement.jpg", imageAlt: "Armoire intégrée avec mini-réfrigérateur", caption: "Armoire intégrée et mini-bar" },
  ],
  bathroomEyebrow: "Salles de bain privées",
  bathroomTitle: "Douche à l'italienne et finitions en marbre",
  bathroomImage1: "/images/salle-bain-noire.jpg",
  bathroomImage1Alt: "Salle de bain avec vasque suspendue et miroir",
  bathroomImage2: "/images/salle-bain-marbre.jpg",
  bathroomImage2Alt: "Salle de bain avec vasque, douche et finitions carrelées",
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  heroEyebrow: "Services, localisation & contact",
  heroTitle: "Tout ce qu'il faut savoir avant votre arrivée",
  heroText: "Nos équipements, notre adresse exacte et la marche à suivre pour réserver votre chambre à Tambacounda.",
  services: [
    { icon: "snowflake", title: "Climatisation", text: "Présente dans toutes les chambres." },
    { icon: "wifi", title: "Wi-Fi très haut débit", text: "Connexion rapide dans tout l'hôtel." },
    { icon: "coffee", title: "Petit déjeuner", text: "Servi chaque matin pour bien démarrer la journée." },
    { icon: "showerHead", title: "Salle de bain privée", text: "Douche à l'italienne, finitions en marbre dans chaque chambre." },
    { icon: "shieldCheck", title: "Gardien & sécurité", text: "Environnement sécurisé avec gardien et vidéosurveillance." },
    { icon: "sofa", title: "Espace salon & cuisine", text: "Un espace commun chaleureux, pour se détendre entre deux visites." },
    { icon: "heartHandshake", title: "Accueil chaleureux", text: "La chaleur de l'hospitalité sénégalaise, à chaque étape du séjour." },
    { icon: "messageCircle", title: "Contact direct WhatsApp", text: "Une question, une demande spéciale ? Nous répondons rapidement." },
    { icon: "mapPin", title: "Emplacement central", text: "Quartier Liberté Ouest, facile d'accès à Tambacounda." },
  ],
  steps: [
    { icon: "messageCircle", title: "Écrivez-nous", text: "Contactez-nous sur WhatsApp avec vos dates et le type de chambre souhaité." },
    { icon: "calendarCheck", title: "Confirmez", text: "Nous vérifions la disponibilité et confirmons votre réservation avec vous." },
    { icon: "keyRound", title: "Profitez du séjour", text: "Arrivez à l'adresse indiquée, votre chambre vous attend." },
  ],
};
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm run test -- schemas`
Expected: PASS — 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/schemas.ts lib/content/defaults.ts lib/content/schemas.test.ts
git commit -m "Add Zod schemas and defaults for all admin-editable content"
```

---

## Task 3: Icon Map

**Files:**
- Create: `lib/content/icons.tsx`

**Interfaces:**
- Consumes: `IconKey` from `lib/content/schemas.ts` (Task 2).
- Produces: `ICONS: Record<IconKey, LucideIcon>` — used by every public page that renders an icon from stored content, and by the admin icon `<select>` inputs.

- [ ] **Step 1: Write `lib/content/icons.tsx`**

```tsx
import {
  MapPin,
  Camera,
  Sparkles,
  Zap,
  Snowflake,
  Wifi,
  Coffee,
  ShowerHead,
  ShieldCheck,
  Sofa,
  HeartHandshake,
  MessageCircle,
  CalendarCheck,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "./schemas";

export const ICONS: Record<IconKey, LucideIcon> = {
  mapPin: MapPin,
  camera: Camera,
  sparkles: Sparkles,
  zap: Zap,
  snowflake: Snowflake,
  wifi: Wifi,
  coffee: Coffee,
  showerHead: ShowerHead,
  shieldCheck: ShieldCheck,
  sofa: Sofa,
  heartHandshake: HeartHandshake,
  messageCircle: MessageCircle,
  calendarCheck: CalendarCheck,
  keyRound: KeyRound,
};

export const ICON_OPTIONS: { value: IconKey; label: string }[] = [
  { value: "mapPin", label: "Localisation" },
  { value: "camera", label: "Caméra / sécurité" },
  { value: "sparkles", label: "Propreté / confort" },
  { value: "zap", label: "Rapidité" },
  { value: "snowflake", label: "Climatisation" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "coffee", label: "Petit déjeuner" },
  { value: "showerHead", label: "Douche / salle de bain" },
  { value: "shieldCheck", label: "Sécurité" },
  { value: "sofa", label: "Salon" },
  { value: "heartHandshake", label: "Accueil" },
  { value: "messageCircle", label: "Message / WhatsApp" },
  { value: "calendarCheck", label: "Réservation" },
  { value: "keyRound", label: "Clé / arrivée" },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/content/icons.tsx
git commit -m "Add fixed icon map for admin-editable sections"
```

---

## Task 4: Content Store (read with fallback, write with validation)

**Files:**
- Create: `lib/content/redis.ts`
- Create: `lib/content/store.ts`
- Test: `lib/content/store.test.ts`

**Interfaces:**
- Consumes: any Zod schema from `lib/content/schemas.ts`.
- Produces:
  - `redis: Redis` client instance from `lib/content/redis.ts`.
  - `getContent<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T>`
  - `setContent<T>(key: string, schema: z.ZodType<T>, value: T, revalidatePaths?: string[]): Promise<{ ok: true } | { ok: false; error: string }>`
  - Both are used by every admin page action and every public page in Tasks 9–14.

- [ ] **Step 1: Write `lib/content/redis.ts`**

```ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();
```
`Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` from the environment (populated automatically by Vercel once the Upstash Redis integration is linked — see `.env.example` from Task 1).

- [ ] **Step 2: Write the failing test**

`lib/content/store.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

vi.mock("./redis", () => ({
  redis: { get: vi.fn(), set: vi.fn() },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { redis } from "./redis";
import { revalidatePath } from "next/cache";
import { getContent, setContent } from "./store";

const Schema = z.object({ title: z.string().min(1) });
const fallback = { title: "default" };

beforeEach(() => {
  vi.mocked(redis.get).mockReset();
  vi.mocked(redis.set).mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe("getContent", () => {
  it("returns the fallback when the key is missing", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns the fallback when stored data fails validation", async () => {
    vi.mocked(redis.get).mockResolvedValue({ title: "" });
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns the fallback when the read throws", async () => {
    vi.mocked(redis.get).mockRejectedValue(new Error("network"));
    expect(await getContent("k", Schema, fallback)).toEqual(fallback);
  });

  it("returns stored data when it is valid", async () => {
    vi.mocked(redis.get).mockResolvedValue({ title: "Stored title" });
    expect(await getContent("k", Schema, fallback)).toEqual({ title: "Stored title" });
  });
});

describe("setContent", () => {
  it("rejects invalid data without writing", async () => {
    const result = await setContent("k", Schema, { title: "" } as never);
    expect(result).toEqual({ ok: false, error: expect.any(String) });
    expect(redis.set).not.toHaveBeenCalled();
  });

  it("writes valid data and revalidates the given paths", async () => {
    const result = await setContent("k", Schema, { title: "New" }, ["/"]);
    expect(result).toEqual({ ok: true });
    expect(redis.set).toHaveBeenCalledWith("k", { title: "New" });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npm run test -- store`
Expected: FAIL — `./store` doesn't exist yet.

- [ ] **Step 4: Write `lib/content/store.ts`**

```ts
import { redis } from "./redis";
import { revalidatePath } from "next/cache";
import type { z } from "zod";

export async function getContent<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let raw: unknown;
  try {
    raw = await redis.get(key);
  } catch (error) {
    console.error(`content:${key} read failed`, error);
    return fallback;
  }
  if (raw == null) return fallback;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`content:${key} failed validation`, parsed.error.message);
    return fallback;
  }
  return parsed.data;
}

export async function setContent<T>(
  key: string,
  schema: z.ZodType<T>,
  value: T,
  revalidatePaths: string[] = []
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((issue) => issue.message).join(", ") };
  }
  await redis.set(key, parsed.data);
  for (const path of revalidatePaths) revalidatePath(path);
  return { ok: true };
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npm run test -- store`
Expected: PASS — 6 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/content/redis.ts lib/content/store.ts lib/content/store.test.ts
git commit -m "Add Redis-backed content store with validated reads/writes and fallback"
```

---

## Task 5: Auth Helpers (password check, signed session cookie)

**Files:**
- Create: `lib/auth.ts`
- Test: `lib/auth.test.ts`

**Interfaces:**
- Produces: `checkPassword(password: string): boolean`, `createSessionToken(): string`, `verifySessionToken(token: string | undefined): boolean`, `SESSION_COOKIE_NAME: string`, `SESSION_MAX_AGE_SECONDS: number` — consumed by `middleware.ts` (Task 6) and the login/logout actions (Task 7).

- [ ] **Step 1: Write the failing test**

`lib/auth.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, ADMIN_PASSWORD: "correct-horse", ADMIN_SECRET: "test-secret" };
  vi.resetModules();
});

describe("checkPassword", () => {
  it("accepts the configured password", async () => {
    const { checkPassword } = await import("./auth");
    expect(checkPassword("correct-horse")).toBe(true);
  });
  it("rejects any other password", async () => {
    const { checkPassword } = await import("./auth");
    expect(checkPassword("wrong")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a freshly created token", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    expect(verifySessionToken(createSessionToken())).toBe(true);
  });
  it("rejects an undefined token", async () => {
    const { verifySessionToken } = await import("./auth");
    expect(verifySessionToken(undefined)).toBe(false);
  });
  it("rejects a tampered token", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    const token = createSessionToken();
    const [issuedAt] = token.split(".");
    expect(verifySessionToken(`${issuedAt}.deadbeef`)).toBe(false);
  });
  it("rejects a token signed with a different secret", async () => {
    const { createSessionToken } = await import("./auth");
    const token = createSessionToken();
    process.env.ADMIN_SECRET = "a-different-secret";
    vi.resetModules();
    const { verifySessionToken } = await import("./auth");
    expect(verifySessionToken(token)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- auth`
Expected: FAIL — `./auth` doesn't exist yet.

- [ ] **Step 3: Write `lib/auth.ts`**

```ts
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET env var is not set");
  return secret;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD env var is not set");
  return password === expected;
}

export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  const signature = createHmac("sha256", getSecret()).update(issuedAt).digest("hex");
  return `${issuedAt}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expectedSignature = createHmac("sha256", getSecret()).update(issuedAt).digest("hex");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age <= SESSION_MAX_AGE_SECONDS * 1000;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm run test -- auth`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts
git commit -m "Add password check and signed session token helpers"
```

---

## Task 6: Middleware (protect /admin/*)

**Files:**
- Create: `middleware.ts` (repo root, alongside `next.config.ts`)

**Interfaces:**
- Consumes: `verifySessionToken`, `SESSION_COOKIE_NAME` from `lib/auth.ts` (Task 5).

- [ ] **Step 1: Write `middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

- [ ] **Step 2: Manually verify (middleware runs in the Edge runtime; it isn't covered by the Vitest/node setup from Task 1)**

This is checked end-to-end once Task 7 adds the login page: visiting `/admin` with no cookie must redirect to `/admin/login`.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "Protect /admin routes with session-cookie middleware"
```

---

## Task 7: Login, Logout, Admin Layout

**Files:**
- Create: `app/admin/login/actions.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `checkPassword`, `createSessionToken`, `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE_SECONDS` from `lib/auth.ts`.
- Produces: `logout` server action from `app/admin/login/actions.ts`, imported by `app/admin/layout.tsx` and reusable by any admin page.

- [ ] **Step 1: Write `app/admin/login/actions.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
```

- [ ] **Step 2: Write `app/admin/login/page.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <form action={formAction} className="w-full max-w-sm rounded-2xl border border-espresso/10 bg-paper p-8">
        <h1 className="font-serif text-xl font-semibold">Administration</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded-lg border border-espresso/20 px-3 py-2 text-sm"
        />
        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Write `app/admin/layout.tsx`**

```tsx
import Link from "next/link";
import { logout } from "./login/actions";

const sections = [
  { href: "/admin/general", label: "Général" },
  { href: "/admin/accueil", label: "Accueil" },
  { href: "/admin/chambres", label: "Chambres" },
  { href: "/admin/galerie", label: "Galerie" },
  { href: "/admin/contact", label: "Contact" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-56 shrink-0 border-r border-espresso/10 bg-paper p-6">
        <span className="font-serif text-lg font-semibold">Admin</span>
        <nav className="mt-6 flex flex-col gap-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="text-sm font-medium text-espresso/80 hover:text-terracotta"
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-8">
          <button type="submit" className="text-sm font-semibold text-espresso/50 hover:text-terracotta">
            Déconnexion
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Write `app/admin/page.tsx`**

```tsx
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect("/admin/general");
}
```

- [ ] **Step 5: Manually verify the full auth loop**

Run: `npm run dev`, then:
1. Visit `http://localhost:3000/admin` → redirected to `/admin/login`.
2. Submit the wrong password → "Mot de passe incorrect." shown, still on the login page.
3. Submit the correct password (from `.env.local`, matching `ADMIN_PASSWORD`) → redirected to `/admin`, then to `/admin/general` (404 is expected until Task 9 — that's fine, it proves the redirect chain and cookie work).
4. Click "Déconnexion" → redirected to `/admin/login`; visiting `/admin` again redirects to login.

- [ ] **Step 6: Commit**

```bash
git add app/admin
git commit -m "Add admin login, logout, and layout with session-cookie auth"
```

---

## Task 8: Image Upload (Blob)

**Files:**
- Create: `lib/content/upload.ts`
- Test: `lib/content/upload.test.ts`
- Create: `components/admin/ImageUploadField.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `validateImageFile(file: File): string | null` (pure, tested), `uploadContentImage(file: File): Promise<{ url: string } | { error: string }>` (server action), `<ImageUploadField value, onChange, label />` — used by every admin page with a photo field (Tasks 10, 11).

- [ ] **Step 1: Write the failing test**

`lib/content/upload.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { validateImageFile } from "./upload";

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "photo", { type });
}

describe("validateImageFile", () => {
  it("accepts a small jpeg", () => {
    expect(validateImageFile(makeFile("image/jpeg", 1024))).toBeNull();
  });
  it("rejects an unsupported type", () => {
    expect(validateImageFile(makeFile("application/pdf", 1024))).not.toBeNull();
  });
  it("rejects a file over 5 MB", () => {
    expect(validateImageFile(makeFile("image/png", 6 * 1024 * 1024))).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- upload`
Expected: FAIL — `./upload` doesn't exist yet.

- [ ] **Step 3: Write `lib/content/imageValidation.ts` and `lib/content/upload.ts`**

A `"use server"` file may only export async functions, so the synchronous validation logic lives in its own module and `upload.ts` (the server action) imports it.

`lib/content/imageValidation.ts`:
```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format non supporté. Utilisez JPEG, PNG ou WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Image trop volumineuse (5 Mo maximum).";
  }
  return null;
}
```

`lib/content/upload.ts`:
```ts
"use server";

import { put } from "@vercel/blob";
import { validateImageFile } from "./imageValidation";

export async function uploadContentImage(file: File): Promise<{ url: string } | { error: string }> {
  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const blob = await put(`content/${Date.now()}-${file.name}`, file, { access: "public" });
  return { url: blob.url };
}
```

And update the test's import to `from "./imageValidation"`.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm run test -- upload`
Expected: PASS — 3 tests.

- [ ] **Step 5: Allow Blob-hosted images in `next/image`**

In `next.config.ts`, add an `images` block:
```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};
```

- [ ] **Step 6: Write `components/admin/ImageUploadField.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadContentImage } from "@/lib/content/upload";

export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startUpload] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const result = await uploadContentImage(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onChange(result.url);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {value && (
        <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-espresso/10">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={pending}
        className="text-sm"
      />
      {pending && <span className="text-xs text-espresso/50">Envoi en cours...</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/content/imageValidation.ts lib/content/upload.ts lib/content/upload.test.ts components/admin/ImageUploadField.tsx next.config.ts
git commit -m "Add Blob image upload with MIME/size validation"
```

---

## Task 9: Reusable Admin List Editor

**Files:**
- Create: `components/admin/ListEditor.tsx`

**Interfaces:**
- Produces: `<ListEditor items, onChange, renderItem, createItem, addLabel />` — a generic add/reorder/delete-with-confirm list, used by the Rooms admin page (Task 11), Gallery admin page (Task 13), and the Chambres-page "Et aussi" photos (Task 11).

- [ ] **Step 1: Write `components/admin/ListEditor.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  renderItem,
  createItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  createItem: () => T;
  addLabel: string;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function update(id: string, patch: Partial<T>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
    setConfirmingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-espresso/15 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded p-1 disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="rounded p-1 disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {confirmingId === item.id ? (
              <button type="button" onClick={() => remove(item.id)} className="text-sm font-semibold text-red-600">
                Confirmer la suppression ?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(item.id)}
                className="rounded p-1 text-espresso/50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {renderItem(item, (patch) => update(item.id, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-espresso/25 py-3 text-sm font-semibold text-espresso/60 hover:border-terracotta hover:text-terracotta"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write the id-generation helper it will need**

`lib/content/ids.ts`:
```ts
export function generateId(seed: string): string {
  const slug = seed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug || "item"}-${suffix}`;
}
```

`lib/content/ids.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateId } from "./ids";

describe("generateId", () => {
  it("slugifies the seed and appends a random suffix", () => {
    const id = generateId("Chambre Deluxe");
    expect(id).toMatch(/^chambre-deluxe-[a-z0-9]{5}$/);
  });
  it("falls back to 'item' for an empty seed", () => {
    expect(generateId("")).toMatch(/^item-[a-z0-9]{5}$/);
  });
  it("produces different ids on successive calls", () => {
    expect(generateId("Room")).not.toBe(generateId("Room"));
  });
});
```

Run: `npm run test -- ids`
Expected: PASS — 3 tests.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ListEditor.tsx lib/content/ids.ts lib/content/ids.test.ts
git commit -m "Add reusable admin list editor and id-generation helper"
```

---

## Task 10: Global Content — Admin Page & Site-Wide Wiring

This is the most invasive task: `lib/whatsapp.ts`'s hardcoded constants are replaced by `content:global`, so every component that used them needs the value passed in as a prop from a server-component parent.

**Files:**
- Modify: `lib/whatsapp.ts` (keep only the pure `buildWaLink` helper)
- Create: `app/admin/general/page.tsx`
- Create: `app/admin/general/actions.ts`
- Modify: `components/Header.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/CTABand.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx` (Header/Footer/CTABand call sites only — content sections come in Task 12)
- Modify: `app/chambres/page.tsx` (Header/Footer/CTABand/buildWaLink call sites only)
- Modify: `app/galerie/page.tsx` (Header/Footer/CTABand call sites only)
- Modify: `app/contact/page.tsx` (full rewrite of the info-card contact details; services/steps come in Task 14)

**Interfaces:**
- Consumes: `GlobalContentSchema`, `DEFAULT_GLOBAL_CONTENT`, `getContent`, `setContent`.
- Produces: `Header`, `Footer`, `CTABand` now require a `waNumber` prop (and `Footer`'s non-`simple` variant requires `phoneDisplay`/`email`/`addressLine1`/`addressLine2`); every page passes these down from a single `getContent("global", ...)` call. Later tasks (11–14) build on pages that already fetch `global` this way.

- [ ] **Step 1: Simplify `lib/whatsapp.ts` to the pure helper only**

```ts
export function buildWaLink(message: string, whatsappNumber: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Update `components/Header.tsx` to take `waNumber` as a prop**

Change the function signature and the two `buildWaLink` calls:
```tsx
export function Header({ current, waNumber }: { current: NavKey; waNumber: string }) {
```
```tsx
          <Button
            href={buildWaLink(
              "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
              waNumber
            )}
            small
          >
```
(apply the same `waNumber` argument to the second `buildWaLink` call in the mobile panel).

- [ ] **Step 3: Update `components/CTABand.tsx` to take `waNumber` as a prop**

```tsx
export function CTABand({
  heading,
  buttonLabel,
  waMessage,
  waNumber,
  size = "default",
  greenButton = false,
}: {
  heading: string;
  buttonLabel: string;
  waMessage: string;
  waNumber: string;
  size?: "default" | "large";
  greenButton?: boolean;
}) {
  return (
    <section className="w-full bg-terracotta px-5 md:px-8 py-16">
      <Wrap className="flex flex-wrap items-center justify-between gap-6 !px-0">
        <h2
          className={`font-serif font-medium text-paper max-w-xl ${
            size === "large" ? "text-[27px]" : "text-2xl"
          }`}
        >
          {heading}
        </h2>
        <Button href={buildWaLink(waMessage, waNumber)} variant={greenButton ? "whatsapp" : "invert"}>
```
(the rest of the file is unchanged).

- [ ] **Step 4: Update `components/Footer.tsx` to take contact fields as props**

```tsx
import Link from "next/link";
import { Phone } from "lucide-react";
import { Wrap } from "./Wrap";

const DEVELOPER_WA_LINK = "https://wa.me/221710338061";

export function Footer({
  simple = false,
  phoneDisplay,
  email,
}: {
  simple?: boolean;
  phoneDisplay?: string;
  email?: string;
}) {
  if (simple) {
    return (
      <footer className="w-full bg-espresso-dark px-5 md:px-8 py-10">
        <Wrap className="flex flex-wrap items-center justify-between gap-4 !px-0">
          <span className="font-serif text-base font-semibold text-paper">Hôtel Résidence Aïcha</span>
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
          <span className="font-serif text-lg font-semibold text-paper">Hôtel Résidence Aïcha</span>
          <p className="max-w-[280px] text-[13.5px] leading-relaxed text-paper/55">
            Liberté Ouest, Lot 636
            <br />
            Tambacounda 26000, Sénégal
          </p>
        </div>
        <div className="flex flex-1 min-w-[160px] flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-paper/40">Navigation</span>
          <Link href="/" className="text-[13.5px] text-paper/75">Accueil</Link>
          <Link href="/chambres" className="text-[13.5px] text-paper/75">Chambres</Link>
          <Link href="/galerie" className="text-[13.5px] text-paper/75">Galerie</Link>
          <Link href="/contact" className="text-[13.5px] text-paper/75">Contact</Link>
        </div>
        <div className="flex flex-1 min-w-[220px] flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-paper/40">Contact</span>
          {phoneDisplay && (
            <a href={`tel:${phoneDisplay.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-[13.5px] text-paper/75">
              <Phone className="h-3.5 w-3.5" />
              {phoneDisplay}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="text-[13.5px] text-paper/75">
              {email}
            </a>
          )}
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
```
Note the hardcoded address block in the first `<div>` is intentionally left as-is here — it moves to `content:global` usage in Step 7 below once call sites pass it in; for now Footer keeps rendering it statically since address text in the footer was not in original scope beyond phone/email. (This keeps the diff focused; if later you want the footer address editable too, pass `addressLine1`/`addressLine2` the same way as `phoneDisplay`.)

- [ ] **Step 5: Update `app/layout.tsx` to fetch global content for SEO metadata and JSON-LD**

```tsx
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
    <html lang="fr" className={`${fraunces.variable} ${workSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-cream text-espresso font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Update `app/page.tsx`, `app/chambres/page.tsx`, `app/galerie/page.tsx` call sites**

In each file, make the page component `async`, fetch global content at the top, and pass it through. Example for `app/page.tsx` (the room/testimonial/reason content itself is wired in Task 12 — here only the `Header`/`Footer`/`CTABand`/direct `buildWaLink` calls change):

```tsx
import { getContent } from "@/lib/content/store";
import { GlobalContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT } from "@/lib/content/defaults";

export default async function HomePage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  return (
    <>
      <Header current="accueil" waNumber={global.whatsappNumber} />

      {/* Hero */}
      ...
              <Button
                href={buildWaLink(
                  "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
                  global.whatsappNumber
                )}
              >
      ...
      <CTABand
        heading="Prêt à réserver votre séjour à l'Hôtel Résidence Aïcha ?"
        buttonLabel="Contactez-nous sur WhatsApp"
        waMessage="Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda."
        waNumber={global.whatsappNumber}
        size="large"
        greenButton
      />

      <Footer phoneDisplay={global.phoneDisplay} email={global.email} />
    </>
  );
}
```

Apply the equivalent change in `app/chambres/page.tsx` (`Header`, every `buildWaLink(msg)` → `buildWaLink(msg, global.whatsappNumber)`, `CTABand` gets `waNumber`, `Footer simple` needs no new props) and `app/galerie/page.tsx` (same pattern, no `buildWaLink` calls there besides `CTABand`).

- [ ] **Step 7: Rewrite the contact-info card in `app/contact/page.tsx`**

Make the page `async`, fetch `global`, and replace the hardcoded `PHONE_DISPLAY`/`WHATSAPP_DISPLAY`/`CONTACT_EMAIL`/`MAPS_SEARCH_URL`/`MAPS_EMBED_URL` imports and usages:

```tsx
import { getContent } from "@/lib/content/store";
import { GlobalContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT } from "@/lib/content/defaults";
// remove the `import { WHATSAPP_DISPLAY, PHONE_DISPLAY, CONTACT_EMAIL, buildWaLink } from "@/lib/whatsapp";`
import { buildWaLink } from "@/lib/whatsapp";

export default async function ContactPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  return (
    <>
      <Header current="contact" waNumber={global.whatsappNumber} />
      ...
                <a href={`tel:${global.phoneDisplay.replace(/\s/g, "")}`} className="flex items-center gap-4">
                  ...
                    <span className="text-[15px] font-medium">{global.phoneDisplay}</span>
                  ...
                <a
                  href={buildWaLink(
                    "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
                    global.whatsappNumber
                  )}
                  ...
                    <span className="text-[15px] font-medium">{global.whatsappDisplay}</span>
                  ...
                <a href={`mailto:${global.email}`} className="flex items-center gap-4">
                  ...
                    <span className="text-[15px] font-medium">{global.email}</span>
                  ...
              <a href={global.mapsSearchUrl} target="_blank" rel="noopener noreferrer" ...>
      ...
            <div className="flex flex-col gap-1 pt-1">
              <span className="font-serif text-[20px] font-semibold">Hôtel Résidence Aïcha</span>
              <span className="text-[14px] leading-[1.5] text-espresso/65">
                {global.addressLine1}
                <br />
                {global.addressLine2}
              </span>
            </div>
      ...
              <iframe src={global.mapsEmbedUrl} ... />
      ...
      <Button
        href={buildWaLink(
          "Bonjour, je souhaite réserver une chambre à l'Hôtel Résidence Aïcha à Tambacounda.",
          global.whatsappNumber
        )}
        variant="whatsapp"
      >
        <WhatsappIcon className="h-[18px] w-[18px]" />
        {global.whatsappDisplay}
      </Button>
      ...
      <Footer phoneDisplay={global.phoneDisplay} email={global.email} />
    </>
  );
}
```
Delete the now-unused `MAPS_SEARCH_URL`/`MAPS_EMBED_URL` module constants and the `services`/`steps` arrays stay for now — they're wired to `content:contact` in Task 14.

- [ ] **Step 8: Write `app/admin/general/actions.ts`**

```ts
"use server";

import { setContent } from "@/lib/content/store";
import { GlobalContentSchema, type GlobalContent } from "@/lib/content/schemas";

export type SaveGlobalState = { error?: string; success?: boolean } | undefined;

export async function saveGlobal(_prevState: SaveGlobalState, formData: FormData): Promise<SaveGlobalState> {
  const value: GlobalContent = {
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    phoneDisplay: String(formData.get("phoneDisplay") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    whatsappDisplay: String(formData.get("whatsappDisplay") ?? ""),
    email: String(formData.get("email") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    addressLine2: String(formData.get("addressLine2") ?? ""),
    mapsSearchUrl: String(formData.get("mapsSearchUrl") ?? ""),
    mapsEmbedUrl: String(formData.get("mapsEmbedUrl") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };

  const result = await setContent("global", GlobalContentSchema, value, ["/", "/chambres", "/galerie", "/contact"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 9: Write `app/admin/general/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { GlobalContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT } from "@/lib/content/defaults";
import { GeneralForm } from "./GeneralForm";

export default async function AdminGeneralPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold">Général</h1>
      <GeneralForm initial={global} />
    </div>
  );
}
```

`app/admin/general/GeneralForm.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import type { GlobalContent } from "@/lib/content/schemas";
import { saveGlobal } from "./actions";

const FIELDS: { name: keyof GlobalContent; label: string }[] = [
  { name: "phoneNumber", label: "Téléphone (chiffres uniquement, ex: 221781292929)" },
  { name: "phoneDisplay", label: "Téléphone affiché" },
  { name: "whatsappNumber", label: "WhatsApp (chiffres uniquement)" },
  { name: "whatsappDisplay", label: "WhatsApp affiché" },
  { name: "email", label: "Email" },
  { name: "addressLine1", label: "Adresse — ligne 1" },
  { name: "addressLine2", label: "Adresse — ligne 2" },
  { name: "mapsSearchUrl", label: "Lien Google Maps (itinéraire)" },
  { name: "mapsEmbedUrl", label: "Lien Google Maps (carte intégrée)" },
  { name: "seoTitle", label: "Titre SEO" },
  { name: "seoDescription", label: "Description SEO" },
];

export function GeneralForm({ initial }: { initial: GlobalContent }) {
  const [state, formAction, pending] = useActionState(saveGlobal, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {FIELDS.map((field) => (
        <label key={field.name} className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">{field.label}</span>
          <input
            name={field.name}
            defaultValue={initial[field.name]}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
      ))}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Enregistré.</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
```

- [ ] **Step 10: Run the full test suite and the linter**

Run: `npm run test && npm run lint`
Expected: all existing tests still pass; lint passes (fix any `no-unused-vars` from removed imports, e.g. unused `PHONE_DISPLAY` etc.).

- [ ] **Step 11: Manually verify**

`npm run dev`, then:
1. Visit `/`, `/chambres`, `/galerie`, `/contact` — identical to before (phone/WhatsApp/email/address/maps links render the same values, sourced from defaults).
2. Log in to `/admin/general`, change the phone display value, save, revisit `/contact` and the footer — new value shows immediately (no restart).

- [ ] **Step 12: Commit**

```bash
git add lib/whatsapp.ts app/admin/general app/layout.tsx app/page.tsx app/chambres/page.tsx app/galerie/page.tsx app/contact/page.tsx components/Header.tsx components/Footer.tsx components/CTABand.tsx
git commit -m "Wire global contact/SEO content to KV with an admin form"
```

---

## Task 11: Rooms — Admin CRUD & Public Wiring

**Files:**
- Create: `app/admin/chambres/actions.ts`
- Create: `app/admin/chambres/page.tsx`
- Create: `app/admin/chambres/RoomsForm.tsx`
- Modify: `app/page.tsx` (rooms preview section)
- Modify: `app/chambres/page.tsx` (rooms grid section)

**Interfaces:**
- Consumes: `RoomSchema`, `RoomsContentSchema`, `DEFAULT_ROOMS_CONTENT`, `getContent`/`setContent`, `ListEditor`, `ImageUploadField`, `generateId`.

- [ ] **Step 1: Write `app/admin/chambres/actions.ts`**

```ts
"use server";

import { setContent } from "@/lib/content/store";
import { RoomsContentSchema, type RoomsContent } from "@/lib/content/schemas";

export type SaveRoomsState = { error?: string; success?: boolean } | undefined;

export async function saveRooms(rooms: RoomsContent): Promise<SaveRoomsState> {
  const result = await setContent("rooms", RoomsContentSchema, rooms, ["/", "/chambres"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 2: Write `app/admin/chambres/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { RoomsContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT } from "@/lib/content/defaults";
import { RoomsForm } from "./RoomsForm";

export default async function AdminChambresPage() {
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Chambres</h1>
      <p className="mt-2 text-sm text-espresso/60">
        L&apos;accueil affiche automatiquement les 3 premières chambres ci-dessous ; la page Chambres les affiche
        toutes, dans cet ordre.
      </p>
      <RoomsForm initial={rooms} />
    </div>
  );
}
```

- [ ] **Step 3: Write `app/admin/chambres/RoomsForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import type { Room, RoomsContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveRooms } from "./actions";

function emptyRoom(): Room {
  return {
    id: generateId("chambre"),
    name: "",
    capacity: "",
    bed: "",
    amenities: [],
    description: "",
    image: "",
    imageAlt: "",
  };
}

export function RoomsForm({ initial }: { initial: RoomsContent }) {
  const [rooms, setRooms] = useState<RoomsContent>(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveRooms(rooms);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <ListEditor
        items={rooms}
        onChange={setRooms}
        createItem={emptyRoom}
        addLabel="Ajouter une chambre"
        renderItem={(room, update) => (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Nom</span>
              <input
                value={room.name}
                onChange={(e) => update({ name: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="font-semibold">Capacité</span>
                <input
                  value={room.capacity}
                  onChange={(e) => update({ capacity: e.target.value })}
                  placeholder="ex: 2 pers."
                  className="rounded-lg border border-espresso/20 px-3 py-2"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="font-semibold">Lit</span>
                <input
                  value={room.bed}
                  onChange={(e) => update({ bed: e.target.value })}
                  placeholder="ex: 1 lit double"
                  className="rounded-lg border border-espresso/20 px-3 py-2"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Équipements (un par ligne)</span>
              <textarea
                value={room.amenities.join("\n")}
                onChange={(e) => update({ amenities: e.target.value.split("\n").filter((line) => line.trim() !== "") })}
                rows={3}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Description (optionnelle)</span>
              <textarea
                value={room.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={2}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Texte alternatif (accessibilité)</span>
              <input
                value={room.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <ImageUploadField value={room.image} onChange={(url) => update({ image: url })} label="Photo" />
          </div>
        )}
      />
      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire `app/chambres/page.tsx`'s rooms grid to `content:rooms`**

Remove the local `const rooms = [...]` array. Make the page `async` (it already becomes async in Task 10 for `global`), fetch rooms too, and render the stored `description` only when non-empty:

```tsx
import { RoomsContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT } from "@/lib/content/defaults";
// (getContent/GlobalContentSchema/DEFAULT_GLOBAL_CONTENT already imported per Task 10)

export default async function ChambresPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  return (
    <>
      ...
          <div className="grid gap-6 md:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="flex flex-col overflow-hidden rounded-[18px] border border-espresso/8 bg-paper">
                <div className="relative h-[210px]">
                  <Image src={room.image} alt={room.imageAlt} fill sizes="(max-width: 860px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="font-serif text-xl font-semibold">{room.name}</span>
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
                      <li key={item} className="flex items-center gap-2 text-[13px] text-espresso/70">
                        <Check className="h-3.5 w-3.5 text-terracotta" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <a
                      href={buildWaLink(`Bonjour, je souhaite réserver une ${room.name} à l'Hôtel Résidence Aïcha.`, global.whatsappNumber)}
                      className="block w-full rounded-full bg-terracotta px-5 py-2.5 text-center text-[13.5px] font-semibold text-paper"
                    >
                      Réserver
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
      ...
```
(The "Et aussi"/`moreRooms` section and the bathroom section below it stay as-is for now — they move to `content:chambresPage` in Task 12.)

- [ ] **Step 5: Wire `app/page.tsx`'s rooms preview to the first 3 of `content:rooms`**

Remove the local `const rooms = [...]` array (keep `trustItems`/`testimonials`/`reasons` for now — Task 12). Fetch rooms alongside `global`:

```tsx
import { RoomsContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT } from "@/lib/content/defaults";

export default async function HomePage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const featuredRooms = rooms.slice(0, 3);
  return (
    <>
      ...
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
                  <span className="font-serif text-[19px] font-semibold">{room.name}</span>
                  <span className="flex items-center gap-1.5 text-[13.5px] text-espresso/60">
                    <Users className="h-[15px] w-[15px]" /> {room.capacity}
                  </span>
                </div>
              </Link>
            ))}
          </div>
      ...
```
Note the capacity string now reads "2 pers." instead of the old homepage-only "2 personnes" — an intentional, minor copy change from unifying the two room lists (per spec §1/§3).

- [ ] **Step 6: Run tests, lint, and manually verify**

Run: `npm run test && npm run lint`

`npm run dev`, then:
1. `/` and `/chambres` render identically to before (same 6 rooms, same images/text), aside from the "2 pers." capacity wording noted above.
2. `/admin/chambres`: reorder a room with ▲▼, confirm the public pages reflect the new order after saving.
3. Add a room with a new photo upload, save, confirm it appears on `/chambres` (and on `/` only if it's in the first 3).
4. Delete a room (two-click confirm), save, confirm it disappears from both pages.

- [ ] **Step 7: Commit**

```bash
git add app/admin/chambres app/page.tsx app/chambres/page.tsx
git commit -m "Add rooms admin CRUD and wire the shared rooms list to both public pages"
```

---

## Task 12: Home Page Content — Admin Page & Wiring

**Files:**
- Create: `app/admin/accueil/actions.ts`
- Create: `app/admin/accueil/page.tsx`
- Create: `app/admin/accueil/HomeForm.tsx`
- Modify: `app/page.tsx` (hero, intro, trust strip, reasons, testimonials, "en images" preview)

**Interfaces:**
- Consumes: `HomeContentSchema`, `DEFAULT_HOME_CONTENT`, `GalleryContentSchema`, `DEFAULT_GALLERY_CONTENT` (for the "en images" preview — see Step 4), `ICONS`, `ICON_OPTIONS`.

- [ ] **Step 1: Write `app/admin/accueil/actions.ts`**

```ts
"use server";

import { setContent } from "@/lib/content/store";
import { HomeContentSchema, type HomeContent } from "@/lib/content/schemas";

export type SaveHomeState = { error?: string; success?: boolean } | undefined;

export async function saveHome(content: HomeContent): Promise<SaveHomeState> {
  const result = await setContent("home", HomeContentSchema, content, ["/"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 2: Write `app/admin/accueil/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { HomeContentSchema } from "@/lib/content/schemas";
import { DEFAULT_HOME_CONTENT } from "@/lib/content/defaults";
import { HomeForm } from "./HomeForm";

export default async function AdminAccueilPage() {
  const home = await getContent("home", HomeContentSchema, DEFAULT_HOME_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Accueil</h1>
      <HomeForm initial={home} />
    </div>
  );
}
```

- [ ] **Step 3: Write `app/admin/accueil/HomeForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import type { HomeContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ICON_OPTIONS } from "@/lib/content/icons";
import { generateId } from "@/lib/content/ids";
import { saveHome } from "./actions";

type WithId<T> = T & { id: string };

export function HomeForm({ initial }: { initial: HomeContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // id is the item's array index, not its text — two items can share the same (possibly
  // still-blank) label/title/author while being edited, and index is always unique.
  const trustItemsWithId: WithId<HomeContent["trustItems"][number]>[] = content.trustItems.map((item, index) => ({
    ...item,
    id: String(index),
  }));
  const reasonsWithId: WithId<HomeContent["reasons"][number]>[] = content.reasons.map((item, index) => ({
    ...item,
    id: String(index),
  }));
  const testimonialsWithId: WithId<HomeContent["testimonials"][number]>[] = content.testimonials.map(
    (item, index) => ({ ...item, id: String(index) })
  );

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveHome(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  function field(key: keyof HomeContent, label: string, multiline = false) {
    const value = content[key] as string;
    return (
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{label}</span>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
            rows={3}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        )}
      </label>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">En-tête (hero)</h2>
        {field("heroEyebrow", "Survol")}
        {field("heroTitle", "Titre")}
        {field("heroText", "Texte", true)}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Introduction</h2>
        {field("introEyebrow", "Survol")}
        {field("introTitle", "Titre")}
        {field("introText", "Texte", true)}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Points de confiance</h2>
        <ListEditor
          items={trustItemsWithId}
          onChange={(items) => setContent({ ...content, trustItems: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("point"), icon: "sparkles", label: "" })}
          addLabel="Ajouter un point"
          renderItem={(item, update) => (
            <div className="flex gap-3">
              <select
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value as HomeContent["trustItems"][number]["icon"] })}
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
                className="flex-1 rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Pourquoi nous choisir</h2>
        <ListEditor
          items={reasonsWithId}
          onChange={(items) => setContent({ ...content, reasons: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("raison"), icon: "sparkles", title: "", text: "" })}
          addLabel="Ajouter une raison"
          renderItem={(item, update) => (
            <div className="flex flex-col gap-2">
              <select
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value as HomeContent["reasons"][number]["icon"] })}
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Titre"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
              <textarea
                value={item.text}
                onChange={(e) => update({ text: e.target.value })}
                rows={2}
                placeholder="Texte"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Avis clients</h2>
        <ListEditor
          items={testimonialsWithId}
          onChange={(items) => setContent({ ...content, testimonials: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("avis"), quote: "", author: "" })}
          addLabel="Ajouter un avis"
          renderItem={(item, update) => (
            <div className="flex flex-col gap-2">
              <textarea
                value={item.quote}
                onChange={(e) => update({ quote: e.target.value })}
                rows={2}
                placeholder="Citation"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
              <input
                value={item.author}
                onChange={(e) => update({ author: e.target.value })}
                placeholder="Auteur"
                className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
              />
            </div>
          )}
        />
      </section>

      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire `app/page.tsx` to `content:home` and `content:gallery`**

Remove the local `trustItems`, `testimonials`, `reasons` consts (the `rooms` const is already gone per Task 11). The "En images" preview switches from 5 hardcoded images to the first 5 entries of `content:gallery` (single source of truth, same pattern as rooms — see spec note below):

```tsx
import { HomeContentSchema, GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_HOME_CONTENT, DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";
import { ICONS } from "@/lib/content/icons";

export default async function HomePage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const home = await getContent("home", HomeContentSchema, DEFAULT_HOME_CONTENT);
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  const featuredRooms = rooms.slice(0, 3);
  const previewPhotos = gallery.photos.slice(0, 5);

  return (
    <>
      <Header current="accueil" waNumber={global.whatsappNumber} />

      {/* Hero */}
      <section className="relative w-full min-h-[480px] md:min-h-[620px] flex items-center overflow-hidden">
        ...
            <Eyebrow light>{home.heroEyebrow}</Eyebrow>
            <h1 className="font-serif text-[32px] md:text-[48px] font-medium leading-[1.1] text-paper">
              {home.heroTitle}
            </h1>
            <p className="max-w-[480px] text-[16.5px] leading-[1.7] text-paper/85">{home.heroText}</p>
        ...

      {/* Intro strip */}
      <section className="w-full">
        <Wrap className="flex flex-wrap gap-14 py-14 md:py-[72px]">
          <div className="flex-[1_1_320px]">
            <Eyebrow>{home.introEyebrow}</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium leading-[1.2]">
              {home.introTitle}
            </h2>
          </div>
          <p className="mt-1.5 flex-[1_1_380px] text-base leading-[1.75] text-espresso/72">{home.introText}</p>
        </Wrap>
      </section>

      {/* Trust strip */}
      <section className="w-full">
        <Wrap className="pb-14 md:pb-[72px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-espresso/10 bg-espresso/10">
            {home.trustItems.map(({ icon, label }) => {
              const Icon = ICONS[icon];
              return (
                <div key={label} className="flex flex-col gap-2.5 bg-paper p-6 md:p-7">
                  <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.6} />
                  <span className="text-[14.5px] font-semibold">{label}</span>
                </div>
              );
            })}
          </div>
        </Wrap>
      </section>

      {/* Rooms preview — unchanged from Task 11 */}
      ...

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
            <Link href="/galerie" className="text-[14.5px] font-semibold text-terracotta underline underline-offset-4">
              Voir toute la galerie →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:h-[520px] md:grid-cols-4 md:grid-rows-2 md:[&>*:first-child]:col-span-2 md:[&>*:first-child]:row-span-2">
            {previewPhotos.map((photo, index) => (
              <div key={photo.id} className={index === 0 ? "relative h-56 overflow-hidden rounded-2xl md:h-full" : "relative h-40 overflow-hidden rounded-2xl md:h-full"}>
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
            {home.reasons.map(({ icon, title, text }) => {
              const Icon = ICONS[icon];
              return (
                <div key={title} className="flex flex-col gap-3">
                  <Icon className="h-[26px] w-[26px] text-terracotta" strokeWidth={1.6} />
                  <span className="font-serif text-[17.5px] font-semibold">{title}</span>
                  <p className="text-sm leading-[1.65] text-espresso/68">{text}</p>
                </div>
              );
            })}
          </div>
        </Wrap>
      </section>

      {/* Testimonials */}
      <section id="avis" className="w-full scroll-mt-6 bg-espresso py-16 md:py-20">
        <Wrap>
          <div className="mb-9">
            <Eyebrow light>Avis clients</Eyebrow>
            <h2 className="mt-3.5 font-serif text-[25px] md:text-[32px] font-medium text-paper leading-[1.2]">
              Ce que disent nos voyageurs
            </h2>
            <p className="mt-3 max-w-[520px] text-sm text-paper/50">
              Noté 4,2/5 sur Google (45 avis) — extraits parmi les retours de nos clients.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {home.testimonials.map((t, i) => (
              <div key={i} className="flex flex-col gap-3.5 rounded-2xl border border-paper/12 bg-paper/6 p-6">
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
      ...
```
The imports `MapPin, Camera, Sparkles, Zap, Users, Star, MessageCircle` from `lucide-react` are no longer all used directly — keep `Users`, `Star`, `MessageCircle` (still used by the rooms preview / testimonials / hero button) and drop `MapPin, Camera, Sparkles, Zap` (now sourced through `ICONS`).

- [ ] **Step 5: Run tests, lint, and manually verify**

Run: `npm run test && npm run lint`

`npm run dev`: `/` renders identically to before. `/admin/accueil`: edit the hero title, save, confirm `/` updates instantly; reorder/add/remove a trust item or testimonial and confirm it reflects on `/`.

- [ ] **Step 6: Commit**

```bash
git add app/admin/accueil app/page.tsx
git commit -m "Add home page content admin form and wire hero/trust/reasons/testimonials"
```

---

## Task 13: Gallery — Admin CRUD & Public Wiring

**Files:**
- Create: `app/admin/galerie/actions.ts`
- Create: `app/admin/galerie/page.tsx`
- Create: `app/admin/galerie/GalleryForm.tsx`
- Modify: `app/galerie/page.tsx`

**Interfaces:**
- Consumes: `GalleryContentSchema`, `DEFAULT_GALLERY_CONTENT`, `ListEditor`, `ImageUploadField`, `generateId`.

- [ ] **Step 1: Write `app/admin/galerie/actions.ts`**

```ts
"use server";

import { setContent } from "@/lib/content/store";
import { GalleryContentSchema, type GalleryContent } from "@/lib/content/schemas";

export type SaveGalleryState = { error?: string; success?: boolean } | undefined;

export async function saveGallery(content: GalleryContent): Promise<SaveGalleryState> {
  const result = await setContent("gallery", GalleryContentSchema, content, ["/", "/galerie"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 2: Write `app/admin/galerie/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";
import { GalleryForm } from "./GalleryForm";

export default async function AdminGaleriePage() {
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Galerie</h1>
      <p className="mt-2 text-sm text-espresso/60">
        L&apos;accueil affiche automatiquement les 5 premières photos ci-dessous dans la section &laquo; En images
        &raquo;.
      </p>
      <GalleryForm initial={gallery} />
    </div>
  );
}
```

- [ ] **Step 3: Write `app/admin/galerie/GalleryForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import type { GalleryContent, GalleryPhoto } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveGallery } from "./actions";

function emptyPhoto(): GalleryPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function GalleryForm({ initial }: { initial: GalleryContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveGallery(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Survol de l&apos;en-tête</span>
        <input
          value={content.heroEyebrow}
          onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Titre de l&apos;en-tête</span>
        <input
          value={content.heroTitle}
          onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Texte de l&apos;en-tête</span>
        <textarea
          value={content.heroText}
          onChange={(e) => setContent({ ...content, heroText: e.target.value })}
          rows={2}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>

      <ListEditor
        items={content.photos}
        onChange={(photos) => setContent({ ...content, photos })}
        createItem={emptyPhoto}
        addLabel="Ajouter une photo"
        renderItem={(photo, update) => (
          <div className="flex flex-col gap-3">
            <ImageUploadField value={photo.image} onChange={(url) => update({ image: url })} label="Photo" />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Légende</span>
              <input
                value={photo.caption}
                onChange={(e) => update({ caption: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Texte alternatif (accessibilité)</span>
              <input
                value={photo.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
          </div>
        )}
      />
      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire `app/galerie/page.tsx` to `content:gallery`**

Remove the local `const photos = [...]` array. Make the page `async`, fetch `global` and `gallery`:

```tsx
import { getContent } from "@/lib/content/store";
import { GlobalContentSchema, GalleryContentSchema } from "@/lib/content/schemas";
import { DEFAULT_GLOBAL_CONTENT, DEFAULT_GALLERY_CONTENT } from "@/lib/content/defaults";

export default async function GaleriePage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const gallery = await getContent("gallery", GalleryContentSchema, DEFAULT_GALLERY_CONTENT);
  return (
    <>
      <Header current="galerie" waNumber={global.whatsappNumber} />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        ...
          <Eyebrow light>{gallery.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {gallery.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{gallery.heroText}</p>
        ...
      </section>

      {/* Masonry gallery */}
      <section className="w-full">
        <Wrap className="py-14 md:py-[70px]">
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {gallery.photos.map((photo) => (
              <figure key={photo.id} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]">
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={photo.image}
                    alt={photo.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1120px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <figcaption className="px-4 py-3 text-[12.5px] font-medium text-espresso/62">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </Wrap>
      </section>

      <CTABand
        heading="Ces photos vous donnent envie de réserver ?"
        buttonLabel="Écrivez-nous sur WhatsApp"
        waMessage="Bonjour, j'ai vu la galerie de l'Hôtel Résidence Aïcha et je souhaite réserver."
        waNumber={global.whatsappNumber}
        greenButton
      />

      <Footer simple />
    </>
  );
}
```

- [ ] **Step 5: Run tests, lint, and manually verify**

Run: `npm run test && npm run lint`

`npm run dev`: `/galerie` renders identically. `/admin/galerie`: reorder, add, delete a photo, confirm `/galerie` and the homepage "En images" preview (first 5) both reflect it.

- [ ] **Step 6: Commit**

```bash
git add app/admin/galerie app/galerie/page.tsx
git commit -m "Add gallery admin CRUD and wire the public gallery page to it"
```

---

## Task 14: Chambres-Page Extras & Contact Content — Admin Pages & Wiring

**Files:**
- Create: `app/admin/chambres/ChambresPageForm.tsx`
- Modify: `app/admin/chambres/actions.ts` (add `saveChambresPage`)
- Modify: `app/admin/chambres/page.tsx` (render both forms)
- Modify: `app/chambres/page.tsx` ("Et aussi" + bathroom sections)
- Create: `app/admin/contact/actions.ts`
- Create: `app/admin/contact/page.tsx`
- Create: `app/admin/contact/ContactForm.tsx`
- Modify: `app/contact/page.tsx` (hero/services/steps sections)

**Interfaces:**
- Consumes: `ChambresPageContentSchema`, `DEFAULT_CHAMBRES_PAGE_CONTENT`, `ContactContentSchema`, `DEFAULT_CONTACT_CONTENT`.

- [ ] **Step 1: Add `saveChambresPage` to `app/admin/chambres/actions.ts`**

Append to the existing file:
```ts
import { ChambresPageContentSchema, type ChambresPageContent } from "@/lib/content/schemas";

export async function saveChambresPage(content: ChambresPageContent): Promise<SaveRoomsState> {
  const result = await setContent("chambresPage", ChambresPageContentSchema, content, ["/chambres"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 2: Write `app/admin/chambres/ChambresPageForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import type { ChambresPageContent, MoreRoomPhotoSchema } from "@/lib/content/schemas";
import type { z } from "zod";
import { ListEditor } from "@/components/admin/ListEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { generateId } from "@/lib/content/ids";
import { saveChambresPage } from "./actions";

type MoreRoomPhoto = z.infer<typeof MoreRoomPhotoSchema>;

function emptyMoreRoom(): MoreRoomPhoto {
  return { id: generateId("photo"), image: "", imageAlt: "", caption: "" };
}

export function ChambresPageForm({ initial }: { initial: ChambresPageContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveChambresPage(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  return (
    <div className="mt-10 flex flex-col gap-6 border-t border-espresso/10 pt-8">
      <h2 className="font-serif text-xl font-semibold">Page Chambres — en-tête et sections</h2>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Survol de l&apos;en-tête</span>
        <input
          value={content.heroEyebrow}
          onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Titre de l&apos;en-tête</span>
        <input
          value={content.heroTitle}
          onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Texte de l&apos;en-tête</span>
        <textarea
          value={content.heroText}
          onChange={(e) => setContent({ ...content, heroText: e.target.value })}
          rows={2}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>

      <h3 className="font-serif text-lg font-semibold">Et aussi — autres photos</h3>
      <ListEditor
        items={content.moreRooms}
        onChange={(moreRooms) => setContent({ ...content, moreRooms })}
        createItem={emptyMoreRoom}
        addLabel="Ajouter une photo"
        renderItem={(photo, update) => (
          <div className="flex flex-col gap-3">
            <ImageUploadField value={photo.image} onChange={(url) => update({ image: url })} label="Photo" />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold">Légende</span>
              <input
                value={photo.caption}
                onChange={(e) => update({ caption: e.target.value })}
                className="rounded-lg border border-espresso/20 px-3 py-2"
              />
            </label>
          </div>
        )}
      />

      <h3 className="font-serif text-lg font-semibold">Salles de bain</h3>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Survol</span>
        <input
          value={content.bathroomEyebrow}
          onChange={(e) => setContent({ ...content, bathroomEyebrow: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Titre</span>
        <input
          value={content.bathroomTitle}
          onChange={(e) => setContent({ ...content, bathroomTitle: e.target.value })}
          className="rounded-lg border border-espresso/20 px-3 py-2"
        />
      </label>
      <div className="flex gap-4">
        <ImageUploadField
          value={content.bathroomImage1}
          onChange={(url) => setContent({ ...content, bathroomImage1: url })}
          label="Photo 1"
        />
        <ImageUploadField
          value={content.bathroomImage2}
          onChange={(url) => setContent({ ...content, bathroomImage2: url })}
          label="Photo 2"
        />
      </div>

      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Render both forms in `app/admin/chambres/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { RoomsContentSchema, ChambresPageContentSchema } from "@/lib/content/schemas";
import { DEFAULT_ROOMS_CONTENT, DEFAULT_CHAMBRES_PAGE_CONTENT } from "@/lib/content/defaults";
import { RoomsForm } from "./RoomsForm";
import { ChambresPageForm } from "./ChambresPageForm";

export default async function AdminChambresPage() {
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const chambresPage = await getContent("chambresPage", ChambresPageContentSchema, DEFAULT_CHAMBRES_PAGE_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Chambres</h1>
      <p className="mt-2 text-sm text-espresso/60">
        L&apos;accueil affiche automatiquement les 3 premières chambres ci-dessous ; la page Chambres les affiche
        toutes, dans cet ordre.
      </p>
      <RoomsForm initial={rooms} />
      <ChambresPageForm initial={chambresPage} />
    </div>
  );
}
```

- [ ] **Step 4: Wire the "Et aussi" and bathroom sections of `app/chambres/page.tsx`**

Remove the local `const moreRooms = [...]` array. Fetch `chambresPage` alongside the existing `global`/`rooms`:

```tsx
import { ChambresPageContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CHAMBRES_PAGE_CONTENT } from "@/lib/content/defaults";

export default async function ChambresPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const rooms = await getContent("rooms", RoomsContentSchema, DEFAULT_ROOMS_CONTENT);
  const chambresPage = await getContent("chambresPage", ChambresPageContentSchema, DEFAULT_CHAMBRES_PAGE_CONTENT);
  return (
    <>
      <Header current="chambres" waNumber={global.whatsappNumber} />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        ...
          <Eyebrow light>{chambresPage.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[620px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {chambresPage.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{chambresPage.heroText}</p>
        ...
      </section>

      {/* Rooms grid — unchanged from Task 11 */}
      ...

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
              <figure key={room.id} className="overflow-hidden rounded-[18px] border border-espresso/8 bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(36,27,18,0.14)]">
                <div className="relative h-[190px]">
                  <Image src={room.image} alt={room.imageAlt} fill sizes="(max-width: 860px) 100vw, 33vw" className="object-cover" />
                </div>
                <figcaption className="px-5 py-4 text-[14px] font-medium text-espresso/75">{room.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={buildWaLink("Bonjour, je souhaite connaître les disponibilités et tarifs des chambres de l'Hôtel Résidence Aïcha.", global.whatsappNumber)}
              className="flex items-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-[14px] font-semibold text-paper"
            >
              <MessageCircle className="h-4 w-4" />
              Demander les disponibilités
            </a>
            <a href="/galerie" className="text-[14px] font-semibold text-terracotta underline underline-offset-4">
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
              <Image src={chambresPage.bathroomImage1} alt={chambresPage.bathroomImage1Alt} fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="relative h-60 md:h-[340px] overflow-hidden rounded-[18px]">
              <Image src={chambresPage.bathroomImage2} alt={chambresPage.bathroomImage2Alt} fill sizes="(max-width: 860px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </Wrap>
      </section>

      <CTABand
        heading="Une question sur une chambre ou une disponibilité ?"
        buttonLabel="Écrivez-nous sur WhatsApp"
        waMessage="Bonjour, j'ai une question sur les chambres de l'Hôtel Résidence Aïcha."
        waNumber={global.whatsappNumber}
        greenButton
      />

      <Footer simple />
    </>
  );
}
```

- [ ] **Step 5: Write `app/admin/contact/actions.ts`**

```ts
"use server";

import { setContent } from "@/lib/content/store";
import { ContactContentSchema, type ContactContent } from "@/lib/content/schemas";

export type SaveContactState = { error?: string; success?: boolean } | undefined;

export async function saveContact(content: ContactContent): Promise<SaveContactState> {
  const result = await setContent("contact", ContactContentSchema, content, ["/contact"]);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
```

- [ ] **Step 6: Write `app/admin/contact/page.tsx`**

```tsx
import { getContent } from "@/lib/content/store";
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";
import { ContactForm } from "./ContactForm";

export default async function AdminContactPage() {
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-espresso/60">
        Les coordonnées (téléphone, WhatsApp, email, adresse) se modifient dans la section Général.
      </p>
      <ContactForm initial={contact} />
    </div>
  );
}
```

- [ ] **Step 7: Write `app/admin/contact/ContactForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import type { ContactContent } from "@/lib/content/schemas";
import { ListEditor } from "@/components/admin/ListEditor";
import { ICON_OPTIONS } from "@/lib/content/icons";
import { generateId } from "@/lib/content/ids";
import { saveContact } from "./actions";

type WithId<T> = T & { id: string };

export function ContactForm({ initial }: { initial: ContactContent }) {
  const [content, setContent] = useState(initial);
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // id is the array index (not the title) so two blank "just added" items never collide — see the
  // same note in app/admin/accueil/HomeForm.tsx.
  const servicesWithId: WithId<ContactContent["services"][number]>[] = content.services.map((s, index) => ({ ...s, id: String(index) }));
  const stepsWithId: WithId<ContactContent["steps"][number]>[] = content.steps.map((s, index) => ({ ...s, id: String(index) }));

  function handleSave() {
    setMessage(null);
    startSave(async () => {
      const result = await saveContact(content);
      setMessage(result?.error ?? "Enregistré.");
    });
  }

  function renderIconTitleText<T extends { icon: ContactContent["services"][number]["icon"]; title: string; text: string }>(
    item: T,
    update: (patch: Partial<T>) => void
  ) {
    return (
      <div className="flex flex-col gap-2">
        <select
          value={item.icon}
          onChange={(e) => update({ icon: e.target.value as T["icon"] } as Partial<T>)}
          className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          value={item.title}
          onChange={(e) => update({ title: e.target.value } as Partial<T>)}
          placeholder="Titre"
          className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
        />
        <textarea
          value={item.text}
          onChange={(e) => update({ text: e.target.value } as Partial<T>)}
          rows={2}
          placeholder="Texte"
          className="rounded-lg border border-espresso/20 px-3 py-2 text-sm"
        />
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">En-tête</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Survol</span>
          <input
            value={content.heroEyebrow}
            onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Titre</span>
          <input
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">Texte</span>
          <textarea
            value={content.heroText}
            onChange={(e) => setContent({ ...content, heroText: e.target.value })}
            rows={2}
            className="rounded-lg border border-espresso/20 px-3 py-2"
          />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Services & équipements</h2>
        <ListEditor
          items={servicesWithId}
          onChange={(items) => setContent({ ...content, services: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("service"), icon: "sparkles", title: "", text: "" })}
          addLabel="Ajouter un service"
          renderItem={renderIconTitleText}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg font-semibold">Étapes de réservation</h2>
        <ListEditor
          items={stepsWithId}
          onChange={(items) => setContent({ ...content, steps: items.map(({ id: _id, ...rest }) => rest) })}
          createItem={() => ({ id: generateId("etape"), icon: "messageCircle", title: "", text: "" })}
          addLabel="Ajouter une étape"
          renderItem={renderIconTitleText}
        />
      </section>

      {message && <p className="text-sm">{message}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="w-fit rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Wire the hero/services/steps sections of `app/contact/page.tsx`**

Remove the local `services` and `steps` arrays. Fetch `contact` alongside the existing `global`:

```tsx
import { ContactContentSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/defaults";
import { ICONS } from "@/lib/content/icons";

export default async function ContactPage() {
  const global = await getContent("global", GlobalContentSchema, DEFAULT_GLOBAL_CONTENT);
  const contact = await getContent("contact", ContactContentSchema, DEFAULT_CONTACT_CONTENT);
  return (
    <>
      <Header current="contact" waNumber={global.whatsappNumber} />

      {/* Title banner */}
      <section className="relative w-full overflow-hidden py-14 md:py-[88px]">
        ...
          <Eyebrow light>{contact.heroEyebrow}</Eyebrow>
          <h1 className="mt-3.5 max-w-[640px] font-serif text-[28px] md:text-[40px] font-medium leading-[1.12] text-paper">
            {contact.heroTitle}
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-paper/80">{contact.heroText}</p>
        ...
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
                <div key={title} className="flex flex-col gap-3 rounded-2xl border border-espresso/8 bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(36,27,18,0.1)]">
                  <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.6} />
                  <span className="text-[15px] font-semibold">{title}</span>
                  <p className="text-[13.5px] leading-[1.6] text-espresso/62">{text}</p>
                </div>
              );
            })}
          </div>
          ...
        </Wrap>
      </section>
      ...
      {/* Réservation */}
      <section className="w-full">
        <Wrap className="py-16 md:py-[76px]">
          ...
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
                  <p className="text-sm leading-[1.65] text-espresso/65">{text}</p>
                </div>
              );
            })}
          </div>
        </Wrap>
      </section>
      ...
```
The `Snowflake, Wifi, Coffee, ShowerHead, ShieldCheck, Sofa, HeartHandshake, MessageCircle, MapPin, CalendarCheck, KeyRound` icon imports are no longer needed directly in this file (sourced through `ICONS`) — keep only `Phone, Mail, ArrowRight` (still used directly) plus whatever the info card still imports directly.

- [ ] **Step 9: Run the full test suite, lint, and a production build**

Run: `npm run test && npm run lint && npm run build`
Expected: all tests pass, lint passes, build succeeds with no type errors.

- [ ] **Step 10: Manually verify end-to-end**

`npm run dev`, then:
1. Every public page (`/`, `/chambres`, `/galerie`, `/contact`) renders identically to the pre-admin site.
2. `/admin/chambres` (second form): edit the "Et aussi" photos and bathroom section, save, confirm `/chambres` updates.
3. `/admin/contact`: edit/reorder/add/delete a service and a step, save, confirm `/contact` updates.
4. Full admin nav sanity pass: `/admin/general`, `/admin/accueil`, `/admin/chambres`, `/admin/galerie`, `/admin/contact` all load, save, and log out correctly.

- [ ] **Step 11: Commit**

```bash
git add app/admin/chambres app/admin/contact app/chambres/page.tsx app/contact/page.tsx
git commit -m "Add chambres-page extras and contact content admin forms, wire remaining public pages"
```

---

## Task 15: Final Cleanup Pass

**Files:**
- Modify: any file left with now-unused imports or dead code from the above tasks

**Interfaces:** none new.

- [ ] **Step 1: Search for leftover hardcoded content arrays**

Run:
```bash
grep -rn "^const \(rooms\|trustItems\|testimonials\|reasons\|photos\|moreRooms\|services\|steps\) = \[" app
```
Expected: no matches (everything now reads from KV via `getContent`).

- [ ] **Step 2: Run the full check**

Run: `npm run test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 3: Commit if anything changed**

```bash
git add -A
git commit -m "Clean up unused imports after admin panel wiring"
```
(skip this step if Step 1/2 found nothing to change).
