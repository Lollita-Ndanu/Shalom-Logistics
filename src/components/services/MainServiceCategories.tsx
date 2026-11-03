import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/services-data";
import ScopeDistanceMedia from "@/components/services/ScopeDistanceMedia";

const scopeCategory = SERVICE_CATEGORIES.find(
  (category) => category.slug === "scope-and-distance"
);

function LearnMoreButton({ slug }: { slug: ServiceCategory["slug"] }) {
  return (
    <Link
      href={`/services/${slug}`}
      className="mt-auto inline-flex w-full items-center justify-center border border-jungle bg-transparent px-5 py-3 text-sm font-semibold text-jungle transition-colors duration-200 hover:bg-jungle hover:text-black focus-visible:bg-jungle focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jungle focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
    >
      Learn more
    </Link>
  );
}

function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <article
      id={category.anchorId}
      className="group isolate flex h-full min-h-[560px] flex-col overflow-hidden border border-neutral-800 bg-neutral-900 transition-transform duration-300 hover:-translate-y-1 scroll-mt-24"
    >
      <div className="relative aspect-[16/9] w-full shrink-0 sm:aspect-[2/1]">
        <div className="absolute inset-0 isolate overflow-hidden">
          <Image
            src={category.image}
            alt={category.imageAlt}
            fill
            loading="lazy"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
            className="origin-center transform-gpu object-cover transition-transform duration-700 ease-out will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] group-hover:scale-105"
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-2px] z-10 h-[calc(55%+2px)]"
          style={{
            background:
              "linear-gradient(to top, var(--color-neutral-900) 0%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 -mt-8 flex flex-1 flex-col p-6 pt-0 sm:p-8 sm:pt-0">
        <h3 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {category.name}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-white/80">
          {category.summary}
        </p>
        <LearnMoreButton slug={category.slug} />
      </div>
    </article>
  );
}

function ScopeFeatureCard({ category }: { category: ServiceCategory }) {
  if (!category.featureVideo || !category.featurePoster) return null;

  return (
    <article
      id={category.anchorId}
      className="group isolate overflow-hidden border border-neutral-800 bg-neutral-900 scroll-mt-24 sm:col-span-2 sm:grid sm:grid-cols-2"
    >
      <div className="relative isolate min-h-[280px] overflow-hidden sm:min-h-[360px] lg:-mr-0.5 lg:min-h-[440px]">
        <ScopeDistanceMedia
          poster={category.featurePoster}
          videoSrc={category.featureVideo}
        />
      </div>

      <div className="relative z-10 flex flex-col bg-black p-6 sm:p-10 lg:p-12">
        <h3 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {category.name}
        </h3>
        <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
          {category.summary}
        </p>

        <ul className="mt-7 space-y-4" aria-label="Scope and distance services">
          {category.subServices.map((service) => (
            <li key={service} className="flex items-start gap-3 text-white/85">
              <Check
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-jungle"
              />
              <span>{service}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <LearnMoreButton slug={category.slug} />
        </div>
      </div>
    </article>
  );
}

export default function MainServiceCategories() {
  if (!scopeCategory) return null;

  const regularCategories = SERVICE_CATEGORIES.filter(
    (category) => category.slug !== scopeCategory.slug
  );

  return (
    <section
      aria-labelledby="service-categories-heading"
      className="relative min-h-full overflow-visible bg-black"
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="service-categories-heading"
            className="text-4xl font-bold leading-tight text-white sm:text-5xl"
          >
            Our Service Categories
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/65 sm:text-xl">
            Everything you need to move, ship and clean, in one place.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <CategoryCard category={regularCategories[0]} />
          <CategoryCard category={regularCategories[1]} />
          <ScopeFeatureCard category={scopeCategory} />
          <CategoryCard category={regularCategories[2]} />
          <CategoryCard category={regularCategories[3]} />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-16 sm:h-20 lg:h-24"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          <path
            d="M0,24 C240,76 480,4 720,42 C960,80 1200,8 1440,24 L1440,100 L0,100 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
