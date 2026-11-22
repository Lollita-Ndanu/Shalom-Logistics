"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export default function ServicesHero({ content = {} }: { content?: Record<string, string> }) {
  const shouldReduceMotion = useReducedMotion() === true;
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };
  const item: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };
  const heroHeadingParts = (content.heading ?? "Moving & Cleaning, Done Right").split(", ", 2);

  return (
    <section aria-labelledby="services-hero-heading" className="services-hero relative isolate h-[clamp(520px,80vh,760px)] w-full overflow-hidden bg-jungle-dark">
      <style>{`
        .services-hero-photo { object-position: 76% center; }
        .services-hero-blur-layer { position: absolute; inset: 0; pointer-events: none; }
        .services-hero-blur-1 { -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); -webkit-mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%); }
        .services-hero-blur-2 { -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); -webkit-mask-image: linear-gradient(to right, #000 0%, #000 55%, transparent 85%); mask-image: linear-gradient(to right, #000 0%, #000 55%, transparent 85%); }
        .services-hero-blur-3 { -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); -webkit-mask-image: linear-gradient(to right, #000 0%, #000 40%, transparent 70%); mask-image: linear-gradient(to right, #000 0%, #000 40%, transparent 70%); }
        .services-hero-blur-4 { -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); -webkit-mask-image: linear-gradient(to right, #000 0%, #000 25%, transparent 55%); mask-image: linear-gradient(to right, #000 0%, #000 25%, transparent 55%); }
        .services-hero-readability { background: linear-gradient(to right, color-mix(in srgb, var(--ink) 80%, transparent) 0%, color-mix(in srgb, var(--ink) 50%, transparent) 40%, transparent 75%); }
        .services-hero-bottom { background: linear-gradient(to bottom, transparent 0%, var(--color-jungle-dark) 100%); }
        .services-hero-title-shadow { text-shadow: 0 2px 16px color-mix(in srgb, var(--ink) 35%, transparent); }
        .services-hero-subline-shadow { text-shadow: 0 2px 16px color-mix(in srgb, var(--ink) 35%, transparent); }
        @supports not (backdrop-filter: blur(1px)) {
          .services-hero-blur-layer { display: none; }
        }
        @media (max-width: 767px) {
          .services-hero-photo { object-position: 68% center; }
          .services-hero-blur-1 { -webkit-mask-image: linear-gradient(to top, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(to top, #000 0%, #000 70%, transparent 100%); }
          .services-hero-blur-2 { -webkit-mask-image: linear-gradient(to top, #000 0%, #000 55%, transparent 85%); mask-image: linear-gradient(to top, #000 0%, #000 55%, transparent 85%); }
          .services-hero-blur-3 { -webkit-mask-image: linear-gradient(to top, #000 0%, #000 40%, transparent 70%); mask-image: linear-gradient(to top, #000 0%, #000 40%, transparent 70%); }
          .services-hero-blur-4 { -webkit-mask-image: linear-gradient(to top, #000 0%, #000 25%, transparent 55%); mask-image: linear-gradient(to top, #000 0%, #000 25%, transparent 55%); }
          .services-hero-readability { background: linear-gradient(to top, color-mix(in srgb, var(--ink) 82%, transparent) 0%, color-mix(in srgb, var(--ink) 52%, transparent) 44%, transparent 86%); }
          .services-hero-bottom { background: linear-gradient(to bottom, transparent 0%, transparent calc(100% - 120px), var(--color-jungle-dark) 100%); }
        }
      `}</style>

      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image src="/images/Services.jpg" alt="" fill priority sizes="100vw" className="services-hero-photo object-cover" />
      </div>
      <div className="services-hero-blur-layer services-hero-blur-1 z-[1]" aria-hidden="true" />
      <div className="services-hero-blur-layer services-hero-blur-2 z-[1]" aria-hidden="true" />
      <div className="services-hero-blur-layer services-hero-blur-3 z-[1]" aria-hidden="true" />
      <div className="services-hero-blur-layer services-hero-blur-4 z-[1]" aria-hidden="true" />
      <div className="services-hero-readability pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />
      <div className="services-hero-bottom pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[120px]" aria-hidden="true" />

      <div className="relative z-[3] flex h-full w-full items-end px-6 pb-24 pt-16 sm:px-6 lg:items-center lg:px-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))] lg:pb-16 lg:pt-20">
        <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-[520px]">
          <motion.p variants={item} aria-hidden="true" className="h-4 sm:h-5" />
          <motion.h1 id="services-hero-heading" variants={item} className="services-hero-title-shadow mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroHeadingParts[0]}{heroHeadingParts[1] ? <span className="mt-2 block text-shine [--shine-base:var(--color-gold)] [--shine-peak:color-mix(in_srgb,var(--color-gold-light)_75%,white)]">{heroHeadingParts[1]}</span> : null}
          </motion.h1>
          <motion.p variants={item} className="services-hero-subline-shadow mt-6 max-w-[520px] text-base leading-relaxed text-white sm:text-lg">
            {content.subtext ?? "Professional moving, courier and cleaning services for homes and businesses across Nairobi, Kenya and East Africa."}
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:gap-4">
            <Link href="/quote" className="inline-flex h-14 w-full items-center justify-center rounded-[10px] bg-gold px-8 text-base font-bold text-jungle-dark transition-colors hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark min-[480px]:w-auto">
              {content.primaryLabel ?? "Request Instant Quote"}
            </Link>
            <Link href={content.secondaryHref ?? "/contact"} className="inline-flex h-14 w-full items-center justify-center rounded-[10px] border border-white/80 bg-transparent px-8 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-jungle-dark min-[480px]:w-auto">
              {content.secondaryLabel ?? "Contact Us"}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
