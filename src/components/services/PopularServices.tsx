"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import {
  Building2,
  House,
  Route,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import ServicesRail from "@/components/shared/ServicesRail";

type PopularService = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

const POPULAR_SERVICES: PopularService[] = [
  {
    title: "Residential Moving",
    description:
      "Full-service home and apartment relocation across Nairobi.",
    href: "#residential-moving",
    icon: House,
    badge: "Most Requested",
  },
  {
    title: "Office & Commercial Moving",
    description: "Zero-downtime office transitions and IT setup.",
    href: "#commercial-moving",
    icon: Building2,
  },
  {
    title: "Inter-County / Upcountry Moving",
    description: "Long-distance transit between Kenyan towns.",
    href: "#scope-and-distance",
    icon: Route,
  },
  {
    title: "Home Spring Cleaning",
    description:
      "Deep residential cleaning and sanitization prior to move-in.",
    href: "#cleaning-services",
    icon: Sparkles,
  },
  {
    title: "Event Gear Transport",
    description:
      "Dedicated transit for production, audio, and exhibition setups.",
    href: "#specialized-logistics",
    icon: Truck,
  },
];

export default function PopularServices() {
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
      <div className="mx-auto mb-14 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="popular-services-heading"
          className="text-4xl font-bold text-gray-900 sm:text-5xl"
        >
          Popular Services
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Our most requested services, ready to book in minutes.
        </p>
      </div>

      <ServicesRail>
        {POPULAR_SERVICES.map((service) => {
          const Icon = service.icon;

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

              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                <Icon className="h-7 w-7 text-jungle" aria-hidden="true" />
              </span>

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
