import type { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import PopularServices from "@/components/services/PopularServices";
import MainServiceCategories from "@/components/services/MainServiceCategories";
import HowItWorks from "@/components/services/HowItWorks";
import PopularAreasTrain from "@/components/services/PopularAreasTrain";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/layout/Footer";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { SERVICE_CATEGORIES } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Services | Shalom Logistics",
  description:
    "Professional moving, courier and cleaning services for homes and businesses across Nairobi, Kenya and East Africa.",
};

export default async function ServicesPage() {
  const sections = await getSiteSections(["services_hero", "services_categories", "services_detail", "services_cta", "services_popular", "services_how_it_works", "services_areas"]);
  const getContent = (key: string) => (sections[key]?.content ?? {}) as Record<string, unknown>;
  const categoriesContent = getContent("services_categories");
  const detailContent = getContent("services_detail");
  const detailItems = Array.isArray(detailContent.items) ? detailContent.items as Record<string, unknown>[] : [];
  const detailImageFor = (categorySlug: string, subservice: string) => {
    const detail = detailItems.find((item) => String(item.slug ?? "") === categorySlug);
    const services = detail && Array.isArray(detail.services) ? detail.services as Record<string, unknown>[] : [];
    const target = normalizeServiceName(subservice);
    const match = services.find((service) => service.isVisible !== false && normalizeServiceName(String(service.name ?? "")) === target && typeof service.image === "string" && service.image.trim());
    return match ? String(match.image) : undefined;
  };
  const categoryRows = visibleItems((categoriesContent.items as (typeof SERVICE_CATEGORIES[number] & { isVisible?: boolean })[] | undefined) ?? [...SERVICE_CATEGORIES]).map((item) => {
    const image = typeof item.image === "string" && item.image.trim() ? item.image : localCategoryImage(item.slug);
    const featurePoster = typeof item.featurePoster === "string" && item.featurePoster.trim() ? item.featurePoster : image;
    return { ...item, image, featurePoster };
  });
  const categories = (categoryRows.length ? categoryRows : [...SERVICE_CATEGORIES]).map((item) => ({ ...item, imageAlt: item.imageAlt ?? item.name, featureVideo: item.featureVideo ?? (item.slug === "scope-and-distance" ? "/videos/scope-distance.mp4" : undefined), featurePoster: item.featurePoster ?? item.image }));
  const visible = (key: string) => sections[key]?.isVisible !== false;
  const cta = getContent("services_cta");
  const hero = getContent("services_hero") as Record<string, string>;
  const popularContent = getContent("services_popular") as { heading?: string; intro?: string; items?: Record<string, unknown>[] };
  const popularItems = (Array.isArray(popularContent.items) ? popularContent.items : []).map((item) => {
    const binding = typeof item.categorySlug === "string" && item.categorySlug && typeof item.subservice === "string" && item.subservice
      ? { categorySlug: item.categorySlug, subservice: item.subservice }
      : popularBinding(String(item.title ?? ""));
    const image = detailImageFor(binding.categorySlug, binding.subservice);
    return { ...item, categorySlug: binding.categorySlug, subservice: binding.subservice, ...(image ? { image } : {}) } as { title: string; description: string; href: string; icon: string; badge?: string; isVisible?: boolean; categorySlug?: string; subservice?: string; image?: string };
  });
  const howContent = getContent("services_how_it_works") as { heading?: string; intro?: string; steps?: { title?: string; description?: string; icon?: string; isVisible?: boolean }[] };
  const areasContent = getContent("services_areas") as { eyebrow?: string; heading?: string; intro?: string; items?: { name?: string; subtitle?: string; image?: string; isVisible?: boolean }[] };
  return (
    <>
      {visible("services_hero") ? <ServicesHero content={hero} /> : null}
      {visible("services_popular") ? <PopularServices content={{ ...popularContent, items: popularItems.length ? popularItems : undefined }} /> : null}
      <div className="relative">
        <div className="relative z-10 bg-black">
          {visible("services_categories") ? <MainServiceCategories categories={categories} content={categoriesContent} /> : null}
        </div>
        <div className="relative z-10 bg-jungle">
          {visible("services_how_it_works") ? <HowItWorks content={howContent} /> : null}
        </div>
      </div>
      {visible("services_areas") ? <PopularAreasTrain content={areasContent} /> : null}
      <div className="relative h-[200dvh]">
        <div className="sticky top-0 z-10 h-dvh overflow-hidden">
          {visible("services_cta") ? <CtaBanner heading={String(cta.heading ?? "")} subtext={String(cta.subtext ?? "")} primaryLabel={String(cta.primaryLabel ?? "")} primaryHref={String(cta.primaryHref ?? "")} secondaryLabel={String(cta.secondaryLabel ?? "")} secondaryHref={String(cta.secondaryHref ?? "")} secondaryTarget={cta.secondaryTarget as "_blank" | "_self" | undefined} secondaryRel={String(cta.secondaryRel ?? "")} /> : null}
        </div>
        <div className="sticky top-0 z-20 h-dvh overflow-y-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}

function localCategoryImage(slug: string) {
  const imageBySlug: Record<string, string> = {
    "residential-moving": "/images/slots/svc-residential.webp",
    "commercial-moving": "/images/slots/svc-commercial.webp",
    "scope-and-distance": "/images/slots/svc-scope.webp",
    "specialized-logistics": "/images/slots/svc-specialized.webp",
    "cleaning-services": "/images/slots/svc-cleaning.webp",
  };
  return imageBySlug[slug] ?? "/images/slots/svc-specialized.webp";
}

function normalizeServiceName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function popularBinding(title: string) {
  const value = title.toLowerCase();
  if (value.includes("clean")) return { categorySlug: "cleaning-services", subservice: "Home Spring Cleaning" };
  if (value.includes("office") || value.includes("commercial")) return { categorySlug: "commercial-moving", subservice: "Office Relocation" };
  if (value.includes("county") || value.includes("upcountry") || value.includes("distance")) return { categorySlug: "scope-and-distance", subservice: "Inter-County & Upcountry Moving" };
  if (value.includes("event") || value.includes("gear")) return { categorySlug: "specialized-logistics", subservice: "Event Gear & Production Transport" };
  return { categorySlug: "residential-moving", subservice: "House & Apartment Moving" };
}
