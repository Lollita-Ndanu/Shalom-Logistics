"use client";

import Image from "next/image";
import Link from "next/link";
import HomeReveal from "@/components/home/HomeReveal";
import ServicesRail from "@/components/shared/ServicesRail";
import { IMAGE_SLOT_BY_ID } from "@/lib/image-slots";

type HomeService = {
  title: string;
  description?: string;
  desc?: string;
  detail?: string;
  image: string;
  isVisible?: boolean;
};

const SERVICES: HomeService[] = [
  { title: "Home Relocation", desc: "Full-service residential moves across Kenya.", detail: "Careful packing, secure transport and gentle handling for every home.", image: "/images/slots/home-home-relocation.webp" },
  { title: "Office Moves", desc: "Minimal downtime for your business relocation.", detail: "Planned around your schedule so your team gets back to work fast.", image: "/images/slots/home-office-moves.webp" },
  { title: "Goods Transport", desc: "Safe, reliable delivery of goods nationwide.", detail: "Flexible vehicle sizes with door-to-door service and on-time arrival.", image: "/images/slots/home-goods-transport.webp" },
  { title: "CCTV Installation", desc: "Professional security camera systems.", image: "/images/slots/home-cctv.webp" },
  { title: "Water Filters", desc: "Clean water solutions for homes & offices.", detail: "Quality filtration systems for safe, great-tasting water all day.", image: "/images/slots/home-water-filters.webp" },
  { title: "Cleaning", desc: "Thorough move-in & move-out cleaning services.", detail: "Deep, detail-focused cleaning that leaves every space spotless.", image: "/images/slots/home-cleaning.webp" },
];

const CARD_META: Record<string, { category: string; quoteService: string; subservice?: string; chips: string[] }> = {
  "Home Relocation": { category: "Home", quoteService: "residential-moving", chips: ["House & Apartment Moving", "Packing & Crating", "Furniture Assembly"] },
  "Office Moves": { category: "Office", quoteService: "commercial-moving", chips: ["Office Relocation", "Data Center & Tech Moving", "Warehouse Relocation"] },
  "Goods Transport": { category: "Transport", quoteService: "specialized-logistics", subservice: "Express On-Demand Courier", chips: ["Express Courier", "Heavy & Piano Moving", "Storage"] },
  "CCTV Installation": { category: "Security", quoteService: "residential-moving", subservice: "CCTV Installation", chips: [] },
  "Water Filters": { category: "Water", quoteService: "residential-moving", subservice: "Water Filter Installation", chips: [] },
  Cleaning: { category: "Cleaning", quoteService: "cleaning-services", chips: ["Home Spring Cleaning", "Post-Construction", "Carpet & Upholstery"] },
};

const WHATSAPP_NUMBER = "254751794728";

function firstSentence(text: string) {
  const sentenceEnd = text.search(/[.!?](?:\s|$)/);
  return sentenceEnd < 0 ? text : text.slice(0, sentenceEnd + 1);
}

function ServiceCard({ service }: { service: HomeService }) {
  const meta = CARD_META[service.title];
  const desc = firstSentence(service.description ?? service.desc ?? "");
  const quoteHref = `/quote?service=${encodeURIComponent(meta.quoteService)}${meta.subservice ? `&subservice=${encodeURIComponent(meta.subservice)}` : ""}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Shalom Logistics, I'd like a quote for ${service.title}.`)}`;
  return (
    <article data-service-card className="group flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] bg-white transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ink)_20%,transparent)]">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <Image src={service.image} alt={service.title} width={800} height={500} sizes="(max-width: 639px) 80vw, (max-width: 1023px) 46vw, (max-width: 1279px) 31vw, 24vw" placeholder="blur" blurDataURL={IMAGE_SLOT_BY_ID[`home-${({ "Home Relocation": "home-relocation", "Office Moves": "office-moves", "Goods Transport": "goods-transport", "CCTV Installation": "cctv", "Water Filters": "water-filters", Cleaning: "cleaning" } as Record<string, string>)[service.title] ?? "home-relocation"}`]?.blurDataURL} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-[color-mix(in_srgb,var(--ink)_8%,transparent)]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[var(--ink)]">{meta.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 max-[639px]:p-[14px]">
        <h3 className="truncate text-lg font-semibold leading-6 text-[var(--ink)]">{service.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">{desc}</p>
        <ul className="mt-3 flex h-8 min-h-8 flex-nowrap gap-2 overflow-hidden" aria-label="Included services">
          {meta.chips.slice(0, 3).map((chip, index) => <li key={chip} title={chip} className={`${index === 2 ? "hidden min-[640px]:block min-[1280px]:hidden" : ""} min-w-0 shrink rounded-full border border-[color-mix(in_srgb,var(--color-jungle)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-jungle)_6%,white)] px-2.5 py-1 text-xs text-jungle`}><span className="block truncate">{chip}</span></li>)}
        </ul>
        <div className="mt-auto">
          <div className="my-4 h-px bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]" />
          <div className="mt-3 flex gap-2">
            <Link href={quoteHref} className="inline-flex h-12 flex-1 items-center justify-center rounded-[10px] bg-gold px-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Get a Quote</Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`Chat on WhatsApp about ${service.title}`} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--whatsapp)] transition-colors hover:bg-[color-mix(in_srgb,var(--whatsapp)_88%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-white"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.09.55 4.13 1.59 5.93L.1 24l6.33-1.66a11.9 11.9 0 0 0 5.65 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.45-8.42ZM12.09 21.77a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.67-.24-.38a9.85 9.85 0 0 1-1.51-5.24c0-5.47 4.45-9.92 9.92-9.92a9.86 9.86 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.44-7.43c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.07-.81.38-.28.3-1.06 1.03-1.06 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.13 4.53.72.31 1.28.49 1.72.62.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ServicesMarqueeSection({ content = {} }: { content?: { heading?: string; intro?: string; viewMoreLabel?: string; viewMoreHref?: string; items?: HomeService[] } }) {
  const services = (content.items ?? SERVICES).filter((service) => service.isVisible !== false);
  const cards = services.map((service) => {
    const fallback = SERVICES.find((item) => item.title === service.title);
    return { ...fallback, ...service, image: service.image || fallback?.image || "" };
  });
  return (
    <section className="overflow-hidden bg-white pt-0 pb-[clamp(40px,5vw,72px)]">
      <HomeReveal className="mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-[var(--ink)] sm:text-5xl">{content.heading ?? "Our Services"}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">{content.intro ?? "Comprehensive moving and related solutions tailored to your needs."}</p>
      </HomeReveal>
      <ServicesRail home>{cards.map((service) => <ServiceCard key={service.title} service={service} />)}</ServicesRail>
      <HomeReveal className="mt-[clamp(24px,3vw,40px)] text-center" effect="fade">
        <Link href={content.viewMoreHref ?? "/services"} className="inline-flex h-14 items-center justify-center rounded-[10px] bg-jungle px-8 text-base font-semibold text-white transition-colors hover:bg-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">{content.viewMoreLabel ?? "View More Services"}</Link>
      </HomeReveal>
    </section>
  );
}
