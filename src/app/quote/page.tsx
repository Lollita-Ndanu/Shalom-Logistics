import Footer from "@/components/layout/Footer";
import QuoteClient from "@/components/quote/QuoteClient";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/service-detail-data";

const FALLBACK_QUOTE = {
  heading: "Tell us about your move.", intro: "Share a few details and our team will follow up with a clear plan and transparent quote.",
  nextHeading: "What happens next", steps: ["Send us the details", "Our team follows up", "You get a clear, transparent quote"],
  serviceHeading: "Service category", serviceCategoryAriaLabel: "Service", serviceOptionsHeading: "Select service options", serviceOptionsHelper: "Choose one or more options under {category}.",
  yourDetailsHeading: "Your details", moveDetailsHeading: "Move details", fromLabel: "From", fromPlaceholder: "Starting location", toLabel: "To", toPlaceholder: "Destination", locationLabel: "Location", locationPlaceholder: "Where do you need the service?", dateLabel: "Preferred date", nameLabel: "Name", namePlaceholder: "Your name", phoneLabel: "Phone", phonePlaceholder: "Your phone number", emailLabel: "Email", emailPlaceholder: "you@example.com", optionalLabel: "optional", notesLabel: "Anything else we should know?", notesPlaceholder: "Number of rooms, stairs or lift, fragile items...", primaryLabel: "Send Quote Request", whatsappLabel: "Send these details on WhatsApp instead", successHeading: "We've received your request.", successBody: "Your request has been saved. Our team will follow up with you soon.",
};

export default async function QuotePage() {
  const sections = await getSiteSections(["quote_content", "services_categories", "services_detail", "global_brand", "footer"]);
  const quote = sections.quote_content?.content as Partial<typeof FALLBACK_QUOTE> | undefined;
  const categoryContent = sections.services_categories?.content as { items?: typeof SERVICE_CATEGORIES[number][] } | undefined;
  const categories = sections.services_categories?.isVisible === false ? [] : visibleItems(categoryContent?.items?.length ? categoryContent.items : [...SERVICE_CATEGORIES]);
  const detailContent = sections.services_detail?.content as { items?: (typeof SERVICE_DETAILS[keyof typeof SERVICE_DETAILS])[] } | undefined;
  const brand = sections.global_brand?.content as { phone1?: string } | undefined;
  const footer = sections.footer?.content as { whatsappNumber?: string } | undefined;
  const details = { ...SERVICE_DETAILS };
  for (const item of detailContent?.items ?? []) {
    if (item.isVisible === false) continue;
    details[item.slug] = { ...details[item.slug], ...item, services: visibleItems(item.services ?? []).map((service) => ({ ...service, image: localDetailImage(service.image ?? "") })) };
  }
  return <><QuoteClient content={{ ...FALLBACK_QUOTE, ...quote }} sectionVisible={sections.quote_content?.isVisible !== false} categories={categories} details={details} phone={brand?.phone1} whatsappUrl={footer?.whatsappNumber ? `https://wa.me/${footer.whatsappNumber}` : undefined} /><Footer /></>;
}

function localDetailImage(image: string) {
  if (image.includes("photo-149736") || image.includes("photo-155849") || image.includes("photo-152173") || image.includes("photo-158652") || image.includes("photo-149736681")) return "/images/slots/home-office-moves.webp";
  if (image.includes("photo-158157") || image.includes("photo-151179") || image.includes("photo-150430") || image.includes("photo-156607") || image.includes("photo-158109") || image.includes("photo-160016") || image.includes("photo-158482")) return "/images/slots/home-cleaning.webp";
  if (image.includes("photo-160058") || image.includes("photo-160051") || image.includes("photo-155504") || image.includes("photo-161648") || image.includes("photo-160021")) return "/images/slots/home-home-relocation.webp";
  return "/images/slots/home-goods-transport.webp";
}
