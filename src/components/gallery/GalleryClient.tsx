"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryItem = { src: string; alt: string; category: string; type?: "image" | "video"; isVisible?: boolean };
type GalleryContent = { heading: string; intro: string; categories: string[]; items: GalleryItem[] };
const DEFAULT_CATEGORIES = ["Home Moving", "Office Moving", "Transport & Logistics", "Cleaning", "Other Services"];

export const FALLBACK_ITEMS: GalleryItem[] = [
  { src: "/images/IMG_20251220_105405.jpg", alt: "Shalom Logistics crew preparing a household move", category: "Home Moving" },
  { src: "/images/IMG_20251220_105328.jpg", alt: "Moving crew and truck ready for a journey", category: "Transport & Logistics" },
  { src: "/images/IMG_20251220_105330.jpg", alt: "Shalom Logistics vehicle prepared for specialist delivery", category: "Transport & Logistics" },
  { src: "/images/IMG_20251204_115746.jpg", alt: "Shalom Logistics moving team at work", category: "Home Moving" },
  { src: "/images/IMG_20251114_133226.jpg", alt: "A Shalom Logistics move in progress", category: "Home Moving" },
  { src: "/images/IMG_20260605_135517.jpg", alt: "Residential moving service by Shalom Logistics", category: "Home Moving" },
  { src: "/images/IMG_20260411_151509.jpg", alt: "Careful handling during a home relocation", category: "Home Moving" },
  { src: "/images/IMG_20251204_143807.jpg", alt: "Professional cleaning service in progress", category: "Cleaning" },
  { src: "/images/OFFICE.jpg", alt: "Office furniture prepared for a commercial relocation", category: "Office Moving" },
  { src: "/images/Services.jpg", alt: "Shalom Logistics services", category: "Transport & Logistics" },
  { src: "/images/9.jpg", alt: "Shalom Logistics service in action", category: "Transport & Logistics" },
  { src: "/images/6.jpg", alt: "Shalom Logistics team supporting a move", category: "Home Moving" },
  { src: "/images/4.jpg", alt: "Moving and logistics service", category: "Transport & Logistics" },
  { src: "/images/2.jpg", alt: "Shalom Logistics moving service", category: "Home Moving" },
  { src: "/images/13.jpg", alt: "A Shalom Logistics service project", category: "Transport & Logistics" },
  { src: "/images/11.jpg", alt: "Shalom Logistics at work", category: "Transport & Logistics" },
  { src: "/images/CCTV.jpg", alt: "CCTV installation service", category: "Other Services" },
  { src: "/images/water-filter.jpeg", alt: "Water filter installation service", category: "Other Services" },
  { src: "/images/Box.png", alt: "Packing supplies for a move", category: "Home Moving" },
  { src: "/images/lorry.png", alt: "Shalom Logistics transport truck", category: "Transport & Logistics" },
];

function isVideo(item: GalleryItem) {
  return item.type === "video" || /\.(mp4|webm|mov)(?:$|\?)/i.test(item.src);
}

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

export default function GalleryClient({ content }: { content: GalleryContent }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const categories = content.categories?.length ? content.categories : DEFAULT_CATEGORIES;
  const items = useMemo(() => (content.items?.length ? content.items : FALLBACK_ITEMS).filter((item) => item.isVisible !== false && item.src && categories.includes(item.category)), [content.items, categories]);
  const visibleItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);
  const selectedItem = selectedIndex === null ? null : visibleItems[selectedIndex] ?? null;

  const close = useCallback(() => setSelectedIndex(null), []);
  const step = useCallback((direction: number) => {
    setSelectedIndex((current) => current === null || visibleItems.length === 0 ? null : (current + direction + visibleItems.length) % visibleItems.length);
  }, [visibleItems.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, close, step]);

  return (
    <main className="bg-white px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="mt-5 text-4xl font-bold leading-tight text-jungle-dark sm:text-6xl">{content.heading}</h1>
          <p className="mt-5 text-lg leading-relaxed text-jungle-dark/75">{content.intro}</p>
        </header>
        <div className="mt-10 flex justify-center overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="Filter gallery by category">
            {["All", ...categories].map((category, index) => {
              const selected = activeCategory === category;
              return <button key={category} id={`gallery-tab-${index}`} type="button" role="tab" aria-selected={selected} onClick={() => { setActiveCategory(category); setSelectedIndex(null); }} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 ${selected ? "bg-jungle-dark text-white" : "bg-jungle-dark/5 text-jungle-dark hover:bg-jungle-dark/10"}`}>{category}</button>;
            })}
          </div>
        </div>
        <div role="tabpanel" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, index) => <button key={`${item.src}-${index}`} type="button" onClick={() => setSelectedIndex(index)} aria-label={`Enlarge ${item.alt}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-jungle-dark/10 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold">
            {isVideo(item)
              ? <video src={item.src} aria-label={item.alt} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <Image src={item.src} alt={item.alt} fill unoptimized={isRemoteImage(item.src)} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white">{item.category}</span>
          </button>)}
        </div>
      </div>

      {selectedItem ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`Gallery image: ${selectedItem.alt}`} onClick={close}>
        <button type="button" onClick={close} aria-label="Close enlarged image" className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><X className="h-6 w-6" /></button>
        <button type="button" onClick={(event) => { event.stopPropagation(); step(-1); }} aria-label="Previous image" className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6"><ChevronLeft className="h-7 w-7" /></button>
        <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center gap-3" onClick={(event) => event.stopPropagation()}>
          {isVideo(selectedItem)
            ? <video key={selectedItem.src} src={selectedItem.src} autoPlay muted loop playsInline controls className="max-h-[82vh] max-w-full rounded-lg object-contain" />
             : <Image key={selectedItem.src} src={selectedItem.src} alt={selectedItem.alt} width={1800} height={1200} unoptimized={isRemoteImage(selectedItem.src)} priority className="max-h-[82vh] w-auto max-w-full rounded-lg object-contain" />}
          <p className="text-center text-sm text-white/80">{selectedItem.alt} <span className="mx-2 text-white/40">·</span>{selectedItem.category} <span className="mx-2 text-white/40">·</span>{selectedIndex! + 1} / {visibleItems.length}</p>
        </div>
        <button type="button" onClick={(event) => { event.stopPropagation(); step(1); }} aria-label="Next image" className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6"><ChevronRight className="h-7 w-7" /></button>
      </div> : null}
    </main>
  );
}
