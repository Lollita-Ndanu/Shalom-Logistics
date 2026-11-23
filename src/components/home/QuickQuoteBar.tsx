"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ServiceCategory } from "@/lib/services-data";

type QuoteCategory = ServiceCategory & { quoteServices: string[] };

export default function QuickQuoteBar({ categories }: { categories: readonly QuoteCategory[] }) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("");
  const [subservice, setSubservice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [location, setLocation] = useState("");
  const [categoryNudge, setCategoryNudge] = useState(false);
  const [destinationAnnouncement, setDestinationAnnouncement] = useState("");
  const [highlighted, setHighlighted] = useState(false);
  const categoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const selected = categories.find((category) => category.slug === categorySlug);
  const serviceLocationRequired = Boolean(selected && /clean/i.test(selected.slug)) || /cctv|water filter/i.test(subservice);
  const services = selected?.quoteServices ?? [];
  const inputClass = "mt-2 h-12 w-full rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_20%,transparent)] bg-white px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-gold";

  useEffect(() => {
    function onDestination(event: Event) {
      const city = (event as CustomEvent<{ city?: string }>).detail?.city;
      if (!city) return;
      setTo(city);
      setLocation(city);
      setDestinationAnnouncement(`Moving to set to ${city}.`);
      const bar = barRef.current;
      if (!bar) return;
      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      bar.style.scrollMarginTop = `${headerHeight + 16}px`;
      const rect = bar.getBoundingClientRect();
      const fullyVisible = rect.top >= headerHeight && rect.bottom <= window.innerHeight;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!fullyVisible) {
        const fitsViewport = bar.offsetHeight <= window.innerHeight - headerHeight - 16;
        bar.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: fitsViewport ? "center" : "start" });
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(fallback);
        window.removeEventListener("scrollend", finish);
        destinationInputRef.current?.focus({ preventScroll: true });
        setHighlighted(true);
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(() => setHighlighted(false), 1200);
      };
      const fallback = window.setTimeout(finish, fullyVisible || reduceMotion ? 0 : 700);
      if (!fullyVisible && !reduceMotion) window.addEventListener("scrollend", finish, { once: true });
    }
    window.addEventListener("shalom:set-destination", onDestination);
    return () => window.removeEventListener("shalom:set-destination", onDestination);
  }, []);

  function requestCategory() {
    if (categorySlug) return;
    setCategoryNudge(false);
    if (categoryTimer.current) clearTimeout(categoryTimer.current);
    requestAnimationFrame(() => setCategoryNudge(true));
    categoryTimer.current = setTimeout(() => setCategoryNudge(false), 1100);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (categorySlug) query.set("category", categorySlug);
    if (subservice) query.set("subservice", subservice);
    if (serviceLocationRequired) {
      if (location.trim()) query.set("location", location.trim());
    } else {
      if (from.trim()) query.set("from", from.trim());
      if (to.trim()) query.set("to", to.trim());
    }
    router.push(`/quote${query.size ? `?${query.toString()}` : ""}`);
  }

  return <div id="quick-quote" ref={barRef} style={{ scrollMarginTop: "calc(var(--header-height, 5rem) + 16px)" }} className={`scroll-mt-20 lg:scroll-mt-24 relative z-20 mx-auto mt-[clamp(60px,7vw,96px)] mb-[clamp(32px,4vw,56px)] w-[calc(100%-2rem)] max-w-[1240px] rounded-[14px] border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-white p-5 ${highlighted ? "ring-[3px] ring-gold destination-highlight" : "ring-0 ring-transparent"}`}>
    <style>{`@keyframes category-nudge-twice { 0%,100% { box-shadow: 0 0 0 2px rgb(185 28 28 / .7); } 18%,52% { box-shadow: 0 0 0 5px rgb(185 28 28 / .25); } 35%,69% { box-shadow: 0 0 0 2px rgb(185 28 28 / .7); } } .animate-category-nudge { animation: category-nudge-twice .7s ease-in-out 2; } @keyframes destination-ring-fade { from { box-shadow: 0 0 0 3px var(--color-gold); } to { box-shadow: 0 0 0 3px transparent; } } .destination-highlight { animation: destination-ring-fade 1.2s ease-out forwards; } @media (prefers-reduced-motion: reduce) { .animate-category-nudge { animation: none; } .destination-highlight { animation: none; } }`}</style>
    <form onSubmit={submit} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr_auto]">
      <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Category
        <select value={categorySlug} onChange={(event) => { setCategorySlug(event.target.value); setSubservice(""); setFrom(""); setTo(""); setLocation(""); }} className={`${inputClass} transition-[box-shadow,border-color] duration-200 ${categoryNudge ? "animate-category-nudge border-red-700 ring-2 ring-red-700/70" : ""}`}>
          <option value="" disabled hidden>Select a category</option>
          {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Services
        <select value={subservice} onPointerDown={requestCategory} onFocus={requestCategory} onKeyDown={(event) => { if (!categorySlug && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); requestCategory(); } }} onChange={(event) => { if (!categorySlug) { requestCategory(); return; } setSubservice(event.target.value); setLocation(""); }} className={inputClass}>
          <option value="" disabled hidden>Select a service</option>
          {services.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </label>
      {serviceLocationRequired ? <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Location<input ref={destinationInputRef} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where do you need the service?" className={inputClass} /></label> : <>
        <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Moving from<input value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Moving to<input ref={destinationInputRef} value={to} onChange={(event) => setTo(event.target.value)} className={inputClass} /></label>
      </>}
      <button type="submit" className="inline-flex h-12 items-center justify-center rounded-[10px] bg-gold px-6 font-semibold text-[var(--ink)] transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Get a Quote</button>
    </form>
    <span className="sr-only" aria-live="polite">{destinationAnnouncement}</span>
  </div>;
}
