import { PHOTO_CREDITS } from "@/lib/image-slots";
import Footer from "@/components/layout/Footer";

export default function CreditsPage() {
  return <><main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-16"><h1 className="text-4xl font-bold text-[var(--ink)]">Photo credits</h1><p className="mt-3 text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">Image sources and licenses.</p>{PHOTO_CREDITS.length ? <ul className="mt-8 divide-y divide-[color-mix(in_srgb,var(--ink)_15%,transparent)]">{PHOTO_CREDITS.map((credit) => <li key={credit.slot} className="py-4"><span className="font-semibold">{credit.slot}</span> — {credit.photographer}, {credit.sourceName}, {credit.license} (<a className="underline" href={credit.link}>{credit.link}</a>)</li>)}</ul> : <p className="mt-8">All current service photos are company-owned.</p>}</main><Footer /></>;
}
