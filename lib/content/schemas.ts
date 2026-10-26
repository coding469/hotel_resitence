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
