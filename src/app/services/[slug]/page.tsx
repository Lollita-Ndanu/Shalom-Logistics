import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { getServiceDetail } from "@/lib/service-detail-data";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import type { ServiceDetail } from "@/lib/service-detail-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((category) => ({ slug: category.slug }));
}

const QUOTE_SERVICE_BY_SLUG: Record<string, string> = {
  "residential-moving": "Home Relocation",
  "commercial-moving": "Office Moves",
  "scope-and-distance": "Goods Transport",
  "specialized-logistics": "Goods Transport",
  "cleaning-services": "Cleaning",
};

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getServiceDetail(slug);

  return {
    title: category
      ? `${category.title} | Shalom Logistics`
      : "Service | Shalom Logistics",
    description: category?.intro,
  };
}

function quoteHref(slug: string) {
  return `/quote?service=${encodeURIComponent(QUOTE_SERVICE_BY_SLUG[slug])}`;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const sections = await getSiteSections(["services_detail", "services_categories", "footer", "global_brand", "global_media", "header"]);
  const detailItems = (sections.services_detail?.content as { breadcrumbLabel?: string; cardQuoteLabel?: string; cardImageAltTemplate?: string; bottomCtaHeading?: string; bottomCtaBody?: string; bottomCtaQuoteLabel?: string; bottomCtaQuoteHref?: string; bottomCtaServicesLabel?: string; bottomCtaServicesHref?: string; items?: (ServiceDetail & { isVisible?: boolean })[] } | undefined);
  const categoryRecordSource = detailItems?.items?.find((item) => item.slug === slug && item.isVisible !== false);
  const categoryRecord = categoryRecordSource ? { ...categoryRecordSource, services: categoryRecordSource.services.map((service) => ({ ...service, image: localDetailImage(service.image ?? "") })) } : undefined;
  const category = categoryRecord ? { ...categoryRecord, breadcrumbLabel: detailItems?.breadcrumbLabel, cardQuoteLabel: detailItems?.cardQuoteLabel, cardImageAltTemplate: detailItems?.cardImageAltTemplate, bottomCtaHeading: detailItems?.bottomCtaHeading, bottomCtaBody: detailItems?.bottomCtaBody, bottomCtaQuoteLabel: detailItems?.bottomCtaQuoteLabel, bottomCtaQuoteHref: detailItems?.bottomCtaQuoteHref, bottomCtaServicesLabel: detailItems?.bottomCtaServicesLabel, bottomCtaServicesHref: detailItems?.bottomCtaServicesHref } : getServiceDetail(slug);
  const cmsDetailRecordExists = detailItems?.items?.some((item) => item.slug === slug) ?? false;
  const categoryItems = (sections.services_categories?.content as { items?: (typeof SERVICE_CATEGORIES[number] & { isVisible?: boolean })[] } | undefined)?.items;
  const categories = (categoryItems?.length ? categoryItems.filter((item) => item.isVisible !== false) : SERVICE_CATEGORIES) as typeof SERVICE_CATEGORIES;
  if (!category || (cmsDetailRecordExists && !categoryRecord) || category.isVisible === false || sections.services_detail?.isVisible === false || sections.services_categories?.isVisible === false) notFound();
  category.services = visibleItems(category.services);

  return (
    <>
      <ServiceDetailContent
        category={category}
        categories={categories}
        quoteHref={quoteHref(category.slug)}
        quoteService={QUOTE_SERVICE_BY_SLUG[category.slug]}
      />
      <Footer />
    </>
  );
}

function localDetailImage(image: string) {
  if (image.includes("photo-149736") || image.includes("photo-155849") || image.includes("photo-152173") || image.includes("photo-158652") || image.includes("photo-149736681")) return "/images/slots/home-office-moves.webp";
  if (image.includes("photo-158157") || image.includes("photo-151179") || image.includes("photo-150430") || image.includes("photo-156607") || image.includes("photo-158109") || image.includes("photo-160016") || image.includes("photo-158482")) return "/images/slots/home-cleaning.webp";
  if (image.includes("photo-160058") || image.includes("photo-160051") || image.includes("photo-155504") || image.includes("photo-161648") || image.includes("photo-160021")) return "/images/slots/home-home-relocation.webp";
  return "/images/slots/home-goods-transport.webp";
}
