import type { ServiceCategorySlug } from "@/lib/services-data";

export type ServiceDetail = {
  slug: ServiceCategorySlug;
  title: string;
  intro: string;
  image: string;
  services: { id: string; name: string; description: string; image?: string }[];
};

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&q=75`;

export const SERVICE_DETAILS: Record<ServiceCategorySlug, ServiceDetail> = {
  "residential-moving": {
    slug: "residential-moving",
    title: "Residential & Personal Moving",
    intro: "Stress-free home and apartment moves across Nairobi, including professional packing, furniture assembly and space organization.",
    image: "/images/IMG_20251220_105405.jpg",
    services: [
      { id: "house-apartment", name: "House & Apartment Moving", description: "Local relocations across Nairobi estates and suburbs.", image: photo("photo-1600585154340-be6161a56a0c") },
      { id: "packing-crating", name: "Packing, Crating & Unpacking", description: "High-grade wrapping materials, custom crates, and unboxing.", image: photo("photo-1600518464441-9154a4dea21b") },
      { id: "furniture-assembly", name: "Furniture Assembly & Placement", description: "Expert disassembly, mounting, and interior positioning.", image: photo("photo-1555041469-a586c61ea9bc") },
      { id: "decluttering", name: "Decluttering & Space Organization", description: "Pre-move clearing and space organization.", image: photo("photo-1616486338812-3dadae4b4ace") },
      { id: "cctv", name: "CCTV Installation", description: "Supply and professional installation of security cameras, with remote phone viewing, for homes and businesses.", image: "/images/CCTV.jpg" },
      { id: "water-filter", name: "Water Filter Installation", description: "Supply, installation and servicing of water filtration systems for homes and offices.", image: "/images/water-filter.jpeg" },
    ],
  },
  "commercial-moving": {
    slug: "commercial-moving",
    title: "Commercial & Business Moving",
    intro: "Planned office, data center and warehouse relocations with labeled inventory, secure IT handling and minimal downtime.",
    image: "/images/OFFICE.jpg",
    services: [
      { id: "office-relocation", name: "Office Relocation", description: "Planned corporate transfers with labeled inventory and fast setup.", image: photo("photo-1497366754035-f200968a6e72") },
      { id: "data-center", name: "Data Center & Tech Moving", description: "Anti-static packing and secure transport for servers and IT gear.", image: photo("photo-1558494949-ef010cbdcc31") },
      { id: "employee-mobility", name: "Corporate Employee Mobility", description: "Dedicated relocation packages for company staff transfers.", image: photo("photo-1521737711867-e3b97375f902") },
      { id: "warehouse-relocation", name: "Warehouse Relocation", description: "Bulk machinery, stock transfer, and facility clearing.", image: photo("photo-1586528116311-ad8dd3c8310d") },
    ],
  },
  "scope-and-distance": {
    slug: "scope-and-distance",
    title: "By Scope & Distance",
    intro: "From same-day moves within Nairobi to upcountry transit and cross-border logistics across East Africa.",
    image: "/images/IMG_20251220_105328.jpg",
    services: [
      { id: "intra-nairobi", name: "Intra-Nairobi Moving", description: "Same-day local moves across Nairobi neighborhoods.", image: photo("photo-1449824913935-59a10b8d2000") },
      { id: "inter-county", name: "Inter-County & Upcountry Moving", description: "Long-distance transit between Kenyan towns.", image: photo("photo-1464219789935-c2d9d9aba644") },
      { id: "cross-border", name: "East African Cross-Border Moving", description: "End-to-end regional logistics with customs assistance.", image: photo("photo-1494412519320-aa613dfb7738") },
    ],
  },
  "specialized-logistics": {
    slug: "specialized-logistics",
    title: "Specialized Logistics & Courier",
    intro: "Event gear, fine art, pianos, pets, express courier, secure storage and VIP concierge moves, handled with specialist care.",
    image: "/images/IMG_20251220_105330.jpg",
    services: [
      { id: "event-gear", name: "Event Gear & Production Transport", description: "Secure movement for sound, lighting, and stage gear.", image: photo("photo-1506157786151-b8491531f063") },
      { id: "express-courier", name: "Express On-Demand Courier", description: "Door-to-door regional package delivery.", image: photo("photo-1580674285054-bed31e145f59") },
      { id: "fine-art", name: "Fine Art & Fragile Handling", description: "Climate-aware, padded transport for high-value decor.", image: photo("photo-1577083552431-6e5fd01aa342") },
      { id: "heavy-piano", name: "Heavy & Piano Moving", description: "Specialized rigging and lifting gear for heavy equipment.", image: photo("photo-1520523839897-bd0b52f945a0") },
      { id: "pet-relocation", name: "Pet Relocation", description: "Safe, stress-free animal transit adhering to transport standards.", image: photo("photo-1543466835-00a7907e9de1") },
      { id: "storage", name: "Storage & Warehousing", description: "Secure short-term and long-term storage facilities.", image: photo("photo-1600880292203-757bb62b4baf") },
      { id: "vip-concierge", name: "VIP Moving Concierge", description: "Full-service turnkey relocation handling utility setups and logistics.", image: photo("photo-1600210492486-724fe5c67fb0") },
    ],
  },
  "cleaning-services": {
    slug: "cleaning-services",
    title: "Professional Cleaning Services",
    intro: "Deep home cleaning, post-construction, event, Airbnb, commercial and industrial cleaning, plus carpet care and pest control.",
    image: "/images/IMG_20251204_143807.jpg",
    services: [
      { id: "home-spring", name: "Home Spring Cleaning", description: "Thorough deep cleaning and sanitization for private homes.", image: photo("photo-1581578731548-c64695cc6952") },
      { id: "event-cleaning", name: "Event & After-Party Cleaning", description: "Post-event cleanup and site restoration.", image: photo("photo-1511795409834-ef04bbd61622") },
      { id: "post-construction", name: "Post-Construction Cleaning", description: "Dust extraction, paint splatter removal, and post-build cleanup.", image: photo("photo-1504307651254-35680f356dfd") },
      { id: "hospitality", name: "Hospitality & Airbnb Cleaning", description: "Quick-turnover sanitization for short-let rentals and guest houses.", image: photo("photo-1566073771259-6a8506099945") },
      { id: "industrial", name: "Warehouse & Industrial Cleaning", description: "Floor scrubbing, dusting, and industrial maintenance.", image: photo("photo-1581092160562-40aa08e78837") },
      { id: "commercial-cleaning", name: "Commercial Property Cleaning", description: "Scheduled maintenance for office buildings and shops.", image: photo("photo-1497366811353-6870744d04b2") },
      { id: "carpet-care", name: "Carpet & Upholstery Care", description: "Steam cleaning and stain removal for sofas and rugs.", image: photo("photo-1600166898405-da9535204843") },
      { id: "pest-control", name: "Pest Control & Fumigation", description: "Certified extermination and preventive pest care.", image: photo("photo-1584820927498-cfe5211fd8bf") },
    ],
  },
};

export function getServiceDetail(slug: string) {
  return SERVICE_DETAILS[slug as ServiceCategorySlug];
}
