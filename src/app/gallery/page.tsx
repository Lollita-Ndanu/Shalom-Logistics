"use client";

import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/layout/Footer";

const CATEGORIES = [
  "All",
  "Home Moving",
  "Office Moving",
  "Transport & Logistics",
  "Cleaning",
  "Other Services",
] as const;

type Category = (typeof CATEGORIES)[number];

const GALLERY_IMAGES: { src: string; alt: string; category: Exclude<Category, "All"> }[] = [
  { src: "/images/IMG_20251220_105405.jpg", alt: "Shalom Logistics crew preparing a household move", category: "Home Moving" },
  { src: "/images/IMG_20251220_105328.jpg", alt: "Moving crew and truck ready for a journey", category: "Transport & Logistics" },
  { src: "/images/IMG_20251220_105330.jpg", alt: "Shalom Logistics vehicle prepared for specialist delivery", category: "Transport & Logistics" },
  { src: "/images/IMG_20251204_115746.jpg", alt: "Shalom Logistics moving team at work", category: "Home Moving" },
  { src: "/images/IMG_20251114_133226.jpg", alt: "A Shalom Logistics move in progress", category: "Home Moving" },
  { src: "/images/IMG_20260605_135517.jpg", alt: "Residential moving service by Shalom Logistics", category: "Home Moving" },
  { src: "/images/IMG_20260411_151509.jpg", alt: "Careful handling during a home relocation", category: "Home Moving" },
  { src: "/images/IMG_20251204_143807.jpg", alt: "Professional cleaning service in progress", category: "Cleaning" },
  { src: "/images/IMG_20251220_105328.jpg", alt: "Long-distance goods transport with Shalom Logistics", category: "Transport & Logistics" },
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
  { src: "/images/Cloud1.jpg", alt: "Shalom Logistics service image", category: "Other Services" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const images = activeCategory === "All"
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter((image) => image.category === activeCategory);

  return (
    <>
      <main className="bg-white px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-jungle">
              Shalom Logistics gallery
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-jungle-dark sm:text-6xl">
              Moving with care at every step.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-jungle-dark/75">
              A look at the people, care, and services that help make every move easier.
            </p>
          </header>

          <div className="mt-10 flex justify-center overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2" role="tablist" aria-label="Filter gallery by category">
              {CATEGORIES.map((category) => {
                const selected = activeCategory === category;
                return (
                  <button
                    key={category}
                    id={`gallery-tab-${CATEGORIES.indexOf(category)}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="gallery-grid"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 ${
                      selected
                        ? "bg-jungle-dark text-white"
                        : "bg-jungle-dark/5 text-jungle-dark hover:bg-jungle-dark/10"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="gallery-grid"
            role="tabpanel"
            aria-labelledby={`gallery-tab-${CATEGORIES.indexOf(activeCategory)}`}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {images.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-jungle-dark/10"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white">
                  {image.category}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
