const WHATSAPP_NUMBER = "221781608275";
export const WHATSAPP_DISPLAY = "+221 78 160 82 75";
export const PHONE_NUMBER = "221781292929";
export const PHONE_DISPLAY = "+221 78 129 29 29";
export const CONTACT_EMAIL = "hotelaicha.tamba@gmail.com";

export function buildWaLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
