"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import ServicesRail from "@/components/shared/ServicesRail";
import HomeReveal from "@/components/home/HomeReveal";
import Image from "next/image";
import { IMAGE_SLOT_BY_ID } from "@/lib/image-slots";

type PopularService = {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  image?: string;
  categorySlug?: string;
  subservice?: string;
};

const POPULAR_SERVICES: PopularService[] = [
  {
    title: "Residential Moving",
    description:
      "Full-service home and apartment relocation across Nairobi.",
    href: "#residential-moving",
    icon: "residential",
    badge: "Most Requested",
  },
  {
    title: "Office & Commercial Moving",
    description: "Zero-downtime office transitions and IT setup.",
    href: "#commercial-moving",
    icon: "office",
  },
  {
    title: "Inter-County / Upcountry Moving",
    description: "Long-distance transit between Kenyan towns.",
    href: "#scope-and-distance",
    icon: "distance",
  },
  {
    title: "Home Spring Cleaning",
    description:
      "Deep residential cleaning and sanitization prior to move-in.",
    href: "#cleaning-services",
    icon: "cleaning",
  },
  {
    title: "Event Gear Transport",
    description:
      "Dedicated transit for production, audio, and exhibition setups.",
    href: "#specialized-logistics",
    icon: "courier",
  },
];

export default function PopularServices({ content = {} }: { content?: { heading?: string; intro?: string; items?: (PopularService & { isVisible?: boolean })[] } }) {
  const popularServices = (content.items ?? POPULAR_SERVICES).filter((item) => (item as PopularService & { isVisible?: boolean }).isVisible !== false);
  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const target = document.getElementById(href.replace("#", ""));
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", href);
  };

  return (
    <section
      aria-labelledby="popular-services-heading"
      className="bg-white py-24"
    >
      <HomeReveal className="mx-auto mb-14 max-w-7xl px-4 text-center sm:px-6 lg:px-8" effect="slide">
        <h2
          id="popular-services-heading"
          className="text-4xl font-bold text-gray-900 sm:text-5xl"
        >
          {content.heading ?? "Popular Services"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          {content.intro ?? "Our most requested services, ready to book in minutes."}
        </p>
      </HomeReveal>

      <ServicesRail>
        {popularServices.map((service, index) => {
          const title = service.title.toLowerCase();
          const imageSlot = IMAGE_SLOT_BY_ID[`popular-${title.includes("residential") || title.includes("home") ? "residential" : title.includes("office") || title.includes("commercial") ? "office" : title.includes("clean") ? "cleaning" : title.includes("county") || title.includes("upcountry") || title.includes("distance") ? "distance" : "courier"}`] ?? IMAGE_SLOT_BY_ID[`popular-${["residential", "office", "distance", "cleaning", "courier"][index % 5]}`];

          return (
            <Link
              key={service.title}
              href={service.href}
              onClick={(event) => handleAnchorClick(event, service.href)}
              data-service-card
              className="relative flex w-[260px] shrink-0 flex-col bg-jungle p-[22px] text-center transition-colors duration-300 hover:bg-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 focus-visible:ring-offset-white md:w-80 md:p-6 [touch-action:pan-x_pan-y] mr-6"
            >
              {service.badge ? (
                <span className="absolute right-0 top-0 bg-yellow-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                  {service.badge}
                </span>
              ) : null}

              <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                <Image src={service.image ?? imageSlot.file} alt={service.title} width={600} height={450} sizes="(max-width: 767px) 260px, 320px" placeholder="blur" blurDataURL={imageSlot.blurDataURL} loading="lazy" className="h-full w-full object-cover" />
              </div>

              <h3 className="mt-5 text-lg font-bold leading-6 text-white md:text-xl md:leading-7">
                {service.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/90 md:text-sm">
                {service.description}
              </p>
            </Link>
          );
        })}
      </ServicesRail>
    </section>
  );
}
