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
  const sections = await getSiteSections(["services_hero", "services_categories", "services_detail", "services_cta"]);
  const getContent = (key: string) => (sections[key]?.content ?? {}) as Record<string, unknown>;
  const categoriesContent = getContent("services_categories");
  const categoryRows = visibleItems((categoriesContent.items as (typeof SERVICE_CATEGORIES[number] & { isVisible?: boolean })[] | undefined) ?? [...SERVICE_CATEGORIES]).map((item) => ({ ...item, image: localCategoryImage(item.slug), featurePoster: localCategoryImage(item.slug) }));
  const categories = (categoryRows.length ? categoryRows : [...SERVICE_CATEGORIES]).map((item) => ({ ...item, imageAlt: item.imageAlt ?? item.name, featureVideo: item.featureVideo ?? (item.slug === "scope-and-distance" ? "/videos/scope-distance.mp4" : undefined), featurePoster: item.featurePoster ?? item.image }));
  const visible = (key: string) => sections[key]?.isVisible !== false;
  const cta = getContent("services_cta");
  const hero = getContent("services_hero") as Record<string, string>;
  return (
    <>
      {visible("services_hero") ? <ServicesHero content={hero} /> : null}
      <div className="relative">
        <div className="relative z-10 bg-black">
          {visible("services_categories") ? <MainServiceCategories categories={categories} content={categoriesContent} /> : null}
        </div>
        <div className="sticky top-16 z-0 bg-white lg:top-20">
          <PopularServices />
        </div>
        <div className="relative z-10 bg-jungle">
          <HowItWorks />
        </div>
      </div>
      <PopularAreasTrain />
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
