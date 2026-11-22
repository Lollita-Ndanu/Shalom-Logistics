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
import { getSiteSections, visibleItems } from "@/lib/cms/sections";

export default async function HomePage() {
  const sections = await getSiteSections(["hero", "home_services", "services", "home_about", "home_why_choose_us", "home_testimonials", "home_faq", "home_cta", "services_how_it_works"]);
  const content = (key: string) => (sections[key]?.content ?? {}) as Record<string, unknown>;
  const visible = (key: string) => sections[key]?.isVisible !== false;
  const hero = content("hero");
  const services = content("home_services");
  const about = content("home_about");
  const why = content("home_why_choose_us");
  const testimonials = content("home_testimonials");
  const faq = content("home_faq");
  const cta = content("home_cta");
  const homeServices = services as { heading?: string; intro?: string; viewMoreLabel?: string; viewMoreHref?: string; items?: { title: string; description?: string; detail: string; image: string; isVisible?: boolean }[] };
  const testimonialContent = testimonials as { heading?: string; intro?: string; stats?: { value: string; label: string; detail: string; isVisible?: boolean }[]; items?: { name: string; location: string; text: string; isVisible?: boolean }[] };
  const faqContent = faq as { heading?: string; intro?: string; items?: { question: string; answer: string; isVisible?: boolean }[] };
  const ctaContent = cta as { heading?: string; subtext?: string; primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string };
  const steps = content("services_how_it_works") as { heading?: string; intro?: string; steps?: { title: string; description: string; icon: string; isVisible?: boolean }[] };
  return (
    <>
      {visible("hero") ? <Hero content={hero} /> : null}
      <QuickQuoteBar />
      {visible("home_services") ? <ServicesMarqueeSection content={{ ...homeServices, items: visibleItems(homeServices.items ?? []) }} /> : null}
      {visible("services_how_it_works") ? <HomeProcessSteps content={{ ...steps, steps: visibleItems(steps.steps ?? []) }} /> : null}
      {visible("home_about") ? <AboutUsSection content={about} /> : null}
      {visible("home_why_choose_us") ? <WhyChooseUs content={why} /> : null}
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
