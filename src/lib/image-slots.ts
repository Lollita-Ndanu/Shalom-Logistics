import { IMAGE_SLOTS } from "../../data/image-slots";
export { IMAGE_SLOTS };
export type { ImageSlot } from "../../data/image-slots";

export const IMAGE_SLOT_BY_ID = Object.fromEntries(IMAGE_SLOTS.map((slot) => [slot.id, slot]));

export const PHOTO_CREDITS = IMAGE_SLOTS
  .filter((slot) => slot.author !== "Shalom Logistics")
  .map((slot) => ({ slot: slot.id, photographer: slot.author, sourceName: new URL(slot.sourceUrl).hostname, license: slot.license, link: slot.sourceUrl }));
