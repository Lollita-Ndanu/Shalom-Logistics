import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { getServiceDetail } from "@/lib/service-detail-data";

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
  const category = getServiceDetail(slug);

  if (!category) notFound();

  return (
    <>
      <ServiceDetailContent
        category={category}
        categories={SERVICE_CATEGORIES}
        quoteHref={quoteHref(category.slug)}
        quoteService={QUOTE_SERVICE_BY_SLUG[category.slug]}
      />
      <Footer />
    </>
  );
}
