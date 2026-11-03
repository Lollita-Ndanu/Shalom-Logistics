import type { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import PopularServices from "@/components/services/PopularServices";
import MainServiceCategories from "@/components/services/MainServiceCategories";
import HowItWorks from "@/components/services/HowItWorks";
import PopularAreasTrain from "@/components/services/PopularAreasTrain";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Services | Shalom Logistics",
  description:
    "Professional moving, courier and cleaning services for homes and businesses across Nairobi, Kenya and East Africa.",
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <div className="relative">
        <div className="relative z-10 bg-black">
          <MainServiceCategories />
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
          <CtaBanner
            heading="Ready for a Stress-Free Move or Cleaning Service?"
            subtext="Join thousands of satisfied clients across Kenya and East Africa."
            primaryLabel="Get Your Free Quote"
            primaryHref="/quote"
            secondaryLabel="Chat on WhatsApp"
            secondaryHref="https://wa.me/254745980198"
            secondaryTarget="_blank"
            secondaryRel="noopener noreferrer"
          />
        </div>
        <div className="sticky top-0 z-20 h-dvh overflow-y-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
