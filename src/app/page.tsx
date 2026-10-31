import Hero from "@/components/home/Hero";
import AboutUsSection from "@/components/home/AboutUsSection";
import ServicesMarqueeSection from "@/components/home/ServicesMarqueeSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesMarqueeSection />
      <AboutUsSection />
      <WhyChooseUs />
      <Testimonials />

      <div className="relative" style={{ height: "300dvh" }}>
        <div className="sticky top-0 z-0 h-dvh overflow-y-auto bg-black">
          <FaqSection />
        </div>
        <div className="sticky top-0 h-dvh overflow-hidden z-10">
          <CtaBanner />
        </div>
        <div className="sticky top-0 z-20 h-dvh overflow-y-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
