import Hero from "@/components/home/Hero";
import AboutUsSection from "@/components/home/AboutUsSection";
import ServicesMarqueeSection from "@/components/home/ServicesMarqueeSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/layout/Footer";
import QuickQuoteBar from "@/components/home/QuickQuoteBar";
import HomeProcessSteps from "@/components/home/HomeProcessSteps";
import HomePopularAreas from "@/components/home/PopularAreas";
import { getSiteSections, visibleItems } from "@/lib/cms/sections";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { SERVICE_DETAILS } from "@/lib/service-detail-data";

export default async function HomePage() {
  const sections = await getSiteSections(["hero", "home_services", "services", "home_about", "home_why_choose_us", "home_testimonials", "home_faq", "home_cta", "services_how_it_works", "services_categories", "services_detail"]);
  const content = (key: string) => (sections[key]?.content ?? {}) as Record<string, unknown>;
  const visible = (key: string) => sections[key]?.isVisible !== false;
  const hero = content("hero");
  const services = content("home_services");
  const about = content("home_about");
  const why = content("home_why_choose_us");
  const testimonials = content("home_testimonials");
  const faq = content("home_faq");
  const cta = content("home_cta");
  const homeServices = services as { heading?: string; intro?: string; viewMoreLabel?: string; viewMoreHref?: string; items?: { title: string; categorySlug?: string; categoryName?: string; subservice?: string; badge?: "Popular" | "Favourite" | "Most requested"; description?: string; desc?: string; detail: string; image: string; isVisible?: boolean }[] };
  const testimonialContent = testimonials as { heading?: string; intro?: string; stats?: { value: string; label: string; detail: string; isVisible?: boolean }[]; items?: { name: string; location: string; text: string; isVisible?: boolean }[] };
  const faqContent = faq as { heading?: string; intro?: string; items?: { question: string; answer: string; isVisible?: boolean }[] };
  const ctaContent = cta as { heading?: string; subtext?: string; primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string };
  const steps = content("services_how_it_works") as { heading?: string; intro?: string; steps?: { title: string; description: string; icon: string; isVisible?: boolean }[] };
  const categoryContent = sections.services_categories?.content as { items?: typeof SERVICE_CATEGORIES[number][] } | undefined;
  const categories = visibleItems(categoryContent?.items?.length ? categoryContent.items : [...SERVICE_CATEGORIES]);
  const detailContent = sections.services_detail?.content as { items?: (typeof SERVICE_DETAILS[keyof typeof SERVICE_DETAILS])[] } | undefined;
  const details = { ...SERVICE_DETAILS };
  for (const detail of detailContent?.items ?? []) {
    if (detail.isVisible !== false) details[detail.slug] = { ...details[detail.slug], ...detail };
  }
  const quickQuoteCategories = sections.services_categories?.isVisible === false ? [] : categories.map((category) => {
    const categoryServices = (category.subServices ?? [])
      .filter((service) => typeof service === "string" || service.isVisible !== false)
      .map((service) => typeof service === "string" ? service : service.name);
    const detailServices = (details[category.slug]?.services ?? []).filter((service) => service.isVisible !== false).map((service) => service.name);
    return { ...category, quoteServices: Array.from(new Set([...categoryServices, ...detailServices])) };
  });
  const defaultHomeServices = categories.flatMap((category) => {
    const names = (category.subServices ?? []).filter((service) => typeof service === "string" || service.isVisible !== false).map((service) => typeof service === "string" ? service : service.name).slice(0, 2);
    const categoryImages: Record<string, string> = {
      "residential-moving": "/images/slots/svc-residential.webp",
      "commercial-moving": "/images/slots/svc-commercial.webp",
      "scope-and-distance": "/images/slots/svc-scope.webp",
      "specialized-logistics": "/images/slots/svc-specialized.webp",
      "cleaning-services": "/images/slots/svc-cleaning.webp",
    };
    return names.map((name) => ({
      title: name,
      categorySlug: category.slug,
      categoryName: category.name,
      subservice: name,
      badge: ["House & Apartment Moving", "Office Relocation", "Inter-County / Upcountry Moving", "Home Spring Cleaning", "Event Gear & Production Transport"].includes(name) ? "Popular" as const : undefined,
      description: details[category.slug]?.services.find((item) => item.name === name)?.description ?? category.summary,
      detail: category.summary,
      image: categoryImages[category.slug] ?? category.image,
      isVisible: true,
    }));
  });
  const homeServiceItems = visibleItems(homeServices.items ?? []);
  const ourServicesItems = homeServiceItems.length === 10 ? homeServiceItems : defaultHomeServices;
  return (
    <>
      {visible("hero") ? <Hero content={hero} /> : null}
      <QuickQuoteBar categories={quickQuoteCategories} />
      {visible("home_services") ? <ServicesMarqueeSection content={{ ...homeServices, items: ourServicesItems }} /> : null}
      {visible("home_about") ? <AboutUsSection content={about} /> : null}
      {visible("services_how_it_works") ? <HomeProcessSteps content={{ ...steps, steps: visibleItems(steps.steps ?? []) }} /> : null}
      {visible("home_why_choose_us") ? <WhyChooseUs content={why} /> : null}
      <HomePopularAreas />
      {visible("home_testimonials") ? <Testimonials content={{ ...testimonialContent, stats: visibleItems(testimonialContent.stats ?? []), items: visibleItems(testimonialContent.items ?? []) }} /> : null}

      <div className="relative">
        <div className="sticky top-0 z-0 h-dvh overflow-y-auto bg-[var(--tint)]">
          {visible("home_faq") ? <FaqSection content={{ ...faqContent, items: visibleItems(faqContent.items ?? []) }} /> : null}
        </div>
        <div className="sticky top-0 h-dvh overflow-hidden z-10">
          {visible("home_cta") ? <CtaBanner {...ctaContent} /> : null}
        </div>
        <div className="sticky top-0 z-20 h-dvh overflow-y-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
