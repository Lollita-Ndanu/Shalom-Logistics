"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SERVICES = [
  {
    title: "Home Relocation",
    desc: "Full-service residential moves across Kenya.",
    detail:
      "Careful packing, secure transport and gentle handling for every home.",
    image: "/images/IMG_20251220_105405.jpg",
  },
  {
    title: "Office Moves",
    desc: "Minimal downtime for your business relocation.",
    detail:
      "Planned around your schedule so your team gets back to work fast.",
    image: "/images/OFFICE.jpg",
  },
  {
    title: "Goods Transport",
    desc: "Safe, reliable delivery of goods nationwide.",
    detail:
      "Flexible vehicle sizes with door-to-door service and on-time arrival.",
    image: "/images/IMG_20251220_105328.jpg",
  },
  {
    title: "CCTV Installation",
    desc: "Professional security camera systems.",
    detail:
      "Clean, dependable installations that keep your property watched.",
    image: "/images/CCTV.jpg",
  },
  {
    title: "Water Filters",
    desc: "Clean water solutions for homes & offices.",
    detail:
      "Quality filtration systems for safe, great-tasting water all day.",
    image: "/images/water-filter.jpeg",
  },
  {
    title: "Cleaning",
    desc: "Thorough move-in & move-out cleaning services.",
    detail:
      "Deep, detail-focused cleaning that leaves every space spotless.",
    image: "/images/IMG_20251204_143807.jpg",
  },
];

export default function ServicesMarqueeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = containerRef.current;
    if (!el) return;
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByCard = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector("a");
    const amount = card ? card.clientWidth + 24 : 320;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-24 overflow-hidden">
      <style>{`
        .services-rail {
          scrollbar-width: none;
        }
        .services-rail::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Our Services
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Comprehensive moving and related solutions tailored to your needs.
        </p>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={containerRef}
          onScroll={updateArrows}
          className="services-rail overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x flex-1"
        >
          <div className="flex w-max">
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="w-72 sm:w-80 shrink-0 mr-6 rounded-2xl border border-gray-200 bg-white overflow-hidden text-left group"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 288px, 320px"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {service.desc}
                  </p>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {service.detail}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollByCard("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/services"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-jungle-dark hover:bg-jungle text-white text-base font-semibold transition-all duration-300 shadow-xl shadow-jungle-dark/20 hover:-translate-y-0.5"
        >
          View More Services
        </Link>
      </div>
    </section>
  );
}
