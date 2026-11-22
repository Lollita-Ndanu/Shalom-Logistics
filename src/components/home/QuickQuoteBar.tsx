"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const SERVICE_OPTIONS = [
  ["Home Relocation", "residential-moving"],
  ["Office Moves", "commercial-moving"],
  ["Goods Transport", "specialized-logistics", "Express On-Demand Courier"],
  ["CCTV Installation", "residential-moving", "CCTV Installation"],
  ["Water Filters", "residential-moving", "Water Filter Installation"],
  ["Cleaning", "cleaning-services"],
] as const;
const MOVING_SERVICES = new Set(["residential-moving", "commercial-moving", "specialized-logistics"]);

export default function QuickQuoteBar() {
  const router = useRouter();
  const [label, setLabel] = useState<string>(SERVICE_OPTIONS[0][0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const selected = SERVICE_OPTIONS.find(([serviceLabel]) => serviceLabel === label) ?? SERVICE_OPTIONS[0];
  const hasMovingLocations = MOVING_SERVICES.has(selected[1]);
  const inputClass = "mt-2 h-12 w-full rounded-[10px] border border-[color-mix(in_srgb,var(--ink)_20%,transparent)] bg-white px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-gold";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams({ service: selected[1] });
    if (selected[2]) query.set("subservice", selected[2]);
    if (hasMovingLocations && from.trim()) query.set("from", from.trim());
    if (hasMovingLocations && to.trim()) query.set("to", to.trim());
    router.push(`/quote?${query.toString()}`);
  }

  return <div className="relative z-20 mx-auto mt-[clamp(48px,6vw,80px)] mb-[clamp(32px,4vw,56px)] w-[calc(100%-2rem)] max-w-[1100px] rounded-[14px] border border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-white p-5">
    <form onSubmit={submit} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
      <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Service
        <select value={label} onChange={(event) => setLabel(event.target.value)} className={inputClass}>{SERVICE_OPTIONS.map(([serviceLabel]) => <option key={serviceLabel} value={serviceLabel}>{serviceLabel}</option>)}</select>
      </label>
      {hasMovingLocations ? <>
        <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Moving from<input value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-[color-mix(in_srgb,var(--ink)_80%,transparent)]">Moving to<input value={to} onChange={(event) => setTo(event.target.value)} className={inputClass} /></label>
      </> : null}
      <button type="submit" className="inline-flex h-12 items-center justify-center rounded-[10px] bg-gold px-6 font-semibold text-[var(--ink)] transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Get a Quote</button>
    </form>
  </div>;
}
