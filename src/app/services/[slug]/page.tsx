import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import {
  SERVICE_CATEGORIES,
  getServiceCategory,
} from "@/lib/services-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getServiceCategory(slug);

  return {
    title: category
      ? `${category.name} | Shalom Logistics`
      : "Service | Shalom Logistics",
    description: category?.summary,
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const category = getServiceCategory(slug);

  if (!category) notFound();

  return (
    <>
      <section className="bg-black px-4 py-28 text-white sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jungle">
            Shalom Logistics service
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            {category.name}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">
            {category.summary}
          </p>

          <div className="mt-12 border-t border-white/15 pt-8">
            <h2 className="text-2xl font-semibold text-white">
              What we can help with
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {category.subServices.map((service) => (
                <li
                  key={service}
                  className="border border-white/15 bg-neutral-900 px-5 py-4 text-white/85"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center bg-yellow-400 px-7 py-3.5 font-bold text-black transition-colors duration-200 hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Request Instant Quote
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center border border-jungle px-7 py-3.5 font-semibold text-jungle transition-colors duration-200 hover:bg-jungle hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
