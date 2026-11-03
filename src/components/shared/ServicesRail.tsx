"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServicesRailProps {
  children: ReactNode;
}

export default function ServicesRail({ children }: ServicesRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateArrows]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-service-card]");
    const amount = card ? card.clientWidth + 24 : 320;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <style>{`
        .services-rail {
          scrollbar-width: none;
        }
        .services-rail::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="relative flex flex-wrap items-center justify-center gap-4 px-4 sm:px-6 md:flex-nowrap md:justify-start lg:px-8">
        <button
          type="button"
          onClick={() => scrollByCard("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="order-2 shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors md:order-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={containerRef}
          onScroll={updateArrows}
          className="services-rail order-1 w-full min-w-0 flex-none overflow-x-auto overscroll-x-contain scroll-smooth motion-reduce:scroll-auto [touch-action:pan-x_pan-y] md:order-none md:w-auto md:flex-1"
        >
          <div className="flex w-max">{children}</div>
        </div>

        <button
          type="button"
          onClick={() => scrollByCard("right")}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="order-3 shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors md:order-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
