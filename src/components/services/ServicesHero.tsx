"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export default function ServicesHero() {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion === true;

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
    ? {
        hidden: { opacity: 1 },
        show: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: "easeOut" },
        },
      };

  return (
    <section
      aria-labelledby="services-hero-heading"
      className="relative isolate min-h-[90svh] w-full overflow-hidden bg-transparent pt-16 lg:min-h-0 lg:pt-20"
    >
      <style>{`
        .services-hero-image {
          object-position: right center;
        }

        .services-hero-blur {
          -webkit-backdrop-filter: blur(6px) brightness(0.82) saturate(1.05);
          backdrop-filter: blur(6px) brightness(0.82) saturate(1.05);
          clip-path: polygon(0 0, 62.56% 0, 48% 100%, 0 100%);
        }

        .services-hero-overlay {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.45) 35%,
            rgba(0, 0, 0, 0.12) 62%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        @media (max-width: 1023px) {
          .services-hero-image {
            filter: blur(2px) brightness(0.82) saturate(1.05);
            object-position: 70% center;
            transform: scale(1.03);
          }

          .services-hero-blur {
            display: none;
          }

          .services-hero-overlay {
            background: linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.65) 0%,
              rgba(0, 0, 0, 0.55) 100%
            );
          }
        }

        @supports not ((backdrop-filter: blur(1px))) {
          .services-hero-blur {
            display: none;
          }
        }
      `}</style>

      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/Services.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="services-hero-image object-cover"
        />
      </div>

      <div
        className="services-hero-blur pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      />
      <div className="services-hero-overlay absolute inset-0 z-[2]" aria-hidden="true" />

      <div className="relative z-[3] grid min-h-[90svh] w-full lg:min-h-[85vh] lg:grid-cols-[minmax(0,48%)_minmax(0,52%)]">
        <div className="relative flex min-h-[90svh] items-center px-6 py-16 sm:px-6 sm:py-20 lg:min-h-0 lg:py-24 lg:pr-8 lg:pl-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))]">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full max-w-[520px]"
          >
            <motion.p
              variants={item}
              aria-hidden="true"
              className="h-4 sm:h-5"
            />

            <motion.h1
              id="services-hero-heading"
              variants={item}
              style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
              className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Moving &amp; Cleaning,
              <span className="mt-2 block text-shine">Done Right</span>
            </motion.h1>

            <motion.p
              variants={item}
              style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
              className="mt-6 max-w-[520px] text-base leading-relaxed text-white/85 sm:text-lg"
            >
              Professional moving, courier and cleaning services for homes and
              businesses across Nairobi, Kenya and East Africa.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:gap-4"
            >
              <Link
                href="/quote"
                className="inline-flex w-full items-center justify-center bg-yellow-400 px-8 py-4 text-base font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black min-[480px]:w-auto"
              >
                Request Instant Quote
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center border-2 border-white px-8 py-4 text-base font-bold text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black min-[480px]:w-auto"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
