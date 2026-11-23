"use client";

import Image from "next/image";
import { IMAGE_SLOT_BY_ID } from "@/lib/image-slots";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ServiceDetail } from "@/lib/service-detail-data";
import type { ServiceCategory } from "@/lib/services-data";

type Props = {
  category: ServiceDetail;
  categories: readonly ServiceCategory[];
  quoteHref: string;
  quoteService: string;
};

const NAVBAR_MOBILE_HEIGHT = 64;
const PILL_BAR_HEIGHT = 64;

export default function ServiceDetailContent({ category, categories, quoteHref, quoteService }: Props) {
  const visibleServices = category.services.filter((service) => service.isVisible !== false);
  const pillBarRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [activeId, setActiveId] = useState(visibleServices[0]?.id ?? "");
  const [highlightedId, setHighlightedId] = useState("");
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const requestedService = new URLSearchParams(window.location.search).get("service");
    const targetService = visibleServices.find((service) => service.name.toLowerCase() === requestedService?.toLowerCase());
    const revealPillHorizontally = (id: string) => {
      const bar = pillBarRef.current;
      const pill = document.getElementById(`service-pill-${id}`);
      if (!bar || !pill) return;
      const barRect = bar.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      if (pillRect.left < barRect.left) bar.scrollBy({ left: pillRect.left - barRect.left, behavior: reduceMotion.current ? "auto" : "smooth" });
      else if (pillRect.right > barRect.right) bar.scrollBy({ left: pillRect.right - barRect.right, behavior: reduceMotion.current ? "auto" : "smooth" });
    };
    let targetFrame: number | undefined;
    if (targetService) {
      targetFrame = window.requestAnimationFrame(() => {
        const card = cardRefs.current.get(targetService.id);
        if (!card) return;
        setActiveId(targetService.id);
        setHighlightedId(targetService.id);
        revealPillHorizontally(targetService.id);
        window.setTimeout(() => setHighlightedId((current) => current === targetService.id ? "" : current), 1500);
      });
    }

    const updateStickyBar = () => {
      setScrolled(window.scrollY > 100);
      const bar = pillBarRef.current;
      setHasOverflow(Boolean(bar && bar.scrollWidth > bar.clientWidth + 2));
    };
    updateStickyBar();
    window.addEventListener("scroll", updateStickyBar, { passive: true });
    window.addEventListener("resize", updateStickyBar);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = visible.target.id;
          setActiveId(id);
          revealPillHorizontally(id);
        }
      },
      {
        rootMargin: `-${NAVBAR_MOBILE_HEIGHT + PILL_BAR_HEIGHT + 16}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    visibleServices.forEach((service) => {
      const card = cardRefs.current.get(service.id);
      if (card) observer.observe(card);
    });

    return () => {
      if (targetFrame !== undefined) window.cancelAnimationFrame(targetFrame);
      observer.disconnect();
      window.removeEventListener("scroll", updateStickyBar);
      window.removeEventListener("resize", updateStickyBar);
    };
  }, [visibleServices]);

  const handlePillClick = (id: string, scroll = true) => {
    setActiveId(id);
    setHighlightedId(id);
    if (scroll) cardRefs.current.get(id)?.scrollIntoView({ behavior: reduceMotion.current ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => {
      setHighlightedId((current) => (current === id ? "" : current));
    }, 1500);
  };

  return (
    <>
      <header className="bg-white px-4 pb-6 pt-24 text-jungle-dark sm:px-6 sm:pb-8 sm:pt-28 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-jungle-dark/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/services" className="transition-colors hover:text-jungle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle">{category.breadcrumbLabel ?? "Services"}</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-jungle-dark">{category.title}</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold leading-tight text-jungle-dark sm:text-4xl">
            {category.title}
          </h1>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-jungle-dark/75 sm:text-lg">
            {category.intro}
          </p>
        </div>
      </header>

      <nav
        ref={pillBarRef}
        aria-label="Services in this category"
        className={`sticky z-30 h-16 border-b border-jungle/15 bg-white transition-shadow ${scrolled ? "shadow-sm" : ""} top-16 lg:top-20`}
      >
        <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="service-pill-scroll flex h-full items-center gap-2 overflow-x-auto whitespace-nowrap pr-8">
            {visibleServices.map((service) => {
              const active = activeId === service.id;
              return (
                <a
                  key={service.id}
                  id={`service-pill-${service.id}`}
                  href={`#${service.id}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => handlePillClick(service.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 ${active ? "border-jungle bg-jungle text-white" : "border-jungle bg-white text-jungle hover:bg-jungle/10"}`}
                >
                  {service.name}
                </a>
              );
            })}
          </div>
          {hasOverflow ? <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-l from-white to-transparent" /> : null}
        </div>
      </nav>

      <main className="bg-white px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <section aria-label={`${category.title} services`} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {visibleServices.map((service) => (
              <article
                key={service.id}
                id={service.id}
                ref={(node) => {
                  if (node) cardRefs.current.set(service.id, node);
                  else cardRefs.current.delete(service.id);
                }}
                className={`flex h-full scroll-mt-[144px] flex-col overflow-hidden rounded-2xl border border-jungle/20 bg-white shadow-sm transition-[transform,box-shadow,ring] duration-300 hover:-translate-y-1 hover:shadow-lg lg:scroll-mt-[160px] ${highlightedId === service.id ? "ring-2 ring-jungle ring-offset-2" : ""}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-jungle-dark">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.imageAlt ?? category.cardImageAlt ?? (category.cardImageAltTemplate ?? "{service} service").replace("{service}", service.name)}
                      width={800}
                      height={600}
                      loading="lazy"
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={IMAGE_SLOT_BY_ID[service.image.includes("home-office-moves") ? "home-office-moves" : service.image.includes("home-cleaning") ? "home-cleaning" : service.image.includes("home-home-relocation") ? "home-home-relocation" : service.image.includes("svc-") ? "svc-specialized" : "home-goods-transport"]?.blurDataURL}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-jungle-dark px-6 text-center">
                      <span className="max-w-xs text-xl font-semibold leading-snug text-white sm:text-2xl">{service.name}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h2 className="min-h-[3.5rem] text-xl font-semibold leading-snug text-jungle-dark sm:text-2xl">
                    {service.name}
                  </h2>
                  <p className="mt-3 leading-relaxed text-jungle-dark/75">
                    {service.description}
                  </p>
                  <Link
                    href={`${quoteHref}&category=${encodeURIComponent(category.slug)}&subservice=${encodeURIComponent(service.name)}`}
                    className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-jungle-dark transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2"
                  >
                    {category.cardQuoteLabel ?? "Get a Quote"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section aria-labelledby="service-cta-title" className="mt-16 rounded-2xl border border-jungle/25 bg-jungle-dark px-6 py-10 text-white sm:mt-20 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="service-cta-title" className="text-2xl font-bold text-white sm:text-3xl">{category.bottomCtaHeading ?? "Not sure which service you need?"}</h2>
                <p className="mt-3 text-white/75">{category.bottomCtaBody ?? "Tell us what you have in mind and we'll help you find the right fit."}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href={category.bottomCtaQuoteHref ?? `/quote?service=${encodeURIComponent(quoteService)}&category=${encodeURIComponent(category.slug)}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-bold text-jungle-dark transition-colors hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark">
                  {category.bottomCtaQuoteLabel ?? "Get a Quote"} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link href={category.bottomCtaServicesHref ?? "/services"} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark">
                  {category.bottomCtaServicesLabel ?? "All Services"}
                </Link>
              </div>
            </div>
          </section>

          <nav aria-label="Other service categories" className="mt-14 border-t border-jungle/20 pt-8 sm:mt-16">
            <h2 className="text-sm font-semibold text-jungle-dark/60">Other categories</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {categories.filter((other) => other.slug !== category.slug).map((other) => (
                <li key={other.slug}>
                  <Link href={`/services/${other.slug}`} className="inline-flex items-center gap-2 rounded-full border border-jungle/70 px-4 py-2.5 text-sm font-medium text-jungle-dark transition-colors hover:bg-jungle/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle">
                    {other.name} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <style jsx global>{`
        .service-pill-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .service-pill-scroll::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .service-pill-scroll { scroll-behavior: auto; }
        }
      `}</style>
    </>
  );
}
