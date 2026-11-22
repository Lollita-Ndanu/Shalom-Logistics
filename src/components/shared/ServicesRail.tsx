"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServicesRail({ children, home = false }: { children: ReactNode; home?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const items = Children.toArray(children);
  const maxIndex = Math.max(0, items.length - (visibleCount >= 3.9 ? 4 : visibleCount >= 2.9 ? 3 : visibleCount >= 1.9 ? 2 : 1));

  const measure = useCallback(() => {
    const width = window.innerWidth;
    const count = home ? (width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1.1) : (width >= 1100 ? 3 : width >= 700 ? 2 : 1.1);
    setVisibleCount(count);
    const rail = containerRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-service-card]");
    if (card) {
      const gap = home ? (width < 640 ? 16 : 20) : 24;
      const step = card.getBoundingClientRect().width + gap;
      const index = Math.round(rail.scrollLeft / step);
      const max = Math.max(0, items.length - (count >= 3.9 ? 4 : count >= 2.9 ? 3 : count >= 1.9 ? 2 : 1));
      setActiveIndex(Math.min(max, index));
    }
  }, [home, items.length]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const scrollTo = (index: number) => {
    const rail = containerRef.current;
    const card = rail?.querySelector<HTMLElement>("[data-service-card]");
    if (!rail || !card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gap = home ? (window.innerWidth < 640 ? 16 : 20) : 24;
    rail.scrollTo({ left: index * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? "auto" : "smooth" });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const rail = containerRef.current;
    const card = rail?.querySelector<HTMLElement>("[data-service-card]");
    if (!rail || !card) return;
    const gap = home ? (window.innerWidth < 640 ? 16 : 20) : 24;
    setActiveIndex(Math.min(maxIndex, Math.round(rail.scrollLeft / (card.getBoundingClientRect().width + gap))));
  };

  return (
    !home ? <LegacyServicesRail>{children}</LegacyServicesRail> :
    <div className={`mx-auto w-full max-w-[1440px] ${home ? "px-8 sm:px-10 lg:px-12" : "px-4 sm:px-6 lg:px-8"}`}>
      <style>{`.services-rail{scrollbar-width:none}.services-rail::-webkit-scrollbar{display:none}`}</style>
      <div className={home ? "relative" : undefined}>
      <div ref={containerRef} onScroll={handleScroll} className={`services-rail flex snap-x snap-mandatory ${home ? "gap-5 max-[639px]:gap-4" : "gap-6"} overflow-x-auto overscroll-x-contain scroll-smooth pb-1 motion-reduce:scroll-auto`} aria-label="Our services">
        {items.map((item, index) => <div key={index} className="flex shrink-0 snap-start items-stretch" style={{ width: `calc((100% - ${(visibleCount - 1) * (home ? (visibleCount < 2 ? 16 : 20) : 24)}px) / ${visibleCount})` }}>{item}</div>)}
      </div>
      {home ? <>
        <button type="button" onClick={() => scrollTo(Math.max(0, activeIndex - 1))} aria-label="Previous services" className={`absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-white text-[var(--ink)] shadow-md transition-opacity min-[640px]:flex hover:bg-[var(--tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeIndex === 0 ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => scrollTo(Math.min(maxIndex, activeIndex + 1))} aria-label="Next services" className={`absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-white text-[var(--ink)] shadow-md transition-opacity min-[640px]:flex hover:bg-[var(--tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeIndex >= maxIndex ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </> : <nav className="mt-5 flex items-center justify-center gap-3" aria-label="Service carousel controls">
        <button type="button" onClick={() => scrollTo(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} aria-label="Previous services" className="flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ink)_15%,transparent)] bg-white text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--jungle,var(--color-jungle))_4%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-40"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose service slide">{items.map((_, index) => <button key={index} type="button" role="tab" aria-label={`Go to service ${index + 1}`} aria-selected={activeIndex === index} onClick={() => scrollTo(index)} className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeIndex === index ? "w-6 bg-gold" : "w-2.5 bg-[color-mix(in_srgb,var(--ink)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--ink)_45%,transparent)]"}`} />)}</div>
        <button type="button" onClick={() => scrollTo(Math.min(maxIndex, activeIndex + 1))} disabled={activeIndex >= maxIndex} aria-label="Next services" className="flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ink)_15%,transparent)] bg-white text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--jungle,var(--color-jungle))_4%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-40"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
      </nav>}
      </div>
    </div>
  );
}

function LegacyServicesRail({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  const scrollByCard = (direction: "left" | "right") => {
    const element = containerRef.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("[data-service-card]");
    const amount = card ? card.clientWidth + 24 : 320;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <>
      <style>{`.services-rail{scrollbar-width:none}.services-rail::-webkit-scrollbar{display:none}`}</style>
      <div className="relative flex flex-wrap items-center justify-center gap-4 px-4 sm:px-6 md:flex-nowrap md:justify-start lg:px-8">
        <button type="button" onClick={() => scrollByCard("left")} disabled={!canScrollLeft} aria-label="Scroll left" className="order-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 md:order-none"><ChevronLeft className="h-5 w-5" /></button>
        <div ref={containerRef} onScroll={updateArrows} className="services-rail order-1 w-full min-w-0 flex-none overflow-x-auto overscroll-x-contain scroll-smooth [touch-action:pan-x_pan-y] motion-reduce:scroll-auto md:order-none md:w-auto md:flex-1"><div className="flex w-max">{children}</div></div>
        <button type="button" onClick={() => scrollByCard("right")} disabled={!canScrollRight} aria-label="Scroll right" className="order-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 md:order-none"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </>
  );
}
