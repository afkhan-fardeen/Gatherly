import {
  ForkKnife,
  Confetti,
  Armchair,
  MusicNotes,
  Camera,
  DotsThree,
} from "@phosphor-icons/react";

export const VENDOR_CATEGORIES = [
  { slug: "catering", name: "Catering", Icon: ForkKnife, available: true },
  { slug: "decor", name: "Decor", Icon: Confetti, available: false },
  { slug: "rentals", name: "Rentals", Icon: Armchair, available: false },
  { slug: "entertainment", name: "Entertainment", Icon: MusicNotes, available: false },
  { slug: "photography", name: "Photography", Icon: Camera, available: false },
  { slug: "misc", name: "Miscellaneous", Icon: DotsThree, available: false },
] as const;

export const ALLOWED_CATEGORIES = ["catering"] as const;
export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

export function isCategoryAllowed(slug: string): slug is AllowedCategory {
  return ALLOWED_CATEGORIES.includes(slug as AllowedCategory);
}
