export type ServiceCategorySlug =
  | "residential-moving"
  | "commercial-moving"
  | "scope-and-distance"
  | "specialized-logistics"
  | "cleaning-services";

export type ServiceCategory = {
  slug: ServiceCategorySlug;
  anchorId: ServiceCategorySlug;
  name: string;
  summary: string;
  image: string;
  imageAlt: string;
  subServices: readonly string[];
  featureVideo?: string;
  featurePoster?: string;
};

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  {
    slug: "residential-moving",
    anchorId: "residential-moving",
    name: "Residential & Personal Moving",
    summary:
      "Stress-free home and apartment moves across Nairobi, including professional packing, furniture assembly and space organization.",
    image: "/images/IMG_20251220_105405.jpg",
    imageAlt: "Shalom Logistics crew preparing a household move with a truck.",
    subServices: [
      "House & Apartment Moving",
      "Packing, Crating & Unpacking",
      "Furniture Assembly & Placement",
      "Decluttering & Space Organization",
    ],
  },
  {
    slug: "commercial-moving",
    anchorId: "commercial-moving",
    name: "Commercial & Business Moving",
    summary:
      "Planned office, data center and warehouse relocations with labeled inventory, secure IT handling and minimal downtime.",
    image: "/images/OFFICE.jpg",
    imageAlt: "Office furniture and moving equipment prepared for a commercial relocation.",
    subServices: [
      "Office Relocation",
      "Data Center & Tech Moving",
      "Corporate Employee Mobility",
      "Warehouse Relocation",
    ],
  },
  {
    slug: "scope-and-distance",
    anchorId: "scope-and-distance",
    name: "By Scope & Distance",
    summary:
      "From same-day moves within Nairobi to upcountry transit and cross-border logistics across East Africa.",
    image: "/images/IMG_20251220_105328.jpg",
    imageAlt: "Shalom Logistics moving crew and truck ready for long-distance transit.",
    subServices: [
      "Intra-Nairobi Moving",
      "Inter-County / Upcountry Moving",
      "East African Cross-Border Moving",
    ],
    featureVideo: "/videos/scope-distance.mp4",
    featurePoster: "/images/IMG_20251220_105328.jpg",
  },
  {
    slug: "specialized-logistics",
    anchorId: "specialized-logistics",
    name: "Specialized Logistics & Courier",
    summary:
      "Event gear, fine art, pianos, pets, express courier, secure storage and VIP concierge moves, handled with specialist care.",
    image: "/images/IMG_20251220_105330.jpg",
    imageAlt: "Shalom Logistics transport vehicle prepared for specialist cargo delivery.",
    subServices: [
      "Event Gear & Production Transport",
      "Express On-Demand Courier",
      "Fine Art & Fragile Handling",
      "Heavy & Piano Moving",
      "Pet Relocation",
      "Storage & Warehousing",
      "VIP Moving Concierge",
    ],
  },
  {
    slug: "cleaning-services",
    anchorId: "cleaning-services",
    name: "Professional Cleaning Services",
    summary:
      "Deep home cleaning, post-construction, event, Airbnb, commercial and industrial cleaning, plus carpet care and pest control.",
    image: "/images/IMG_20251204_143807.jpg",
    imageAlt: "Professional cleaner carrying out detailed window cleaning.",
    subServices: [
      "Home Spring Cleaning",
      "Event & After-Party Cleaning",
      "Post-Construction Cleaning",
      "Hospitality & Airbnb Cleaning",
      "Warehouse & Industrial Cleaning",
      "Commercial Property Cleaning",
      "Carpet & Upholstery Care",
      "Pest Control & Fumigation",
    ],
  },
];

export function getServiceCategory(slug: string) {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug);
}
